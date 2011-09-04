/**
 * ControlP5 Group
 * by andreas schlegel, 2009
 */
import controlP5.*;

ControlP5 controlP5;

void setup() {
  size(400,400);
  frameRate(30);

  controlP5 = new ControlP5(this);
  ControlGroup l = controlP5.addGroup("myGroup",100,200);
  controlP5.addBang("A-1",0,4,20,20).setGroup(l);
  controlP5.addBang("A-2",30,4,20,20).setGroup(l);
  l.setBackgroundColor(color(255,100));
  l.setBackgroundHeight(150);
  println("the height of controlgroup l: "+l.getBackgroundHeight());
  
  ControlGroup l2 = controlP5.addGroup("myGroup2",100,40,200);
  l2.activateEvent(true);
  
  
  controlP5.addBang("B-1",0,4,20,20).setGroup(l2);
  Radio r = controlP5.addRadio("radio",100,4);
  r.add("black",0);
  r.add("red",1);
  r.add("green",2);
  r.add("blue",3);
  r.add("grey",4);
  r.setColorLabel(0xffff0000);
  r.setGroup(l2);
  
  
}

void draw() {
  background(0);
}


void controlEvent(ControlEvent theEvent) {
  if(theEvent.isGroup()) {
    println("got an event from group "+theEvent.group().name()+", isOpen? "+theEvent.group().isOpen());  
  } else if (theEvent.isController()){
    println("got something from a controller "+theEvent.controller().name());
  }
}


void keyPressed() {
  if(key==' ') {
    controlP5.group("myGroup").remove();
  }
}
