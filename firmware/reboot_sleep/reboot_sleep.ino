// Reboot Sleep v1: BLE connection only. No accelerometer readings or sleep data.
// XIAO ESP32-S3 wiring: D4/GPIO5 -> SDA, D5/GPIO6 -> SCL,
//                     3V3 -> VIN, GND -> GND (black wire is NOT SCL).
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <atomic>

// Keep in sync with src/services/ble/protocol.ts.
static const char *SERVICE_UUID = "7b6f0001-6c2d-4a89-9f31-42e51b6a8c90";
static const char *VERSION_UUID = "7b6f0002-6c2d-4a89-9f31-42e51b6a8c90";
static uint8_t protocolVersion = 1;
static std::atomic<bool> restartAdvertising(false);

class ConnectionCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *server) override {
    // Advertising stops on connection. Do not restart while a phone is connected.
    BLEDevice::getAdvertising()->stop();
    Serial.println("Phone connected");
  }

  void onDisconnect(BLEServer *server) override {
    restartAdvertising.store(true);
    Serial.println("Phone disconnected");
  }
};

void setup() {
  Serial.begin(115200);  // Never wait for Serial: the device also boots from a charger.
  char deviceName[24];
  const uint16_t suffix = static_cast<uint16_t>(ESP.getEfuseMac() >> 32);
  snprintf(deviceName, sizeof(deviceName), "Reboot Sleep %04X", suffix);

  BLEDevice::init(deviceName);
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new ConnectionCallbacks());
  BLEService *service = server->createService(SERVICE_UUID);
  BLECharacteristic *version = service->createCharacteristic(VERSION_UUID, BLECharacteristic::PROPERTY_READ);
  version->setValue(&protocolVersion, 1);
  service->start();

  // Keep the 128-bit UUID in the primary packet, so service-filtered scans find us.
  // The complete name goes in the separate scan response (legacy packets are 31 bytes).
  BLEAdvertisementData advertisement;
  advertisement.setFlags(0x06);  // General discoverable, BR/EDR unsupported.
  advertisement.setCompleteServices(BLEUUID(SERVICE_UUID));
  BLEAdvertisementData response;
  response.setName(deviceName);
  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->setAdvertisementData(advertisement);
  advertising->setScanResponseData(response);
  advertising->setScanResponse(true);
  advertising->start();
  Serial.printf("%s advertising; protocol version %u\n", deviceName, protocolVersion);
}

void loop() {
  if (restartAdvertising.exchange(false)) {
    // Restart from the main task after the BLE disconnect callback has returned.
    delay(100);
    BLEDevice::startAdvertising();
    Serial.println("Advertising again");
  }
  delay(20);
}
