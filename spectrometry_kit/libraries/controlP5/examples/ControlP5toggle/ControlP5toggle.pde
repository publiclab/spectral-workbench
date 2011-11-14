/**
 * ControlP5 Toggle
 * by andreas schlegel, 2009
 */

import controlP5.*;

ControlP5 controlP5;

int myColorBackground = color(0,0,0);

boolean toggleValue = true;

void setup() {
  size(400,400);
  smooth();
  controlP5 = new ControlP5(this);
  controlP5.addToggle("toggle",false,100,160,20,20);
  controlP5.addToggle("toggleValue",true,100,240,100,20).setMode(ControlP5.SWITCH);
}
  
void draw() {
  background(myColorBackground);
  if(toggleValue==true) {
    fill(0,255,0);
  } else {
    fill(255,0,0);
  }
  rect(0,0,width,100);
}

void toggle(boolean theFlag) {
  if(theFlag==true) {
    myColorBackground = color(100);
  } else {
    myColorBackground = color(0);
  }
  println("a toggle event.");
}
