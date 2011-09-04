/**
 * ControlP5 RadioButton
 * by andreas schlegel, 2009
 */

import controlP5.*;

ControlP5 controlP5;

int myColorBackground = color(0,0,0);

RadioButton r;
void setup() {
  size(400,400);
  smooth();
  controlP5 = new ControlP5(this);
  r = controlP5.addRadioButton("radioButton",20,160);
  r.setColorForeground(color(120));
  r.setColorActive(color(255));
  r.setColorLabel(color(255));
  r.setItemsPerRow(5);
  r.setSpacingColumn(50);

  addToRadioButton(r,"50",1);
  addToRadioButton(r,"100",2);
  addToRadioButton(r,"150",3);
  addToRadioButton(r,"200",4);
  addToRadioButton(r,"250",5);
}


void addToRadioButton(RadioButton theRadioButton, String theName, int theValue ) {
  Toggle t = theRadioButton.addItem(theName,theValue);
  t.captionLabel().setColorBackground(color(80));
  t.captionLabel().style().movePadding(2,0,-1,2);
  t.captionLabel().style().moveMargin(-2,0,0,-3);
  t.captionLabel().style().backgroundWidth = 46;
}


void draw() {
  background(myColorBackground);
}


void keyPressed() {
  if(key==' ') {
    r.deactivateAll();
  } else if (key=='a') {
    r.activate("50");
  } else if(key>='0' && key<'5') {
    // convert a key-number (48-52) to an int between 0 and 4
    int n = int(key)-48;
    r.activate(n);
  }
}

void controlEvent(ControlEvent theEvent) {
  print("got an event from "+theEvent.group().name()+"\t");
  for(int i=0;i<theEvent.group().arrayValue().length;i++) {
    print(int(theEvent.group().arrayValue()[i]));
  }
  println("\t "+theEvent.group().value());
  myColorBackground = color(int(theEvent.group().value()*50),0,0);
}


