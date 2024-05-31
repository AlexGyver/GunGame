#include "UARTHandler.h"

UARTHandler::UARTHandler() {
  Serial.begin(9600);
	this->listeners = NULL;
  this->defaultListener = NULL;
	this->idx = 0;
}

UARTHandler::~UARTHandler() {
  while(this->listeners != NULL) {
    UARTListener* p = this->listeners;
    this->listeners = this->listeners->prev;
    delete p;
  }
  Serial.end();
}

void UARTHandler::addDefaultListener( void(*listener)(char, char*)) {
  this->defaultListener = listener;
}

void UARTHandler::loop() {
  if (Serial.available() > 0) {
    char d = Serial.read();
    if(d != 10) {
    	this->data[this->idx++] = d;
    } else {
    	char pcode = this->data[0];
    	char pdata[this->idx];
    	memcpy(pdata, this->data+1, this->idx);
      pdata[this->idx-1]=0;
    	this->idx = 0;
    	this->fireEvent(pcode, pdata);
    }
  }
}

void UARTHandler::addListener(char code, void(*listener)(char*)) {
  UARTListener* p = new UARTListener();
  p->prev = this->listeners;
  p->listener = listener;
  p->code = code;
  this->listeners = p;
}

void UARTHandler::fireEvent(char pcode, char* pdata) {
	UARTListener* p = this->listeners;
  while(p != NULL) {
  	if(p->code == pcode){
  		p->listener(pdata);
  		return;
  	}
    p = this->listeners->prev;
  }
  if(this->defaultListener != NULL) {
    this->defaultListener(pcode, pdata);
  }
}
