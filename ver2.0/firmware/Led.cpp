#include "Led.h"

Led::Led(uint8_t pin) {
    this->pin = pin;
    this->time1 = 0;
    this->time2 = 0;
    this->position = 1;
    this->looped = false;
    this->period = 128;
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
}

void Led::turnOff() {
    this->looped = false;
    this->frequency_mask = 0;
    digitalWrite(this->pin, LOW);
}

void Led::turnOn() {
    this->looped = false;
    this->frequency_mask = 0;
    digitalWrite(this->pin, HIGH);
}

void Led::blink(uint8_t frequency_mask, bool looped) {
    this->position = 1;
    this->frequency_mask = frequency_mask;
    this->looped = looped;
}

void Led::blinkOnce(uint8_t frequency_mask) {
    this->position = 1;
    this->blink(frequency_mask, false);
    this->looped = looped;
}

void Led::loop() {
    if(this->frequency_mask > 0) {
        this->time2 = millis();
        if(((this->time2-this->time1)>this->period) || (this->time2<this->time1)) {
            uint8_t mode = this->frequency_mask & this->position;
            if(mode>0) {
                digitalWrite(this->pin, HIGH);
            } else {
                digitalWrite(this->pin, LOW);
            }
            this->position = this->position<<1;
            if(this->looped && this->position==0) {
                this->position=1;
            }
            this->time1 = this->time2;
        }
    }
}