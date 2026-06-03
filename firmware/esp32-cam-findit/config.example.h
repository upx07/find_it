#pragma once

// Copy this file to config.h and fill in your Wi-Fi credentials.
// The 2.4GHz network must reach the ESP32-CAM and the FindIt backend.

#define WIFI_SSID      "your-ssid"
#define WIFI_PASSWORD  "your-password"

// ----------------------------------------------------------------------------
// Optional: STATIC IP
//
// By default the board gets its IP from DHCP, which can change on reboot and
// break the backend's ESP32_URL. Defining a static IP keeps it fixed forever.
//
// To enable, UNCOMMENT the four lines below and adjust to YOUR network:
//   - STATIC_IP_ADDR : pick an IP OUTSIDE the router's DHCP range to avoid
//                      conflicts (a high number like .200 is usually safe).
//   - STATIC_GATEWAY : your router's IP (check it in your phone/PC Wi-Fi info).
//   - STATIC_SUBNET  : almost always 255.255.255.0 on home/office networks.
//   - STATIC_DNS     : fine to use the gateway, or 8.8.8.8.
//
// After flashing, point the backend at it: ESP32_URL=http://192.168.0.200
//
// #define STATIC_IP_ADDR  "192.168.0.200"
// #define STATIC_GATEWAY  "192.168.0.1"
// #define STATIC_SUBNET   "255.255.255.0"
// #define STATIC_DNS      "192.168.0.1"
