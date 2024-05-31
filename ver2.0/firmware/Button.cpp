#include "Button.h"

Button::Button(uint8_t pin) {
   this->pin = pin;
   this->listeners = NULL;
   pinMode(pin, INPUT_PULLUP);
   this->startMs = millis();
   this->state = digitalRead(this->pin);
}

Button::~Button() {
  while(this->listeners != NULL) {
    Node* p = this->listeners;
    this->listeners = this->listeners->prev;
    delete p;
  }
}

void Button::addListener(void (*listener)(BUTTON_CLICK_EVENT)) {
  Node* p = new Node();
  p->prev = this->listeners;
  p->listener = listener;
  this->listeners = p;
}

void Button::fireEvent(BUTTON_CLICK_EVENT event) {
  Node* p = this->listeners;
  while(p != NULL) {
      p->listener(event);
      p = p->prev;
  }
}

void Button::loop() {
  uint32_t ms = millis();
  bool pin_state = digitalRead(this->pin);
  // Фиксируем нажатие кнопки
  if(pin_state != this->state) {
    if(pin_state != LOW) {
      uint32_t period = ms - this->startMs;
      if(period > AUTOCLIK_MS) {
        if(period < LONGCLIK_MS) {
            this->fireEvent(SB_CLICK);
          } else {
            this->fireEvent(SB_LONG_CLICK);
          }
      }
    }
    this->state = pin_state;
    this->startMs = ms;
  }
}
