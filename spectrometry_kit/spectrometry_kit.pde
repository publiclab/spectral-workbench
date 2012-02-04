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


import javax.imageio.*;
import java.awt.image.BufferedImage;

byte[] bufferImage(PImage srcimg) {
  ByteArrayOutputStream out = new ByteArrayOutputStream();
  BufferedImage img = new BufferedImage(srcimg.width, srcimg.height, BufferedImage.TYPE_INT_ARGB);
  img = (BufferedImage) createImage(srcimg.width,srcimg.height);
  img.setRGB(0, 0, srcimg.width, srcimg.height, srcimg.pixels, 0, srcimg.width);


  try {


     ImageIO.write(img, "PNG", out);

  } catch (FileNotFoundException e) {
    println(e);
  } catch (IOException ioe) {
    println(ioe);
  }
  return out.toByteArray();
}
class Spectrum {
    public int[][][] buffer;
    public int[] storedbuffer;
    public int[] absorptionbuffer;
    public int[] enhancedabsorptionbuffer;
    public int history;
    public int resolution = 1;
    public int[][][] hyperBuffer;
    public int hyperX = video.width/2;
    public int lastred = 0;
    public int lastgreen = 0;
    public int lastblue = 0;
    public int currentSpectrumDisplayHeight = 10;
    public int averageAbsorption = 0;
    public int absorptionSum;
    public int lastval = 0;

    public Spectrum(int pHistory,int pSamplerow) {
      settings.sampleRow = pSamplerow;
      history = pHistory;
      buffer = new int[history][video.width][3];
      hyperBuffer = new int[width/settings.hyperRes][width][video.height]; // [bands][history][videoheight]
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

      int index = int (video.width*settings.sampleRow); //the horizontal strip to sample
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
      int xoff = (int) width/2-video.width/8, yoff = (int) height/2-video.height/8;
      fill(150);
      rect(xoff-10,yoff-40,video.width/4+20,video.height/4+60);
      fill(20);
      textFont(font,18);
      text("Drag to adjust the sampling height",xoff,yoff-10);
      video.image(xoff,yoff,video.width/4,video.height/4);
      noFill();
      stroke(255,255,0);
      rect(xoff,yoff+settings.sampleRow/4,video.width/4,settings.sampleHeight/4);
      fill(255,255,0,0.3);
      noStroke();
      rect(xoff,yoff,video.width/4,settings.sampleRow/4);
      rect(xoff,yoff+settings.sampleRow/4+settings.sampleHeight/4,video.width/4,settings.sampleHeight/4+settings.sampleRow/4);
    }
    public void storeReference() {
      for (int x = 0;x < buffer[0].length;x++) {
        storedbuffer[x] = (buffer[0][x][0]+buffer[0][x][1]+buffer[0][x][2])/3;
      }
    }

    public float wavelengthFromPixel(int x) {
        float nmPerPixel = (settings.secondMarkerWavelength-settings.firstMarkerWavelength)/(settings.secondMarkerPixel-settings.firstMarkerPixel);
        float nmForZero = settings.firstMarkerWavelength-((float)settings.firstMarkerPixel*nmPerPixel);
        return nmForZero+((float)x*nmPerPixel);
    }

