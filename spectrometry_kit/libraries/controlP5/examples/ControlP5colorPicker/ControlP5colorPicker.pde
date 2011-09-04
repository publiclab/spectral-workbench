/**
 * ControlP5 Slider. Horizontal and vertical sliders, 
 * with and without tick marks and snap-to-tick.
 * by andreas schlegel, 2010
 */

import controlP5.*;

ControlP5 controlP5;

ColorPicker cp;

void setup() {
  size(400,400);
  controlP5 = new ControlP5(this);
  cp = controlP5.addColorPicker("picker",0,0,255,20);
}

void draw() {
  background(cp.getColorValue());
}

void keyPressed() {
  switch(key) {
    case('1'):
    cp.setArrayValue(new float[] {120,0,120,255});
    break;
    case('2'):
    cp.setColorValue(color(255,0,0,255));
    break;
  }
}
