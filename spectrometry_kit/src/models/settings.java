/**
 * Local storage of settings/configurations
 */
/**
configfiles taken from http://wiki.processing.org/index.php/External_configuration_files
@author toxi
*/
class Settings {
  P5Properties props;
  // start to centralize settings here...
  int uniqId;
  float firstMarkerWavelength;
  int firstMarkerPixel;
  float secondMarkerWavelength;
  int secondMarkerPixel;
  int sampleRow;
  int sampleHeight;
  int hyperRes;
  int videoDevice,videoWidth,videoHeight;
  PApplet parent;
  public Settings(PApplet pParent) {
    println("Reading settings.txt");
    parent = pParent;
    try { 
      props=new P5Properties();
      props.load(openStream("settings.txt"));

      uniqId = props.getIntProperty("user.uniqId",0);
      if (uniqId == 0) set("user.uniqId",(int)(Math.random() * ((999999999) + 1)));
      set("client.version",0.4);

      videoWidth = props.getIntProperty("video.height",1280); 
      videoHeight = props.getIntProperty("video.width",720); 
      sampleRow = props.getIntProperty("video.samplerow",80); 
      sampleHeight = props.getIntProperty("video.sampleheight",int (height*(0.18))); 
      hyperRes = props.getIntProperty("hyperspectral.resolution",10); 
      videoDevice = props.getIntProperty("video.device",0); 
      firstMarkerWavelength = props.getFloatProperty("calibration.firstMarkerWavelength",0); 
      firstMarkerPixel = props.getIntProperty("calibration.firstMarkerPixel",0); 
      secondMarkerWavelength = props.getFloatProperty("calibration.secondMarkerWavelength",0); 
      secondMarkerPixel = props.getIntProperty("calibration.secondMarkerPixel",0); 
    } catch(IOException e) {
      println("couldn't read config file...");
    }
  }

  // http://download.oracle.com/javase/1.4.2/docs/api/java/util/Properties.html
  // I.E. settings.set("video.samplerow",settings.sampleRow);
  void set(String key,int val) {
    println("Writing settings.txt");
    String stringVal = ""+val; // how else to turn int into String? I'm on a plane and can't look it up.
    props.setProperty(key,stringVal);
    // Write properties file.
    try {
      props.store(new FileOutputStream(parent.dataPath("settings.txt")), null);
      println("done");
    } catch (IOException e) {
      println(e);
    }
  }
  // http://download.oracle.com/javase/1.4.2/docs/api/java/util/Properties.html
  void set(String key,float val) {
    println("Writing settings.txt");
    String stringVal = ""+val; // how else to turn int into String? I'm on a plane and can't look it up.
    props.setProperty(key,stringVal);
    // Write properties file.
    try {
      props.store(new FileOutputStream(parent.dataPath("settings.txt")), null);
      println("done");
    } catch (IOException e) {
      println(e);
    }
  }
  // http://download.oracle.com/javase/1.4.2/docs/api/java/util/Properties.html
  void set(String key,long val) {
    println("Writing settings.txt");
    String stringVal = ""+val; // how else to turn int into String? I'm on a plane and can't look it up.
    props.setProperty(key,stringVal);
    // Write properties file.
    try {
      props.store(new FileOutputStream(parent.dataPath("settings.txt")), null);
      println("done");
    } catch (IOException e) {
      println(e);
    }
  }

}
/**
 * simple convenience wrapper object for the standard
 * Properties class to return pre-typed numerals
 */
class P5Properties extends Properties {
 
  boolean getBooleanProperty(String id, boolean defState) {
    return boolean(getProperty(id,""+defState));
  }
 
  int getIntProperty(String id, int defVal) {
    return int(getProperty(id,""+defVal)); 
  }
 
  float getFloatProperty(String id, float defVal) {
    return float(getProperty(id,""+defVal)); 
  }  
}

