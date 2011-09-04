/**
  * ControlP5 scrollList. depricated, use listBox.
  *
  * by andreas schlegel, 2009
  */
  
import controlP5.*;

ControlP5 controlP5;

ScrollList l;

void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  controlP5.setControlFont(new ControlFont(createFont("Times",20),14));
  l = controlP5.addScrollList("myList",100,100,220,280);
  l.setItemHeight(30);
  l.setBarHeight(20);

  l.captionLabel().toUpperCase(false);
  l.captionLabel().set("something else");
  l.captionLabel().style().marginTop = 4;
  for(int i=0;i<40;i++) {
    controlP5.Button b = l.addItem("a"+i,i);
    b.setId(100 + i);
  }
}

void controlEvent(ControlEvent theEvent) {
  // ScrollList is of type ControlGroup.
  // when an item in a scrollList is activated,
  // 2 controlEvents will be broadcasted.
  // the first one event is triggered from the ScrollList,
  // the second one from the button that has been pressed
  // inside the scrollList.
  // to avoid an error message from controlP5, you
  // need to check what type of item did trigger the
  // event, either a controller or a group.
  if(theEvent.isController()) {
    // an event from a controller e.g. button
    println(theEvent.controller().value()+" from "+theEvent.controller());
  } 
  else if (theEvent.isGroup()) {
    // an event from a group e.g. scrollList
    println(theEvent.group().value()+" from "+theEvent.group());
  }
}

void keyPressed() {
  if(key=='r') {
    l.removeItem("a"+int(random(40)) );
  } 
  else if(key=='a') {
    l.addItem("a"+int(random(40)), int(random(100)) );
  }
}
void draw() {
  background(0);
  // scroll the scroll List according to the mouseX position
  // when holding down SPACE.
  if(keyPressed && key==' ') {
    l.scroll(mouseX/((float)width)); // scroll taks values between 0 and 1
  }
}



