/*
Spectrometry_kit - a Processing.org-based interface for spectral analysis with a USB webcam-based spectrometer. Also a spectrometer-based musical instrument or guitar pedal

by the Public Laboratory for Open Technology and Science
publiclaboratory.org

(c) Copyright 2011 Public Laboratory

This file is part of PLOTS Spectral Workbench.

PLOTS Spectral Workbench is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

PLOTS Spectral Workbench is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with PLOTS Spectral Workbench.  If not, see <http://www.gnu.org/licenses/>.
 */

import processing.video.*; //mac or windows
import codeanticode.gsvideo.*; //linux
import ddf.minim.analysis.*;
import ddf.minim.*;

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

    save("spectra/"+year()+"-"+month()+"-"+day()+"-"+hour()+""+minute()+"-"+typedText+".png");
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
class Video
{
  public Capture capture; //mac or windows
  public GSCapture gscapture; //linux
  int width, height;
  int sampleWidth, sampleHeight;
  int[] rgb;
  boolean isLinux;
  public String[] cameras;
  public Video(PApplet parent, int receivedWidth, int receivedHeight)
  {
    width = receivedWidth;
    height = receivedHeight;
    sampleHeight = 80;
    try {
      Runtime r = Runtime.getRuntime();
      Process p = r.exec("uname");
      p.waitFor();
      BufferedReader b = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String line = "";
      while ((line = b.readLine()) != null) {
        if (line.equals("Linux")) {
          isLinux = true;
        }
      }
    } catch(IOException e1) {}
    catch(InterruptedException e2) {}

    try {
      Runtime r = Runtime.getRuntime();
      Process p = r.exec("uvcdynctrl -s \"Exposure, Auto\" 1 && uvcdynctrl -s \"White Balance Temperature, Auto\" 0");
    } catch(IOException e1) { println(e1); }

    if (isLinux) {
      gscapture = new GSCapture(parent, width, height, "/dev/video0"); //linux
      gscapture.play(); //linux only
      println("Linux");
    } else {
      capture = new Capture(parent, width, height, 20); //mac or windows via QuickTime/Java
      capture.settings(); // mac or windows only, allows selection of video input
      println("Not Linux");
    }
  }
  int[] pixels()
  {
    if (isLinux) return gscapture.pixels;
    else return capture.pixels;
  }
  public void image(int x,int y,int imgWidth,int imgHeight)
  {
    if (isLinux) {
      gscapture.read();
    } //else papplet.image(capture,x,y,imgWidth,imgHeight);
  }
  /*
   * Retrieve red, green, blue color intensities
   * from video input for given pixel
   */
  public int[] get_rgb(int x)
  {
    rgb = new int[3];
    rgb[0] = 0;
    rgb[1] = 0;
    rgb[2] = 0;

    for (int yoff = int (sampleHeight/-2); yoff < int (sampleHeight/2); yoff+=1) {
      int sampleind = int ((video.width*samplerow)+(video.width*yoff)+x);

      if (sampleind >= 0 && sampleind <= (video.height*video.width)) {
        int pixelColor = gscapture.pixels[sampleind];
        rgb[0] = rgb[0]+((pixelColor >> 16) & 0xff);
        rgb[1] = rgb[1]+((pixelColor >> 8) & 0xff);
        rgb[2] = rgb[2]+(pixelColor & 0xff);
      }
    }

    rgb[0] = int (rgb[0]/(sampleHeight*1.00));
    rgb[1] = int (rgb[1]/(sampleHeight*1.00));
    rgb[2] = int (rgb[2]/(sampleHeight*1.00));

    return rgb;
  }
}
Video video;
class Filter implements AudioSignal, AudioListener
{
  private float[] leftChannel;
  private float[] rightChannel;
  private Minim minim;
  private FFT fft;
  private AudioInput in;
  private AudioOutput out;
  public int bsize;
  public Filter(PApplet parent)
  {
    bsize = 512;
    minim = new Minim(parent);
    minim.debugOn();
    in = minim.getLineIn(Minim.MONO, bsize);
    out = minim.getLineOut(Minim.MONO, bsize);
    leftChannel = new float[bsize];
    rightChannel= new float[bsize];
    fft = new FFT(out.bufferSize(), out.sampleRate());
    fft.window(FFT.HAMMING);
    in.addListener(this);
    out.addSignal(this);
  }
  synchronized void samples(float[] samp)
  {
    arraycopy(samp,leftChannel);
  }
  synchronized void samples(float[] sampL, float[] sampR)
  {
    arraycopy(sampL,leftChannel);
    arraycopy(sampR,rightChannel);
  }
  void generate(float[] samp)
  {
    arraycopy(leftChannel,samp);
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

      if (absorption[x] < 0) {
        fft.setBand(x,map(0,0,255,0,1));
      } else {
        fft.setBand(x,map(contrastEnhancedAbsorption[x]/3.00,0,255,0.4,0.7));
      }
      index++;
    }
    fft.inverse(samp);
    }
  }
  void generate(float[] left, float[] right)
  {
    generate(left);
    generate(right);
  }
}

