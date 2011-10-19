class Video
{
  public Capture capture; //mac or windows
  public GSCapture gscapture; //linux
  int width, height;
  int sampleWidth, sampleHeight;
  int[] rgb;
  boolean isLinux;
  public String[] cameras;
  public Video(PApplet parent, int receivedWidth, int receivedHeight)
  {
    width = receivedWidth;
    height = receivedHeight;
    sampleHeight = 80;
    //OS detection
    try {  
      Runtime r = Runtime.getRuntime();
      Process p = r.exec("uname");
      p.waitFor();
      BufferedReader b = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String line = "";
      while ((line = b.readLine()) != null) {
        // "Linux", "Darwin", dunno what the Windows one is if anything
        if (line.equals("Linux")) {
          isLinux = true;
        }
      }
    } catch(IOException e1) {}
    catch(InterruptedException e2) {}

    // Disable auto-exposure and auto-color
    // not tested for 2nd camera, just default
    try {  
      Runtime r = Runtime.getRuntime();
      Process p = r.exec("uvcdynctrl -s \"Exposure, Auto\" 1 && uvcdynctrl -s \"White Balance Temperature, Auto\" 0");
    } catch(IOException e1) { println(e1); }
    //catch(InterruptedException e2) {}

    if (isLinux) {
      //GSCapture.list() is not working on Linux, it seems? would be great to debug.
      //cameras = GSCapture.list();
      //println("Available cameras:");
      //for (int i = 0; i < cameras.length; i++) println(cameras[i]);
      // type "ls /dev/video*" in the terminal to discover video devices
      //gscapture = new GSCapture(parent, width, height, cameras[cameras.length-1]); //linux
      gscapture = new GSCapture(parent, width, height, "/dev/video0"); //linux
      gscapture.play(); //linux only
      println("Linux");
    } else {
      capture = new Capture(parent, width, height, 20); //mac or windows via QuickTime/Java
      capture.settings(); // mac or windows only, allows selection of video input
      println("Not Linux");
    }
  }
  int[] pixels()
  {
    if (isLinux) return gscapture.pixels;
    else return capture.pixels;
  }
  public void image(int x,int y,int imgWidth,int imgHeight)
  {
    if (isLinux) {
      gscapture.read();
      //papplet.image(gscapture,x,y,imgWidth,imgHeight);
    } //else papplet.image(capture,x,y,imgWidth,imgHeight);
  }
  /*
   * Retrieve red, green, blue color intensities 
   * from video input for given pixel
   */
  public int[] get_rgb(int x) 
  {
    rgb = new int[3];
    rgb[0] = 0;
    rgb[1] = 0;
    rgb[2] = 0;

    for (int yoff = int (sampleHeight/-2); yoff < int (sampleHeight/2); yoff+=1) {
      int sampleind = int ((video.width*samplerow)+(video.width*yoff)+x);

      if (sampleind >= 0 && sampleind <= (video.height*video.width)) {
        int pixelColor = gscapture.pixels[sampleind];
        // Faster method of calculating r, g, b than red(), green(), blue() 
        rgb[0] = rgb[0]+((pixelColor >> 16) & 0xff);
        rgb[1] = rgb[1]+((pixelColor >> 8) & 0xff);
        rgb[2] = rgb[2]+(pixelColor & 0xff);
      }
    }    

    // sample <sampleHeight> rows of data in each of 3 colors:
    rgb[0] = int (rgb[0]/(sampleHeight*1.00));
    rgb[1] = int (rgb[1]/(sampleHeight*1.00));
    rgb[2] = int (rgb[2]/(sampleHeight*1.00));

    return rgb;
  }
}
