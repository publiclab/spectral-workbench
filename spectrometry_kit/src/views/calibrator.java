/**
 * A class to manage the sliders for calibrating a spectrometer. 
**/
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
    firstMarker = new Button("Mercury 2, 435.833",settings.firstMarkerPixel,y,height);
    sliders.add(firstMarker);
    secondMarker = new Button("Mercury 3, 546.074",settings.secondMarkerPixel,y,height);
    sliders.add(secondMarker);
  }

  void draw() {
    textFont(font,10);

    // draw mouse wavelength
    text((int)(spectrum.wavelengthFromPixel(mouseX))+"nm",mouseX+4,y+50);
    stroke(40);
    line(mouseX,y,mouseX,y+1000); // all the way past the bottom of the screen

    if (settings.firstMarkerWavelength != 0) { // if no calibration exists, this will be 0
      // the device could have been changed or swapped... we can double check by color, maybe
      // draw graduated labels
      
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
