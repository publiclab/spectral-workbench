/**
 * ControlP5 textfield (advanced)
 * textfield advanced example by andreas schlegel, 11.02.2009
 * demonstrates how to use keepFocus, setText, getText, getTextList,
 * clear, setAutoClear, isAutoClear and submit.
 * by andreas schlegel, 2009
 */

import controlP5.*;
ControlP5 controlP5;

String textValue = "";
Textfield myTextfield;

void setup() {
  size(600,400);
  frameRate(25);
  controlP5 = new ControlP5(this);
  myTextfield = controlP5.addTextfield("texting",160,100,200,20);
  myTextfield.setFocus(true);
  controlP5.addTextfield("textValue",100,200,200,20);
  // use setAutoClear(true/false) to clear a textfield or keep text displayed in
  // a textfield after pressing return.
  myTextfield.setAutoClear(true);
  myTextfield.keepFocus(true);

  controlP5.addButton("clear",0,60,100,90,20);
  controlP5.addButton("performTextfieldActions",0,60,50,150,20);
  controlP5.addToggle("toggleAutoClear",true,220,50,100,20).setCaptionLabel("Auto Clear");
  controlP5.addToggle("toggleKeepFocus",true,330,50,100,20).setCaptionLabel("Keep Focus");

  controlP5.addButton("submit",0,370,100,60,20);
}

void draw() {
  background(0);
}

void toggleAutoClear(boolean theFlag) {
  myTextfield.setAutoClear(theFlag);
}

void toggleKeepFocus(boolean theFlag) {
  myTextfield.keepFocus(theFlag);
}

void clear(int theValue) {
  myTextfield.clear();
}

void submit(int theValue) {
  myTextfield.submit();
}


void controlEvent(ControlEvent theEvent) {
  if(theEvent.controller() instanceof Textfield) {
    println("controlEvent: accessing a string from controller '"+theEvent.controller().name()+"': "+theEvent.controller().stringValue());
    // Textfield.isAutoClear() must be true
    print("controlEvent: trying to setText, ");
    ((Textfield)theEvent.controller()).setText("controlEvent: changing text.");
    if(((Textfield)theEvent.controller()).isAutoClear()==false) {
      println(" success!");
    } 
    else {
      println(" but Textfield.isAutoClear() is false, could not setText here.");
    }
  }
}

void performTextfieldActions() {
  println("\n");
  // Textfield.getText();
  println("the current text of myTextfield: "+myTextfield.getText());
  println("the current value of textValue: "+textValue);
  // Textfield.setText();
  myTextfield.setText("changed the text of a textfield");
  println("changing text of myTextfield to: "+myTextfield.getText());
  // Textfield.getTextList();
  println("the textlist of myTextfield has "+myTextfield.getTextList().length+" items.");
  for(int i=0;i<myTextfield.getTextList().length;i++) {
    println("\t"+myTextfield.getTextList()[i]);
  }
  println("\n");
}




public void texting(String theText) {
  // receiving text from controller texting
  println("a textfield event for controller 'texting': "+theText);
}



