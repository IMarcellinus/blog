#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WebSocketsServer.h>

#define WIFI_SSID "Umar Home"
#define WIFI_PASSWORD "passwordnyaapa"

AsyncWebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("Client [%u] disconnected\n", num);
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("Client [%u] connected from %s\n", num, ip.toString().c_str());
      }
      break;
    case WStype_TEXT:
      Serial.printf("Client [%u] sent text: %s\n", num, payload);
      break;
  }
}

void setup() {
  Serial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);

  server.begin();
}

void loop() {
  webSocket.loop();

  if (Serial.available() > 0) {
    String qrCodeData = Serial.readStringUntil('\n');
    qrCodeData.trim(); // Membersihkan spasi di sekitar data
    Serial.print("QR Code Data: ");
    Serial.println(qrCodeData);
    webSocket.broadcastTXT(qrCodeData);
  }
}
