/**
 * A class to manage the sliders for calibrating a spectrometer. 
**/
class Calibrator { 

  Button firstMarker,secondMarker;
  public ArrayList sliders; 
  public int y,height;

  public Calibrator(PApplet parent) {
    y = headerHeight+(parent.height-headerHeight)/2;
    height = 10;
    sliders = new ArrayList();
    firstMarker = new Button("Mercury 1",0,y,height);
    sliders.add(firstMarker);
println(y);
    secondMarker = new Button("Mercury 2",width-100,y,height);
    sliders.add(secondMarker);
  }

  void draw() {
    textFont(font,10);

    if (controller == "analyze") { // show wavelength graduations
      if (settings.firstMarkerWavelength != 0) { // if no calibration exists, this will be 0
        // the device could have been changed or swapped... we can double check by color, maybe
       
        // draw graduated labels

 
      } else {
        text("No calibration yet",4,height+4);
      }
    } else { // show sliders

      for (int i = 0;i < sliders.size();i++) {
        Button b = (Button) sliders.get(i);
        b.draw();
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

  void mouseMoved() {
    if (firstMarker.dragging) {
      firstMarker.x = mouseX;
    } else if (secondMarker.dragging) {
      secondMarker.x = mouseX;
    }
  }

  void mouseReleased() {
    firstMarker.dragging = false;
    secondMarker.dragging = false;
  }

}
