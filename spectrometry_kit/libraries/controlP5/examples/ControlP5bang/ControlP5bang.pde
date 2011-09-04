/**
 * <b>ControlP5bang</b><br />
 * A bang doesnt have a value but only triggers an event that can be received by a
 * function named after the bang's name or parsing an event inside the controlEvent function.
 * By default a bang is triggered when pressed but this can be changed to 'release' 
 * using theBang.setTriggerEvent(Bang.RELEASE).<br />
 * for implementation details see controlP5/Bang <br />
 * related examples ControlP5button <br />
 * by Andreas Schlegel 2010<br />
 * 
 */

import controlP5.*;

ControlP5 controlP5;

int myColorBackground = color(0,0,0);

color[] col = new color[] {
  color(100), color(150), color(200), color(250)
};

void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  for(int i=0;i<col.length;i++) {
    controlP5.addBang("bang"+i,40+i*80,150,40,40).setId(i);
  }
  // change the trigger event, by default it is PRESSED.
  controlP5.addBang("bang",40,250,120,40).setTriggerEvent(Bang.RELEASE);
  controlP5.controller("bang").setLabel("changeBackground");
}

void draw() {
  background(myColorBackground);
  for(int i=0;i<col.length;i++) {
    fill(col[i]);
    rect(40+i*80,50,40,80);
  }
}

public void bang() {
  int theColor = (int)random(255);
  myColorBackground = color(theColor);
  println("### bang(). a bang event. setting background to "+theColor);
}

public void controlEvent(ControlEvent theEvent) {
  for(int i=0;i<col.length;i++) {
    if(theEvent.controller().name().equals("bang"+i)) {
      col[i] = color(random(255));
    }
  }
  println(
  "## controlEvent / id:"+theEvent.controller().id()+
    " / name:"+theEvent.controller().name()+
    " / label:"+theEvent.controller().label()+
    " / value:"+theEvent.controller().value()
    );
}

