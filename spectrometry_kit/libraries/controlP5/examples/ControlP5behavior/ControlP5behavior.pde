/**
 * <b>ControlP5behavior</b><br /> 
 * ControlBehavior is an abstract class that can be extended using your 
 * custom control behaviors. What is a control behavior? Control Behaviors
 * allow you to automate and dynamically change the state or value of a
 * controller. One behavior per controller is currently supported. i case you
 * need to use more that one bahavior, the implementation has to happen
 * on your side - inside your control behavior. <br />
 * by Andreas Schlegel 2010<br />
 * 
 */
import controlP5.*;


ControlP5 controlP5;

int myColorBackground = color(0,0,0);

public int sliderValue = 100;

void setup() {
  size(400,400);
  frameRate(30);
  controlP5 = new ControlP5(this);
  controlP5.addSlider("sliderValue",0,255,128,100,50 + height/2,40,100);
  controlP5.addSlider("slider",100,255,128,100,50,100,40);
  
  controlP5.addBang("bang",40,50 + height/2,40,40);
  // add a custom ControlBehavior to controller bang,
  // class TimerEvent is included in this sketch at the bottom
  // and extends abstract class ControlBehavior.
  controlP5.controller("bang").setBehavior(new TimedEvent());
  
  // use an anonymous class of type ControlBehavior.
  controlP5.controller("slider").setBehavior(new ControlBehavior() {
    float a = 0;
    public void update() { setValue(sin(a += 0.1) * 50  + 150); }
  });
  
  
}

void draw() {
  background(myColorBackground);
  fill(sliderValue);
  rect(0,0,width,height/2);
}

void slider(float theColor) {
  myColorBackground = color(theColor);
  println("# a slider event. setting background to "+theColor);
}

public void bang() {
  println("# an event received from controller bang.");
  // a bang will set the value of controller sliderValue
  // to a random number between 0 and 255.
  controlP5.controller("sliderValue").setValue(random(0,255));
}

// custom ControlBehavior
class TimedEvent extends ControlBehavior {
  long myTime;
  int interval = 200;

  public TimedEvent() { reset(); }
  void reset() { myTime = millis() + interval; }

  public void update() {
    if(millis()>myTime) { setValue(1); reset(); }
  }
}

