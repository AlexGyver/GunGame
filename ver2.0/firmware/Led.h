#ifndef _USER_Led_H_
#define _USER_Led_H_


#include <arduino.h>

#ifndef PIN_LED
#define PIN_LED 15
#endif

class Led {
    public:
        Led(uint8_t pin=PIN_LED);
        void turnOff();
        void turnOn();
        void blink(uint8_t frequency_mask, bool looped=true);
        void blinkOnce(uint8_t frequency_mask);
        void loop();
    private:
        uint32_t period;
        uint32_t time1;
        uint32_t time2;
        uint8_t frequency_mask;
        uint8_t position;
        uint8_t pin;
        bool looped;
};

#endif
