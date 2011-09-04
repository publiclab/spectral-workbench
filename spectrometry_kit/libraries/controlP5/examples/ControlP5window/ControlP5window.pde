/**
 * ControlP5 ControlWindow
 * by andreas schlegel, 2009
 */

import controlP5.*;

ControlP5 controlP5;

int myColorBackground = color(0,0,0);

ControlWindow controlWindow;

public int sliderValue = 40;

void setup() {
  size(400,400);  
  frameRate(25);
  controlP5 = new ControlP5(this);
  controlP5.setAutoDraw(false);
  controlWindow = controlP5.addControlWindow("controlP5window",100,100,400,200);
  controlWindow.hideCoordinates();
  
  controlWindow.setBackground(color(40));
  Controller mySlider = controlP5.addSlider("sliderValue",0,255,40,40,100,10);
  mySlider.setWindow(controlWindow);
  Textfield field = controlP5.addTextfield("myWindowTextfield",70,130,100,20);
  field.setWindow(controlWindow);

  controlP5.addSlider("sliderValue1",0,255,40,40,100,10);
  controlP5.addTextfield("myTextfield",70,130,40,20);
  controlWindow.setTitle("abc");
  
}

void draw() {
  background(sliderValue);
  controlP5.draw();
}

void myTextfield(String theValue) {
  println(theValue);
}

void myWindowTextfield(String theValue) {
  println("from controlWindow: "+theValue);
}

void keyPressed() {
  if(key==',') controlP5.window("controlP5window").hide();
  if(key=='.') controlP5.window("controlP5window").show();
  // controlWindow = controlP5.addControlWindow("controlP5window2",600,100,400,200);
  // controlP5.controller("sliderValue1").moveTo(controlWindow);
  
  // since version 0.5.0, a controlWindow can be set undecorated.
  if(key=='d') {
    if(controlWindow.isUndecorated()) {
      controlWindow.setUndecorated(false);
    } else {
      controlWindow.setUndecorated(true);
    }
  }
  if(key=='t') {
    controlWindow.toggleUndecorated();
  }
}