Filter filter;

String colortype = "combined";
String typedText = "type to label spectrum";
PFont font;
int audiocount = 0;
int res = 1;
int samplerow;
int lastval = 0;
int lastred = 0;
int lastgreen = 0;
int lastblue = 0;
int[] spectrumbuf, lastspectrum, absorption, contrastEnhancedAbsorption;
int averageAbsorption = 0;
int absorptionSum;

public void setup() {
  size(640, 480, P2D);
  video = new Video(this,width,height);
  samplerow = int (height*(0.50));
  font = loadFont("Georgia-Italic-18.vlw");

  spectrumbuf = new int[width];
  lastspectrum = new int[width];
  absorption = new int[width];
  contrastEnhancedAbsorption = new int[width];
  for (int x = 0;x < width;x++) { // is this necessary? initializing the spectrum buffer with zeroes? come on!
    spectrumbuf[x] = 0;
    absorption[x] = 0;
    contrastEnhancedAbsorption[x] = 0;
  }
  filter = new Filter(this);
}

public void captureEvent(Capture c) { //mac or windows
  c.read();
}
public void captureEvent(GSCapture c) { //linux
  c.read();
}

void draw() {
  loadPixels(); //load screen pixel buffer into pixels[]
  background(64);

  fill(255);
  noStroke();
  line(0,height-255,width,height-255); //100% mark for spectra

  textFont(font,18);
  text("PLOTS Spectral Workbench", 15, 160); //display current title
  text(typedText, 15, 190); //display current title

  absorptionSum = 0;

  if (colortype == "rgb") {
    for (int y = 0; y < int (height); y+=4) {
      for (int x = 0; x < int (width); x+=4) {
        pixels[(height*3/4*width)+(y*width/4)+(x/4)] = video.gscapture.pixels[y*width+x];
      }
    }
    noFill();
    stroke(255,255,0);
    rect(0,height*3/4+samplerow/4,width/4,video.sampleHeight/4);
  }
  stroke(255);
  fill(255);

  int index = int (video.width*samplerow); //the horizontal strip to sample
  for (int x = 0; x < int (width); x+=res) {

    int[] rgb = video.get_rgb(x);

    spectrumbuf[x] = (rgb[0]+rgb[1]+rgb[2])/3;
    for (int y = 0; y < int (height/4); y+=res) {
      pixels[(y*width)+x] = color(rgb[0],rgb[1],rgb[2]);
    }



if (colortype == "combined") {
  stroke(255);
  int val = (rgb[0]+rgb[1]+rgb[2])/3;
  line(x,height-lastval,x+1,height-val);
  lastval = (rgb[0]+rgb[1]+rgb[2])/3;

  stroke(color(255,0,0));
  int lastind = x-1;
  if (lastind < 0) {
     lastind = 0;
  }
  line(x,height-lastspectrum[lastind],x+1,height-lastspectrum[x]);

  stroke(color(255,255,0));
  absorption[x] = int (255*(1-(val/(lastspectrum[x]+1.00))));
  int last = x-1;
  if (last < 0) { last = 0; }
  line(x,height-absorption[last],x+1,height-absorption[x]);

  absorptionSum += absorption[x];
  contrastEnhancedAbsorption[x] = (absorption[x] - averageAbsorption) * 4;
  contrastEnhancedAbsorption[x] += averageAbsorption;
  stroke(color(0,255,0)); // green line
  last = x-1;
  if (last < 0) { last = 0; }

} else if (colortype == "rgb") { // RGB sensor calibration mode

  stroke(color(255,0,0));
  line(x,height-lastred,x+1,height-rgb[0]);
  lastred = rgb[0];
  stroke(color(0,255,0));
  line(x,height-lastgreen,x+1,height-rgb[1]);
  lastgreen = rgb[1];
  stroke(color(0,0,255));
  line(x,height-lastblue,x+1,height-rgb[2]);
  lastblue = rgb[2];
}
    index++;
  }

  averageAbsorption = absorptionSum/width;
  stroke(128);
  line(0,averageAbsorption,width,averageAbsorption);

  updatePixels();
}
