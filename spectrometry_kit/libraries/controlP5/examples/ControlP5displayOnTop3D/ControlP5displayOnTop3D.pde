import controlP5.*;
import processing.opengl.*;

ControlP5 controlP5;
int messageBoxResult = -1;
ControlGroup messageBox;
String messageBoxString = "";


void setup() {
  size(640,480,OPENGL);
  frameRate(30);
  controlP5 = new ControlP5(this);
  createMessageBox();
  controlP5.Button b = controlP5.addButton("toggleBox",1,20,20,100,20);
  b.setLabel("Toggle Box");
  PFont font = createFont("",30);
  textFont(font);
}

float t;
void draw() {
  hint(ENABLE_DEPTH_TEST);
  pushMatrix();
  if(messageBox.isVisible()) {
    background(128);
  } else {
    background(0);
    fill(255);
    text(messageBoxString,20,height-40);
  }
  
  translate(width/2,height/2,mouseX);
  rotateY(t+=0.1);
  fill(255);
  rect(-50,-50,100,100);
  popMatrix();
  hint(DISABLE_DEPTH_TEST);
}



void toggleBox(int theValue) {
  if(messageBox.isVisible()) {
    messageBox.hide();
  } else {
    messageBox.show();
  }
}


void createMessageBox() {
  // create a group to store the messageBox elements
  messageBox = controlP5.addGroup("messageBox",width/2 - 150,100,300);
  messageBox.setBackgroundHeight(120);
  messageBox.setBackgroundColor(color(0,100));
  messageBox.hideBar();
  
  // add a TextLabel to the messageBox.
  Textlabel l = controlP5.addTextlabel("messageBoxLabel","Some MessageBox text goes here.",20,20);
  l.moveTo(messageBox);
  
  // add a textfield-controller with named-id inputbox
  // this controller will be linked to function inputbox() below.
  Textfield f = controlP5.addTextfield("inputbox",20,36,260,20);
  f.captionLabel().setVisible(false);
  f.moveTo(messageBox);
  f.setColorForeground(color(20));
  f.setColorBackground(color(20));
  f.setColorActive(color(100));
  // add the OK button to the messageBox.
  // the name of the button corresponds to function buttonOK
  // below and will be triggered when pressing the button.
  controlP5.Button b1 = controlP5.addButton("buttonOK",0,65,80,80,24);
  b1.moveTo(messageBox);
  b1.setColorBackground(color(40));
  b1.setColorActive(color(20));
  // by default setValue would trigger function buttonOK, 
  // therefore we disable the broadcasting before setting
  // the value and enable broadcasting again afterwards.
  // same applies to the cancel button below.
  b1.setBroadcast(false); 
  b1.setValue(1);
  b1.setBroadcast(true);
  b1.setCaptionLabel("OK");
  // centering of a label needs to be done manually 
  // with marginTop and marginLeft
  //b1.captionLabel().style().marginTop = -2;
  //b1.captionLabel().style().marginLeft = 26;
  
  // add the Cancel button to the messageBox. 
  // the name of the button corresponds to function buttonCancel
  // below and will be triggered when pressing the button.
  controlP5.Button b2 = controlP5.addButton("buttonCancel",0,155,80,80,24);
  b2.moveTo(messageBox);
  b2.setBroadcast(false);
  b2.setValue(0);
  b2.setBroadcast(true);
  b2.setCaptionLabel("Cancel");
  b2.setColorBackground(color(40));
  b2.setColorActive(color(20));
  //b2.captionLabel().toUpperCase(false);
  // centering of a label needs to be done manually 
  // with marginTop and marginLeft
  //b2.captionLabel().style().marginTop = -2;
  //b2.captionLabel().style().marginLeft = 16;
}

// function buttonOK will be triggered when pressing
// the OK button of the messageBox.
void buttonOK(int theValue) {
  println("a button event from button OK.");
  messageBoxString = ((Textfield)controlP5.controller("inputbox")).getText();
  messageBoxResult = theValue;
  messageBox.hide();
}


// function buttonCancel will be triggered when pressing
// the Cancel button of the messageBox.
void buttonCancel(int theValue) {
  println("a button event from button Cancel.");
  messageBoxResult = theValue;
  messageBox.hide();
}

// inputbox is called whenever RETURN has been pressed 
// in textfield-controller inputbox 
void inputbox(String theString) {
  println("got something from the inputbox : "+theString);
  messageBoxString = theString;
  messageBox.hide();
}
