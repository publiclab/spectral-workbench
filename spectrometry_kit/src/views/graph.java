/*
 * Draws spectrum intensity graph,
 * runs for each column of video data, every frame
 */

if (controller == "analyze" || controller == "heatmap") {
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
  line(x,height-spectrum.storedbuffer[lastind],x+1,height-spectrum.storedbuffer[x]);

  // percent absorption compared to reference reading
  stroke(color(155,155,0));
  // calculate absorption for this x position, store it in the absorption buffer:
  spectrum.absorptionbuffer[x] = int (255*(1-(val/(spectrum.storedbuffer[x]+1.00))));
  int last = x-1;
  if (last < 0) { last = 0; }
  line(x,height-spectrum.absorptionbuffer[last],x+1,height-spectrum.absorptionbuffer[x]);

  // contrast-enhanced absorption:
  absorptionSum += spectrum.absorptionbuffer[x];
  // amplify by scale factor:
  spectrum.enhancedabsorptionbuffer[x] = (spectrum.absorptionbuffer[x] - averageAbsorption) * 4;
  spectrum.enhancedabsorptionbuffer[x] += averageAbsorption;
  stroke(color(0,255,0)); // green line
  last = x-1;
  if (last < 0) { last = 0; }
  //line(x,height-spectrum.enhancedabsorptionbuffer[last],x+1,height-spectrum.enhancedabsorptionbuffer[x]);

} else if (controller == "setup") { // RGB sensor calibration mode

  // red channel:
  stroke(color(255,0,0));
  line(x,height-spectrum.lastred,x+1,height-rgb[0]);
  spectrum.lastred = rgb[0];      
  // green channel:
  stroke(color(0,255,0));
  line(x,height-spectrum.lastgreen,x+1,height-rgb[1]);
  spectrum.lastgreen = rgb[1];
  // blue channel:
  stroke(color(0,0,255));
  line(x,height-spectrum.lastblue,x+1,height-rgb[2]);
  spectrum.lastblue = rgb[2];
}
