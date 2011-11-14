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
      spectrum.samplerow += 1;
      if (spectrum.samplerow >= video.height) {
        spectrum.samplerow = video.height;
      }
    } else if (keyCode == UP) {
      spectrum.samplerow -= 1;
      if (spectrum.samplerow <= 0) {
        spectrum.samplerow = 0;
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
    if (typedText.equals(defaultTypedText)) { 
      typedText = "";
    }
    typedText += key;
  }
}
