// FindIt — ESP32-CAM firmware (DFR0602 / AI-Thinker ESP32-CAM)
//
// Serves a tiny HTTP API on the local network. The FindIt Phoenix backend
// hits GET http://<this-board>/capture and receives a JPEG in the response
// body. The board does NOT push to the backend.
//
// Endpoints:
//   GET /         -> "FindIt ESP32-CAM ready" (text/plain)
//   GET /health   -> {"ok":true,"free_heap":N} (application/json)
//   GET /capture  -> raw JPEG bytes (image/jpeg)
//
// Requires Wi-Fi credentials in config.h (copy from config.example.h).

#include "config.h"

#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <esp_task_wdt.h>
#include "esp_camera.h"

// Watchdog timeout (seconds). loop() must reset it within this window.
#define WDT_TIMEOUT_SEC 15

// How often loop() checks Wi-Fi and tries to reconnect if dropped.
#define WIFI_CHECK_INTERVAL_MS 5000

// AI-Thinker ESP32-CAM pin map (same on DFR0602)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// Onboard red LED (active LOW). Used as status indicator.
#define STATUS_LED_PIN    33

WebServer server(80);

static void statusLed(bool on) {
  digitalWrite(STATUS_LED_PIN, on ? LOW : HIGH);
}

static bool initCamera() {
  camera_config_t config = {};
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size   = FRAMESIZE_XGA;   // 1024x768
    config.jpeg_quality = 10;
    config.fb_count     = 2;
    config.fb_location  = CAMERA_FB_IN_PSRAM;
    config.grab_mode    = CAMERA_GRAB_LATEST;
  } else {
    config.frame_size   = FRAMESIZE_SVGA;  // 800x600
    config.jpeg_quality = 12;
    config.fb_count     = 1;
    config.fb_location  = CAMERA_FB_IN_DRAM;
    config.grab_mode    = CAMERA_GRAB_WHEN_EMPTY;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("esp_camera_init failed: 0x%x\n", err);
    return false;
  }
  return true;
}

static bool connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);

  // Optional static IP (from config.h). Must run BEFORE WiFi.begin().
  // If STATIC_IP_ADDR is not defined, the board falls back to DHCP.
#ifdef STATIC_IP_ADDR
  IPAddress local_ip, gateway, subnet, dns;
  local_ip.fromString(STATIC_IP_ADDR);
  gateway.fromString(STATIC_GATEWAY);
  subnet.fromString(STATIC_SUBNET);
  dns.fromString(STATIC_DNS);
  if (!WiFi.config(local_ip, gateway, subnet, dns)) {
    Serial.println("Static IP config failed, falling back to DHCP");
  } else {
    Serial.printf("Using static IP %s\n", STATIC_IP_ADDR);
  }
#endif

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.printf("Connecting to Wi-Fi SSID '%s'", WIFI_SSID);

  const uint32_t deadline = millis() + 30000;
  while (WiFi.status() != WL_CONNECTED && millis() < deadline) {
    statusLed(true);
    delay(150);
    statusLed(false);
    delay(150);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi connect failed");
    return false;
  }

  Serial.print("WiFi connected, IP = ");
  Serial.println(WiFi.localIP());
  return true;
}

static void handleRoot() {
  server.send(200, "text/plain", "FindIt ESP32-CAM ready");
}

static void handleHealth() {
  char body[96];
  snprintf(body, sizeof(body), "{\"ok\":true,\"free_heap\":%u}", (unsigned) ESP.getFreeHeap());
  server.send(200, "application/json", body);
}

static void handleCapture() {
  statusLed(true);
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    statusLed(false);
    Serial.println("esp_camera_fb_get failed");
    server.send(500, "application/json", "{\"ok\":false,\"error\":\"capture_failed\"}");
    return;
  }

  // Let WebServer emit exactly one Content-Type/Content-Length pair:
  // setContentLength() + send(200, "image/jpeg", "") does that, then we stream
  // the raw JPEG over the client. The previous bare send(200) with manual
  // headers produced DUPLICATE Content-Type (text/html + image/jpeg) and
  // Content-Length (0 + real size) headers — a malformed response that strict
  // HTTP clients (the Phoenix backend's Finch/Mint) reject, so /capture failed
  // with a 502 every time.
  WiFiClient client = server.client();
  server.setContentLength(fb->len);
  server.sendHeader("Cache-Control", "no-store");
  server.send(200, "image/jpeg", "");
  client.write(fb->buf, fb->len);

  esp_camera_fb_return(fb);
  statusLed(false);
  Serial.printf("Served /capture (%u bytes)\n", (unsigned) fb->len);
}

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(false);
  delay(200);
  Serial.println();
  Serial.println("FindIt ESP32-CAM booting");

  pinMode(STATUS_LED_PIN, OUTPUT);
  statusLed(false);

  if (!initCamera()) {
    Serial.println("Camera init failed — halting");
    while (true) {
      statusLed(true); delay(80);
      statusLed(false); delay(80);
    }
  }

  if (!connectWifi()) {
    Serial.println("Wi-Fi failed — halting");
    while (true) {
      statusLed(true); delay(500);
      statusLed(false); delay(500);
    }
  }

  if (MDNS.begin("findit-esp")) {
    MDNS.addService("http", "tcp", 80);
    Serial.println("mDNS: http://findit-esp.local/");
  }

  server.on("/", HTTP_GET, handleRoot);
  server.on("/health", HTTP_GET, handleHealth);
  server.on("/capture", HTTP_GET, handleCapture);
  server.begin();

  Serial.println("HTTP server started on port 80");
  statusLed(true);
  delay(500);
  statusLed(false);

  esp_task_wdt_init(WDT_TIMEOUT_SEC, true);
  esp_task_wdt_add(NULL);
}

void loop() {
  esp_task_wdt_reset();
  server.handleClient();

  static uint32_t last_wifi_check = 0;
  uint32_t now = millis();
  if (now - last_wifi_check > WIFI_CHECK_INTERVAL_MS) {
    last_wifi_check = now;
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Wi-Fi link lost, reconnecting...");
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    }
  }

  delay(1);
}
