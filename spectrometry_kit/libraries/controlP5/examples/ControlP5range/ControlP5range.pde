/**
 * ControlP5 Range
 * by andreas schlegel, 2009
 */

import controlP5.*;



ControlP5 controlP5;

int myColorBackground = color(0,0,0);

int colorMin = 100;
int colorMax = 100;
Range range;
void setup() {
  size(400,400);
  controlP5 = new ControlP5(this);
  range = controlP5.addRange("rangeController",0,255, 0,127.5, 100,160,200,12);
}

void draw() {
  background(colorMin);
  fill(colorMax);
  rect(0,0,width,100);
}

void controlEvent(ControlEvent theControlEvent) {
  if(theControlEvent.controller().name().equals("rangeController")) {
    // min and max values are stored in an array.
    // access this array with controller().arrayValue().
    // min is at index 0, max is at index 1.
    colorMin = int(theControlEvent.controller().arrayValue()[0]);
    colorMax = int(theControlEvent.controller().arrayValue()[1]);
  }
}


void keyPressed() {
  switch(key) {
    case('1'):range.setLowValue(0);break;
    case('2'):range.setLowValue(100);break;
    case('3'):range.setHighValue(120);break;
    case('4'):range.setHighValue(200);break;
  }
}
