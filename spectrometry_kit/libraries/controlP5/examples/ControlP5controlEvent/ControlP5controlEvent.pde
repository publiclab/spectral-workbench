/**
 * ControlP5 ControlEvent
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
  controlP5.addNumberbox("n1",myColorRect,100,160,100,14).setId(1);
  controlP5.addNumberbox("n2",myColorBackground,100,200,100,14).setId(2);
  controlP5.addTextfield("n3",100,240,100,20).setId(3);
}

void draw() {
  background(myColorBackground);
  fill(myColorRect);
  rect(0,0,width,100);
}


void controlEvent(ControlEvent theEvent) {
  println("got a control event from controller with id "+theEvent.controller().id());
  switch(theEvent.controller().id()) {
    case(1):
    myColorRect = (int)(theEvent.controller().value());
    break;
    case(2):
    myColorBackground = (int)(theEvent.controller().value());
    break;
    case(3):
    println(theEvent.controller().stringValue());
    break;  
  }
}
