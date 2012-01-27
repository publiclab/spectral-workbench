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
    firstMarker = new Button("Wavelength",spectrum.hyperX,y,height);
    sliders.add(firstMarker);
    secondMarker = new Button("End",3000,y,height); //not using yet, put off to right side; will be used for a range selection
    sliders.add(secondMarker);
  }

  void draw() {
    // bump hyperBuffer by 1 place
    for (int t = spectrum.hyperBuffer.length-1;t > 0;t--) {
      for (int y = 0;y < video.height;y++) {
        for (int b = 0;b < (int)(video.width/spectrum.hyperRes);b++) { // every wavelength
          if (b < video.width) spectrum.hyperBuffer[b][t][y] = spectrum.hyperBuffer[b][t-1][y];
        }
      }
    }
    // copy hyperX column into hyperBuffer
    for (int y = video.height-1;y> 0;y--) {
      for (int b = 0;b < video.width/spectrum.hyperRes;b++) {
        spectrum.hyperBuffer[b][0][y] = video.pixels()[b*spectrum.hyperRes+(video.width*y)];
      }
    }

    for (int x = 0;x < spectrum.hyperBuffer[spectrum.hyperX/spectrum.hyperRes].length;x++) {
      for (int y = headerHeight;y < video.height;y++) {
        for (int w = 0;w < spectrum.hyperRes;w++) {
          pixels[(y*width)+(x*spectrum.hyperRes)+w] = spectrum.hyperBuffer[spectrum.hyperX/spectrum.hyperRes][x][y];
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
    // Handoff interaction to regions: 
    if (mouseY < headerHeight) { // Header
      header.mousePressed();
    } else if (mouseY < int (headerHeight+(height-headerHeight)/2)) { // Waterfall

    } else if (mouseY < int (20+headerHeight+(height-headerHeight)/2)) { // Calibrator

    } else { // Graph
  
    }

    if (firstMarker.mouseOver()) {
      firstMarker.dragging = true;
    } else if (secondMarker.mouseOver()) {
      //secondMarker.dragging = true;
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