    public void saveHyperspectralCube() {
      PGraphics pg = createGraphics(width, video.height, P2D);
      for (int b = 0;b < spectrum.hyperBuffer.length;b++) {
        for (int x = 0;x < video.width;x++) {
          for (int y = headerHeight;y < video.height;y++) {
            pg.pixels[(y*width)+x] = spectrum.hyperBuffer[b][x][y];
          }
        }
        pg.save("cube"+spectrum.wavelengthFromPixel(b*settings.hyperRes)+".png");
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

            builder.append("{wavelength:"+spectrum.wavelengthFromPixel(x)+",average:"+wavelengthAverage(pixel));
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

            builder.append(spectrum.wavelengthFromPixel(x)+","+wavelengthAverage(pixel));
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
      settings.sampleRow += 1;
      if (settings.sampleRow >= video.height-settings.sampleHeight) {
        settings.sampleRow = video.height-settings.sampleHeight-1;
      }
    } else if (keyCode == UP) {
      settings.sampleRow -= 1;
      if (settings.sampleRow <= 0) {
        settings.sampleRow = 0;
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

void mouseDragged() {
  if (controller == "analyze") {
  } else if (controller == "setup") {
    setup.mouseDragged();
  } else if (controller == "heatmap") {
  } else if (controller == "hyperspectral") {
    hyperspectral.mouseDragged();
  }
}

void mousePressed() {
  if (controller == "analyze") {
    analyze.mousePressed();
  } else if (controller == "setup") {
    setup.mousePressed();
  } else if (controller == "heatmap") {
    analyze.mousePressed(); // for now, same.
  } else if (controller == "hyperspectral") {
    hyperspectral.mousePressed();
  }
}

void mouseReleased() {
  if (controller == "analyze") {
  } else if (controller == "setup") {
    setup.mouseReleased();
  } else if (controller == "heatmap") {
  } else if (controller == "hyperspectral") {
    hyperspectral.mouseReleased();
  }
}
class Button {

  public String text;
  public boolean visible = false;
  public int x = 0;
  public int y = 0;
  public boolean dragging = false; // not often used except in "sliders"
  public int padding = 10;
  public int width = 100;
  public int height = headerHeight;
  public int fontSize = 18;//24;
  public boolean hovering = false;
  public boolean down = false;
  public color fillColor = #222222;
  public String forController;

  public Button(String pText,int pX, int pY, int pHeight, String pForController) {
    text = pText;
    x = pX;
    y = pY;
    height = pHeight;
    forController = pForController;
    textFont(font,fontSize);
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

  public void mousePressed() {}

  void up() {
    down = false;
  }
  void down() {
    down = true;
  }

  void draw() {
    textFont(font,fontSize);
    strokeCap(PROJECT);
    fill(fillColor);
    stroke(20);
    rect(x,y+1,width-1,height-2);
    if (hovering) fill(0,0,0,50);
    rect(x,y+1,width-1,height-2);
    if (down) fill(0,0,0,80);
    rect(x,y+1,width-1,height-2);
    fill(255);
    if (down) fill(170);
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
  int width, height;
  int sampleWidth;
  int[] rgb;
  boolean isLinux;
  PApplet parent;
  public String[] cameras;
  public Video(PApplet PParent, int receivedWidth, int receivedHeight, int receivedDevice) {
    width = receivedWidth;
    height = receivedHeight;
    settings.videoDevice = receivedDevice;

    parent = PParent;
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
      Process p = r.exec("uvcdynctrl -d video"+settings.videoDevice+" -s \"Exposure, Auto\" 1 && uvcdynctrl -s \"White Balance Temperature, Auto\" 0 && uvcdynctrl -d video"+settings.videoDevice+" -s Contrast 128");
    } catch(IOException e1) { println(e1); }

    if (isLinux) {
      println("Video device: /dev/video"+settings.videoDevice);
      gscapture = new GSCapture(parent, width, height, "/dev/video"+settings.videoDevice,10); //linux
      gscapture.start();
      int[][] resolutions = gscapture.resolutions();
      gscapture.stop();
      gscapture = new GSCapture(parent, resolutions[0][0], resolutions[0][1], "/dev/video"+settings.videoDevice,10); //linux
      gscapture.start();
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
  public void changeDevice(int Pdevice) {
    if (isLinux) {
      gscapture.stop();
      settings.videoDevice = Pdevice;
      settings.set("video.device",Pdevice);
      gscapture = new GSCapture(parent, width, height, "/dev/video"+settings.videoDevice, 10);
      gscapture.start();
    }
  }
  public void image(int x,int y,int imgWidth,int imgHeight)
  {
    if (isLinux) {
      gscapture.read();
      parent.image(gscapture,x,y,imgWidth,imgHeight);
    } else parent.image(capture,x,y,imgWidth,imgHeight);
  }
  public int[] get_rgb(int x)
  {
    rgb = new int[3];
    rgb[0] = 0;
    rgb[1] = 0;
    rgb[2] = 0;

    for (int yoff = settings.sampleRow; yoff < settings.sampleRow+settings.sampleHeight; yoff+=1) {
      int sampleind = int ((video.width*yoff)+x);

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

    rgb[0] = int (rgb[0]/(settings.sampleHeight*1.00));
    rgb[1] = int (rgb[1]/(settings.sampleHeight*1.00));
    rgb[2] = int (rgb[2]/(settings.sampleHeight*1.00));

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

    int index = int (video.width*settings.sampleRow); //the middle horizontal strip

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
        pg.set(x,y,pixels[headerHeight*width+y*width+x]);
      }
    }
    pg.endDraw();
    pg.save(spectraFolder + presenter.generateFileName(typedText + "-alt", "png"));

    String webTitle = presenter.generateFileName("untitled",null);
    try {
      String response;

      float version = settings.props.getFloatProperty("client.version",0);
      int uniq_id = settings.props.getIntProperty("user.uniqId",0);
      float startW = spectrum.wavelengthFromPixel(0);
      float endW = spectrum.wavelengthFromPixel(video.width);

      String saveString = serverUrl+"/spectrums/create?spectrum[title]="+webTitle+"&spectrum[author]=anonymous&client="+version+"&uniq_id="+uniq_id+"&startWavelength="+startW+"&endWavelength="+endW;
      println(saveString);
      URL u = new URL(saveString);

      response = postData(u,bufferImage(pg.get()),presenter.generateFileName(typedText,"png"));
      println(serverUrl+"/spectra/edit/"+response);
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

        dstream.writeBytes("Content-Disposition: form-data; name=\"photo\"; filename=\""+filename+"\" \r\nContent-Type: image/png\r\nContent-Transfer-Encoding: binary\r\n\r\n");
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

    } else if (mouseY < int (20+headerHeight+(height-headerHeight)/2)) { // Calibrator

    } else { // Graph

    }
  }

}
Analyze analyze;
class Setup {

  boolean selectingSampleRow = true;
  boolean sampleRowMousePressed = false;
  int delayCounter = 10;

  public Setup() {

  }

  public void mouseMoved() {
  }
  public void mouseDragged() {
    calibrator.mouseDragged();
  }

  public void mousePressed() {
    if (mouseY < headerHeight) { // Header
      header.mousePressed();
    } else if (selectingSampleRow && (mouseX > width/2-video.width/8 && mouseX < width/2+video.width/8) && (mouseY > height/2-video.height/8 && mouseY < height/2+video.height/8)) { // Modal video select
      sampleRowMousePressed = true;
      settings.sampleRow = 4*(mouseY-height/2+video.height/8);
      if (settings.sampleRow+settings.sampleHeight > video.height || settings.sampleRow+settings.sampleHeight <= 0) {
        settings.sampleHeight = video.height-settings.sampleRow-1;
      }
    } else if (mouseY < int (headerHeight+(height-headerHeight)/2)) { // Waterfall

    } else if (mouseY < int (30+headerHeight+(height-headerHeight)/2)) { // Calibrator
      calibrator.mousePressed();
    } else { // Graph

    }
  }

  public void mouseReleased() {
    int topRow, bottomRow;
    if (sampleRowMousePressed) {
      sampleRowMousePressed = false;
      selectingSampleRow = false;
      delayCounter = 10;
      if (settings.sampleRow > (4*(mouseY-height/2+video.height/8))) {
        topRow = (4*(mouseY-height/2+video.height/8));
        bottomRow = settings.sampleRow;
        settings.sampleRow = topRow;
      } else {
        bottomRow = (4*(mouseY-height/2+video.height/8));
        topRow = settings.sampleRow;
      }
      settings.sampleHeight = bottomRow-topRow;
      if (settings.sampleRow+settings.sampleHeight > video.height || settings.sampleRow+settings.sampleHeight <= 0) {
        settings.sampleHeight = video.height-settings.sampleRow-1;
      }
      settings.set("video.samplerow",settings.sampleRow);
      settings.set("video.sampleheight",settings.sampleHeight);
      controller = "analyze";
    }
    calibrator.mouseReleased();
  }

}

Setup setup;
class Hyperspectral {
  Button firstMarker,secondMarker;
  public ArrayList sliders;
  public int y,height;
  PApplet parent;

  public Hyperspectral(PApplet pParent) {
    parent = pParent;
    y = headerHeight+3;
    height = 30;
    sliders = new ArrayList();
    firstMarker = new Button("Wavelength",spectrum.hyperX,y,height,"hyperspectral");
    sliders.add(firstMarker);
    secondMarker = new Button("End",3000,y,height,"hyperspectral"); //not using yet, put off to right side; will be used for a range selection
    sliders.add(secondMarker);
  }

  void draw() {
    for (int t = spectrum.hyperBuffer.length-1;t > 0;t--) {
      for (int y = 0;y < video.height;y++) {
        for (int b = 0;b < (int)(video.width/settings.hyperRes);b++) { // every wavelength
          if (b < video.width) spectrum.hyperBuffer[b][t][y] = spectrum.hyperBuffer[b][t-1][y];
        }
      }
    }
    for (int y = video.height-1;y> 0;y--) {
      for (int b = 0;b < video.width/settings.hyperRes;b++) {
        spectrum.hyperBuffer[b][0][y] = video.pixels()[b*settings.hyperRes+(video.width*y)];
      }
    }

    for (int t = 0;t < spectrum.hyperBuffer[0].length;t++) {
      for (int y = 0;y < video.height;y++) {
        for (int w = 0;w < settings.hyperRes;w++) {
	  if (t*settings.hyperRes < width) {
            pixels[((headerHeight+y)*width)+(t*settings.hyperRes)+w] = spectrum.hyperBuffer[spectrum.hyperX/settings.hyperRes][t][y];
          }
        }
      }
    }

    firstMarker.draw();
    firstMarker.text = "Wavelength ("+spectrum.wavelengthFromPixel(firstMarker.x)+")";

    if (firstMarker.dragging) { // && firstMarker.mouseOver()) {
      firstMarker.x = mouseX;
      stroke(255);
      line(firstMarker.x,0,firstMarker.x,height);
    } else if (secondMarker.dragging) { // && secondMarker.mouseOver()) {
      secondMarker.x = mouseX;
      stroke(255);
      line(secondMarker.x,0,secondMarker.x,height);
    }

  }

  public void mousePressed() {
    if (mouseY < headerHeight) { // Header
      header.mousePressed();
    } else if (mouseY < int (headerHeight+(height-headerHeight)/2)) { // Waterfall

    } else if (mouseY < int (20+headerHeight+(height-headerHeight)/2)) { // Calibrator

    } else { // Graph

    }

    if (firstMarker.mouseOver()) {
      firstMarker.dragging = true;
    } else if (secondMarker.mouseOver()) {
    }
  }

  void mouseDragged() {
  }

  void mouseReleased() {
    firstMarker.dragging = false;
    spectrum.hyperX = firstMarker.x;
      settings.set("hyperspectral.firstMarkerPixel",spectrum.hyperX);
    secondMarker.dragging = false;
  }

}
Hyperspectral hyperspectral;
class VideoRowButton extends Button {
  VideoRowButton(String PbuttonName,int Px,int Py,int Pheight) {
	super(PbuttonName,Px,Py,Pheight,"setup");
  }
  void draw() {
    if (controller == forController) {
	super.draw();
    }
  }
  void mousePressed() {
    if (controller == forController && super.mouseOver()) {
      setup.selectingSampleRow = true;
    }
  }
}

class SaveButton extends Button {
  SaveButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"all");
  }
  void mousePressed() {
    if (super.mouseOver()) {
      if (controller == "hyperspectral") spectrum.saveHyperspectralCube();
      else server.upload();
    }
  }
}

class AnalyzeButton extends Button {
  AnalyzeButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"all");
  }
  void mousePressed() {
    if (super.mouseOver()) {
      header.switchController("analyze");
      header.heatmapButton.up();
      header.setupButton.up();
      header.analyzeButton.down();
    }
  }
}

class HeatmapButton extends Button {
  HeatmapButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"all");
  }
  void mousePressed() {
    if (super.mouseOver()) {
      header.switchController("heatmap");
      header.heatmapButton.down();
      header.setupButton.up();
      header.analyzeButton.up();
    }
  }
}
class HyperspectralButton extends Button {
  HyperspectralButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"all");
  }
  void mousePressed() {
    if (super.mouseOver()) {
      header.switchController("hyperspectral");
      header.heatmapButton.up();
      header.setupButton.up();
      header.analyzeButton.up();
    }
  }
}

