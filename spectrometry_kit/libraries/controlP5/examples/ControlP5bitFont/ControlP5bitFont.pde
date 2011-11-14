/**
ControlP5 bitFont.
this example shows you how to load your own pixel fonts into controlP5. Each letter is 
separated by a red dot at the top of the source bit-font image. How a bit-font is created 
and has to be formatted, see the examples fonts inside the data folder of this sketch.
The following characters are supported (the first character is a SPACE). 
 !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~
 
Example sketch ControlLabelExtended shows you how to use PFont instead of a bitfont.
by andreas schlegel, 2009
*/

import controlP5.*;


ControlP5 controlP5;
controlP5.Label label;
Textfield myTextfield;
int myBitFontIndex;


void setup() {
  size(400,400);
  controlP5 = new ControlP5(this);
  label = new controlP5.Label(this, "some funny text here.", 100,40);
  label.position.x = 100;
  label.position.y = 100;
  label.toUpperCase(false);
  // load a new font and apply it to the newly created label.
  int myBitFontIndex = label.bitFontRenderer.addBitFont(loadImage("myFontA.gif"));
  label.setFont(myBitFontIndex);

  // apply the newly loaded bit font to the below textfield.
  myTextfield = controlP5.addTextfield("textinput",100,160,200,20);
  myTextfield.setFocus(true);
  myTextfield.valueLabel().setFont(myBitFontIndex);
  myTextfield.valueLabel().style().marginTop = -2;
}

void draw() {
  background(0);
  label.draw(this);
}

void textinput(String theValue) {
  label.set(theValue);
}


void mousePressed() {
  // change the font of our label when the mouse is pressed.
  if(label.getFont() == ControlP5.standard56) {
    label.setFont(ControlP5.standard58);
  } 
  else {
    label.setFont(ControlP5.standard56);
  }
}

