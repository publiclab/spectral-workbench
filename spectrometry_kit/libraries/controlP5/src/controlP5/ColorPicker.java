package controlP5;

import processing.core.PApplet;

/**
 * controlP5 is a processing gui library.
 * 
 * 2007-2010 by Andreas Schlegel
 * 
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version. This library is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 * 
 * @author Andreas Schlegel (http://www.sojamo.de)
 * @modified 10/05/2010
 * @version 0.5.4
 * 
 */


public class ColorPicker extends ControlGroup {

	protected Slider sliderRed;
	protected Slider sliderGreen;
	protected Slider sliderBlue;
	protected Slider sliderAlpha;
	protected ControlCanvas currentColor;

	protected ColorPicker(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			int theX,
			int theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		isBarVisible = false;
		isCollapse = false;
		_myArrayValue = new float[] { 255, 255, 255, 255 };

		currentColor = addCanvas(new ColorField());

		sliderRed = controlP5.addSlider(theName + "-red", 0, 255, 0, 0, theWidth, 10);
		sliderRed.setId(0);
		sliderRed.isBroadcast = false;
		sliderRed.addListener(this);
		sliderRed.setValue(255);
		sliderRed.moveTo(this);
		sliderRed.setMoveable(false);
		sliderRed.setColorBackground(0xff660000);
		sliderRed.setColorForeground(0xffaa0000);
		sliderRed.setColorActive(0xffff0000);
		sliderRed.captionLabel().setVisible(false);
		sliderRed.setDecimalPrecision(0);

		sliderGreen = controlP5.addSlider(theName + "-green", 0, 255, 0, 11, theWidth, 10);
		sliderGreen.setId(1);
		sliderGreen.isBroadcast = false;
		sliderGreen.addListener(this);
		sliderGreen.setValue(255);
		sliderGreen.moveTo(this);
		sliderGreen.setMoveable(false);
		sliderGreen.setColorBackground(0xff006600);
		sliderGreen.setColorForeground(0xff00aa00);
		sliderGreen.setColorActive(0xff00ff00);
		sliderGreen.captionLabel().setVisible(false);
		sliderGreen.setDecimalPrecision(0);

		sliderBlue = controlP5.addSlider(theName + "-blue", 0, 255, 0, 22, theWidth, 10);
		sliderBlue.setId(2);
		sliderBlue.isBroadcast = false;
		sliderBlue.addListener(this);
		sliderBlue.setValue(255);
		sliderBlue.moveTo(this);
		sliderBlue.setMoveable(false);
		sliderBlue.setColorBackground(0xff000066);
		sliderBlue.setColorForeground(0xff0000aa);
		sliderBlue.setColorActive(0xff0000ff);
		sliderBlue.captionLabel().setVisible(false);
		sliderBlue.setDecimalPrecision(0);

		sliderAlpha = controlP5.addSlider(theName + "-alpha", 0, 255, 0, 33, theWidth, 10);
		sliderAlpha.setId(3);
		sliderAlpha.isBroadcast = false;
		sliderAlpha.addListener(this);
		sliderAlpha.setValue(255);
		sliderAlpha.moveTo(this);
		sliderAlpha.setMoveable(false);
		sliderAlpha.setColorBackground(0xff666666);
		sliderAlpha.setColorForeground(0xffaaaaaa);
		sliderAlpha.setColorActive(0xffffffff);
		sliderAlpha.captionLabel().setVisible(false);
		sliderAlpha.setDecimalPrecision(0);
		sliderAlpha.valueLabel().setColor(0xff000000);
	}

	public void controlEvent(ControlEvent theEvent) {
		_myArrayValue[theEvent.id()] = theEvent.value();
	}

	public void setArrayValue(float[] theArray) {
		sliderRed.setValue(theArray[0]);
		sliderGreen.setValue(theArray[1]);
		sliderBlue.setValue(theArray[2]);
		sliderAlpha.setValue(theArray[3]);
		_myArrayValue = theArray;
	}

	public void setColorValue(int theColor) {
		setArrayValue(new float[] { theColor >> 16 & 0xff, theColor >> 8 & 0xff, theColor >> 0 & 0xff,
				theColor >> 24 & 0xff });
	}

	public int getColorValue() {
		int cc = 0xffffffff;
		return cc & (int) (_myArrayValue[3]) << 24 | (int) (_myArrayValue[0]) << 16 | (int) (_myArrayValue[1]) << 8
				| (int) (_myArrayValue[2]) << 0;
	}

	class ColorField extends ControlCanvas {
		public void draw(PApplet theApplet) {
			theApplet.fill(_myArrayValue[0], _myArrayValue[1], _myArrayValue[2], _myArrayValue[3]);
			theApplet.rect(0, 44, getWidth(), 15);
		}
	}
	
	@Override
	public String toString() {
		return "type:\tColorPicker\n"+super.toString();
	}
}

//this will become a color picker
//some inspiration
//http://www.nbdtech.com/blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
//http://alienryderflex.com/hsp.html