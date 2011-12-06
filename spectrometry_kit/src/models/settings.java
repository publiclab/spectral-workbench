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
  // int samplerow, sampleHeight;
  int firstMarkerWavelength,firstMarkerPixel;
  int secondMarkerWavelength,secondMarkerPixel;
  PApplet parent;
   public Settings(PApplet pParent) {
    println("Reading settings.txt");
    parent = pParent;
    try { 
      props=new P5Properties();
      props.load(openStream("settings.txt"));
      spectrum.samplerow = props.getIntProperty("video.samplerow",80); 
      video.sampleHeight = props.getIntProperty("video.sampleheight",int (height*(0.18))); 
      video.device = props.getIntProperty("video.device",0); 
      firstMarkerWavelength = props.getIntProperty("calibration.firstMarkerWavelength",0); 
      firstMarkerPixel = props.getIntProperty("calibration.firstMarkerPixel",0); 
      secondMarkerWavelength = props.getIntProperty("calibration.secondMarkerWavelength",0); 
      secondMarkerPixel = props.getIntProperty("calibration.secondMarkerPixel",0); 
    } catch(IOException e) {
      println("couldn't read config file...");
    }
  }

  // http://download.oracle.com/javase/1.4.2/docs/api/java/util/Properties.html
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

