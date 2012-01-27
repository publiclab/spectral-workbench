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
      // allow dragging upward or downward:
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

