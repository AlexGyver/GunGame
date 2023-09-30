#pragma once
#include <Arduino.h>

class Led {
 public:
  Led(uint8_t pin) : _pin(pin) {
    pinMode(_pin, OUTPUT);
  }
  void on() {
    write(1);
  }
  void off() {
    write(0);
  }
  void toggle() {
    write(!_state);
  }
  bool state() {
    return _state;
  }
  void write(bool state) {
    digitalWrite(_pin, state);
    _state = state;
  }

 private:
  uint8_t _pin;
  bool _state = 0;
};