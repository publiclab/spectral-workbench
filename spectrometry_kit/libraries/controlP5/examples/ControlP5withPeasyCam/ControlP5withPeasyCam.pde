/**
 * ControlP5 with PeasyCam support. tested with peasy 0.8.2
 *
 * by jeffg 2009
 * http://processing.org/discourse/yabb2/YaBB.pl?num=1234988194/30#30
 */
 
import peasy.*;
import controlP5.*;
import processing.opengl.*;

PeasyCam cam;
ControlP5 controlP5;
PMatrix3D currCameraMatrix;
PGraphics3D g3; 

int buttonValue = 1;

int myColor = color(255,0,0);

void setup() {
  size(400,400,OPENGL);
  g3 = (PGraphics3D)g;
  cam = new PeasyCam(this, 100);
  controlP5 = new ControlP5(this);
  controlP5.addButton("button",10,100,60,80,20).setId(1);
  controlP5.addButton("buttonValue",4,100,90,80,20).setId(2);
  controlP5.setAutoDraw(false);
}
void draw() {
  
  background(0);
  hint(ENABLE_DEPTH_TEST);
  fill(myColor);
  box(30);
  pushMatrix();
  translate(0,0,20);
  fill(0,0,255);
  box(5);
  popMatrix();
  // makes the gui stay on top of elements
  // drawn before.
  hint(DISABLE_DEPTH_TEST);
  gui();
  
}

void gui() {
   currCameraMatrix = new PMatrix3D(g3.camera);
   camera();
   controlP5.draw();
   g3.camera = currCameraMatrix;
}

void controlEvent(ControlEvent theEvent) {
  println(theEvent.controller().id());
}

void button(float theValue) {
  myColor = color(random(255),random(255),random(255));
  println("a button event. "+theValue);
}
 

