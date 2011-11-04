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
    //save CSV and JSON:
    PrintWriter csv;
    PrintWriter json;
    csv = createWriter("spectra/"+year()+"-"+month()+"-"+day()+"-"+hour()+""+minute()+"-"+typedText+".csv");
    json = createWriter("spectra/"+year()+"-"+month()+"-"+day()+"-"+hour()+""+minute()+"-"+typedText+".json");

    json.println("{name:'"+year()+"-"+month()+"-"+day()+"-"+hour()+""+minute()+"-"+typedText+"',lines:");

    // iterate by pixel:
    for (int x=0;x<spectrumbuf[0].length;x++) {
      // for now, just the average of r,g,b:
      csv.println("unknown_wavelength,"+(spectrumbuf[0][x][0]+spectrumbuf[0][x][1]+spectrumbuf[0][x][2])/3+","+spectrumbuf[0][x][0]+","+spectrumbuf[0][x][1]+","+spectrumbuf[0][x][2]);
      json.print("{wavelength:null,average:"+(spectrumbuf[0][x][0]+spectrumbuf[0][x][1]+spectrumbuf[0][x][2])/3+",r:"+spectrumbuf[0][x][0]+",g:"+spectrumbuf[0][x][1]+",b:"+spectrumbuf[0][x][2]+"}");
      if (x < spectrumbuf[0].length-1) { json.println(","); }
    }

    csv.close();
    json.print("}");
    json.close();

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
