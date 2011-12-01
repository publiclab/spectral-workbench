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

//= require <lib/bufferImage.java>
//= require <models/spectrum>
Spectrum spectrum;
//= require <interface/keyboard>
Keyboard keyboard;
//= require <interface/mouse>
//Mouse mouse;
//= require <interface/button>
//= require <models/system>
System system;
//= require <models/video>
Video video;
//= require <models/filter>
Filter filter;
//= require <models/server>
Server server;
//= require <controllers/analyze>
Analyze analyze;
//= require <views/header>
Header header;

//String serverUrl = "http://localhost:3000"; // the remote server to upload to
String serverUrl = "http://spectralworkbench.org"; // the remote server to upload to
String controller = "setup"; // this determines what controller is used, i.e. what mode the app is in
final static String defaultTypedText = "type to label spectrum";
String typedText = defaultTypedText;
PFont font;
int headerHeight = 60; // this should eventually be stored in some kind of view/controller config file...? header.height?

public void setup() {
  font = loadFont("Georgia-Italic-24.vlw");  
  textFont(font,24);

  system = new System();
  keyboard = new Keyboard();
  //hmmm... controller definitions:
  //application = new Controller(); // this could contain subcontrollers?
  analyze = new Analyze();
  header = new Header();
  server = new Server();

  //size(640, 480, P2D);
  //size(1280, 720, P2D);
  // Or run full screen, more fun! Use with Sketch -> Present
  size(screen.width, screen.height-20, P2D);

  //video = new Video(this,640,480,0);
  video = new Video(this,1280,720,0);
  spectrum = new Spectrum(int (height-headerHeight)/2,int (height*(0.18))); //history (length),samplerow (row # to begin sampling)
  filter = new Filter(this);
}

public void switchMode() {
    if (controller == "analyze") {
      controller = "setup";
    } 
    else if (controller == "setup") {
      controller = "heatmap";
    }
    else if (controller == "heatmap") {
      controller = "analyze";
    }
}
public void captureEvent(Capture c) { //mac or windows via Quicktime Java bridge
  c.read();
}
public void captureEvent(GSCapture c) { //linux
  c.read();
}

void draw() {
  loadPixels(); //load screen pixel buffer into pixels[]

  background(34);
  stroke(0);
  line(0,height-255,width,height-255); //100% mark for spectra

  header.draw();
  if (controller == "setup") { spectrum.preview(); }
  spectrum.draw(headerHeight); //y position of top of spectrum

  updatePixels();
}

