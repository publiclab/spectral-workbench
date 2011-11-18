/**
saveasjpg taken from http://wiki.processing.org/index.php/Save_as_JPEG
@author Yonas Sandbæk

JPG encoding colors are wrong...

http://stackoverflow.com/questions/2753741/java-1-5-0-16-corrupted-colours-when-saving-jpg-image
http://www.javakb.com/Uwe/Forum.aspx/java-programmer/20720/Scaling-and-then-saving-as-JPEG-wrong-colors
*/
 
import com.sun.image.codec.jpeg.*;
 
byte[] bufferImage(PImage srcimg) {
  ByteArrayOutputStream out = new ByteArrayOutputStream();
  //BufferedImage img = new BufferedImage(srcimg.width, srcimg.height, 2);
  BufferedImage img = new BufferedImage(srcimg.width, srcimg.height, BufferedImage.TYPE_INT_RGB);
  img = (BufferedImage) createImage(srcimg.width,srcimg.height);
  //Graphics2D g2d = img.createGraphics();
  //g2d.drawImage(srcimg, 0, 0, null);
  //g2d.dispose();

  //int[] rgb = new int[3];
  for (int y = 0; y < srcimg.height; y++) {
    for (int x = 0; x < srcimg.width; x++) {
      int rgb = srcimg.pixels[y * srcimg.width + x];
      int[] rgbarray = new int[3];
      rgbarray[0] = int (red(rgb));
      rgbarray[1] = int (green(rgb));
      rgbarray[2] = int (blue(rgb));
      img.setRGB(x,y,1,1, rgbarray, 0, srcimg.width);
      //img.setRGB(x, y, srcimg.pixels[y * srcimg.width + x]);
    }
  }
      //int pixelColor = srcimg.pixels[y*srcimg.width+x];
      //rgb[0] = rgb[0]+((pixelColor >> 16) & 0xff);
      //rgb[1] = rgb[1]+((pixelColor >> 8) & 0xff);
      //rgb[2] = rgb[2]+(pixelColor & 0xff);
      //img.setRGB(x,y,rgb[0],rgb[1],rgb[2]);
      //img.setRGB(x,y,(0xff000000 | (rgb[0] << 16) | (rgb[1] << 8) | rgb[2]));
      //img.setRGB(i, j, srcimg.getRGB(i,j));
      //img.setRGB(i, j, srcimg.pixels[j * srcimg.width + i]);
  try {
    JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(out);
    JPEGEncodeParam encpar = encoder.getDefaultJPEGEncodeParam(img);
    encpar.setQuality(1, false);
    encoder.setJPEGEncodeParam(encpar);
    encoder.encode(img);
  }
  catch (FileNotFoundException e) {
    println(e);
  }
  catch (IOException ioe) {
    println(ioe);
  }
  return out.toByteArray();
}