class SetupButton extends Button {
  SetupButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"all");
  }
  void mousePressed() {
    if (super.mouseOver()) {
      header.switchController("setup");
      header.heatmapButton.up();
      header.setupButton.down();
      header.analyzeButton.up();
    }
  }
}

class BaselineButton extends Button {
  BaselineButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"analyze");
  }
  void mousePressed() {
    if (super.mouseOver()) spectrum.storeReference();
  }
  void draw() {
    if (controller == forController) super.draw();
  }
}

class WebcamButton extends Button {
  WebcamButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"setup");
  }
  void draw() {
    if (video.isLinux && controller == forController) super.draw();
  }
  void mousePressed() {
    if (super.mouseOver() && video.isLinux) {
      video.changeDevice(settings.videoDevice+1);
    }
  }
}

class LearnButton extends Button {
  LearnButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"all");
  }
  void mousePressed() {
    if (super.mouseOver()) link("http://publiclaboratory.org/wiki/spectral-workbench");
  }
}

class Header {
  public PImage logo;
  public int rightOffset = 0; // where to put new buttons (shifts as buttons are added)
  public ArrayList buttons;
  public Button learnButton;
  public Button saveButton;
  public Button analyzeButton;
  public Button heatmapButton;
  public Button hyperspectralButton;
  public Button setupButton;

