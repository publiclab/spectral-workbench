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


import com.sun.image.codec.jpeg.*;

byte[] bufferImage(PImage srcimg) {
  ByteArrayOutputStream out = new ByteArrayOutputStream();
  BufferedImage img = new BufferedImage(srcimg.width, srcimg.height, 2);
  img = (BufferedImage) createImage(srcimg.width,srcimg.height);
  for (int i = 0; i < srcimg.width; i++)
    for (int j = 0; j < srcimg.height; j++)
      img.setRGB(i, j, srcimg.pixels[j * srcimg.width + i]);
  try {
    JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(out);
    JPEGEncodeParam encpar = encoder.getDefaultJPEGEncodeParam(img);
    encpar.setQuality(1, false);
    encoder.setJPEGEncodeParam(encpar);
    encoder.encode(img);
  }
  catch (FileNotFoundException e) {
    println(e);
  }
  catch (IOException ioe) {
    println(ioe);
  }
  return out.toByteArray();
}
class Spectrum {
    public int[][][] buffer;
    public int[] storedbuffer;
    public int[] absorptionbuffer;
    public int[] enhancedabsorptionbuffer;
    public int samplerow;
    public int history;
    public int resolution = 1;
    public int lastred = 0;
    public int lastgreen = 0;
    public int lastblue = 0;
    public int currentSpectrumDisplayHeight = 10;
    public int averageAbsorption = 0;
    public int absorptionSum;
    public int lastval = 0;

    public Spectrum(int pHistory,int pSamplerow) {
      samplerow = pSamplerow;
      history = pHistory;
      buffer = new int[history][video.width][3];
      storedbuffer = new int[video.width];
      absorptionbuffer = new int[video.width];
      enhancedabsorptionbuffer = new int[video.width];
      for (int x = 0;x < video.width;x++) { // is this necessary? initializing the spectrum buffer with zeroes? come on!
        absorptionbuffer[x] = 0;
        enhancedabsorptionbuffer[x] = 0;
      }
    }
    public void draw(int ypos) {
      for (int i = history-1;i > 0;i--) {
        for (int x = 0;x < video.width;x++) {
          buffer[i][x] = buffer[i-1][x];
        }
      }

      absorptionSum = 0;

      int index = int (video.width*samplerow); //the horizontal strip to sample
      for (int x = 0; x < int (video.width); x+=resolution) {

        int[] rgb = video.get_rgb(x);

        buffer[0][x] = rgb;
        if (x < width) {
          for (int y = 0; y < history; y++) {
            if (controller == "heatmap") {
		colorMode(HSB,255);
		pixels[((currentSpectrumDisplayHeight+ypos)*width)+(y*width)+x] = color(255-(buffer[y][x][0]+buffer[y][x][1]+buffer[y][x][2])/3,255,255);
		colorMode(RGB,255);
            } else {
		pixels[((currentSpectrumDisplayHeight+ypos)*width)+(y*width)+x] = color(buffer[y][x][0],buffer[y][x][1],buffer[y][x][2]);
 	    }
          }
          for (int y = 0; y < currentSpectrumDisplayHeight-1; y++) {
            if (controller == "heatmap") {
		colorMode(HSB,255);
		pixels[(ypos*width)+(y*width)+x] = color(255-(buffer[0][x][0]+buffer[0][x][1]+buffer[0][x][2])/3,255,255);
		colorMode(RGB,255);
            } else {
		pixels[(ypos*width)+(y*width)+x] = color(buffer[0][x][0],buffer[0][x][1],buffer[0][x][2]);
 	    }

          }
/*
 * Draws spectrum intensity graph,
 * runs for each column of video data, every frame
 */

if (controller == "analyze" || controller == "heatmap") {
  stroke(255);
  int val = (rgb[0]+rgb[1]+rgb[2])/3;
  line(x,height-lastval,x+1,height-val);
  lastval = (rgb[0]+rgb[1]+rgb[2])/3;

  stroke(color(255,0,0));
  int lastind = x-1;
  if (lastind < 0) {
     lastind = 0;
  }
  line(x,height-spectrum.storedbuffer[lastind],x+1,height-spectrum.storedbuffer[x]);

  stroke(color(155,155,0));
  spectrum.absorptionbuffer[x] = int (255*(1-(val/(spectrum.storedbuffer[x]+1.00))));
  int last = x-1;
  if (last < 0) { last = 0; }
  int y1 = height-spectrum.absorptionbuffer[last];
  int y2 = height-spectrum.absorptionbuffer[x];
  if (y1 == 255) { y1 = 0; }
  if (y2 == 255) { y2 = 0; }
  line(x,y1,x+1,y2);

  absorptionSum += spectrum.absorptionbuffer[x];
  spectrum.enhancedabsorptionbuffer[x] = (spectrum.absorptionbuffer[x] - averageAbsorption) * 4;
  spectrum.enhancedabsorptionbuffer[x] += averageAbsorption;
  stroke(color(0,255,0)); // green line
  last = x-1;
  if (last < 0) { last = 0; }

} else if (controller == "setup") { // RGB sensor calibration mode

  stroke(color(255,0,0));
  line(x,height-spectrum.lastred,x+1,height-rgb[0]);
  spectrum.lastred = rgb[0];
  stroke(color(0,255,0));
  line(x,height-spectrum.lastgreen,x+1,height-rgb[1]);
  spectrum.lastgreen = rgb[1];
  stroke(color(0,0,255));
  line(x,height-spectrum.lastblue,x+1,height-rgb[2]);
  spectrum.lastblue = rgb[2];
}
        }
        index++;
      }
      stroke(255);
      fill(255);
      averageAbsorption = absorptionSum/width;
      stroke(128);
      int avY = height-averageAbsorption/3;
      line(0,avY,width,avY);
      noStroke();
      text(averageAbsorption,10,avY);
    }
    public void preview() {
      for (int y = 0; y < int (video.height); y+=4) {
        for (int x = 0; x < int (video.width); x+=4) {
          if (x < width && y < height) {
            if (video.isLinux) {
              pixels[(height*3/4*width)+(y*width/4)+((x/4))] = video.gscapture.pixels[y*video.width+x];
            } else {
              pixels[(height*3/4*width)+(y*width/4)+((x/4))] = video.capture.pixels[y*video.width+x];
            }
          }
        }
      }
      noFill();
      stroke(255,255,0);
      rect(0,height*3/4+samplerow/4-video.sampleHeight/4,video.width/4,video.sampleHeight/4);
    }
    public void storeReference() {
      for (int x = 0;x < buffer[0].length;x++) {
        storedbuffer[x] = (buffer[0][x][0]+buffer[0][x][1]+buffer[0][x][2])/3;
      }
    }
}

