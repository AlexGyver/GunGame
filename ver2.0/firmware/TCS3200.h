#pragma once

#define S0  4
#define S1  0
#define S2  2
#define S3  14
#define P_OUT 12

const unsigned long timeout = 400;

struct tcs_color_t {
  unsigned long r, g, b;
};

class TCS3200 {
 public:
  void begin() {
    pinMode(S0, OUTPUT);
    pinMode(S1, OUTPUT);
    pinMode(S2, OUTPUT);
    pinMode(S3, OUTPUT);
    pinMode(P_OUT, INPUT);
    // Setting frequency-scaling to 100%
    digitalWrite(S0,HIGH);
    digitalWrite(S1,HIGH);
  }

  tcs_color_t getRaw() {
    return tcs_color_t{
        map(_read16(LOW, LOW, false), 1000, 45000, 255, 0),
        map(_read16(HIGH, HIGH, true), 1500, 70000, 255, 0),
        map(_read16(LOW, HIGH, true), 1500, 65000, 255, 0),
    };
  }

 private:
  unsigned long _read16(uint8_t vs2, uint8_t vs3, bool addDelay) {
    if(addDelay) {
      delay(50);
    }
    digitalWrite(S2,vs2);
    digitalWrite(S3,vs3);
    return pulseIn(P_OUT, LOW);  // Reading the output Red frequency
  }
};