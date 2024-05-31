#ifndef _USER_UARTHandler_H_
#define _USER_UARTHandler_H_

#include <arduino.h>

struct UARTListener {
  UARTListener* prev;
  char code;
  void (*listener)(char*);
};

class UARTHandler {
private :
	UARTListener    *listeners;
  void (*defaultListener)(char, char*);
	char data[60];
	uint8_t idx;
public:
	UARTHandler();
	~UARTHandler();
	void loop();
  void addListener(char code, void(*listener)(char*));
  void addDefaultListener(void(*listener)(char, char*));
	void fireEvent(char code, char* data);
};

#endif
