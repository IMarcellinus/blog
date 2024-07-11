#include <SoftwareSerial.h>

SoftwareSerial myserial(2, 3);
String kode;

void setup() {
  Serial.begin(9600);
  myserial.begin(9600);
  myserial.setTimeout(100);
}

void loop() {
  while (myserial.available() > 0) {
    kode = myserial.readString();
    Serial.println(kode);  // Print to Serial Monitor (useful for debugging)
    delay(100);  // Give ESP8266 time to process
  }
}