/**
 * ControlP5 controlFont. 
 * (this example only works with processing version 1.1+ 
 * due to changes in PFont.)
 *
 * this example showshow to create a button with controlP5 (1), how to
 * load and use a PFont with controlP5 (2), apply a ControlFont to
 * the caption label of a button (3), and adjust the location of a
 * caption label using the style() property of a controller.
 * 
 * by andreas schlegel, 2010
 */
import controlP5.*;

ControlP5 controlP5;
ControlFont font;
controlP5.Button b;
int buttonValue = 1;
boolean isOpen;
int myColorBackground = color(0,0,0);


void setup() {
  size(640,480);
  smooth();
  frameRate(30);
  controlP5 = new ControlP5(this);
  // (1)
  // create some controllers
  controlP5.addButton("button",10,0,0,80,20).setId(1);
  b = controlP5.addButton("buttonValue",4,100,190,80,20);
  b.setId(2);
  b.setWidth(200);
  b.setHeight(200);
  
  // (2)
  // load a new font. ControlFont is a wrapper for processing's PFont
  // with processing 1.1 ControlFont.setSmooth() is not supported anymore.
  // to display a font as smooth or non-smooth, use true/false as 3rd parameter
  // when creating a PFont:
  PFont pfont = createFont("Times",20,true); // use true/false for smooth/no-smooth
  font = new ControlFont(pfont);
  
  // font.setSmooth(true); // font.setSmooth() is deprecated, see comments above.
  

  // (3)
  // change the font and content of the captionlabels 
  // for both buttons create earlier.
  controlP5.controller("button").captionLabel().setControlFont(font);
  controlP5.controller("button").captionLabel().setControlFontSize(10);
  b.captionLabel().setControlFont(font);
  b.captionLabel().setControlFontSize(80);
  b.captionLabel().toUpperCase(false);
  b.captionLabel().set("hello");
  
  // (4)
  // adjust the location of a catiption label using the 
  // style property of a controller.
  b.captionLabel().style().marginLeft = 4;
  b.captionLabel().style().marginTop = 36;

}

void draw() {
  background(buttonValue*10);
  // animate button b
  b.position().x += ((isOpen==true ? 0:-200) - b.position().x) * 0.2;
}

public void controlEvent(ControlEvent theEvent) {
  println(theEvent.controller().id());
}

public void button(float theValue) {
  println("a button event. "+theValue);
  isOpen = !isOpen;
  controlP5.controller("button").setCaptionLabel((isOpen==true) ? "close":"open");
}




