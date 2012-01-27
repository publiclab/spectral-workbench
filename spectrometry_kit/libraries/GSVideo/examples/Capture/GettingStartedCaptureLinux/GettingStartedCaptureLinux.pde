/**
 * Getting Started with Capture.
 * 
 * GSVideo version by Andres Colubri. 
 * 
 * Reading and displaying an image from an attached Capture device. 
 */ 
import codeanticode.gsvideo.*;

GSCapture cam;

void setup() {
  size(640, 480);

/*
  // List functionality (GSCapture.list(), etc) still not ready on Linux
  
  However, a camera can be selected by using its corresponding device file:
  cam = new GSCapture(this, 640, 480, "/dev/video0");
  cam = new GSCapture(this, 640, 480, "/dev/video1");
  etc.
  */

  cam = new GSCapture(this, 640, 480);
  cam.start();  
  
  /*
  // You can get the resolutions supported by the
  // capture device using the resolutions() method.
  // It must be called after creating the capture 
  // object. 
  int[][] res = cam.resolutions();
  for (int i = 0; i < res.length; i++) {
    println(res[i][0] + "x" + res[i][1]);
  } 
  */
  
  /*
  // You can also get the framerates supported by the
  // capture device:
  String[] fps = cam.framerates();
  for (int i = 0; i < fps.length; i++) {
    println(fps[i]);
  } 
  */  
}

void draw() {
  if (cam.available() == true) {
    cam.read();
    image(cam, 0, 0);
    // The following does the same, and is faster when just drawing the image
    // without any additional resizing, transformations, or tint.
    //set(0, 0, cam);
  }
}
