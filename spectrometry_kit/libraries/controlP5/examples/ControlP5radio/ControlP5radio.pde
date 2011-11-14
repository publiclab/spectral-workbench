/**
 * ControlP5 Radio
 * Radio is deprecated, use RadioButton or CheckBox
 * by andreas schlegel, 2009
 */

import controlP5.*;

ControlP5 controlP5;

int myColorBackground = color(0,0,0);

void setup() {
  size(400,400);
  smooth();
  controlP5 = new ControlP5(this);
  Radio r = controlP5.addRadio("radio",100,160);
  r.deactivateAll(); // use deactiveAll to not make the first radio button active.
  r.add("black",0);
  r.add("red",1);
  r.add("green",2);
  r.add("blue",3);
  r.add("grey",4);
}

void draw() {
  background(myColorBackground);
}

void radio(int theID) {
  switch(theID) {
    case(0):
      myColorBackground = color(0);    
      break;  
    case(1):
      myColorBackground = color(255,0,0);
      break;  
    case(2):
      myColorBackground = color(0,255,0);
      break;  
    case(3):
      myColorBackground = color(0,0,255);
      break;  
    case(4):
      myColorBackground = color(128);
      break;
  }
  println("a radio event.");
}
