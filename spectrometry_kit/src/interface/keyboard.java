class Keyboard {
  public boolean controlKey = false;
}

void keyReleased() {
  if (key == CODED) {
    if (keyCode == CONTROL) {
      keyboard.controlKey = false;
    }
  }
}

void keyPressed() {
  if (key == CODED) {
    if (keyCode == DOWN) {
      settings.sampleRow += 1;
      if (settings.sampleRow >= video.height-settings.sampleHeight) {
        settings.sampleRow = video.height-settings.sampleHeight-1;
      }
    } else if (keyCode == UP) {
      settings.sampleRow -= 1;
      if (settings.sampleRow <= 0) {
        settings.sampleRow = 0;
      }
    } else if (keyCode == CONTROL) {
      keyboard.controlKey = true;
    }
  } 
  else if (key == ' ' && keyboard.controlKey) {
    spectrum.storeReference();
  }
  else if (key == 's' && keyboard.controlKey) {
    println("saving to server...");
    server.upload();
  } 
  else if (keyCode == TAB) {
    switchMode();
  } 
  else if (keyCode == BACKSPACE) {
    typedText = typedText.substring(0,max(0,typedText.length()-1));
  } 
  else if (keyCode == ESC) {
    typedText = "";
  } 
  else {
    if (typedText.equals(defaultTypedText) || typedText.equals("saved: type to label next spectrum")) { 
      typedText = "";
    }
    typedText += key;
  }
}
