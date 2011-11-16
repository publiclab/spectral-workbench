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
    public int samplerow;
    public int history;
    public int resolution = 1;
    // for setup mode:
    public int lastred = 0;
    public int lastgreen = 0;
    public int lastblue = 0;
    public int currentSpectrumDisplayHeight = 10;
    public int averageAbsorption = 0;
    public int absorptionSum;
    public int lastval = 0;

    public Spectrum(int pHistory,int pSamplerow) {
      samplerow = pSamplerow;
      history = pHistory;
      buffer = new int[history][video.width][3];
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
      int index = int (video.width*samplerow); //the horizontal strip to sample
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
      //video.image(0,height*3/4,width/4,height/4)
      for (int y = 0; y < int (video.height); y+=4) {
        for (int x = 0; x < int (video.width); x+=4) {
          if (x < width && y < height) {
            if (video.isLinux) {
              pixels[(height*3/4*width)+(y*width/4)+((x/4))] = video.gscapture.pixels[y*video.width+x];
            //pixels[(height*3/4*width)+(y*width/4)+((x/4))] = video.gscapture.pixels[int (y/video.scale()*video.width+x/video.scale())];
            } else {
              pixels[(height*3/4*width)+(y*width/4)+((x/4))] = video.capture.pixels[y*video.width+x];
            }
          }
        }
      }
      // draw the region of sampling with a rectangle:
      noFill();
      stroke(255,255,0);
      rect(0,height*3/4+samplerow/4-video.sampleHeight/4,video.width/4,video.sampleHeight/4);
    }
    /**
     * Saves the current spectrum in a separate buffer for comparison.
     */
    public void storeReference() {
      for (int x = 0;x < buffer[0].length;x++) {
        storedbuffer[x] = (buffer[0][x][0]+buffer[0][x][1]+buffer[0][x][2])/3;
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

            builder.append("{wavelength:null,average:"+wavelengthAverage(pixel));
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

            builder.append("unknown_wavelength,"+wavelengthAverage(pixel));
            builder.append(","+getRed(pixel));
            builder.append(","+getGreen(pixel));
            builder.append(","+getBlue(pixel));
        }

        return builder.toString();
    }
}
