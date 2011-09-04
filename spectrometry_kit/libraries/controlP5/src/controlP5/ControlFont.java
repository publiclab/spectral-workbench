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

import processing.core.PFont;

/**
 * ControlFont is a container for a PFont that
 * can be used for customizing the font of a label.
 * Fonts other than the pixel fonts provided by
 * ControlP5 can for now only be used for TextLabels
 * and Controller Labels. Textarea and Textfield are
 * not supported.
 * 
 * @author andreas
 * 
 */
public class ControlFont {

	protected int fontSize;

	protected PFont font;

	protected boolean isControlFont;

	protected boolean isSmooth;

	// textorize, a Ruby-based font rasterizer command line utility for Mac OS X
	// http://textorize.org/

	/**
	 * create a controlFont and pass a reference to
	 * a PFont. fontsize needs to be defined as second parameter.
	 * 
	 * @param theFont
	 * @param theFontSize
	 */
	public ControlFont(PFont theFont, int theFontSize) {
		font = theFont;
		fontSize = theFontSize;
		isControlFont = true;
	}
	
	public ControlFont(PFont theFont) {
		font = theFont;
		fontSize = font.getFont().getSize();
		isControlFont = true;
	}

	protected boolean isActive() {
		return isControlFont;
	}

	protected boolean setActive(boolean theFlag) {
		isControlFont = theFlag;
		return isControlFont;
	}

	/**
	 * @deprecated
	 * @param theFlag
	 */
	public void setSmooth(boolean theFlag) {
		System.out
		  .println("deprecated: ControlFont.setSmooth(). PFont.smooth not supported with processing 1.1+ anymore. Set the smooth flag in the constructor when creating a PFont.");
	}

	/**
	 * @deprecated
	 * @return
	 */
	public boolean isSmooth() {
		System.out
		  .println("deprecated: ControlFont.isSmooth(). PFont.smooth not supported with processing 1.1+ anymore. Set the smooth flag in the constructor when creating a PFont.");
		return true;
	}

	public PFont getPFont() {
		return font;
	}

	public int size() {
		return fontSize;
	}

	public void setSize(int theSize) {
		fontSize = theSize;
	}

}
