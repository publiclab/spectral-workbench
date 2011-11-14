import controlP5.*;
ControlP5 controlP5;
ControlWindow controlWindow;
ControlWindowCanvas cc;

// this example demonstrates how to use a ControlWindowCanvas 
// which can from different windows.
// click the mouse in both windows to see the effect.

// your controlWindowCanvas class
class MyCanvas extends ControlWindowCanvas {
  
  public void draw(PApplet theApplet) {
    theApplet.background(255);
     // a rectangle will be drawn if the mouse has been
    // pressed inside the main sketch window.
    // mousePressed here refers to the mousePressed
    // variable of your main sketch
    if(mousePressed) {
      theApplet.fill(255,0,0);
      theApplet.rect(10,10,100,100);
      theApplet.fill(0);
      theApplet.ellipse(mouseX,mouseY,20,20);
    }
    // will draw a rectangle into the controlWindow
    // if the mouse has been pressed inside the controlWindow itself.
    // theApplet.mousePressed here refers to the
    // mousePressed variable of the controlWindow.
    if(theApplet.mousePressed) {
      theApplet.fill(0);
      theApplet.rect(10,10,100,100);
      theApplet.fill(255,0,0);
      theApplet.ellipse(theApplet.mouseX,theApplet.mouseY,20,20);
    }
    
  }

}


void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);

  controlWindow = controlP5.addControlWindow("controlP5window",100,100,width,height,30);
  controlWindow.setUpdateMode(ControlWindow.NORMAL);

  cc = new MyCanvas();
  cc.pre();
  controlWindow.addCanvas(cc);

}

void draw(){}


