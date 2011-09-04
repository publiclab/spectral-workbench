// ControlP5plugTo
// an example that shows the plugTo method to link any 
// type of object to a controller event
//
// by andreas schlegel 2010
//

import controlP5.*;
import processing.opengl.*;

ControlP5 controlP5;

Test[] testarray;
Test test;

Button b;

void setup() {
  size(600,400,OPENGL);
  smooth();
  textMode(SCREEN);
  test = new Test(50);
  testarray = new Test[10];
  for(int i=0;i<10;i++) {
    testarray[i] = new Test(200 + i*20);
  }
  
  controlP5 = new ControlP5(this);
  
  b = controlP5.addButton("trigger",1);
  b.setColorBackground(color(255,0,0));
  controlP5.addButton("plug",2);
  controlP5.addButton("remove",3);
}


void plug(int theValue) {
   b.plugTo(testarray);
   b.plugTo(test);
   b.setColorBackground(color(0,128,0));
   println("plugging controller b1 to array 'testarray' and variable 'test'.");
}

void remove(int theValue) {
  b.unplugFrom(testarray);
  b.unplugFrom(test);
  b.setColorBackground(color(255,0,0));
  println("removing array 'testarray' and variable 'test' from controller b1.");
}


void draw() {
  background(0);
  fill(255);
  for(int i=0;i<10;i++) {
    testarray[i].display();
  }
  test.display();
}


public void controlEvent(ControlEvent theEvent) {
  //println("papplet controlEvent triggered by "+theEvent.controller().name());
}


class Test {
  float n0 = 0; 
  float n1 = 1; 
  float x;
  
  Test(float theX) {
    x = theX;
  } 
  
  void trigger(int theValue) {
    n1 = random(100);
  }
  
  void display() {
    n0 += (n1-n0) * 0.1;
    rect(x,200,10,n0);
  }

  void controlEvent(ControlEvent theEvent) {
    //println("\t\t b1 event sub \n\n");
  }
}

