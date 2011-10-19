////////////////////////////////////
// DRAW SPECTRUM INTENSITY GRAPH
////////////////////////////////////

// runs for each column of video data, every frame

if (colortype == "combined") {
  // current live spectrum:
  stroke(255);
  int val = (rgb[0]+rgb[1]+rgb[2])/3;
  line(x,height-lastval,x+1,height-val);
  lastval = (rgb[0]+rgb[1]+rgb[2])/3;

  // last saved spectrum:
  stroke(color(255,0,0));
  int lastind = x-1;
  if (lastind < 0) { 
     lastind = 0;
  }
  line(x,height-lastspectrum[lastind],x+1,height-lastspectrum[x]);

  // percent absorption compared to reference reading
  stroke(color(255,255,0));
  // calculate absorption for this x position, store it in the absorption buffer:
  absorption[x] = int (255*(1-(val/(lastspectrum[x]+1.00))));
  int last = x-1;
  if (last < 0) { last = 0; }
  line(x,height-absorption[last],x+1,height-absorption[x]);

  // contrast-enhanced absorption:
  absorptionSum += absorption[x];
  // amplify by scale factor:
  contrastEnhancedAbsorption[x] = (absorption[x] - averageAbsorption) * 4;
  contrastEnhancedAbsorption[x] += averageAbsorption;
  stroke(color(0,255,0)); // green line
  last = x-1;
  if (last < 0) { last = 0; }
  //line(x,height-contrastEnhancedAbsorption[last],x+1,height-contrastEnhancedAbsorption[x]);

} else if (colortype == "rgb") { // RGB sensor calibration mode

  // red channel:
  stroke(color(255,0,0));
  line(x,height-lastred,x+1,height-rgb[0]);
  lastred = rgb[0];      
  // green channel:
  stroke(color(0,255,0));
  line(x,height-lastgreen,x+1,height-rgb[1]);
  lastgreen = rgb[1];
  // blue channel:
  stroke(color(0,0,255));
  line(x,height-lastblue,x+1,height-rgb[2]);
  lastblue = rgb[2];
}