class SpectrumPresentation {
    int[][][] mBuffer;

    public SpectrumPresentation(int[][][] pBuffer) {
        mBuffer = pBuffer;
    }

    int getRed(int[] pPixel) {
        return pPixel[0];
    }

    int getGreen(int[] pPixel) {
        return pPixel[1];
    }

    int getBlue(int[] pPixel) {
        return pPixel[2];
    }

    double wavelengthAverage(int[] pPixel) {
        return (getRed(pPixel) + getGreen(pPixel) + getBlue(pPixel))/3;
    }

    public String generateFileName(String pUserText, String pExtension) {
        StringBuilder builder = new StringBuilder();

        builder.append(year());
        builder.append("-"+month());
        builder.append("-"+day());
        builder.append("-"+hour());
        builder.append("-"+minute());

        if (pUserText != null && !pUserText.equals(defaultTypedText)) {
            builder.append("-"+pUserText);
        }

        if (pExtension != null) {
            builder.append("."+pExtension);
        }

        return builder.toString();
    }

    public String toJson(String pName) {
        StringBuilder builder = new StringBuilder();
        builder.append("{name:'"+pName+"',lines:");

        int length = mBuffer[0].length;
        for (int x = 0; x < length; x++) {
            int[] pixel = mBuffer[0][x];

            builder.append("{wavelength:null,average:"+wavelengthAverage(pixel));
            builder.append(",r:"+getRed(pixel));
            builder.append(",g:"+getGreen(pixel));
            builder.append(",b:"+getBlue(pixel)+"}");

            if (x < length-1) { builder.append(","); }
        }
        builder.append("}");

        return builder.toString();
    }

    public String toCsv() {
        StringBuilder builder = new StringBuilder();

        int length = mBuffer[0].length;
        for (int x = 0; x < length; x++) {
            int[] pixel = mBuffer[0][x];

            builder.append("unknown_wavelength,"+wavelengthAverage(pixel));
            builder.append(","+getRed(pixel));
            builder.append(","+getGreen(pixel));
            builder.append(","+getBlue(pixel));
        }

        return builder.toString();
    }
}
Spectrum spectrum;
class Keyboard {
  public boolean controlKey = false;
}

