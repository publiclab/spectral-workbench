package controlP5;

/**
 * controlP5 is a processing gui library.
 *
 *  2007-2010 by Andreas Schlegel
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * as published by the Free Software Foundation; either version 2.1
 * of the License, or (at your option) any later version.
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General
 * Public License along with this library; if not, write to the
 * Free Software Foundation, Inc., 59 Temple Place, Suite 330,
 * Boston, MA 02111-1307 USA
 *
 * @author 		Andreas Schlegel (http://www.sojamo.de)
 * @modified	10/05/2010
 * @version		0.5.4
 *
 */

/**
 * 
 */
public class CColor {

	/*
	 * TODO referring to this thread
	 * http://processing.org/discourse/yabb2/YaBB.pl?num=1246553397/2#2 the color
	 * handling is not very user friendly and should be revised. naming: take out
	 * color from the fields make fields public or add getter for each color how
	 * to change/edit only the alpha channel of a color?
	 */
	protected int colorBackground = 0xff003652;

	protected int colorForeground = 0xff00698c;

	protected int colorActive = 0xff08a2cf; // 0699C4;

	protected int colorCaptionLabel = 0xffffffff;

	protected int colorValueLabel = 0xffffffff;

	protected int colorBackgroundAlpha = 0xff;

	protected int colorForegroundAlpha = 0xff;

	protected int colorActiveAlpha = 0xff; // 0699C4;

	protected int colorCaptionLabelAlpha = 0xff;

	protected int colorValueLabelAlpha = 0xff;

	protected int alpha = 0xff;

	protected int maskA = 0x00ffffff;
	protected int maskR = 0xff00ffff;
	protected int maskG = 0xffff00ff;
	protected int maskB = 0xffffff00;

	protected void set(CColor theColor) {
		colorBackground = theColor.colorBackground;
		colorForeground = theColor.colorForeground;
		colorActive = theColor.colorActive;
		colorCaptionLabel = theColor.colorCaptionLabel;
		colorValueLabel = theColor.colorValueLabel;
		colorBackgroundAlpha = theColor.colorBackgroundAlpha;
		colorForegroundAlpha = theColor.colorForegroundAlpha;
		colorActiveAlpha = theColor.colorActiveAlpha;
		colorCaptionLabelAlpha = theColor.colorCaptionLabelAlpha;
		colorValueLabelAlpha = theColor.colorValueLabelAlpha;
	}

	protected void copyTo(ControllerInterface theControl) {
		theControl.setColorBackground(colorBackground);
		theControl.setColorForeground(colorForeground);
		theControl.setColorActive(colorActive);
		theControl.setColorLabel(colorCaptionLabel);
	}

	public String toString() {
		return ("bg (" + (colorBackground >> 16 & 0xff) + "," + (colorBackground >> 8 & 0xff) + ","
				+ (colorBackground >> 0 & 0xff) + "), " + "fg (" + (colorForeground >> 16 & 0xff) + ","
				+ (colorForeground >> 8 & 0xff) + "," + (colorForeground >> 0 & 0xff) + "), " + "active ("
				+ (colorActive >> 16 & 0xff) + "," + (colorActive >> 8 & 0xff) + "," + (colorActive >> 0 & 0xff) + "), "
				+ "captionlabel (" + (colorCaptionLabel >> 16 & 0xff) + "," + (colorCaptionLabel >> 8 & 0xff) + ","
				+ (colorCaptionLabel >> 0 & 0xff) + "), " + "valuelabel " + (colorValueLabel >> 16 & 0xff) + ","
				+ (colorValueLabel >> 8 & 0xff) + "," + (colorValueLabel >> 0 & 0xff)+")");
	}

	public CColor() {
	}

	public CColor(CColor theColor) {
		set(theColor);
	}

	public boolean equals(CColor theColor) {
		if (colorBackground == theColor.colorBackground && colorForeground == theColor.colorForeground
				&& colorActive == theColor.colorActive && colorCaptionLabel == theColor.colorCaptionLabel
				&& colorValueLabel == theColor.colorValueLabel) {
			return true;
		}
		return false;
	}

	public void setAlpha(int theAlpha) {
		alpha = theAlpha;
		colorBackground = (colorBackground & maskA) | (int) (colorBackgroundAlpha * (alpha / 255.0f)) << 24;
		colorForeground = (colorForeground & maskA) | (int) (colorForegroundAlpha * (alpha / 255.0f)) << 24;
		colorActive = (colorActive & maskA) | (int) (colorActiveAlpha * (alpha / 255.0f)) << 24;
		colorCaptionLabel = (colorCaptionLabel & maskA) | (int) (colorCaptionLabelAlpha * (alpha / 255.0f)) << 24;
		colorValueLabel = (colorValueLabel & maskA) | (int) (colorValueLabel * (alpha / 255.0f)) << 24;
	}

	public void setForeground(int theColor) {
		colorForegroundAlpha = theColor >> 24 & 0xff;
		colorForeground = (theColor & maskA) | (colorForegroundAlpha & alpha) << 24;
	}

	public void setBackground(int theColor) {
		colorBackgroundAlpha = theColor >> 24 & 0xff;
		colorBackground = (theColor & maskA) | (colorBackgroundAlpha & alpha) << 24;
		;
	}

	public void setActive(int theColor) {
		colorActiveAlpha = theColor >> 24 & 0xff;
		colorActive = (theColor & maskA) | (colorActiveAlpha & alpha) << 24;
	}

	public void setCaptionLabel(int theColor) {
		colorCaptionLabelAlpha = theColor >> 24 & 0xff;
		colorCaptionLabel = (theColor & maskA) | (colorCaptionLabelAlpha & alpha) << 24;
	}

	public void setValueLabel(int theColor) {
		colorValueLabelAlpha = theColor >> 24 & 0xff;
		colorValueLabel = (theColor & maskA) | (colorValueLabelAlpha & alpha) << 24;
	}

	public int getAlpha() {
		return alpha;
	}

	public int getForeground() {
		return colorForeground;
	}

	public int getBackground() {
		return colorBackground;
	}

	public int getActive() {
		return colorActive;
	}

	public int getCaptionLabel() {
		return colorCaptionLabel;
	}

	public int getValueLabel() {
		return colorValueLabel;
	}

}