  public Button baselineButton;
  public Button webcamButton;
  public Button videoRowButton;
  public int margin = 4;

  public Header() {
    logo = loadImage("logo-small.png");
    buttons = new ArrayList();
    learnButton = addButton(new LearnButton("Learn",width-rightOffset-margin,margin,headerHeight-8));
    saveButton = addButton(new SaveButton("Save",width-rightOffset-margin,margin,headerHeight-8));

    hyperspectralButton = addButton(new HyperspectralButton("Hyperspectral",width-rightOffset-margin,margin,headerHeight-8));
    analyzeButton = addButton(new AnalyzeButton("Analyze",width-rightOffset-margin,margin,headerHeight-8));
    analyzeButton.down();
    heatmapButton = addButton(new HeatmapButton("Heatmap",width-rightOffset-margin,margin,headerHeight-8));
    setupButton = addButton(new SetupButton("Setup",width-rightOffset-margin,margin,headerHeight-8));

    baselineButton = addButton(new BaselineButton("Baseline",width-rightOffset-margin,margin,headerHeight-8));
    baselineButton.fillColor = #444444;
    webcamButton = addButton(new WebcamButton("Switch webcam",width-rightOffset-margin,margin,headerHeight-8));
    webcamButton.fillColor = #444444;
    videoRowButton = addButton(new VideoRowButton("Adjust sample row",width-rightOffset-margin,margin,headerHeight-8));
    videoRowButton.fillColor = #444444;
  }

