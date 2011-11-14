/**
 * ControlP5 Timer
 * by andreas schlegel, 2009
 */

import controlP5.*;

ControlP5 controlP5;
ControlTimer c;
Textlabel t;

void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  c = new ControlTimer();
  t = new Textlabel(this,"--",100,100);
  c.setSpeedOfTime(1);
}


void draw() {
  background(0);
  t.setValue(c.toString());
  t.draw(this);
  t.setPosition(mouseX, mouseY);
}


void mousePressed() {
  c.reset();
}
