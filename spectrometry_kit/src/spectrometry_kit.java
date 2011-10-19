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

//= require <keyboard>
//= require <models/video>
Video video;
//= require <models/filter>
Filter filter;

String colortype = "combined";
String typedText = "type to label spectrum";
PFont font;
int audiocount = 0;
int res = 1;
int samplerow;
int lastval = 0;
// for rgb mode:
int lastred = 0;
int lastgreen = 0;
int lastblue = 0;
int[] spectrumbuf, lastspectrum, absorption, contrastEnhancedAbsorption;
int averageAbsorption = 0;
int absorptionSum;

public void setup() {
  //size(screen.width, screen.height, P2D);
  //size(1280, 720, P2D);
  size(640, 480, P2D);
  //size(320, 240, P2D);
  // Or run full screen, more fun! Use with Sketch -> Present
  //size(screen.width, screen.height, P2D);
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
  //text("red=baseline, white=current, yellow=absorption",15,height-255+45);

  // re-zero intensity sum
  absorptionSum = 0;

  // preview video to align spectrum
  if (colortype == "rgb") {
    //video.image(0,height*3/4,width/4,height/4)
    for (int y = 0; y < int (height); y+=4) {
      for (int x = 0; x < int (width); x+=4) {
        pixels[(height*3/4*width)+(y*width/4)+(x/4)] = video.gscapture.pixels[y*width+x];
      }
    }
    // draw the region of sampling with a rectangle:
    noFill();
    stroke(255,255,0);
    rect(0,height*3/4+samplerow/4,width/4,video.sampleHeight/4);
  }
  stroke(255);
  fill(255);

  int index = int (video.width*samplerow); //the horizontal strip to sample
  for (int x = 0; x < int (width); x+=res) {

    int[] rgb = video.get_rgb(x);

    // draw direct output of averaged camera sampling
    spectrumbuf[x] = (rgb[0]+rgb[1]+rgb[2])/3;
    for (int y = 0; y < int (height/4); y+=res) {
      pixels[(y*width)+x] = color(rgb[0],rgb[1],rgb[2]);
    }

    //= require <views/graph>
    index++;
  }

  // indicate average with a line
  averageAbsorption = absorptionSum/width;
  stroke(128);
  line(0,averageAbsorption,width,averageAbsorption);

  updatePixels();
}
