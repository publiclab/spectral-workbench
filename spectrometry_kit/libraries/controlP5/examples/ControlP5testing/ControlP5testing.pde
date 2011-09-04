import controlP5.*;


ControlP5 controlP5;

int myColorBackground = color(0,0,0);

void setup() {
  size(400,400);
  controlP5 = new ControlP5(this);
  Tab t = controlP5.addTab(this,"new");
  controlP5.addTab(this,"new2");
  for(int i=0;i<4;i++) {
    controlP5.addBang("bang"+i,100,40+i*40,20,20).setTab("new");
  }
  controlP5.addBang("defaultBang",100,100,20,20);
}

void draw() {
  background(myColorBackground);
}


void mousePressed() {
}


void bang() {
  int theColor = (int)random(255);
  myColorBackground = color(theColor);
  println("a bang event. setting background to "+theColor);
}

void keyPressed() {
  /*
  if(key==' ') {
   if(controlP5.controller("bang").isVisible()) {
   controlP5.controller("bang").hide();
   } else {
   controlP5.controller("bang").show();
   }
   }
   */
  if(key=='.') {
    for(int i=0;i<20;i++) {
      controlP5.addBang("bang"+i,100,40+i*30,20,20);
    }
    System.gc();
  } 
  else if (key==',') {
    for(int i=0;i<20;i++) {
      controlP5.remove("bang"+i);
    }
  } else if (key=='m') {
    controlP5.remove("new");
  }
}
