import controlP5.*;

/**
 * ControlP5 canvas.
 * WARNING
 * ControlCanvas and ControlWindowCanvas are yet EXPERIMENTAL
 * and therefore will undergo changes in the future before being
 * fully functional!
 *
 * by andreas schlegel, 2009
 */


ControlP5 controlP5;
ControlWindow controlWindow;
ControlWindowCanvas cc;

// your controlWindowCanvas class
class MyCanvas extends ControlWindowCanvas {
  public void draw(PApplet theApplet) {
    theApplet.fill(random(255));
    theApplet.rect(theApplet.mouseX,10,100,100);
  }
}


void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);

  // create a control window.
  controlWindow = controlP5.addControlWindow("controlP5window",100,100,400,400,30);

  // for continuous update use ControlWindow.NORMAL  to update a control
  // window only when it is in focus, use ControlWindow.ECONOMIC
  // economic is the default update value.
  controlWindow.setUpdateMode(ControlWindow.NORMAL);


  // create a control window canvas and add it to
  // the control window from above.  
  cc = new MyCanvas();
  cc.pre(); // use cc.post(); to draw on top of the controllers.
  controlWindow.addCanvas(cc);

}


void controlEvent(ControlEvent theEvent) {
  println(theEvent.controller().id()+"  /  "+
    theEvent.controller()+"  /  "+
    theEvent.controller().value()
    );
}


void draw() {
  background(0);
}

