/**
 * <b>ControlP5auto</b><br />
 * demonstrates the use of controlP5's shortcut for adding 
 * auto-arranged controllers.<br />
 * for implementation details see controlP5/ControlP5Base <br />
 * related examples ControlP5quick <br />
 * by Andreas Schlegel 2010<br />
 * 
 */
 
import controlP5.*;

ControlP5 controlP5;  

float a = 0;

float b = 0;

float c= 0;

// controller toggleB will changed this variable 
public int toggleB = 1;

// controller toggleC will changed this variable 
public int toggleC = 1;

void setup() {
  size(600,400);
  controlP5 = new ControlP5(this);
  // begin a new group of auto-arranged controllers
  controlP5.begin(10,10);
  // linebreak() forces the consecutive controller to
  // start in the next line.
  controlP5.addSlider("sliderA",0,100).linebreak();
  controlP5.addNumberbox("numberboxB");
  controlP5.addNumberbox("numberboxC").linebreak();
  controlP5.addButton("buttonB");
  controlP5.addButton("buttonC");
  controlP5.end();
  
  controlP5.controller("sliderA").setValue(50);
  
  // add a new controller window.
  ControlWindow cw = controlP5.addControlWindow("win",250,250);
  cw.setLocation(10,10);
  // create a new group of controllers and 
  // move them into the control window.
  ControlGroup cg = controlP5.addGroup("myGroup",30,30);
  cg.moveTo(cw);
  controlP5.begin(cg,0,10);
  controlP5.addSlider("hello",0,100).linebreak();
  controlP5.addToggle("toggleB");
  controlP5.addToggle("toggleC");
  controlP5.end();
}


void draw() {
  background(a);
  if(toggleB != 0) {
    fill(b);
    rect(100,100,200,200);
  }
  if(toggleC != 0) {
    fill(c);
    rect(310,100,200,200);
  }
}

// controller sliderA will invoke this function when changed
public void sliderA(int v) { a = v; }

// controller numberboxB will invoke this function when changed
public void numberboxB(int v) { b = v; }

// controller numberboxC will invoke this function when changed
public void numberboxC(int v) { c = v; }

// controller numberboxB will invoke this function when changed
public void buttonB(int v) { b = 128; }

// controller buttonC will invoke this function when changed
public void buttonC(int v) { c = 128; }


