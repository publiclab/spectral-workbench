class Setup {

  boolean selectingSampleRow = true;
  boolean sampleRowMousePressed = false;
  int delayCounter = 10;

  public Setup() {

  }

  public void mouseMoved() {
    calibrator.mouseMoved();      
  }

  public void mousePressed() {
    if (mouseY < headerHeight) { // Header
      header.mousePressed();
    } else if (selectingSampleRow && (mouseX > width/2-video.width/8 && mouseX < width/2+video.width/8) && (mouseY > height/2-video.height/8 && mouseY < height/2+video.height/8)) { // Modal video select

      sampleRowMousePressed = true;
      spectrum.samplerow = 4*(mouseY-height/2+video.height/8);
      if (spectrum.samplerow+video.sampleHeight > video.height || spectrum.samplerow+video.sampleHeight <= 0) {
        video.sampleHeight = video.height-spectrum.samplerow-1;
      }
    } else if (mouseY < int (headerHeight+(height-headerHeight)/2)) { // Waterfall

    } else if (mouseY < int (20+headerHeight+(height-headerHeight)/2)) { // Calibrator
      calibrator.mousePressed();      
    } else { // Graph

    }
  }

  public void mouseReleased() {
    if (sampleRowMousePressed) {
      sampleRowMousePressed = false;
      selectingSampleRow = false;
      delayCounter = 10;
      video.sampleHeight = (4*(mouseY-height/2+video.height/8))-spectrum.samplerow;
      if (spectrum.samplerow+video.sampleHeight > video.height || spectrum.samplerow+video.sampleHeight <= 0) {
        video.sampleHeight = video.height-spectrum.samplerow-1;
      }
      settings.set("video.samplerow",spectrum.samplerow);
      settings.set("video.sampleheight",video.sampleHeight);
      controller = "analyze";
    }
    calibrator.mouseReleased();      
  }

}

