/**
 * ControlP5 button.
 * this example shows how to create buttons with controlP5.
 * 
 * by andreas schlegel, 2009
 */
import controlP5.*;

ControlP5 controlP5;

// this is only a note.
// we will not use variable b in the code below.
// we have to use controlP5.Button here since there
// would be a conflict if we only use Button to declare button b.
Button b;

// a button-controller with name buttonValue will change the
// value of this variable when pressed.
int buttonValue = 0;

int myColor = color(0,255,180);


void setup() {
  size(640,480);
  smooth();
  frameRate(30);
  controlP5 = new ControlP5(this);
  controlP5.addButton("buttonA",0,100,100,80,19);
  controlP5.addButton("buttonB",255,100,120,80,19);
  controlP5.addButton("buttonValue",128,100,140,80,19);

}

void draw() {
  background(myColor);
  fill(buttonValue);
  rect(20,20,width-40,height-40);
}

public void controlEvent(ControlEvent theEvent) {
  println(theEvent.controller().name());
  
}

// function buttonA will receive changes from 
// controller with name buttonA
public void buttonA(int theValue) {
  println("a button event from buttonA: "+theValue);
  myColor = theValue;
}

// function buttonB will receive changes from 
// controller with name buttonB
public void buttonB(int theValue) {
  println("a button event from buttonB: "+theValue);
  myColor = theValue;
}




