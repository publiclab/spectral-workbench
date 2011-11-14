/**
 * ControlP5 GroupCanvas
 * by andreas schlegel, 2009
 */
import controlP5.*;

/**
  * WARNING
  * ControlCanvas and ControlWindowCanvas are yet EXPERIMENTAL
  * and therefore will undergo changes in the future before being
  * fully functional!
  */
  
ControlP5 controlP5;
  
void setup() {
  size(400,400);
  frameRate(30);

  controlP5 = new ControlP5(this);
  ControlGroup l = controlP5.addGroup("myGroup",100,40);
  l.addCanvas(new TestCanvas());
}

void draw() {
  background(0);
}


void controlEvent(ControlEvent theEvent) {
  println("got an event from "+theEvent.controller().name());
}


class TestCanvas extends ControlCanvas {
  TestCanvas() {
  }
  
  public void draw(PApplet theApplet) {
    theApplet.fill(int(random(244)));
    theApplet.rect(0,0,100,100);
  }
}
