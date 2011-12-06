//class Mouse {
//  public Mouse() {
//
//  }  
//}

void mouseMoved() {
  // switch to calling controller.activeController
  if (controller == "analyze") {
    //analyze.mouseMoved();
  } else if (controller == "setup") {
    setup.mouseMoved();
  } else if (controller == "heatmap") {
    //heatmap.mouseMoved();
  }
}

void mousePressed() {
  // switch to calling controller.activeController
  if (controller == "analyze") {
    analyze.mousePressed();
  } else if (controller == "setup") {
    setup.mousePressed();
    //analyze.mousePressed(); // backup
  } else if (controller == "heatmap") {
    //heatmap.mousePressed();
    analyze.mousePressed(); // for now, same.
  }
}

void mouseReleased() {
  // switch to calling controller.activeController
  if (controller == "analyze") {
    //analyze.mousePressed();
  } else if (controller == "setup") {
    setup.mouseReleased();
  } else if (controller == "heatmap") {
    //heatmap.mousePressed();
  }
}
