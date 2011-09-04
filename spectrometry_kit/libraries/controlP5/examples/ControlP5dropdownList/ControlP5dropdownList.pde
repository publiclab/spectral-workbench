  /**
 * ControlP5dropdownList
 * A dropdownList controller, based on the ListBox controller.
 * the currently selected dropdownlist item is displayed inside
 * the menu bar of the DropdownList.
 
 * by andreas schlegel, 2010
 * www.sojamo.de/libraries/controlP5
 */

import controlP5.*;

ControlP5 controlP5;

DropdownList p1, p2;


//setting height, etc is a mess and spoiled. REPAIR


int cnt = 0;
void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  p1 = controlP5.addDropdownList("myList-p1",100,100,100,120);
  customize(p1);
  p2 = controlP5.addDropdownList("myList-p2",220,100,100,120);
  customize(p2);
}

void customize(DropdownList ddl) {
  ddl.setBackgroundColor(color(190));
  ddl.setItemHeight(20);
  ddl.setBarHeight(15);
  ddl.captionLabel().set("pulldown");
  ddl.captionLabel().style().marginTop = 3;
  ddl.captionLabel().style().marginLeft = 3;
  ddl.valueLabel().style().marginTop = 3;
  for(int i=0;i<80;i++) {
    ddl.addItem("item "+i,i);
  }
  ddl.setColorBackground(color(60));
  ddl.setColorActive(color(255,128));
}

void keyPressed() {
  if(key=='1') {
    // set the height of a pulldown menu, should always be a multiple of itemHeight
    p1.setHeight(210);
  } 
  else if(key=='2') {
    // set the height of a pulldown menu, should always be a multiple of itemHeight
    p1.setHeight(120);
  }
  else if(key=='i') {
    // set the height of a pulldown menu item, should always be a fraction of the pulldown menu
    p1.setItemHeight(30);
  } 
  else if(key=='u') {
    // set the height of a pulldown menu item, should always be a fraction of the pulldown menu
    p1.setItemHeight(10);
    p1.setBackgroundColor(color(100,0,0));
  } 
  else if(key=='a') {
    // add new items to the pulldown menu
    int n = (int)(random(100000));
    p1.addItem("item "+n, n);
  } 
  else if(key=='d') {
    // remove items from the pulldown menu  by name
    p1.removeItem("item "+cnt);
    cnt++;
  }
  else if(key=='c') {
    p1.clear();
  }
}

void controlEvent(ControlEvent theEvent) {
  // PulldownMenu is if type ControlGroup.
  // A controlEvent will be triggered from within the ControlGroup.
  // therefore you need to check the originator of the Event with
  // if (theEvent.isGroup())
  // to avoid an error message from controlP5.

  if (theEvent.isGroup()) {
    // check if the Event was triggered from a ControlGroup
    println(theEvent.group().value()+" from "+theEvent.group());
  } else if(theEvent.isController()) {
    println(theEvent.controller().value()+" from "+theEvent.controller());
  }
}

void draw() {
  background(128);
}

