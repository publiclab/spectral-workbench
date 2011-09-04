/**
  * ControlP5 TextArea.
  *
  * by andreas schlegel, 2009
  */

import controlP5.*;

ControlP5 controlP5;
Textarea myTextarea;

void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  myTextarea = controlP5.addTextarea(
  "label1", 
  "a textarea is of type group, not controller.\n"+
    "you can set the width and height of a textarea, if there is more text than space available, scrollbars are added.  "+
    "use ALT + mouseDown to move the textarea. First sketches showing the potential of the new volumetric brush (here the box version was used). Size and density and brush mode (additve, multiply or replace) can be customized. Here I first used a massive brush size with high positive density to create the box, then switched to negative density and smaller size to carve out. The colours are visualizing curvature and were applied in Meshlab later.", 
  100,100,200,60);
  controlP5.addSlider("changeWidth",0,200,100,100,20,100,9);
  controlP5.addSlider("changeHeight",0,200,100,100,60,100,9);
  myTextarea.setColorForeground(0xffff0000);
}


void keyPressed() {
  if(key=='r') {
    myTextarea.setText("a textarea can be used to leave notes inside of controlP5 displayed on the screen. scrollbars are available when text extends the visible area. Textarea extends ControllerGroup, for more available methods see the ControllerGroup documentation.");
  } else if(key=='c') {
    myTextarea.setColor(0xff0000);
  }
}
void draw() {
  background(0);
  if(keyPressed && key==' ') {
    myTextarea.scroll((float)mouseX/(float)width);
  }
  if(keyPressed && key=='l') {
    myTextarea.setLineHeight(mouseY);
  }
}

void changeWidth(int theValue) {
  myTextarea.setWidth(theValue);
}

void changeHeight(int theValue) {
  myTextarea.setHeight(theValue);
}