void keyReleased() {
  if (key == CODED) {
    if (keyCode == CONTROL) {
      keyboard.controlKey = false;
    }
  }
}

void keyPressed() {
  if (key == CODED) {
    if (keyCode == DOWN) {
      spectrum.samplerow += 1;
      if (spectrum.samplerow >= video.height) {
        spectrum.samplerow = video.height;
      }
    } else if (keyCode == UP) {
      spectrum.samplerow -= 1;
      if (spectrum.samplerow <= 0) {
        spectrum.samplerow = 0;
      }
    } else if (keyCode == CONTROL) {
      keyboard.controlKey = true;
    }
  }
  else if (key == ' ' && keyboard.controlKey) {
    spectrum.storeReference();
  }
  else if (key == 's' && keyboard.controlKey) {
    println("saving to server...");
    server.upload();
  }
  else if (keyCode == TAB) {
    switchMode();
  }
  else if (keyCode == BACKSPACE) {
    typedText = typedText.substring(0,max(0,typedText.length()-1));
  }
  else if (keyCode == ESC) {
    typedText = "";
  }
  else {
    if (typedText.equals(defaultTypedText) || typedText.equals("saved: type to label next spectrum")) {
      typedText = "";
    }
    typedText += key;
  }
}
Keyboard keyboard;

void mouseMoved() {
}

void mousePressed() {

  if (controller == "analyze") {
    analyze.mousePressed();
  } else if (controller == "setup") {
    analyze.mousePressed(); // for now, same.
  } else if (controller == "heatmap") {
    analyze.mousePressed(); // for now, same.
  }

}
class Button {

  public String text;
  public int x = 0;
  public int y = 0;
  public int padding = 10;
  public int width = 100;
  public int height = headerHeight;
  public int fontSize = 18;//24;
  public boolean hovering = false;
  public boolean down = false;
  public color fillColor = #222222;

  public Button(String pText,int pX, int pY, int pHeight) {
    text = pText;
    x = pX;
    y = pY;
    height = pHeight;
    width = int (textWidth(text)+padding*2);
  }

  public Button(String pText,int pX, int pY) {
    text = pText;
    x = pX;
    y = pY;
    width = int (textWidth(text)+padding*2);
  }

  boolean mouseOver() {
    return (mouseX > x && mouseX < x+width && mouseY > y && mouseY < y+height);
  }

  void up() {
    down = false;
  }
  void down() {
    down = true;
  }

  void draw() {
    strokeCap(PROJECT);
    fill(fillColor);
    stroke(20);
    rect(x,y+1,width-1,height-2);
    if (hovering) fill(0,0,0,50);
    rect(x,y+1,width-1,height-2);
    if (down) fill(0,0,0,50);
    rect(x,y+1,width-1,height-2);
    fill(255);
    noStroke();
    text(text,x+padding,y+height-((height-fontSize)/2));
    hover();
    strokeWeight(1);
  }

  void hover() {
    if (mouseOver()) {
      hovering = true;
    } else {
      hovering = false;
    }
  }

}
/*
 * A class to interact with the system, mainly through
 * System.run() calls to access a shell prompt.
 */
class System
{
  boolean isLinux;
  public String[] command;
  public System() {
    if (run("uname").equals("Linux")) {
      isLinux = true;
    } else {
      isLinux = false;
    }
  }
  /*
   * Runs <command> in a shell and returns a single line response.
   */
  public String run(String command) {
    print("Shell command: '");
    print(command);
    println("'");
    String response = "Failed try {}";
    try {
      Runtime r = Runtime.getRuntime();
      Process p = r.exec(command);
      p.waitFor();
      BufferedReader b = new BufferedReader(new InputStreamReader(p.getInputStream()));
      response = b.readLine();
      print("Response: '");
      print(response);
      println("'");
      String line;
      while ((line = b.readLine()) != null) {
        println(line);
      }
    } catch(IOException e1) { println(e1); }
    catch(InterruptedException e2) { println(e2); }
    return(response);
  }
  public String bash(String command) {
    return(run("/bin/bash -c \""+command+"\""));
  }
}
System system;
class Video {
  public Capture capture; //mac or windows
  public GSCapture gscapture; //linux
  public int device;
  int width, height;
  int sampleWidth, sampleHeight;
  int[] rgb;
  boolean isLinux;
  public String[] cameras;
  public Video(PApplet parent, int receivedWidth, int receivedHeight, int receivedDevice) {
    width = receivedWidth;
    height = receivedHeight;
    device = receivedDevice;
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
      Process p = r.exec("uvcdynctrl -d video"+device+" -s \"Exposure, Auto\" 1 && uvcdynctrl -s \"White Balance Temperature, Auto\" 0 && uvcdynctrl -d video"+device+" -s Contrast 128");
    } catch(IOException e1) { println(e1); }

