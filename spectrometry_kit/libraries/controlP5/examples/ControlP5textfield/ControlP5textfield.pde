/**
 * ControlP5 Textflied.
 * 
 * for a more advanced example see textfieldAdvanced which 
 * demonstrates how to use keepFocus, setText, getText, getTextList,
 * clear, setAutoClear, isAutoClear or submit.
 * by andreas schlegel, 2009
 */

import controlP5.*;
ControlP5 controlP5;



String textValue = "";
Textfield myTextfield;

void setup() {
  size(400,400);
  frameRate(25);
  controlP5 = new ControlP5(this);

  myTextfield = controlP5.addTextfield("texting",100,160,200,20);
  myTextfield.setFocus(true);
  controlP5.addTextfield("textValue",100,200,200,20);
}

void draw() {
  background(0);
}


void controlEvent(ControlEvent theEvent) {
  println("controlEvent: accessing a string from controller '"+theEvent.controller().name()+"': "+theEvent.controller().stringValue());
}


public void texting(String theText) {
  // receiving text from controller texting
  println("a textfield event for controller 'texting': "+theText);
}


