// Transcodes an h264 movie in avi format as OGG inside a
// matroska (mkv) video file.
// 
// Source video is an excerpt from Amplify by Mike Creighton:
// http://vimeo.com/19511824

import codeanticode.gsvideo.*;

GSMovie movIn;
GSMovieMaker movOut;

String fnIn = "in.avi";
int widthIn = 640;
int heightIn = 480;

String fnOut = "data/out.mkv";
int fpsOut = 30;

int frame0, frame;

void setup() {
  size(640, 480);
  background(0);
  frameRate(30);
    
  movIn = new GSMovie(this, fnIn);
  movIn.play();
  
  movOut = new GSMovieMaker(this, widthIn, heightIn, fnOut, GSMovieMaker.THEORA, GSMovieMaker.HIGH, fpsOut);
  movOut.setQueueSize(0, 50);
  movOut.start();  
}

void movieEvent(GSMovie movie) {
  frame0 = frame;
  movie.read();
  frame = movie.frame();
  if (frame0 + 1 < frame) {
    println("Frame skipped: " + frame0 + " " + frame);  
  }
}

void draw() {    
  if (movIn.ready()) { 
    movOut.addFrame(movIn.pixels);
    image(movIn, 0, 0, width, height);
  }
  
  if (0 < movOut.getDroppedFrames()) {
    println("Dropped frames: " + movOut.getDroppedFrames());
  }
  
  if (!movIn.isPlaying()) {
    movOut.finish();
    exit();
  }
}
