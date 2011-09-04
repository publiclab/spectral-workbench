/**
 * ControlP5 Checkbox
 * an example demonstrating the use of a checkbox in controlP5. 
 * to control a checkbox use:
 * activate(), deactivate(), activateAll(), deactivateAll()
 * toggle(), getState()
 * see the reference for further details
 * by andreas schlegel, 2010
 */
import controlP5.*;

ControlP5 controlP5;

CheckBox checkbox;

int myColorBackground;
void setup() {
  size(400,400);
  smooth();
  controlP5 = new ControlP5(this);
  checkbox = controlP5.addCheckBox("checkBox",20,20);  
  // make adjustments to the layout of a checkbox.
  checkbox.setColorForeground(color(120));
  checkbox.setColorActive(color(255));
  checkbox.setColorLabel(color(128));
  checkbox.setItemsPerRow(3);
  checkbox.setSpacingColumn(30);
  checkbox.setSpacingRow(10);
  // add items to a checkbox.
  checkbox.addItem("0",0);
  checkbox.addItem("10",10);
  checkbox.addItem("50",50);
  checkbox.addItem("100",100);
  checkbox.addItem("200",200);
  checkbox.addItem("5",5);
}

void keyPressed() {
  println(char(1)+" / "+keyCode);
  if(key==' '){
    checkbox.deactivateAll();
  } else {
    for(int i=0;i<6;i++) {
      // check if key 0-5 have been pressed and toggle
      // the checkbox item accordingly.
      if(keyCode==(48 + i)) { 
        // the index of checkbox items start at 0
        checkbox.toggle(i);
        println("toggle "+checkbox.getItem(i).name());
        // also see 
        // checkbox.activate(index);
        // checkbox.deactivate(index);
      }
    }
  }
}

void draw() {
  background(myColorBackground);
  fill(0);
  rect(10,10,150,60);
}

void controlEvent(ControlEvent theEvent) {
  if(theEvent.isGroup()) {
    myColorBackground = 0;
    print("got an event from "+theEvent.group().name()+"\t");
    // checkbox uses arrayValue to store the state of 
    // individual checkbox-items. usage:
    for(int i=0;i<theEvent.group().arrayValue().length;i++) {
      int n = (int)theEvent.group().arrayValue()[i];
      print(n);
      if(n==1) {
        myColorBackground += ((RadioButton)theEvent.group()).getItem(i).internalValue();
      }
    }
    println();
  }
}



