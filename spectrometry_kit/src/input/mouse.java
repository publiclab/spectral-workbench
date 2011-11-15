class Mouse {
  public Mouse() {

  }  
}

void mousePressed() {
  // Handoff interaction to regions: 
  // Header:
  if (mouseY < headerHeight) {
    // break this up into some sort of Button model with registration of x,y,w,h
    // Save:
    if (mouseX > width-100) {
      println("Saving to server (button)");
      server.upload();
    }
    // Switch modes:
    if (mouseX > width-300 && mouseX < width-100) {
      println("Switching mode (button)");
      switchMode();
    }
    if (mouseX > width-400 && mouseX < width-300) {
      open("~/Desktop/Safari.app");
      //String script = "tell application \'ScreenSaverEngine\' to activate";
      //println("osascript -e \""+script+"\"");
      //system.run("osascript -e \""+script+"\"");
    }
  } 
}
