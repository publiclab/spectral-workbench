import controlP5.*;

ControlP5 controlP5;
Slider2D s;

void setup() {
  size(400,400);
  controlP5 = new ControlP5(this);
  //Slider2D s = controlP5.addSlider2D("slider",0,10,0,10,5,5, 20,100,100,100);
  s = controlP5.addSlider2D("wave",30,40,100,100);
  s.setArrayValue(new float[] {50, 50});  
  smooth();
}

float cnt;
void draw() {
  background(0);
  pushMatrix();
  translate(160,140);
  strokeWeight(1);
  stroke(255,100);
  rect(0,-100, 200,200);
  line(0,0,200, 0);
  stroke(255);
  
  strokeWeight(2);
  for(int i=1;i<200;i++) {
    float y0 = cos(map(i-1,0,s.arrayValue()[0],-PI,PI)) * s.arrayValue()[1]; 
    float y1 = cos(map(i,0,s.arrayValue()[0],-PI,PI)) * s.arrayValue()[1];
    line((i-1),y0,i,y1);
  }
  
  popMatrix();
}
