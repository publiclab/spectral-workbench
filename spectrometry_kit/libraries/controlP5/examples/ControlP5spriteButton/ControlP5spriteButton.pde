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

void setup() {
  size(800,400,OPENGL);
  smooth();
  frameRate(30);
  controlP5 = new ControlP5(this);
  
  ControllerSprite sprite = new ControllerSprite(controlP5,loadImage("buttonSprite.png"),75,75);
  sprite.setMask(loadImage("buttonSpriteMask.png"));
  sprite.enableMask();
  
  controlP5.Button b = controlP5.addButton("play",100,20,40,50,50);
  b.setSprite(sprite);  
  
  b = controlP5.addButton("play2",101,120,40,50,50);
  b.setSprite(sprite);  
  
  
}

void draw() {
  background(200);
}

public void play(int theValue) {
  println("playing : " + theValue); 
}
