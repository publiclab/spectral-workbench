class Keys {
  public boolean commandKey;
  
}
Keys keys;

void keyReleased() {
  if (key == CODED) {
    if (keyCode == CONTROL) {
      keys.commandKey = false;
    }
  }
}

void keyPressed() {
  if (key == CODED) {
    if (keyCode == DOWN) {
      samplerow += 1;
      if (samplerow >= video.height) {
        samplerow = video.height;
      }
    } else if (keyCode == UP) {
      samplerow -= 1;
      if (samplerow <= 0) {
        samplerow = 0;
      }
    } else if (keyCode == CONTROL) {
      println("control key");
      keys.commandKey = false;
    }
  } 
  else if (key == ' ') {
    for (int x = 0;x < spectrumbuf[0].length;x++) {
      lastspectrum[x] = (spectrumbuf[0][x][0]+spectrumbuf[0][x][1]+spectrumbuf[0][x][2])/3;
    }
  }
  else if (key == 's' && keys.commandKey) {
    println("saving to server...");
    server.upload();
  } 
  else if (keyCode == TAB) {
    if (colortype == "combined") {
      colortype = "rgb";
    } 
    else if (colortype == "rgb") {
      colortype = "heat";
    }
    else if (colortype == "heat") {
      colortype = "combined";
    }
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
