/**
 * controlP5workingWithIDs by andreas schlegel
 * an example to show how to distinguish controllers by IDs.
 * further information in the documentation folder provided in the controlP5 folder.
 * controlP5 website at http://www.sojamo.de/controlP5
 */

import controlP5.*;

ControlP5 controlP5;

public int myColorRect = 200;

public int myColorBackground = 40;


void setup() {
  size(400,400);
  frameRate(25);
  /* new instance of ControlP5 */
  controlP5 = new ControlP5(this);
  /* add 2 controllers and give each of them a unique id. */
  controlP5.addNumberbox("numberbox1",myColorRect,100,160,100,14).setId(1);
  controlP5.addSlider("slider1",10,200,myColorBackground,100,220,100,10).setId(2);
}

void draw() {
  background(myColorBackground);
  fill(myColorRect);
  rect(0,0,width,100);
}


void controlEvent(ControlEvent theEvent) {
  /* events triggered by controllers are automatically forwarded to 
     the controlEvent method. by checking the id of a controller one can distinguish
     which of the controllers has been changed.
  */
  println("got a control event from controller with id "+theEvent.controller().id());
  switch(theEvent.controller().id()) {
    case(1):
    /* controller numberbox1 with id 1 */
    myColorRect = (int)(theEvent.controller().value());
    break;
    case(2):
    /* controller slider1 with id 2 */
    myColorBackground = (int)(theEvent.controller().value());
    break;  
  }
}
