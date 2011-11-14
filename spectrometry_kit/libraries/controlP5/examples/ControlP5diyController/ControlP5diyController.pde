/**
 * ControlP5 DIY controller
 * this example shows how to create your own controller by extending and
 * using the abstract class Controller, the base class for every controller.
 * by andreas schlegel, 2009
 */
import controlP5.*;


ControlPad cp;
ControlP5 controlP5;

void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);

  // create a new instance of the ControlPad controller.
  cp = new ControlPad(controlP5,"DIY",60,40,100,100);
  // register the newly created ControlPad with controlP5
  controlP5.register(cp);
}

void draw() {
  background(0);
}

void controlEvent(ControlEvent theEvent) {
  println(theEvent.arrayValue());
}


// create your own ControlP5 controller.
// your own controller needs to extend controlP5.Controller
// for reference and documentation see the javadoc for controlP5
// and the source code as indicated on the controlP5 website.
class ControlPad extends Controller {

  // 4 fields for the 2D controller-handle
  int cWidth=10, cHeight=10; 
  float cX, cY;

  ControlPad(ControlP5 theControlP5, String theName, int theX, int theY, int theWidth, int theHeight) {
    // the super class Controller needs to be initialized with the below parameters
    super(theControlP5,  (Tab)(theControlP5.getTab("default")), theName, theX, theY, theWidth, theWidth);
    // the Controller class provides a field to store values in an 
    // float array format. for this controller, 2 floats are required.
    _myArrayValue = new float[2];
  }

  // overwrite the updateInternalEvents method to handle mouse and key inputs.
  public void updateInternalEvents(PApplet theApplet) {
    if(getIsInside()) {
      if(isMousePressed && !controlP5.keyHandler.isAltDown) {
        cX = constrain(mouseX-position.x(),0,width-cWidth);
        cY = constrain(mouseY-position.y(),0,height-cHeight);
        setValue(0);
      }
    }
  }

  // overwrite the draw method for the controller's visual representation.
  public void draw(PApplet theApplet) {
    // use pushMatrix and popMatrix when drawing
    // the controller.
    theApplet.pushMatrix();
    theApplet.translate(position().x(), position().y());
    // draw the background of the controller.
    if(getIsInside()) {
      theApplet.fill(150);
    } 
    else {
      theApplet.fill(100);
    }
    rect(0,0,width,height);

    // draw the controller-handle
    fill(255);
    rect(cX,cY,cWidth,cHeight);
    // draw the caption- and value-label of the controller
    // they are generated automatically by the super class
    captionLabel().draw(theApplet, 0, height + 4);
    valueLabel().draw(theApplet, 40, height + 4);

    theApplet.popMatrix();
  } 

  public void setValue(float theValue) {
    // setValue is usually called from within updateInternalEvents
    // in case of changes, updates. the update of values or 
    // visual elements is done here.
    _myArrayValue[0] = cX / ((float)(width-cWidth)/(float)width);
    _myArrayValue[1] = cY / ((float)(height-cHeight)/(float)height);
    // update the value label.
    valueLabel().set(adjustValue(_myArrayValue[0],0)+" / "+adjustValue(_myArrayValue[1],0));

    // broadcast triggers a ControlEvent, updates are made to the sketch, 
    // controlEvent(ControlEvent) is called.
    // the parameter (FLOAT or STRING) indicates the type of 
    // value and the type of methods to call in the main sketch.
    broadcast(FLOAT);
  }

  // needs to be implemented since it is an abstract method in controlP5.Controller
  // nothing needs to be set since this method is only relevant for saving 
  // controller settings and only applies to (most) default Controllers.
  public void addToXMLElement(ControlP5XMLElement theElement) {
  }
}


