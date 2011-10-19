void keyPressed() {
  if (key == CODED) {
    if (keyCode == DOWN) {
      samplerow += 1;
      if (samplerow >= video.height) {
        samplerow = video.height;
      }
    } 
    else if (keyCode == UP) {
      samplerow -= 1;
      if (samplerow <= 0) {
        samplerow = 0;
      }
    }
  } 
  else if (key == ' ') {
    for (int x = 0;x < spectrumbuf[0].length;x++) {
      lastspectrum[x] = (spectrumbuf[0][x][0]+spectrumbuf[0][x][1]+spectrumbuf[0][x][2])/3;
    }
  }
  else if (key == 's') {
    //save JSON:

    //save PNG:
    save("spectra/"+year()+"-"+month()+"-"+day()+"-"+hour()+""+minute()+"-"+typedText+".png");
    //save to web:
    //http://libraries.seltar.org/postToWeb/
    typedText = "";
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
    if (typedText == "type to label spectrum") { 
      typedText = "";
    }
    typedText += key;
  }
}
