/**
 * ControlP5 Listener
 * by andreas schlegel, 2009
 */
import controlP5.*;

ControlP5 controlP5;
MyControlListener myListener;

void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  controlP5.addSlider("mySlider",100,200,140,200,200,100,10);
  
  myListener = new MyControlListener();
  controlP5.controller("mySlider").addListener(myListener);
}

void draw() {
  background(myListener.col);  
}


class MyControlListener implements ControlListener {
  int col;
  public void controlEvent(ControlEvent theEvent) {
    println("i got an event from mySlider, " +
            "changing background color to "+
            theEvent.controller().value());
    col = (int)theEvent.controller().value();
  }

}
