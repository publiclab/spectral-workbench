/**
 * Serialize spectral data.
 * For now a loose wrapper around the pixel buffer,
 * to facilitate representing as JSON or CSV
 */
class Spectrum {
    public int[][][] buffer;
    public int[] storedbuffer;
    public int[] absorptionbuffer;
    public int[] enhancedabsorptionbuffer;
    public int history;
    public int resolution = 1;
    public int[][][] hyperBuffer;
    public int hyperX = video.width/2;
    // for setup mode:
    public int lastred = 0;
    public int lastgreen = 0;
    public int lastblue = 0;
    public int currentSpectrumDisplayHeight = 10;
    public int averageAbsorption = 0;
    public int absorptionSum;
    public int lastval = 0;

    public Spectrum(int pHistory,int pSamplerow) {
      settings.sampleRow = pSamplerow;
      history = pHistory;
      buffer = new int[history][video.width][3];
      hyperBuffer = new int[width/settings.hyperRes][width][video.height]; // [bands][history][videoheight]
      storedbuffer = new int[video.width];
      absorptionbuffer = new int[video.width];
      enhancedabsorptionbuffer = new int[video.width];
      for (int x = 0;x < video.width;x++) { // is this necessary? initializing the spectrum buffer with zeroes? come on!
        absorptionbuffer[x] = 0;
        enhancedabsorptionbuffer[x] = 0;
      }
    }
    /**
     * Runs every draw cycle
     */
    public void draw(int ypos) {
      // bump spectrum history by 1 place
      for (int i = history-1;i > 0;i--) {
        for (int x = 0;x < video.width;x++) {
          buffer[i][x] = buffer[i-1][x];
        }
      }

      // re-zero intensity sum
      absorptionSum = 0;

      // iterate through each pixel
      int index = int (video.width*settings.sampleRow); //the horizontal strip to sample
      for (int x = 0; x < int (video.width); x+=resolution) {

        // Read from video into a new row in the spectrum.buffer
        int[] rgb = video.get_rgb(x);

        // draw direct output of averaged camera sampling, for "history" frames of history
        buffer[0][x] = rgb;
        ///////////////////////////////////
        // scale video.width to width!!
        if (x < width) {
          for (int y = 0; y < history; y++) {
            if (controller == "heatmap") {
		colorMode(HSB,255);
		pixels[((currentSpectrumDisplayHeight+ypos)*width)+(y*width)+x] = color(255-(buffer[y][x][0]+buffer[y][x][1]+buffer[y][x][2])/3,255,255);
		colorMode(RGB,255);
            } else {
		pixels[((currentSpectrumDisplayHeight+ypos)*width)+(y*width)+x] = color(buffer[y][x][0],buffer[y][x][1],buffer[y][x][2]);
 	    }
          }
          // display current spectrum for currentSpectrumDisplayHeight rows:
          for (int y = 0; y < currentSpectrumDisplayHeight-1; y++) {
            if (controller == "heatmap") {
		colorMode(HSB,255);
		pixels[(ypos*width)+(y*width)+x] = color(255-(buffer[0][x][0]+buffer[0][x][1]+buffer[0][x][2])/3,255,255);
		colorMode(RGB,255);
            } else {
		pixels[(ypos*width)+(y*width)+x] = color(buffer[0][x][0],buffer[0][x][1],buffer[0][x][2]);
 	    }
          
          }
          ////////////////
          // Render graph:
          ////////////////
          //= require <views/graph>
        }
        index++;
      }
      // indicate average absorption with a line (should mark a percent too):
      stroke(255);
      fill(255);
      averageAbsorption = absorptionSum/width;
      stroke(128);
      int avY = height-averageAbsorption/3;
      line(0,avY,width,avY);
      noStroke();
      text(averageAbsorption,10,avY);
    }
    /**
     * Preview video to align spectrum - shows thumbnail in bottom left corner
     */
    public void preview() {
      int xoff = width/2-video.width/8, yoff = height/2-video.height/8;
      fill(150);
      rect(xoff-10,yoff-40,video.width/4+20,video.height/4+60); 
      fill(20);
      textFont(font,18);
      text("Drag to adjust the sampling height",xoff,yoff-10);
      video.image(xoff,yoff,video.width/4,video.height/4);
      // draw the region of sampling with a rectangle:
      noFill();
      stroke(255,255,0);
      rect(xoff,yoff+settings.sampleRow/4,video.width/4,settings.sampleHeight/4);
      fill(255,255,0,0.3);
      noStroke();
      rect(xoff,yoff,video.width/4,settings.sampleRow/4);
      rect(xoff,yoff+settings.sampleRow/4+settings.sampleHeight/4,video.width/4,settings.sampleHeight/4+settings.sampleRow/4);
    }
    /**
     * Saves the current spectrum in a separate buffer for comparison.
     */
    public void storeReference() {
      for (int x = 0;x < buffer[0].length;x++) {
        storedbuffer[x] = (buffer[0][x][0]+buffer[0][x][1]+buffer[0][x][2])/3;
      } 
    }

