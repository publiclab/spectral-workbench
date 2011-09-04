
/**
 * controlP5 Load
 * an example that show how to load a controller setup<br />
 * by andreas schlegel, 2009
 */

import controlP5.*;

ControlP5 controlP5;
public int myColorRect = 200;
public int myColorBackground = 100;


void setup() {
  size(400,400);
  frameRate(25);
  controlP5 = new ControlP5(this);  
  
  // when loading a controller setup, controllers can
  // update themselves by setting autoInitialization to true.
  // if the autoInitialization is set to false, the 
  // controller will not update when loaded.
  
   // set to true or false for initial updates
  controlP5.setAutoInitialization(true);
  
  // load a controller setup.
  controlP5.load("controlP5.xml");
}

void draw() {
  background(myColorBackground);
  fill(myColorRect);
  rect(0,0,width,100);
}

void keyPressed() {
  if(key=='s') {
    // save the current state/setup of all 
    // controllers available.
    controlP5.save();
  }
}

public void numberbox(float a) {
  println("got an event from controller numberbox");
}

void controlEvent(ControlEvent theEvent) {
  println("got a control event from controller with id "+
          theEvent.controller().id()+" / "+
          theEvent.controller().name()+" / "+
          theEvent.controller().value());
  
  switch(theEvent.controller().id()) {
    case(3):
    myColorRect = (int)(theEvent.controller().value());
    break;
    case(2):
    myColorBackground = (int)(theEvent.controller().value());
    break;  
  }
}
