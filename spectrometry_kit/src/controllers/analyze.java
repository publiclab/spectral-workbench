class Analyze {

  public Analyze() {

  }

  public void mousePressed() {
    // Handoff interaction to regions: 
    if (mouseY < headerHeight) { // Header
      header.mousePressed();
    } else if (mouseY < int (headerHeight+(height-headerHeight)/2)) { // Waterfall

    } else if (mouseY < int (20+headerHeight+(height-headerHeight)/2)) { // Calibrator

    } else { // Graph
  
    }
  } 

}
