/**
  * ControlP5 Slider.
  *
  * by andreas schlegel, 2009
  */

import controlP5.*;


ControlP5 controlP5;

int myColorBackground = color(0,0,0);

int sliderValue = 100;

void setup() {
  size(400,400);
  controlP5 = new ControlP5(this);
  controlP5.addSlider("slider",100,200,128,100,160,100,10);
  controlP5.addSlider("sliderValue",100,200,100,100,200,100,10);
}

void draw() {
  background(myColorBackground);
  fill(sliderValue);
  rect(0,0,width,100);
}

void slider(int theColor) {
  myColorBackground = color(theColor);
  println("a slider event. setting background to "+theColor);
  controlP5.controller("sliderValue").setValue(theColor);
}

void keyPressed() {
  controlP5.controller("sliderValue").setValue(150);
}
