/**
  * ControlP5 Tab.
  *
  * by andreas schlegel, 2009
  */

import controlP5.*;


ControlP5 controlP5;

int myColorBackground = color(0,0,0);

int sliderValue = 100;

void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  controlP5.addButton("button",10,100,80,80,20);
  controlP5.addButton("buttonValue",4,100,110,80,20);
  controlP5.addSlider("sliderValue",0,255,128,100,200,10,100);
  controlP5.addSlider("slider",100,200,128,100,160,100,10);
  // tab global is a tab that lies on top of any other tab and
  // is always visible
  controlP5.controller("slider").moveTo("global");
  
  controlP5.controller("sliderValue").moveTo("extra");
  controlP5.tab("extra").setColorForeground(0xffff0000);
  controlP5.tab("extra").setColorBackground(0xff330000);
  
  controlP5.trigger();
  
  // in case you want to receive a controlEvent when
  // a  tab is clicked, use activeEvent(true)
  controlP5.tab("extra").activateEvent(true);
  controlP5.tab("extra").setId(2);
  
  controlP5.tab("default").activateEvent(true);
  // to rename the label of a tab, use setLabe("..."),
  // the name of the tab will remain as given when initialized.
  controlP5.tab("default").setLabel("something");
  controlP5.tab("default").setId(1);
}

void draw() {
  background(myColorBackground);
  fill(sliderValue);
  rect(0,0,width,100);
}

void slider(int theColor) {
  myColorBackground = color(theColor);
  println("a slider event. setting background to "+theColor);
}

void controlEvent(ControlEvent theControlEvent) {
  if(theControlEvent.isController()) {
    println("controller : "+theControlEvent.controller().id());
  } else if (theControlEvent.isTab()) {
    println("tab : "+theControlEvent.tab().id()+" / "+theControlEvent.tab().name());
  }
}