  public Button addButton(Button pButton) {
    buttons.add(pButton);
    if (pButton.forController == "all") {
      rightOffset += pButton.width+margin;
      if (pButton.forController == controller) {
        pButton.visible = true;
      }
    }
    pButton.x -= pButton.width;
    return pButton;
  }

  public void mousePressed() {
    for (int i = 0;i < buttons.size();i++) {
      Button b = (Button) buttons.get(i);
      b.mousePressed();
    }
  }

  public void switchController(String Pcontroller) {
    controller = Pcontroller;

    for (int i = 0;i < buttons.size();i++) {
      Button b = (Button) buttons.get(i);
      if (b.visible && b.forController != "all" && b.forController != Pcontroller) {
	println("removing "+b.text+":"+b.forController);
        rightOffset -= b.width;
        b.visible = false;
      }
    }
    for (int i = 0;i < buttons.size();i++) {
      Button b = (Button) buttons.get(i);
      if (b.forController == Pcontroller) {
	b.visible = true;
	println("adding "+b.text+":"+b.forController);
        rightOffset += b.width;
        b.x = width-rightOffset-margin;
      }
    }
  }

  public void draw() {
    fill(255);
    noStroke();
    image(logo,14,14);
    textFont(font,24);
    text("PLOTS Spectral Workbench", 55, 40); //display current title

    for (int i = 0;i < buttons.size();i++) {
      Button b = (Button) buttons.get(i);
      b.draw();
    }
  }
}