    public float wavelengthFromPixel(int x) {
        float nmPerPixel = (settings.secondMarkerWavelength-settings.firstMarkerWavelength)/(settings.secondMarkerPixel-settings.firstMarkerPixel);
        float nmForZero = settings.firstMarkerWavelength-((float)settings.firstMarkerPixel*nmPerPixel);
        return nmForZero+((float)x*nmPerPixel);
    }

    // saves a giant png where each an image from each band is stacked vertically
    // another version might save separate images for each band
    public void saveHyperspectralCube() {
      //PGraphics pg = createGraphics(video.height*(video.width/res), video.width, P3D);
      PGraphics pg = createGraphics(width, video.height, P2D);
      for (int b = 0;b < spectrum.hyperBuffer.length;b++) {
        for (int x = 0;x < video.width;x++) {
          for (int y = headerHeight;y < video.height;y++) {
            pg.pixels[(y*width)+x] = spectrum.hyperBuffer[b][x][y];
          }
        } 
        pg.save("cube"+spectrum.wavelengthFromPixel(b*settings.hyperRes)+".png");
      }
    }

}

/**
 * Serialize spectral data.
 * For now a loose wrapper around the pixel buffer,
 * to facilitate representing as JSON or CSV
 */
class SpectrumPresentation {
    int[][][] mBuffer;

    public SpectrumPresentation(int[][][] pBuffer) {
        mBuffer = pBuffer;
    }

    int getRed(int[] pPixel) {
        return pPixel[0];
    }

    int getGreen(int[] pPixel) {
        return pPixel[1];
    }

    int getBlue(int[] pPixel) {
        return pPixel[2];
    }

    double wavelengthAverage(int[] pPixel) {
        // for now, just the average of r,g,b:
        return (getRed(pPixel) + getGreen(pPixel) + getBlue(pPixel))/3;
    }

    /**
     * Generate a name to save
     *
     * @param pUserText user specified suffix.  ignored if null
     * @param pExtension ignored if null
     */
    public String generateFileName(String pUserText, String pExtension) {
        StringBuilder builder = new StringBuilder();

        builder.append(year());
        builder.append("-"+month());
        builder.append("-"+day());
        builder.append("-"+hour());
        builder.append("-"+minute());

        if (pUserText != null && !pUserText.equals(defaultTypedText)) { 
            builder.append("-"+pUserText);
        }

        if (pExtension != null) {
            builder.append("."+pExtension);
        }

        return builder.toString();
    }

    public String toJson(String pName) {
        StringBuilder builder = new StringBuilder();
        builder.append("{name:'"+pName+"',lines:");

        // iterate by pixel:
        int length = mBuffer[0].length;
        for (int x = 0; x < length; x++) {
            int[] pixel = mBuffer[0][x];

            builder.append("{wavelength:"+spectrum.wavelengthFromPixel(x)+",average:"+wavelengthAverage(pixel));
            builder.append(",r:"+getRed(pixel));
            builder.append(",g:"+getGreen(pixel));
            builder.append(",b:"+getBlue(pixel)+"}");

            if (x < length-1) { builder.append(","); }
        }
        builder.append("}");

        return builder.toString();
    }

    public String toCsv() {
        StringBuilder builder = new StringBuilder();

        // iterate by pixel:
        int length = mBuffer[0].length;
        for (int x = 0; x < length; x++) {
            int[] pixel = mBuffer[0][x];

            builder.append(spectrum.wavelengthFromPixel(x)+","+wavelengthAverage(pixel));
            builder.append(","+getRed(pixel));
            builder.append(","+getGreen(pixel));
            builder.append(","+getBlue(pixel));
        }

        return builder.toString();
    }
}
