#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WebSocketsServer.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID "Umar Home"
#define WIFI_PASSWORD "passwordnyaapa"

AsyncWebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);
LiquidCrystal_I2C lcd(0x27, 16, 2); // Alamat I2C mungkin perlu disesuaikan

void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("Client [%u] disconnected\n", num);
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("Client [%u] connected from %s\n", num, ip.toString().c_str());
        lcd.clear();
        lcd.setCursor(0, 0); // Tampilkan "Websockets from"
        lcd.print("Websockets from");
        lcd.setCursor(0, 1); // Tampilkan "IP: " dan alamat IP di baris kedua
        lcd.print("IP: ");
        lcd.print(ip.toString().c_str());
        delay(2000); // Tampilkan selama 2 detik
        lcd.clear();
        lcd.setCursor(4, 0);
        lcd.print("SILAHKAN");
        lcd.setCursor(2, 1);
        lcd.print("SCAN KTM ANDA");
      }
      break;
    case WStype_TEXT:
      Serial.printf("Client [%u] sent text: %s\n", num, payload);
      break;
  }
}

void displayWelcomeMessage() {
  lcd.clear();
  lcd.setCursor(3, 0); // Posisi tengah untuk "WELCOME TO"
  lcd.print("WELCOME TO");
  lcd.setCursor(4, 1); // Posisi tengah untuk "SILAPER"
  lcd.print("SILAPER");
  delay(3000); // Tampilkan selama 3 detik
}

void displayJurusanTeknikElektro() {
  lcd.clear();
  lcd.setCursor(4, 0); // Posisi tengah untuk "JURUSAN"
  lcd.print("JURUSAN");
  lcd.setCursor(1, 1); // Posisi tengah untuk "TEKNIK ELEKTRO"
  lcd.print("TEKNIK ELEKTRO");
  delay(3000); // Tampilkan selama 3 detik
}

void setup() {
  Serial.begin(9600);
  lcd.init(); // Menggunakan init() untuk inisialisasi
  lcd.backlight();

  displayWelcomeMessage();
  displayJurusanTeknikElektro();

  // Proses koneksi Wi-Fi
  lcd.clear();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lcd.setCursor(0, 0);
  lcd.print("Menghubungkan");
  lcd.setCursor(0, 1);
  lcd.print(".....................");
  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    lcd.setCursor(0, 1);
    lcd.print(".");
    delay(300);
  }

  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Terhubung");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());

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
    
    lcd.clear();
    if (qrCodeData.length() == 8) {
      lcd.setCursor(1, 0);
      lcd.print("SELAMAT DATANG");
      lcd.setCursor(4, 1);
      lcd.print(qrCodeData);
    } else {
      lcd.setCursor(4, 0);
      lcd.print("DATA MHS");
      lcd.setCursor(0, 1);
      lcd.print("BELUM  TERDAFTAR");
      delay(2000); // Tampilkan selama 1 detik
      lcd.clear();
      lcd.setCursor(4, 0);
      lcd.print("SILAHKAN");
      lcd.setCursor(3, 1);
      lcd.print("SCAN ULANG");
    }
    delay(3000); // Tampilkan selama 3 detik
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Terhubung");
    lcd.setCursor(0, 1);
    lcd.print("IP: ");
    lcd.print(WiFi.localIP());
  }
}