Header header;
class Calibrator {

  Button firstMarker,secondMarker;
  public ArrayList sliders;
  public int y,height;
  PApplet parent;

  public Calibrator(PApplet Pparent) {
    parent = Pparent;
    y = headerHeight+(parent.height-headerHeight)/2;
    height = 30;
    sliders = new ArrayList();
    firstMarker = new Button("Mercury 2, 435.833",settings.firstMarkerPixel,y,height,"setup");
    sliders.add(firstMarker);
    secondMarker = new Button("Mercury 3, 546.074",settings.secondMarkerPixel,y,height,"setup");
    sliders.add(secondMarker);
  }

  void draw() {
    textFont(font,10);

    text((int)(spectrum.wavelengthFromPixel(mouseX))+"nm",mouseX+4,y+50);
    stroke(40);
    line(mouseX,y,mouseX,y+1000); // all the way past the bottom of the screen

    if (settings.firstMarkerWavelength != 0) { // if no calibration exists, this will be 0

      float nmPerPixel = (settings.secondMarkerWavelength-settings.firstMarkerWavelength)/(settings.secondMarkerPixel-settings.firstMarkerPixel);
      int pxFor400Nm = settings.firstMarkerPixel - (int) (35.833/nmPerPixel);

      for (int i=-4;i<8;i++) {
        int gradX = pxFor400Nm+(int)((float)i*(100.00/nmPerPixel));
        stroke(40);
        line(gradX,y,gradX,y+1000); // all the way past the bottom of the screen
        noStroke();
        fill(200);
        text((int)(400+(i*100))+"nm",gradX+4,y+20);
      }

    } else {
      text("No calibration yet",4,height+4);
    }
    if (controller == "setup") { // show wavelength graduations

      for (int i = 0;i < sliders.size();i++) {
        Button b = (Button) sliders.get(i);
        b.draw();
      }

      if (firstMarker.dragging) { // && firstMarker.mouseOver()) {
        firstMarker.x = mouseX;
        stroke(255);
        line(firstMarker.x,0,firstMarker.x,parent.height);
      } else if (secondMarker.dragging) { // && secondMarker.mouseOver()) {
        secondMarker.x = mouseX;
        stroke(255);
        line(secondMarker.x,0,secondMarker.x,parent.height);
      }

    }
  }

  void mousePressed() {
    if (firstMarker.mouseOver()) {
      firstMarker.dragging = true;
    } else if (secondMarker.mouseOver()) {
      secondMarker.dragging = true;
    }
  }

  void mouseDragged() {
  }

