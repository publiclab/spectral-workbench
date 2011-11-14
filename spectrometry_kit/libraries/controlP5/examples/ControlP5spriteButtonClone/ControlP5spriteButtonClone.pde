/**
 * ControlP5 SpriteButton
 *
 * IMPORTANT !!
 * ControlerSprite is yet experimental and will undergo
 * changes and modifications.
 * required png images are included in the data folder of thius sketch.
 *
 * by andreas schlegel, 2009
 */
 
import controlP5.*;
import processing.opengl.*;
ControlP5 controlP5;


ControllerSprite sprite;
controlP5.Button b1;
controlP5.Button b2;

void setup() {
  size(800,400,OPENGL);
  smooth();
  frameRate(30);
  controlP5 = new ControlP5(this);
  
  sprite = new ControllerSprite(controlP5,loadImage("buttonSprite.png"),75,75,3);
  sprite.setMask(loadImage("buttonSpriteMask.png"));
  sprite.enableMask();
  
  b1 = controlP5.addButton("play",100,20,40,50,50);
  b1.setSprite(sprite.clone());  
  
  b2 = controlP5.addButton("play2",101,120,40,50,50);
  b2.setSprite(sprite.clone());  
  
  
}

void keyPressed() {
  if(key=='1') {
  b1.getSprite().setForceState(0);
  } else if(key=='2') {
  b1.getSprite().setForceState(1);
  } else if(key=='3') {
  b1.getSprite().setForceState(2);
  }
}

void draw() {
  background(200);
}

public void play(int theValue) {
  println(theValue); 
}
