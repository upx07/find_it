# FindIt — Firmware ESP32-CAM (DFR0602)

Firmware que faz o ESP32-CAM responder requisições HTTP do backend FindIt. Quando o backend chama `GET http://<esp>/capture`, o ESP tira uma foto na hora e devolve o JPEG no corpo da resposta.

## Hardware

- **Placa**: DFRobot DFR0602 — é o AI-Thinker ESP32-CAM rebadged. No Arduino IDE selecione **"AI Thinker ESP32-CAM"**.
- **Câmera**: OV2640 já inclusa no kit.
- **Hardware extra necessário** (não vem com a placa):
  - Adaptador USB↔Serial 3.3V (FTDI, CP2102 ou CH340)
  - Fonte 5V/2A externa (o USB do PC pode não dar conta — o datasheet alerta que sub-tensão causa "water ripple" na imagem e brownout no Wi-Fi)
  - 1 jumper macho-macho (para colocar IO0↔GND durante o flash)

## Wiring para flashar

```
Adaptador USB↔Serial          ESP32-CAM (DFR0602)
─────────────────────────────────────────────────
5V                       <-> 5V
GND                      <-> GND
TX                       <-> U0R  (GPIO 3)
RX                       <-> U0T  (GPIO 1)
```

A DFR0602 **não tem botão BOOT**. Para entrar em modo de flash:

1. Ligue tudo desconectado da rede USB primeiro.
2. Conecte com um jumper **IO0 ↔ GND**.
3. Pressione e solte **RST**.
4. No Arduino IDE clique **Upload**.
5. Quando aparecer "Connecting...", pode pressionar RST mais uma vez se preciso.
6. Após terminar, **remova o jumper IO0↔GND** e pressione RST novamente para rodar o firmware.

## Setup do Arduino IDE

1. **Boards Manager URL** (em Preferences):
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
2. **Tools → Board** → "AI Thinker ESP32-CAM"
3. **Tools → Partition Scheme** → "Huge APP (3MB No OTA/1MB SPIFFS)"
4. **Tools → PSRAM** → "Enabled"
5. **Tools → Upload Speed** → 115200 (ou 921600 se a conexão for estável)

Não há bibliotecas extras a instalar — `esp_camera.h`, `WebServer.h` e `ESPmDNS.h` vêm com o board package ESP32.

## Configuração

1. Copie `config.example.h` para `config.h` no mesmo diretório:
   ```
   cp firmware/esp32-cam-findit/config.example.h firmware/esp32-cam-findit/config.h
   ```
2. Edite `config.h` e preencha `WIFI_SSID` e `WIFI_PASSWORD`. **O Wi-Fi precisa ser 2.4GHz** — o ESP32 não suporta 5GHz.

`config.h` está no `.gitignore`, então as credenciais não vão para o repositório.

## Como o backend acha o ESP

Depois do flash, abra o **Serial Monitor a 115200 baud** e pressione RST. O firmware imprime:

```
WiFi connected, IP = 192.168.1.42
mDNS: http://findit-esp.local/
HTTP server started on port 80
```

Configure o backend FindIt com **uma das duas formas**:

- **mDNS** (recomendado, sem precisar saber o IP):
  ```
  export ESP32_URL=http://findit-esp.local
  ```
- **IP direto** (se mDNS não funcionar na sua rede):
  ```
  export ESP32_URL=http://192.168.1.42
  ```

Default no [config/runtime.exs](../../config/runtime.exs) é `http://findit-esp.local`.

## Teste rápido sem o backend

Com o ESP rodando, do laptop na mesma rede:

```
curl http://findit-esp.local/                # FindIt ESP32-CAM ready
curl http://findit-esp.local/health          # {"ok":true,"free_heap":...}
curl -o test.jpg http://findit-esp.local/capture
file test.jpg                                # JPEG image data, ...
open test.jpg
```

## Endpoints do firmware

| Método | Rota       | Resposta                                  |
|--------|------------|-------------------------------------------|
| GET    | `/`        | Texto `FindIt ESP32-CAM ready`            |
| GET    | `/health`  | JSON `{"ok":true,"free_heap":N}`          |
| GET    | `/capture` | Corpo binário JPEG (`Content-Type: image/jpeg`) |

## LED de status (GPIO 33, vermelho onboard)

- Piscando rápido durante boot: tentando conectar Wi-Fi
- Piscando lento contínuo: Wi-Fi falhou (firmware travou)
- Piscando muito rápido contínuo: câmera falhou ao iniciar (verifique o cabo flat e a alimentação)
- Aceso por ~500ms após boot: pronto
- Acende brevemente a cada captura

> O LED branco brilhante (GPIO 4) é o flash da câmera, não é usado como status — o datasheet diz que ele puxa 310mA@5V quando ligado, então só dispararia se você precisar de iluminação.

## Troubleshooting

- **"Brownout detector triggered"** no Serial: alimentação fraca. Use fonte 5V/2A externa em vez do USB do PC.
- **`esp_camera_init failed: 0x105`**: câmera não detectada. Desligue tudo, reencaixe o cabo flat da câmera (o conector é frágil), reconecte e tente de novo.
- **`Wi-Fi connect failed`**: confira se a rede é 2.4GHz e se as credenciais em `config.h` estão certas (atenção a maiúsculas/minúsculas e acentos no SSID).
- **`Failed to connect to ESP32`** durante o upload: o jumper IO0↔GND não está fazendo contato, ou o adaptador USB-Serial está em 5V em vez de 3.3V no lógico, ou o TX/RX está invertido.
- **Imagem com "water ripple" (riscos horizontais)**: alimentação insuficiente. Trocar a fonte resolve.

## Alternativa: PlatformIO

Em vez do Arduino IDE, dá pra usar PlatformIO com este `platformio.ini` colocado neste diretório:

```ini
[env:esp32cam]
platform = espressif32
board = esp32cam
framework = arduino
monitor_speed = 115200
upload_speed = 921600
board_build.partitions = huge_app.csv
build_flags =
    -DBOARD_HAS_PSRAM
    -mfix-esp32-psram-cache-issue
```

Depois é só `pio run -t upload` e `pio device monitor`.
