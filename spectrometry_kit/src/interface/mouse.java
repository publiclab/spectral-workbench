//class Mouse {
//  public Mouse() {
//
//  }  
//}

void mouseMoved() {
}

void mousePressed() {

  // switch to calling controller.activeController
  if (controller == "analyze") {
    analyze.mousePressed();
  } else if (controller == "setup") {
    //setup.mousePressed();
    analyze.mousePressed(); // for now, same.
  } else if (controller == "heatmap") {
    //heatmap.mousePressed();
    analyze.mousePressed(); // for now, same.
  }

}
