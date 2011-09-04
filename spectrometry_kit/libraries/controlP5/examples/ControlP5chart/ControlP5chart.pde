/**
 * press any key to change input data for the chart.
*/
import controlP5.*;

ControlP5 controlP5;
Chart myChart;
float[] f;
import processing.opengl.*;

void setup() {
  size(600,400);
  smooth();

  frameRate(30);
  controlP5 = new ControlP5(this);
  myChart = controlP5.addChart("Hello",20,20,400,100);
  controlP5.addButton("hello",2,200,200,100,20);
  controlP5.addSlider("slider",0,100,50,320,200,100,20).setNumberOfTickMarks(11);
  //myChart.setDisplay(new ChartBarDisplay(myChart));
  myChart.setStrokeWeight(1);
  ChartDataSet cds = myChart.addDataSet();
  cds.getColor().setForeground(color(255,150));
  f = new float[100];
  for(int i=0;i<f.length;i++) {
    f[i] = random(0,60);
  }
  myChart.updateData(0,f);

  for(int i=0;i<f.length;i++) {
    f[i] = random(40,80);
  }
  myChart.updateData(1,f);
}


void draw() {
  background(0);
  if(keyPressed) {
    float[] tf = new float[f.length-1];
    arrayCopy(f,tf,tf.length);
    f[0] = random(0,60);
    arrayCopy(tf,0,f,1,tf.length);
    myChart.updateData(f);
  }
}



class ChartBarDisplay implements ControllerDisplay {

  Chart myChart;

  public ChartBarDisplay(Chart theChart) {
    myChart = theChart;
  }

  public void display(PApplet p, Controller theController) {
    p.pushMatrix();
    for(int n=0;n<myChart.size();n++) {
      float total = 0;
      for(int i=0;i<myChart.getDataSet(n).size();i++) {
        total += myChart.getDataSet(n).get(i).getValue();
      }

      float segment = TWO_PI/total;
      float angle = 0;
      p.fill(255);
      p.translate(0, n*(myChart.getWidth()+10));
      for(int i=0;i<myChart.getDataSet(n).size();i++) {      
        fill(255 - i*20);
        float nextAngle = angle + myChart.getDataSet(n).get(i).getValue()*segment;
        p.arc(0,0,myChart.getWidth(), myChart.getHeight(),angle-0.1, nextAngle);
        angle = nextAngle;
      }
    }
    p.popMatrix();
    
    //    p.fill(myChart.getColor().getBackground());
    //    p.noStroke();
    //    p.rect(0, 0, myChart.getWidth(), myChart.getHeight());
    //    p.stroke(myChart.getColor().getForeground());
    //    for(int n=0;n<myChart.size();n++) {
    //      p.stroke( myChart.getDataSet(n).getColor().getForeground() );      
    //      for(int i=0;i<myChart.getDataSet(n).size();i++) {
    //        p.line(n+i*3, myChart.getDataSet(n).get(i).getValue(), n+i*3, 100);
    //      }
    //    }
  }
}

