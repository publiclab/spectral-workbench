 /**
 * controlP5numberbox by andreas schlegel <br />
 * an example to show how to use a numberbox to control <br />
 * variables and events.<br />
 */ 

import controlP5.*;

ControlP5 controlP5;

int myColorBackground = color(0,0,0);

public float numberboxValue = 100;

void setup() {
  size(400,400);
  frameRate(25);
  controlP5 = new ControlP5(this);
  // add a numberbox
  controlP5.addNumberbox("numberbox",100,100,160,100,14);
  
  // add a second numberbox
  Numberbox n = controlP5.addNumberbox("numberboxValue",128,100,200,100,14);
  // set the sensitifity of the numberbox
  n.setMultiplier(0.1);
  // change the control direction to left/right
  n.setDirection(Controller.HORIZONTAL);
}

void draw() {
  background(myColorBackground);
  fill(numberboxValue);
  rect(0,0,width,100);
}

void numberbox(int theColor) {
  myColorBackground = color(theColor);
  println("a numberbox event. setting background to "+theColor);
}
