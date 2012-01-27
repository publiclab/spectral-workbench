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
  
  cam = new GSCapture(this, 640, 480);  

  /*
  Note about camera selection in Mac:
  List functionality (GSCapture.list(), etc.) still not working.
  
  But it is possible to select the camera, althouth it is a little
  tricky right now. Under 32 bits, GSVideo uses a capture plugin (osxvideosrc)
  that accepts a camera specification as a sequence grabber input device in 
  format "sgname:input#". For example:
  
  cam = new GSCapture(this, 640, 480, "USB Video Class Video:0");  
  
  Under 64 bits, GSVideo uses a different capture plugin (qtkitvideoserc)
  which only accepts a device index for the time being:
  
  cam = new GSCapture(this, 640, 480, "0");
  cam = new GSCapture(this, 640, 480, "1");  
  etc.
  
  Note that the index must be given as a string, to maintain consistency with
  the API.   
  */
  
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
