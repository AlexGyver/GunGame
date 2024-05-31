#ifndef _USER_Button_H_
#define _USER_Button_H_

#include <arduino.h>

#ifndef AUTOCLIK_MS
#define AUTOCLIK_MS 50
#endif

#ifndef LONGCLIK_MS
#define LONGCLIK_MS 4000
#endif

#ifndef PIN_BUTTON
#define PIN_BUTTON 13
#endif

extern bool isDebug;

typedef enum {
   SB_CLICK,
   SB_LONG_CLICK
} BUTTON_CLICK_EVENT;



struct Node {
  Node* prev;
  void (*listener)(BUTTON_CLICK_EVENT);
};

class Button {
  private :
    uint8_t  pin;
    Node    *listeners;
    bool     state;
    uint32_t startMs;
  public :
     Button(uint8_t pin=PIN_BUTTON);
     ~Button();
     void addListener(void (*listener)(BUTTON_CLICK_EVENT));
     void fireEvent(BUTTON_CLICK_EVENT event);
     void loop();
};

#endif
