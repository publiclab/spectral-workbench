/*

 Spectrofone - a spectrometer-based musical instrument or guitar pedal
 by Jeffrey Warren of the Public Laboratory for Open Technology and Science
 publiclaboratory.org
 
 (c) Copyright 2011 Jeffrey Warren
 
 This code is released under the MIT License
 
 */

import processing.video.*; //mac or windows
//import codeanticode.gsvideo.*; //linux
import ddf.minim.analysis.*;
import ddf.minim.*;

Capture video; //mac or windows
//GSCapture video; //linux

Minim minim;
AudioInput in;
AudioOutput out;
FFT fft;
SpectrumCollector spectrumfilter;

int bsize = 512;
String colortype = "combined";
String typedText = "type to label spectrum";
PFont font;
int audiocount = 0;
int res = 1;
int samplesize = 80;
int samplerow;
int lastval = 0;
// for rgb mode:
int lastred = 0;
int lastgreen = 0;
int lastblue = 0;
int[] spectrumbuf;
int[] lastspectrum;
int[] absorption;
int[] contrastEnhancedAbsorption;
int averageAbsorption = 0;
int absorptionSum;

public void setup() {
  //size(screen.width, screen.height, P2D);
  size(1280, 720, P2D);
  //size(640, 480, P2D);
  //size(320, 240, P2D);
  // Or run full screen, more fun! Use with Sketch -> Present
  //size(screen.width, screen.height, OPENGL);
  //video = new Capture(this, width, height, 20); //mac or windows
  video = new GSCapture(this, width, height, "/dev/video1"); //linux; type "ls /dev/video*" in the terminal to discover video devices
  video.play(); //linux only
  samplerow = int (height*(0.50));
//  video.settings(); // mac or windows only, allows selection of video input
  font = loadFont("Ubuntu-18.vlw");  
  spectrumbuf = new int[width];
  lastspectrum = new int[width];
  absorption = new int[width];
  contrastEnhancedAbsorption = new int[width];
  for (int x = 0;x < width;x++) { // is this necessary? initializing the spectrum buffer with zeroes? come on!
    spectrumbuf[x] = 0;
    absorption[x] = 0;
    contrastEnhancedAbsorption[x] = 0;
  }
  minim = new Minim(this);
  minim.debugOn();
  in = minim.getLineIn(Minim.MONO, bsize);
  out = minim.getLineOut(Minim.MONO, bsize);
  // create an FFT object that has a time-domain buffer 
  // the same size as jingle's sample buffer
  // note that this needs to be a power of two 
  // and that it means the size of the spectrum
  // will be 512. see the online tutorial for more info.
  fft = new FFT(out.bufferSize(), out.sampleRate());
  fft.window(FFT.HAMMING);
  spectrumfilter = new SpectrumCollector(out.bufferSize());
  // passes the mic input to the spectrum filter class
  in.addListener(spectrumfilter);
  // passes the result of the spectrum filter class to the audio output
  out.addSignal(spectrumfilter);
}

public void captureEvent(Capture c) { //mac or windows
  //public void captureEvent(GSCapture c) { //linux
  c.read();
}

void draw() {
  loadPixels(); //load screen pixel buffer
  background(0);

  stroke(255);
  line(0,height-255,width,height-255); //100% mark for spectra

    textFont(font,18);
    text("PLOTS Spectral Workbench", 15, 160); //display current title
    text(typedText, 15, 190); //display current title
    fill(150);
//    text("red=baseline, white=current, yellow=absorption",15,height-255+45);

  // re-zero intensity sum
  absorptionSum = 0;

  ////////////////////////////////////
  // SAMPLE FROM VIDEO INPUT
  ////////////////////////////////////

  int index = int (video.width*samplerow); //the horizontal strip to sample
  for (int x = 0; x < int (width); x+=res) {

    int r = 0, g = 0, b = 0;

    for (int yoff = int (samplesize/-2); yoff < int (samplesize/2); yoff+=1) {
      int sampleind = int ((video.width*samplerow)+(video.width*yoff)+x);

      if (sampleind >= 0 && sampleind <= (video.height*video.width)) {
        int pixelColor = video.pixels[sampleind];
        // Faster method of calculating r, g, b than red(), green(), blue() 
        r = r+((pixelColor >> 16) & 0xff);
        g = g+((pixelColor >> 8) & 0xff);
        b = b+(pixelColor & 0xff);
      }
    }    

    // sample <samplesize> rows of data in each of 3 colors:
    r = int (r/(samplesize*1.00));
    g = int (g/(samplesize*1.00));
    b = int (b/(samplesize*1.00));

    // draw direct output of averaged camera sampling
    spectrumbuf[x] = (r+g+b)/3;
    for (int y = 0; y < int (height/4); y+=res) {
      pixels[(y*width)+x] = color(r,g,b);
    }

    ////////////////////////////////////
    // DRAW SPECTRUM INTENSITY GRAPH
    ////////////////////////////////////

    if (colortype == "combined") {
      // current live spectrum:
      stroke(255);
      int val = (r+g+b)/3;
      line(x,height-lastval,x+1,height-val);
      lastval = (r+g+b)/3;

      // last saved spectrum:
      stroke(color(255,0,0));
      int lastind = x-1;
      if (lastind < 0) { 
        lastind = 0;
      }
      line(x,height-lastspectrum[lastind],x+1,height-lastspectrum[x]);

      // percent absorption compared to reference reading
      stroke(color(255,255,0));
      // calculate absorption for this x position, store it in the absorption buffer:
      absorption[x] = int (255*(1-(val/(lastspectrum[x]+1.00))));
      int last = x-1;
      if (last < 0) { last = 0; }
      line(x,height-absorption[last],x+1,height-absorption[x]);

      // contrast-enhanced absorption:
      absorptionSum += absorption[x];
      // amplify by scale factor:
      contrastEnhancedAbsorption[x] = (absorption[x] - averageAbsorption) * 4;
      contrastEnhancedAbsorption[x] += averageAbsorption;
      stroke(color(0,255,0)); // green line
      last = x-1;
      if (last < 0) { last = 0; }
      line(x,height-contrastEnhancedAbsorption[last],x+1,height-contrastEnhancedAbsorption[x]);

    } else if (colortype == "rgb") { // RGB sensor calibration mode

      // red channel:
      stroke(color(255,0,0));
      line(x,height-lastred,x+1,height-r);
      lastred = r;      
      // green channel:
      stroke(color(0,255,0));
      line(x,height-lastgreen,x+1,height-g);
      lastgreen = g;
      // blue channel:
      stroke(color(0,0,255));
      line(x,height-lastblue,x+1,height-b);
      lastblue = b;
    }

    index++;
  }

  averageAbsorption = absorptionSum/width;
  stroke(color(128,128,128));
  line(0,averageAbsorption,width,averageAbsorption);
  updatePixels();
}