    if (isLinux) {
      println("Video device: /dev/video"+device);
      gscapture = new GSCapture(parent, width, height, 10, "/dev/video"+device); //linux
      gscapture.play(); //linux only
      println("Linux");
    } else {
      capture = new Capture(parent, width, height, 20); //mac or windows via QuickTime/Java
      capture.settings(); // mac or windows only, allows selection of video input
      println("Not Linux");
    }
  }
  public int[] pixels()
  {
    if (isLinux) return gscapture.pixels;
    else return capture.pixels;
  }
  public float scale()
  {
    return (width*1.000)/screen.width;
  }
  public void image(int x,int y,int imgWidth,int imgHeight)
  {
    if (isLinux) {
      gscapture.read();
    } //else papplet.image(capture,x,y,imgWidth,imgHeight);
  }
  public int[] get_rgb(int x)
  {
    rgb = new int[3];
    rgb[0] = 0;
    rgb[1] = 0;
    rgb[2] = 0;

    for (int yoff = spectrum.samplerow; yoff < spectrum.samplerow+sampleHeight; yoff+=1) {
      int sampleind = int ((video.width*spectrum.samplerow)+(video.width*yoff)+x);

      if (sampleind >= 0 && sampleind <= (video.height*video.width)) {
        int pixelColor;
        if (isLinux) {
          pixelColor = gscapture.pixels[sampleind];
        } else {
          pixelColor = capture.pixels[sampleind];
        }
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
    minim.debugOff();
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

    int index = int (video.width*spectrum.samplerow); //the middle horizontal strip

    for (int x = 0; x < fft.specSize(); x+=1) {

      int vindex = int (map(x,0,fft.specSize(),0,video.width));
      int pixelColor = pixels[vindex];
      int r = (pixelColor >> 16) & 0xff;
      int g = (pixelColor >> 8) & 0xff;
      int b = pixelColor & 0xff;

      if (spectrum.absorptionbuffer[x] < 0) {
        fft.setBand(x,map(0,0,255,0,1));
      } else {
        fft.setBand(x,map(spectrum.enhancedabsorptionbuffer[x]/3.00,0,255,0.4,0.7));
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
class Server {
  public void upload() {

    String spectraFolder = "spectra/";
    SpectrumPresentation presenter = new SpectrumPresentation(spectrum.buffer);

    PrintWriter csv = createWriter(spectraFolder + presenter.generateFileName(typedText, "csv"));
    csv.print(presenter.toCsv());
    csv.close();

    PrintWriter json = createWriter(spectraFolder + presenter.generateFileName(typedText, "json"));
    json.print(presenter.toJson(presenter.generateFileName(typedText, null)));
    json.close();

    save(spectraFolder + presenter.generateFileName(typedText, "png")); // this just saves the main pixel buffer

    PGraphics pg;
    pg = createGraphics(video.width, 100, P2D);
    pg.beginDraw();
    for (int y=0;y<100;y++) {
      for (int x=0;x<video.width;x++) {
        pg.set(x,y,pixels[spectrum.samplerow*video.width+y*video.width+x]);
      }
    }
    pg.endDraw();
    pg.save(spectraFolder + presenter.generateFileName(typedText + "-alt", "png"));

    try {
      String response;
      println(serverUrl+"/spectrums/create?title="+typedText+"&author=anonymous");
      URL u = new URL(serverUrl+"/spectrums/create?title="+typedText+"&author=anonymous&stupidkey=foolsdumbbots");
      response = postData(u,bufferImage(get(0, headerHeight, width, 100)),presenter.generateFileName(typedText,"jpg"));
      typedText = "saved: type to label next spectrum";
      link(serverUrl+"/spectra/edit/"+response);
    } catch (MalformedURLException e) {
      println("ERROR " +e.getMessage());
    } catch (IOException e) {
      println("ERROR " +e.getMessage());
    }
  }
  public String postData(URL pUrl, byte[] pData, String filename) {
    try {
        URLConnection c = pUrl.openConnection();
        c.setDoOutput(true);
        c.setDoInput(true);
        c.setUseCaches(false);

        final String boundary = "AXi93A";
        c.setRequestProperty("Content-Type", "multipart/form-data; boundary="+boundary);

        DataOutputStream dstream = new DataOutputStream(c.getOutputStream());

        dstream.writeBytes("--"+boundary+"\r\n");

        dstream.writeBytes("Content-Disposition: form-data; name=\"photo\"; filename=\""+filename+"\" \r\nContent-Type: image/jpeg\r\nContent-Transfer-Encoding: binary\r\n\r\n");
        dstream.write(pData ,0, pData.length);

        dstream.writeBytes("\r\n--"+boundary+"--\r\n\r\n");
        dstream.flush();
        dstream.close();

        BufferedReader in = new BufferedReader(new InputStreamReader(c.getInputStream()));
        StringBuilder sb = new StringBuilder(in.readLine());
        String s = in.readLine();
        while (s != null) {
            s = in.readLine();
            sb.append(s);
        }
        return sb.toString();
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
  }
}
Server server;
class Analyze {

  public Analyze() {

  }

  public void mousePressed() {
    if (mouseY < headerHeight) { // Header
      header.mousePressed();
    } else if (mouseY < int (headerHeight+(height-headerHeight)/2)) { // Waterfall

    } else { // Graph

    }
  }

}
Analyze analyze;
class Header {

  public PImage logo;
  public int rightOffset = 0; // where to put new buttons (shifts as buttons are added)
  public Button[] buttons; // we should store all buttons in here instead of explicitly defining, as below:
  public Button learnButton;
  public Button saveButton;
  public Button analyzeButton;
  public Button heatmapButton;
  public Button setupButton;
  public Button baselineButton;
  public int margin = 4;

  public Header() {
    logo = loadImage("logo-small.png");
    learnButton = addButton("Learn");
    saveButton = addButton("Save");
    heatmapButton = addButton("Heatmap");
    setupButton = addButton("Setup");
    analyzeButton = addButton("Analyze");
    analyzeButton.down();
    baselineButton = addButton("Baseline");
    baselineButton.fillColor = #444444;
  }

  public Button addButton(String buttonName) {
    Button button = new Button(buttonName,width-rightOffset-margin,margin,headerHeight-8);
    rightOffset += button.width+margin;
    button.x -= button.width;
    return button;
  }

  public void mousePressed() {
    if (saveButton.mouseOver()) {
      server.upload();
    }
    if (analyzeButton.mouseOver()) {
      controller = "analyze";
      heatmapButton.up();
      setupButton.up();
      analyzeButton.down();
    }
    if (setupButton.mouseOver()) {
      controller = "setup";
      heatmapButton.up();
      setupButton.down();
      analyzeButton.up();
    }
    if (heatmapButton.mouseOver()) {
      controller = "heatmap";
      heatmapButton.down();
      setupButton.up();
      analyzeButton.up();
    }
    if (baselineButton.mouseOver()) {
      spectrum.storeReference();
    }
    if (learnButton.mouseOver()) {
      link("http://publiclaboratory.org/wiki/spectral-workbench");
    }
  }

  public void draw() {

    fill(255);
    noStroke();
    image(logo,14,14);
    textFont(font,24);
    text("PLOTS Spectral Workbench: "+typedText, 55, 40); //display current title

    saveButton.draw();
    learnButton.draw();
    analyzeButton.draw();
    heatmapButton.draw();
    setupButton.draw();
    baselineButton.draw();
  }
}


Header header;

String serverUrl = "http://spectrometer.publiclaboratory.org"; // the remote server to upload to
String controller = "analyze"; // this determines what controller is used, i.e. what mode the app is in
final static String defaultTypedText = "type to label spectrum";
String typedText = defaultTypedText;
PFont font;
int headerHeight = 60; // this should eventually be stored in some kind of view/controller config file...? header.height?

public void setup() {
  font = loadFont("Georgia-Italic-24.vlw");
  textFont(font,24);

  system = new System();
  keyboard = new Keyboard();
  analyze = new Analyze();
  header = new Header();
  server = new Server();

  size(screen.width, screen.height-20, P2D);

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

