/*
Spectrometry_kit - a Processing.org-based interface for spectral analysis with a USB webcam-based spectrometer. Also a spectrometer-based musical instrument or guitar pedal

>> You must install the "GSVideo" and "controlP5" libraries in a folder called "libraries" in your sketchbook.

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

//= require <models/spectrum>
Spectrum spectrum;
//= require <keyboard>
//= require <models/system>
System system;
//= require <models/video>
Video video;
//= require <models/filter>
Filter filter;
//= require <models/server>
Server server;

//String serverUrl = "http://localhost:3000"; // the remote server to upload to
String serverUrl = "http://spectrometer.publiclaboratory.org"; // the remote server to upload to
String controller = "setup"; // this determines what controller is used, i.e. what mode the app is in
String colortype = "combined";
final static String defaultTypedText = "type to label spectrum";
String typedText = defaultTypedText;
PFont font;
int audiocount = 0;
int lastval = 0;
int averageAbsorption = 0;
int absorptionSum;
PImage logo;

public void setup() {
  system = new System();
  keys = new Keys();
  //size(640, 480, P2D);
  //size(1280, 720, P2D);
  // Or run full screen, more fun! Use with Sketch -> Present
  size(screen.width, screen.height-20, P2D);
  //video = new Video(this,640,480,0);
  video = new Video(this,1280,720,0);
  spectrum = new Spectrum(150,int (height*(0.250))); //history (length),samplerow (row # to begin sampling)
  font = loadFont("Georgia-Italic-18.vlw");  
  filter = new Filter(this);
  //logo = loadImage("logo.png");
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

  //image(logo,0,0);
  textFont(font,18);
  text("PLOTS Spectral Workbench", 55, 25+spectrum.history); //display current title
  text(typedText, 15, 55+spectrum.history); //display current title
  //text("red=baseline, white=current, yellow=absorption",15,height-255+45);

  // re-zero intensity sum
  absorptionSum = 0;

  if (colortype == "rgb") { spectrum.preview(); }

  stroke(255);
  fill(255);
  // indicate average with a line
  averageAbsorption = absorptionSum/width;
  stroke(128);
  line(0,averageAbsorption/3,width,averageAbsorption/3);

  spectrum.draw();

  updatePixels();
}