  void mouseReleased() {
    firstMarker.dragging = false;
    settings.firstMarkerPixel = firstMarker.x;
    settings.firstMarkerWavelength = 435.833;
      settings.set("calibration.firstMarkerWavelength",settings.firstMarkerWavelength);
      settings.set("calibration.firstMarkerPixel",settings.firstMarkerPixel);
    secondMarker.dragging = false;
    settings.secondMarkerPixel = secondMarker.x;
    settings.secondMarkerWavelength = 546.074;
      settings.set("calibration.secondMarkerWavelength",settings.secondMarkerWavelength);
      settings.set("calibration.secondMarkerPixel",settings.secondMarkerPixel);
  }

}
Calibrator calibrator;
class Settings {
  P5Properties props;
  int uniqId;
  float firstMarkerWavelength;
  int firstMarkerPixel;
  float secondMarkerWavelength;
  int secondMarkerPixel;
  int sampleRow;
  int sampleHeight;
  int hyperRes;
  int videoDevice,videoWidth,videoHeight;
  PApplet parent;
  public Settings(PApplet pParent) {
    println("Reading settings.txt");
    parent = pParent;
    try {
      props=new P5Properties();
      props.load(openStream("settings.txt"));

      uniqId = props.getIntProperty("user.uniqId",0);
      if (uniqId == 0) set("user.uniqId",(int)(Math.random() * ((999999999) + 1)));
      set("client.version",0.4);

      videoWidth = props.getIntProperty("video.height",1280);
      videoHeight = props.getIntProperty("video.width",720);
      sampleRow = props.getIntProperty("video.samplerow",80);
      sampleHeight = props.getIntProperty("video.sampleheight",int (height*(0.18)));
      hyperRes = props.getIntProperty("hyperspectral.resolution",10);
      videoDevice = props.getIntProperty("video.device",0);
      firstMarkerWavelength = props.getFloatProperty("calibration.firstMarkerWavelength",0);
      firstMarkerPixel = props.getIntProperty("calibration.firstMarkerPixel",0);
      secondMarkerWavelength = props.getFloatProperty("calibration.secondMarkerWavelength",0);
      secondMarkerPixel = props.getIntProperty("calibration.secondMarkerPixel",0);
    } catch(IOException e) {
      println("couldn't read config file...");
    }
  }

  void set(String key,int val) {
    println("Writing settings.txt");
    String stringVal = ""+val; // how else to turn int into String? I'm on a plane and can't look it up.
    props.setProperty(key,stringVal);
    try {
      props.store(new FileOutputStream(parent.dataPath("settings.txt")), null);
      println("done");
    } catch (IOException e) {
      println(e);
    }
  }
  void set(String key,float val) {
    println("Writing settings.txt");
    String stringVal = ""+val; // how else to turn int into String? I'm on a plane and can't look it up.
    props.setProperty(key,stringVal);
    try {
      props.store(new FileOutputStream(parent.dataPath("settings.txt")), null);
      println("done");
    } catch (IOException e) {
      println(e);
    }
  }
  void set(String key,long val) {
    println("Writing settings.txt");
    String stringVal = ""+val; // how else to turn int into String? I'm on a plane and can't look it up.
    props.setProperty(key,stringVal);
    try {
      props.store(new FileOutputStream(parent.dataPath("settings.txt")), null);
      println("done");
    } catch (IOException e) {
      println(e);
    }
  }

}
class P5Properties extends Properties {

  boolean getBooleanProperty(String id, boolean defState) {
    return boolean(getProperty(id,""+defState));
  }

  int getIntProperty(String id, int defVal) {
    return int(getProperty(id,""+defVal));
  }

  float getFloatProperty(String id, float defVal) {
    return float(getProperty(id,""+defVal));
  }
}

Settings settings;

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
  analyze = new Analyze();
  setup = new Setup();
  header = new Header();
  server = new Server();

  size(screen.width, screen.height-20, P2D);

  settings = new Settings(this); // once more settings are stored in this object instead of video or spectrum, this can move up
  video = new Video(this,settings.videoHeight,settings.videoWidth,0);
  spectrum = new Spectrum(int (height-headerHeight)/2,settings.sampleRow); //history (length),samplerow (row # to begin sampling)
  hyperspectral = new Hyperspectral(this);
  filter = new Filter(this);
  calibrator = new Calibrator(this);
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
  calibrator.draw();
  if (controller == "hyperspectral") hyperspectral.draw();
  else spectrum.draw(headerHeight); //y position of top of spectrum
  updatePixels();
  if ((controller == "setup" && setup.selectingSampleRow) || setup.delayCounter > 0) {
	setup.delayCounter -= 1;
	spectrum.preview();
  }
}