void keyPressed() {
  if (key == CODED) {
    if (keyCode == DOWN) {
      samplerow += 1;
      if (samplerow >= video.height) {
        samplerow = video.height;
      }
    } 
    else if (keyCode == UP) {
      samplerow -= 1;
      if (samplerow <= 0) {
        samplerow = 0;
      }
    }
  } 
  else if (key == ' ') {
    for (int x = 0;x < spectrumbuf.length;x++) {
      lastspectrum[x] = spectrumbuf[x];
    }
  }
  else if (key == 's') {
    //save JSON:

    //save PNG:
    save(year()+"-"+month()+"-"+day()+"-"+hour()+""+minute()+"-"+typedText+".png");
    //save to web:
    //http://libraries.seltar.org/postToWeb/
    typedText = "";
  } 
  else if (keyCode == TAB) {
    if (colortype == "combined") {
      colortype = "rgb";
    } 
    else if (colortype == "rgb") {
      colortype = "combined";
    }
  } 
  else if (keyCode == BACKSPACE) {
    typedText = typedText.substring(0,max(0,typedText.length()-1));
  } 
  else if (keyCode == ESC) {
    typedText = "";
  } 
  else {
    if (typedText == "type to label spectrum") { 
      typedText = "";
    }
    typedText += key;
  }
}

//void stop()
//{
//  out.close();
//  minim.stop(); 
//  super.stop();
//}

class SpectrumCollector implements AudioSignal, AudioListener
{
  private float[] leftChannel;
  private float[] rightChannel;
  SpectrumCollector(int sample)
  {
    leftChannel = new float[sample];
    rightChannel= new float[sample];
  }
  // This part is implementing AudioListener interface, see Minim reference
  synchronized void samples(float[] samp)
  {
    arraycopy(samp,leftChannel);
  }
  synchronized void samples(float[] sampL, float[] sampR)
  {
    arraycopy(sampL,leftChannel);
    arraycopy(sampR,rightChannel);
  }  
  // This part is implementing AudioSignal interface, see Minim reference
  void generate(float[] samp)
  {
    arraycopy(leftChannel,samp);
//    audiocount += 1;
//    if (audiocount > 100) {
//    audiocount = 0;
    if (true) {
    fft.forward(samp);
    loadPixels();

    int index = int (video.width*samplerow); //the middle horizontal strip

    for (int x = 0; x < fft.specSize(); x+=1) {

      int vindex = int (map(x,0,fft.specSize(),0,video.width));
      int pixelColor = pixels[vindex];
      int r = (pixelColor >> 16) & 0xff;
      int g = (pixelColor >> 8) & 0xff;
      int b = pixelColor & 0xff;

      //samp[x] = samp[x] *0;//* map((r+b+g)/3,0,255,0.00,1.00);
      // this version uses the raw incoming light to generate audio:
      //fft.setBand(x,map((r+b+g)/3.00,0,255,0,1));
      // this version uses the *absorption*, i.e. the difference between the last spectrum and the current one
      if (absorption[x] < 0) {
        fft.setBand(x,map(0,0,255,0,1));
      } else {
        fft.setBand(x,map(contrastEnhancedAbsorption[x]/3.00,0,255,0.4,0.7));
      }
//    fft.setBand(x,fft.getBand(x) * map((r+b+g)/3.00,0,255,0.3,0.7));
      index++;
    }
    fft.inverse(samp);
    }
  }
  // this is a stricly mono signal
  void generate(float[] left, float[] right)
  {
    //     arraycopy(leftChannel,left);
    //     arraycopy(rightChannel,right);
    generate(left);
    generate(right);
  }
}

