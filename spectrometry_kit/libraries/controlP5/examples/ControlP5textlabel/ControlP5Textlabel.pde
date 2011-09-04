/**
 * ControlP5 TextLabel
 * by andreas schlegel, 2009
 */

import controlP5.*;

ControlP5 controlP5;

Textlabel myTextlabelA;
Textlabel myTextlabelB;

void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  controlP5.setControlFont(new ControlFont(createFont("Georgia",20), 20));

  myTextlabelA = controlP5.addTextlabel("label","A SINGLE TESTLABEL.",20,134);
  myTextlabelA.setColorValue(0xffcccccc);

  myTextlabelB = new Textlabel(this,"a single textlabel big stuff.",20,20,400,200);
}



void draw() {
  background(0);
  myTextlabelB.draw(this); 
}

