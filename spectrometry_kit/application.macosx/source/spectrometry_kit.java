import processing.core.*; 
import processing.xml.*; 

import processing.video.*; 
import codeanticode.gsvideo.*; 
import ddf.minim.analysis.*; 
import ddf.minim.*; 

import java.applet.*; 
import java.awt.*; 
import java.awt.image.*; 
import java.awt.event.*; 
import java.io.*; 
import java.net.*; 
import java.text.*; 
import java.util.*; 
import java.util.zip.*; 
import java.util.regex.*; 

public class spectrometry_kit extends PApplet {

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

 //mac or windows
 //linux



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

      int index = PApplet.parseInt (video.width*samplerow); //the horizontal strip to sample
      for (int x = 0; x < PApplet.parseInt (video.width); x+=resolution) {

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
  spectrum.absorptionbuffer[x] = PApplet.parseInt (255*(1-(val/(spectrum.storedbuffer[x]+1.00f))));
  int last = x-1;
  if (last < 0) { last = 0; }
  line(x,height-spectrum.absorptionbuffer[last],x+1,height-spectrum.absorptionbuffer[x]);

  absorptionSum += spectrum.absorptionbuffer[x];
  spectrum.enhancedabsorptionbuffer[x] = (spectrum.absorptionbuffer[x] - averageAbsorption) * 4;
  spectrum.enhancedabsorptionbuffer[x] += averageAbsorption;
  stroke(color(0,255,0)); // green line
  last = x-1;
  if (last < 0) { last = 0; }

} else if (controller == "calibrate") { // RGB sensor calibration mode

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
    }
    public void preview() {
      for (int y = 0; y < PApplet.parseInt (video.height); y+=4) {
        for (int x = 0; x < PApplet.parseInt (video.width); x+=4) {
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

    public int getRed(int[] pPixel) {
        return pPixel[0];
    }

    public int getGreen(int[] pPixel) {
        return pPixel[1];
    }

    public int getBlue(int[] pPixel) {
        return pPixel[2];
    }

    public double wavelengthAverage(int[] pPixel) {
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

public void keyReleased() {
  if (key == CODED) {
    if (keyCode == CONTROL) {
      keyboard.controlKey = false;
    }
  }
}

public void keyPressed() {
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
    if (typedText.equals(defaultTypedText)) {
      typedText = "";
    }
    typedText += key;
  }
}
Keyboard keyboard;
class Mouse {
  public Mouse() {

  }
}

public void mousePressed() {
  if (mouseY < headerHeight) {
    if (mouseX > width-100) {
      println("Saving to server (button)");
      server.upload();
    }
    if (mouseX > width-300 && mouseX < width-100) {
      println("Switching mode (button)");
      switchMode();
    }
    if (mouseX > width-400 && mouseX < width-300) {
      open("~/Desktop/Safari.app");
    }
  }
}
Mouse mouse;
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
    return (width*1.000f)/screen.width;
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

    for (int yoff = PApplet.parseInt (sampleHeight/-2); yoff < PApplet.parseInt (sampleHeight/2); yoff+=1) {
      int sampleind = PApplet.parseInt ((video.width*spectrum.samplerow)+(video.width*yoff)+x);

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

    rgb[0] = PApplet.parseInt (rgb[0]/(sampleHeight*1.00f));
    rgb[1] = PApplet.parseInt (rgb[1]/(sampleHeight*1.00f));
    rgb[2] = PApplet.parseInt (rgb[2]/(sampleHeight*1.00f));

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
  public synchronized void samples(float[] samp)
  {
    arraycopy(samp,leftChannel);
  }
  public synchronized void samples(float[] sampL, float[] sampR)
  {
    arraycopy(sampL,leftChannel);
    arraycopy(sampR,rightChannel);
  }
  public void generate(float[] samp)
  {
    arraycopy(leftChannel,samp);
    if (true) {
    fft.forward(samp);
    loadPixels();

    int index = PApplet.parseInt (video.width*spectrum.samplerow); //the middle horizontal strip

    for (int x = 0; x < fft.specSize(); x+=1) {

      int vindex = PApplet.parseInt (map(x,0,fft.specSize(),0,video.width));
      int pixelColor = pixels[vindex];
      int r = (pixelColor >> 16) & 0xff;
      int g = (pixelColor >> 8) & 0xff;
      int b = pixelColor & 0xff;

      if (spectrum.absorptionbuffer[x] < 0) {
        fft.setBand(x,map(0,0,255,0,1));
      } else {
        fft.setBand(x,map(spectrum.enhancedabsorptionbuffer[x]/3.00f,0,255,0.4f,0.7f));
      }
      index++;
    }
    fft.inverse(samp);
    }
  }
  public void generate(float[] left, float[] right)
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

    println("got this far");

    PrintWriter csv = createWriter(spectraFolder + presenter.generateFileName(typedText, "csv"));
    csv.print(presenter.toCsv());
    csv.close();

    PrintWriter json = createWriter(spectraFolder + presenter.generateFileName(typedText, "json"));
    json.print(presenter.toJson(presenter.generateFileName(typedText, null)));
    json.close();

    PGraphics pg;

    pg = createGraphics(80, 80, P3D, spectraFolder + "alt-" + presenter.generateFileName(typedText, "png"));
    pg.beginDraw();
    pg.endDraw();
    save(spectraFolder + presenter.generateFileName(typedText, "png"));
    try {
      println(serverUrl+"/spectrums/create?title="+typedText);
      URL u = new URL("http://localhost:3000/spectrums/create?title="+typedText);
      this.postData(u,presenter.toJson(presenter.generateFileName(typedText, null)).getBytes());
    } catch (MalformedURLException e) {
      println("ERROR " +e.getMessage());
    } catch (IOException e) {
      println("ERROR " +e.getMessage());
    }
    typedText = "saved: type to label next spectrum";
  }
  public String postData(URL pUrl, byte[] pData) {
    try {
        URLConnection c = pUrl.openConnection();
        c.setDoOutput(true);
        c.setDoInput(true);
        c.setUseCaches(false);

        final String boundary = "AXi93A";
        c.setRequestProperty("Content-Type", "multipart/form-data; boundary="+boundary);

        DataOutputStream dstream = new DataOutputStream(c.getOutputStream());

        dstream.writeBytes(boundary+"\r\n");

        dstream.writeBytes("Content-Disposition: form-data; name=\"data\"; filename=\"whatever\" \r\nContent-Type: text/json\r\nContent-Transfer-Encoding: binary\r\n\r\n");
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

String serverUrl = "http://spectrometer.publiclaboratory.org"; // the remote server to upload to
String controller = "analyze"; // this determines what controller is used, i.e. what mode the app is in
final static String defaultTypedText = "type to label spectrum";
String typedText = defaultTypedText;
PFont font;
int audiocount = 0;
int lastval = 0;
int averageAbsorption = 0;
int absorptionSum;
PImage logo;
int headerHeight = 60; // this should eventually be stored in some kind of view/controller config file...? header.height?

public void switchMode() {
    if (controller == "analyze") {
      controller = "calibrate";
    }
    else if (controller == "calibrate") {
      controller = "heatmap";
    }
    else if (controller == "heatmap") {
      controller = "analyze";
    }
}

public void setup() {
  system = new System();
  keyboard = new Keyboard();
  mouse = new Mouse();
  size(screen.width, screen.height-20, P2D);
  video = new Video(this,1280,720,0);
  spectrum = new Spectrum(PApplet.parseInt (height-headerHeight)/2,PApplet.parseInt (height*(0.250f))); //history (length),samplerow (row # to begin sampling)
  font = loadFont("Georgia-Italic-24.vlw");
  filter = new Filter(this);
  logo = loadImage("logo-small.png");
}

public void captureEvent(Capture c) { //mac or windows
  c.read();
}
public void captureEvent(GSCapture c) { //linux
  c.read();
}

public void draw() {
  loadPixels(); //load screen pixel buffer into pixels[]
  background(64);

  fill(255);
  noStroke();
  line(0,height-255,width,height-255); //100% mark for spectra

  image(logo,14,14);
  textFont(font,24);
  text("PLOTS Spectral Workbench: "+typedText, 55, 40); //display current title

  int padding = 10;
  noFill();
  stroke(255);
  fill(255);
  noStroke();
  noFill();
  stroke(255);
  rect(width-300,0,200,headerHeight);
  fill(255);
  noStroke();
  text(controller+" mode",width-300+padding,40);
  noFill();
  stroke(255);
  rect(width-400,0,100,headerHeight);
  fill(255);
  noStroke();
  text("How-to",width-400+padding,40);

  absorptionSum = 0;

  if (controller == "calibrate") { spectrum.preview(); }

  stroke(255);
  fill(255);
  averageAbsorption = absorptionSum/width;
  stroke(128);
  line(0,averageAbsorption/3,width,averageAbsorption/3);

  spectrum.draw(headerHeight); //y position of top of spectrum

  updatePixels();
}


  static public void main(String args[]) {
    PApplet.main(new String[] { "--present", "--bgcolor=#666666", "--stop-color=#cccccc", "spectrometry_kit" });
  }
}
