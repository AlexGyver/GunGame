#pragma once
#include <Arduino.h>
#include <Wire.h>

#define TCS_ADDRESS (0x29)
#define TCS_COMMAND_BIT (0x80)
#define TCS_ID (0x12)
#define TCS_CONTROL (0x0F)
#define ENABLE (0x00)
#define ENABLE_PON (0x01)
#define ENABLE_AEN (0x02)
#define TCS_ATIME (0x01)
#define TCS_CDATAL (0x14)
#define TCS_RDATAL (0x16)
#define TCS_GDATAL (0x18)
#define TCS_BDATAL (0x1A)

enum class tcs_gain_t : uint8_t {
  X1 = 0x00,
  X4 = 0x01,
  X16 = 0x02,
  X60 = 0x03,
};

enum class tcs_time_t : uint8_t {
  T2_4 = 0xFF,
  T24 = 0xF6,
  T50 = 0xEB,
  T60 = 0xE7,
  T101 = 0xD6,
};

struct tcs_color_t {
  uint16_t r, g, b;
};

class TCS3472 {
 public:
  bool begin(TwoWire* wire) {
    _wire = wire;
    uint8_t x = _read8(TCS_ID);
    _ok = !((x != 0x4d) && (x != 0x44) && (x != 0x10));
    setTime(tcs_time_t::T24);
    setGain(tcs_gain_t::X16);
    _write8(ENABLE, ENABLE_PON);
    delay(3);
    _write8(ENABLE, ENABLE_PON | ENABLE_AEN);
    return _ok;
  }

  tcs_color_t getRaw() {
    return tcs_color_t{
        _read16(TCS_RDATAL),
        _read16(TCS_GDATAL),
        _read16(TCS_BDATAL),
    };
  }
  void setTime(tcs_time_t time) {
    _write8(TCS_ATIME, (uint8_t)time);
  }

  void setGain(tcs_gain_t gain) {
    _write8(TCS_CONTROL, (uint8_t)gain);
  }

  bool status() {
    return _ok;
  }

 private:
  TwoWire* _wire;
  bool _ok = false;

  uint16_t _read16(uint8_t reg) {
    if (!_ok) return 0;
    _beginCMD(reg);
    _endCMD();
    _wire->requestFrom(TCS_ADDRESS, 2);
    uint16_t data = _wire->read();
    data |= _wire->read() << 8;
    return data;
  }

  uint8_t _read8(uint8_t reg) {
    _beginCMD(reg);
    _endCMD();
    _wire->requestFrom(TCS_ADDRESS, 1);
    return _wire->read();
  }

  void _write8(uint8_t reg, uint8_t data) {
    if (!_ok) return;
    _beginCMD(reg);
    _wire->write(data);
    _endCMD();
  }

  void _beginCMD(uint8_t reg) {
    _wire->beginTransmission(TCS_ADDRESS);
    _wire->write(TCS_COMMAND_BIT | reg);
  }
  void _endCMD() {
    _wire->endTransmission(0);
  }
};