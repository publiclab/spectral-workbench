/**

*/
 
import javax.imageio.*;
import java.awt.image.BufferedImage;

byte[] bufferImage(PImage srcimg) {
  ByteArrayOutputStream out = new ByteArrayOutputStream();
  //BufferedImage img = new BufferedImage(srcimg.width, srcimg.height, 2);
  BufferedImage img = new BufferedImage(srcimg.width, srcimg.height, BufferedImage.TYPE_INT_ARGB);
  img = (BufferedImage) createImage(srcimg.width,srcimg.height);
  img.setRGB(0, 0, srcimg.width, srcimg.height, srcimg.pixels, 0, srcimg.width);
 
  //Graphics2D g2d = img.createGraphics();
  //g2d.drawImage(srcimg, 0, 0, null);
  //g2d.dispose();

  //int[] rgb = new int[3];
//  for (int y = 0; y < srcimg.height; y++) {
//    for (int x = 0; x < srcimg.width; x++) {
//      int rgb = srcimg.pixels[y * srcimg.width + x];
//      int[] rgbarray = new int[4];
//      rgbarray[0] = int (1);
//      rgbarray[0] = int (red(rgb));
//      rgbarray[1] = int (green(rgb));
//      rgbarray[2] = int (blue(rgb));
//      img.setRGB(x,y,1,1, rgbarray, 0, srcimg.width);
      //img.setRGB(x, y, srcimg.pixels[y * srcimg.width + x]);
//    }
//  }
  try {

    // http://helpdesk.objects.com.au/java/how-do-i-convert-a-java-image-to-a-png-byte-array
      // http://docs.oracle.com/cd/E17802_01/products/products/java-media/jai/forDevelopers/jai-apidocs/com/sun/media/jai/codec/PNGEncodeParam.html
      // also read this: http://www.sussmanprejza.com/ar/card/DataUpload.java
    // PNG encoding goes here:
   
     ImageIO.write(img, "PNG", out);

  } catch (FileNotFoundException e) {
    println(e);
  } catch (IOException ioe) {
    println(ioe);
  }
  return out.toByteArray();
}
