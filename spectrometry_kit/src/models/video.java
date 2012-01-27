class Video {
  public Capture capture; //mac or windows
  public GSCapture gscapture; //linux
  int width, height;
  int sampleWidth;
  int[] rgb;
  boolean isLinux;
  PApplet parent;
  public String[] cameras;
  public Video(PApplet PParent, int receivedWidth, int receivedHeight, int receivedDevice) {
    width = receivedWidth;
    height = receivedHeight;
    settings.videoDevice = receivedDevice;

    parent = PParent;
    //OS detection
    // SHOULD USE:  if (PApplet.platform == MACOSX) {
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
      Process p = r.exec("uvcdynctrl -d video"+settings.videoDevice+" -s \"Exposure, Auto\" 1 && uvcdynctrl -s \"White Balance Temperature, Auto\" 0 && uvcdynctrl -d video"+settings.videoDevice+" -s Contrast 128");
    } catch(IOException e1) { println(e1); }
    //catch(InterruptedException e2) {}

    if (isLinux) {
      //GSCapture.list() is not working on Linux, it seems? would be great to debug.
      //cameras = GSCapture.list();
      //println("Available cameras:");
      //for (int i = 0; i < cameras.length; i++) println(cameras[i]);
      // Alternate solution: type "ls /dev/video*" in the terminal to discover video settings.videoDevices
      //    String settings.videoDevices = system.bash("ls /dev/video*");
      //if (settings.videoDevices != "null") {
      //  settings.videoDevice = int (devices.substring(devices.length()-1));
      //  println("Auto-detected video settings.videoDevice.");
      //}
      println("Video device: /dev/video"+settings.videoDevice);
      //gscapture = new GSCapture(parent, width, height, cameras[cameras.length-1]); //linux
      gscapture = new GSCapture(parent, width, height, 10, "/dev/video"+settings.videoDevice); //linux
      // attempt to auto-configure resolution -- do you really need to restart the object?
      //int[][] resolutions = gscapture.resolutions();
      //width = resolutions[resolutions.length-1][0];
      //height = resolutions[resolutions.length-1][1];
      //gscapture.delete();
      //gscapture = new GSCapture(parent, width, height, "/dev/video0"); //linux
      gscapture.play();
      // THIS SECTION DOES NOT PROPERLY DETECT THAT THE VIDEO DEVICE RESOLUTION IS NOT SUPPORTED:
      if (!gscapture.isPlaying()) {// !gscapture.isCapturing()) { // former for GSCapture < 1.0, latter for >= 1.0 
        println("native resolution failed, trying 640x480");
        gscapture = new GSCapture(parent, 640, 480, 10, "/dev/video"+settings.videoDevice); //linux
        width = 640;
        height = 480;
      }
      println("Linux");
    } else {
      capture = new Capture(parent, width, height, 20); //mac or windows via QuickTime/Java
      capture.settings(); // mac or windows only, allows selection of video input
      println("Not Linux");
    }
  }
  public int[] pixels()
  {
    if (isLinux) return gscapture.pixels;
    else return capture.pixels;
  }
  // video.width:screen.width
  public float scale()
  {
    return (width*1.000)/screen.width;
  }
  // Linux only, for now:
  public void changeDevice(int Pdevice) {
    if (isLinux) {
      settings.videoDevice = Pdevice;
      settings.set("video.device",Pdevice);
      gscapture = new GSCapture(parent, width, height, 10, "/dev/video"+settings.videoDevice);
    }
  }
  public void image(int x,int y,int imgWidth,int imgHeight)
  {
    if (isLinux) {
      gscapture.read();
      //papplet.image(gscapture,x,y,imgWidth,imgHeight);
    } else parent.image(capture,x,y,imgWidth,imgHeight);
  }
  /**
   * Retrieve red, green, blue color intensities 
   * from video input for given pixel
   */
  public int[] get_rgb(int x) 
  {
    rgb = new int[3];
    rgb[0] = 0;
    rgb[1] = 0;
    rgb[2] = 0;

    for (int yoff = settings.sampleRow; yoff < settings.sampleRow+settings.sampleHeight; yoff+=1) {
      int sampleind = int ((video.width*yoff)+x);

      if (sampleind >= 0 && sampleind <= (video.height*video.width)) {
        int pixelColor;
        if (isLinux) {
          pixelColor = gscapture.pixels[sampleind];
        } else {
          pixelColor = capture.pixels[sampleind];
        }
        // Faster method of calculating r, g, b than red(), green(), blue() 
        rgb[0] = rgb[0]+((pixelColor >> 16) & 0xff);
        rgb[1] = rgb[1]+((pixelColor >> 8) & 0xff);
        rgb[2] = rgb[2]+(pixelColor & 0xff);
      }
    }    

    // sample <sampleHeight> rows of data in each of 3 colors:
    rgb[0] = int (rgb[0]/(settings.sampleHeight*1.00));
    rgb[1] = int (rgb[1]/(settings.sampleHeight*1.00));
    rgb[2] = int (rgb[2]/(settings.sampleHeight*1.00));

    return rgb;
  }
}
