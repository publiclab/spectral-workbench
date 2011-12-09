//class Mouse {
//  public Mouse() {
//
//  }  
//}

void mouseDragged() {
  // switch to calling controller.activeController
  if (controller == "analyze") {
    //analyze.mouseDragged();
  } else if (controller == "setup") {
    setup.mouseDragged();
  } else if (controller == "heatmap") {
    //heatmap.mouseDragged();
  } else if (controller == "hyperspectral") {
    hyperspectral.mouseDragged();
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
  } else if (controller == "hyperspectral") {
    hyperspectral.mousePressed();
  }
}

void mouseReleased() {
  // switch to calling controller.activeController
  if (controller == "analyze") {
    //analyze.mouseReleased();
  } else if (controller == "setup") {
    setup.mouseReleased();
  } else if (controller == "heatmap") {
    //heatmap.mouseReleased();
  } else if (controller == "hyperspectral") {
    hyperspectral.mouseReleased();
  }
}
