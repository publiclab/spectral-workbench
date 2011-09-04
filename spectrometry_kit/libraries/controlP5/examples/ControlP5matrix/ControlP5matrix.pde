/**
 * ControlP5 Matrix
 * click into the blue box, the matrix, to activate and deactivate
 * cells of the matrix. A matrix can be used for example
 * a sequencer, a drum machine.
 *
 * by andreas schlegel, 2009
 */
import controlP5.*;

ControlP5 controlP5;

int myColorBackground = color(0,0,0);

void setup() {
  size(600,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  controlP5.addMatrix("someMatrix", 20, 20, 10, 10, 400, 300);
}

void draw() {
  background(myColorBackground);
}


void keyPressed() {
  controlP5.controller("someMatrix").setValue(256);
}

void controlEvent(ControlEvent theEvent) {
  println("## controlEvent / id:"+theEvent.controller().id()+"\n"+
      "name:"+theEvent.controller().name()+"\n"+
      "label:"+theEvent.controller().label()+"\n"+
      "value:"+theEvent.controller().value()+"\n"+
      "matrixValue x:"+Matrix.getX(theEvent.controller().value())+"\n"+
      "matrixValue y:"+Matrix.getY(theEvent.controller().value())+"\n"      
      );
}
