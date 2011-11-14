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

import processing.core.PApplet;
import processing.core.PImage;

/**
 * Label description tbd.
 * 
 * @example ControlP5Textlabel
 * 
 */
public class Label implements CDrawable {

	protected PImage _myImage;

	protected PImage _myImageMask;

	protected String _myText;

	protected int _myWidth;

	protected int _myHeight;

	protected int _myColor;

	public boolean isToUpperCase = true;

	protected boolean isFixedSize = false;

	public static BitFontRenderer bitFontRenderer;

	protected int _myFontIndex = ControlP5.standard58;

	protected int _myCursorPosition = -1;

	protected boolean isMultiline = false;

	protected int _myLineHeight = 10;

	protected int _myOffsetY = 0;

	protected int textHeight;

	protected boolean isVisible = true;

	public CVector3f position = new CVector3f();

	protected int _myLetterSpacing = 0;

	protected int _myColorBackground = 0x000000;

	protected boolean isColorBackground = false;

	public static int LABEL_WIDTH_OFFSET = 4;

	public ControllerStyle _myControllerStyle = new ControllerStyle();

	protected int _myOffsetX = 0;

	protected boolean isControlFont = false;

	protected ControlFont _myControlFont;

	protected int _myControlFontSize;

	protected Label(final String theText) {
		this(theText, 0, 10, 0xffffffff);
	}

	protected Label(final String theText, final int theColor) {
		this(theText, 0, 10, theColor);
	}

	protected Label(final String theText, final int theWidth, final int theHeight) {
		this(theText, theWidth, theHeight, 0xffffffff);
	}

	protected Label(final String theText, final int theWidth, final int theHeight, final int theColor) {
		bitFontRenderer = new BitFontRenderer();
		init(theText, (theWidth != 0) ? theWidth : bitFontRenderer.getWidth(theText, this), theHeight, theColor);
	}

	/**
	 * 
	 * @param theApplet
	 * @param theText
	 * @param theWidth
	 * @param theHeight
	 * @param theColor
	 */
	public Label(PApplet theApplet, String theText, int theWidth, int theHeight, int theColor) {
		bitFontRenderer = new BitFontRenderer(theApplet);
		init(theText, theWidth, theHeight, theColor);
	}

	public Label(PApplet theApplet, String theText, int theWidth, int theHeight) {
		this(theApplet, theText, theWidth, theHeight, 0xffffff);
	}

	private void init(String theText, final int theWidth, final int theHeight, final int theColor) {
		_myText = (theText == null) ? "" : theText;
		_myWidth = theWidth + LABEL_WIDTH_OFFSET;
		_myHeight = theHeight;
		_myColor = theColor;
		isControlFont = ControlP5.isControlFont;
		if (isControlFont && ControlP5.getControlFont() != null) {
			setControlFont(ControlP5.getControlFont());
		}

		_myImage = new PImage(_myWidth, _myHeight);
		_myImageMask = new PImage(_myWidth, _myHeight);
		setFixedSize(true);
		set(_myText);
	}

	private void checkRenderer() {

	}

	/**
	 * set the text of the label to upperCase.
	 * 
	 * @param theFlag
	 *          boolean
	 */
	public void toUpperCase(boolean theFlag) {
		isToUpperCase = theFlag;
		update();
	}

	/**
	 * draw a textlabel at a given location xy.
	 * 
	 * @param theApplet
	 *          PApplet
	 * @param theX
	 *          int
	 * @param theY
	 *          int
	 */
	public void draw(final PApplet theApplet, final int theX, final int theY) {
		if (isVisible) {
			theApplet.pushMatrix();
			theApplet.translate(_myControllerStyle.marginLeft, _myControllerStyle.marginTop);
			if (isColorBackground) {
				theApplet.fill(_myColorBackground);
				float ww = _myControllerStyle.paddingRight + _myControllerStyle.paddingLeft;
				if (_myControllerStyle.backgroundWidth > -1) {
					ww += _myControllerStyle.backgroundWidth;
				} else {
					ww += _myImage.width;
				}

				float hh = _myControllerStyle.paddingBottom + _myControllerStyle.paddingTop;
				if (_myControllerStyle.backgroundHeight > -1) {
					hh += _myControllerStyle.backgroundHeight;
				} else {
					hh += _myImage.height;
				}

				theApplet.rect(theX, theY, ww, hh);
			}
			if (isControlFont) {
				renderControlFont(theApplet, theX + _myControllerStyle.paddingLeft, theY + _myControllerStyle.paddingTop);
			} else {
				if ((_myImage.width > 0 && _myImage.height > 0) || !isControlFont) {
					theApplet.image(_myImage, theX + _myControllerStyle.paddingLeft, theY + _myControllerStyle.paddingTop);
				}
			}
			theApplet.popMatrix();
		}
	}

	/**
	 * draw a textlabel.
	 */
	public void draw(PApplet theApplet) {
		if (isVisible) {
			theApplet.pushMatrix();
			theApplet.translate(_myControllerStyle.marginLeft, _myControllerStyle.marginTop);
			if (isColorBackground) {
				theApplet.fill(_myColorBackground);
				float ww = _myControllerStyle.paddingRight + _myControllerStyle.paddingLeft;
				if (_myControllerStyle.backgroundWidth > -1) {
					ww += _myControllerStyle.backgroundWidth;
				} else {
					ww += _myImage.width;
				}

				float hh = _myControllerStyle.paddingBottom + _myControllerStyle.paddingTop;
				if (_myControllerStyle.backgroundHeight > -1) {
					hh += _myControllerStyle.backgroundHeight;
				} else {
					hh += _myImage.height;
				}

				theApplet.rect(position.x, position.y, ww, hh);
			}
			if (isControlFont) {
				renderControlFont(theApplet, position.x + _myControllerStyle.paddingLeft, position.y
						+ _myControllerStyle.paddingTop);
			} else {
				theApplet.image(_myImage, position.x + _myControllerStyle.paddingLeft, position.y
						+ _myControllerStyle.paddingTop);
			}
			theApplet.popMatrix();
		}
	}

	/**
	 * 
	 * @param theApplet
	 * @param theX
	 * @param theY
	 * @param theColor
	 */
	protected void draw(final PApplet theApplet, final int theX, final int theY, final int theColor) {
		theApplet.pushMatrix();
		theApplet.translate(_myControllerStyle.marginLeft, _myControllerStyle.marginTop);
		_myColor = theColor;
		if (isControlFont) {
			if (isColorBackground) {
				theApplet.fill(_myColorBackground);
				float ww = _myControllerStyle.paddingRight + _myControllerStyle.paddingLeft;
				if (_myControllerStyle.backgroundWidth > -1) {
					ww += _myControllerStyle.backgroundWidth;
				} else {
					ww += _myImage.width;
				}

				float hh = _myControllerStyle.paddingBottom + _myControllerStyle.paddingTop;
				if (_myControllerStyle.backgroundHeight > -1) {
					hh += _myControllerStyle.backgroundHeight;
				} else {
					hh += _myImage.height;
				}

				theApplet.rect(theX, theY, ww, hh);
			}
			renderControlFont(theApplet, theX + _myControllerStyle.paddingLeft, theY + _myControllerStyle.paddingTop);
		} else {
			if (_myImage.width > 0 && _myImage.height > 0) {
				if (isColorBackground) {
					theApplet.fill(_myColorBackground);
					float ww = _myControllerStyle.paddingRight + _myControllerStyle.paddingLeft;
					if (_myControllerStyle.backgroundWidth > -1) {
						ww += _myControllerStyle.backgroundWidth;
					} else {
						ww += _myImage.width;
					}

					float hh = _myControllerStyle.paddingBottom + _myControllerStyle.paddingTop;
					if (_myControllerStyle.backgroundHeight > -1) {
						hh += _myControllerStyle.backgroundHeight;
					} else {
						hh += _myImage.height;
					}

					theApplet.rect(theX, theY, ww, hh);
				}
				theApplet.image(_myImage, theX + _myControllerStyle.paddingLeft, theY + _myControllerStyle.paddingTop);

			}
		}
		theApplet.popMatrix();
	}

	protected void renderControlFont(PApplet theApplet, float theX, float theY) {
		theApplet.fill(_myColor);
		theApplet.textFont(_myControlFont.getPFont(), _myControlFontSize);
		theApplet.textLeading(_myLineHeight);
		// TODO why 0.7f use proper font positioning
		theApplet.translate(0, _myControlFont.getPFont().getFont().getSize2D() * 0.7f);
		theApplet.text(isToUpperCase ? _myText.toUpperCase() : _myText, theX, theY);
	}

	/**
	 * set the text of the label. when setting the text, the fixedSize flag will
	 * be temporarily overwritten and set to false. after the text has been set,
	 * the fixedSize flag is set back to its previous value. use set(String, true)
	 * to set text for a fixed size area.
	 * 
	 * @param theText
	 */
	public void set(final String theText) {
		boolean myFixedSize = isFixedSize;
		setFixedSize(false);
		set(theText, _myColor, _myCursorPosition);
		setFixedSize(myFixedSize);
	}

	public void set(final String theText, final int theColor) {
		boolean myFixedSize = isFixedSize;
		setFixedSize(false);
		_myColor = theColor;
		set(theText, _myColor, _myCursorPosition);
		setFixedSize(myFixedSize);
	}

	public void set(final String theText, final boolean isFixedSize) {
		setFixedSize(isFixedSize);
		set(theText, _myColor, _myCursorPosition);
	}

	public void set(final String theText, final int theColor, final boolean isFixedSize) {
		_myColor = theColor;
		setFixedSize(isFixedSize);
		set(theText, _myColor, _myCursorPosition);
	}

	public void setWithCursorPosition(final String theText, final int theCursorPosition) {
		_myOffsetX = 0;
		set(theText, _myColor, theCursorPosition, _myOffsetX);
	}

	public void setWithCursorPosition(final String theText, final int theCursorPosition, final int theOffsetX) {
		_myOffsetX = theOffsetX;
		set(theText, _myColor, theCursorPosition, _myOffsetX);
	}

	/**
	 * a textlabel is an image containing text rendered from a bitfont source
	 * image. available bit fonts are: standard56, standard58, synt24, grixel. the
	 * font of a textlabel can be changed by using setFont(int theFontIndex)
	 * theFontIndex is of type int and available indexes are stored in the
	 * constants ControlP5.standard56, ControlP5.standard58, ControlP5.synt24,
	 * ControlP5.grixel available characters for each pixelfont range from ascii
	 * code 32-126
	 * 
	 * @shortdesc set the Pixel-Font-Family of the Textlabel.
	 * @param theFont
	 *          int
	 */
	public Label setFont(int theFont) {
		isControlFont = false;
		// !!! myFixedSize solution is a temporary fix
		// find a way to generally get rid of isFixedSize
		// or find a better management for isFixedSize
		// in order to better adapt setText and setFont to a Label.
		// boolean myFixedSize = isFixedSize;
		_myFontIndex = theFont;
		// isFixedSize = false;
		update();
		// isFixedSize = myFixedSize;
		return this;
	}

	/**
	 * returns the index of the current bitFont.
	 * 
	 * @return
	 */
	public int getFont() {
		return _myFontIndex;
	}
	

	public ControlFont setControlFont(ControlFont theControlFont) {
		_myControlFont = theControlFont;
		setControlFontSize(_myControlFont.size());
		isControlFont = true;
		return _myControlFont;
	}

	protected void updateFont(ControlFont theControlFont) {
		setControlFont(theControlFont);
	}

	public ControlFont getControlFont() {
		return _myControlFont;
	}

	public void setControlFontSize(int theSize) {
		_myControlFontSize = theSize;
		update();
	}

	/**
	 * work around, fix the issue with cutting off a label when setting a new font
	 * for a label.
	 */
	public Label adjust() {
		if (isControlFont) {
			_myHeight = BitFontRenderer.font[_myFontIndex].height;
			_myWidth = bitFontRenderer.getWidth(this);
			_myWidth += _myText.length() * _myLetterSpacing;
		}
		update();
		return this;
	}

	/**
	 * 
	 * @return
	 */
	protected int getFontIndex() {
		return _myFontIndex;
	}

	protected void setLineHeight(int theValue) {
		_myLineHeight = theValue;
		update();
	}

	protected void setLetterSpacing(int theValue) {
		_myLetterSpacing = theValue;
		update();
	}

	public void multiline(boolean theFlag) {
		isMultiline = theFlag;
	}

	protected void update() {
		if (isControlFont) {
			ControlP5.papplet.textFont(_myControlFont.getPFont(), _myControlFontSize);
			_myWidth = (int) ControlP5.papplet.textWidth(isToUpperCase ? _myText.toUpperCase() : _myText);
		} else {
			if (!isFixedSize) {
				_myHeight = BitFontRenderer.font[_myFontIndex].height;
				_myWidth = bitFontRenderer.getWidth(this);
				_myWidth += _myText.length() * _myLetterSpacing;

			}
			_myImage = new PImage(_myWidth, _myHeight);
			_myImageMask = new PImage(_myWidth, _myHeight);

			set(_myText, _myColor, _myCursorPosition);
		}
	}

	public void setOffset(float theValue) {
		_myOffsetY = (int) theValue;
	}

	public int offset() {
		return _myOffsetY;
	}

	protected void set(String theText, final int theColor, final int theCursorPosition) {
		_myOffsetX = 0;
		set(theText, theColor, theCursorPosition, _myOffsetX);
	}

	protected void set(String theText, final int theColor, final int theCursorPosition, final int theOffsetX) {
		_myOffsetX = theOffsetX;
		_myCursorPosition = theCursorPosition;
		if (theText == null) {
			theText = "";
		}
		_myText = theText;
		// this conflicts with setting the captionLabel with
		// controller.captionLabel().set("blabla");
		if (!isControlFont) {
			if (!isFixedSize) {
				// !!! take out +8, there is still some issues with calculating
				// the
				// width of a label, assuming its an issue with upper and lower
				// case
				// of theText.
				int myWidth = bitFontRenderer.getWidth(this); // + 8
				if (myWidth > _myWidth) {
					_myWidth = myWidth;
					_myImage = new PImage(myWidth, _myHeight);
					_myImageMask = new PImage(_myWidth, _myHeight);
				}
			}

			_myColor = theColor;
			textHeight = bitFontRenderer.write(this);
			_myImage.updatePixels();
		}
	}

	protected PImage getImage() {
		return _myImage;
	}

	protected PImage getImageMask() {
		return _myImageMask;
	}

	protected int getOffsetX() {
		return _myOffsetX;
	}

	protected int getOffsetY() {
		return _myOffsetY;
	}

	protected int getCursorPosition() {
		return _myCursorPosition;
	}

	protected int getLetterSpacing() {
		return _myLetterSpacing;
	}

	/**
	 * @deprecated
	 * @return
	 */
	public int lineHeight() {
		return _myLineHeight;
	}

	public int getLineHeight() {
		return _myLineHeight;
	}

	protected boolean isMultiline() {
		return isMultiline;
	}

	public int textHeight() {
		return textHeight;
	}

	/**
	 * @deprecated
	 * @param theFixedSize
	 */
	public void fixedSize(boolean theFixedSize) {
		isFixedSize = theFixedSize;
	}

	public void setFixedSize(boolean theFixedSize) {
		isFixedSize = theFixedSize;
	}

	/**
	 * @deprecated
	 * @return
	 */
	public int color() {
		return _myColor;
	}

	public int getColor() {
		return _myColor;
	}

	public void setColor(int theColor) {
		_myColor = theColor;
		set(_myText, theColor);
	}

	public void setColor(int theColor, boolean theFixedSizeFlag) {
		_myColor = theColor;
		set(_myText, theColor, theFixedSizeFlag);
	}

	public void setColorBackground(int theColor) {
		_myColorBackground = theColor;
		isColorBackground = true;
	}

	public void disableColorBackground() {
		isColorBackground = false;
	}

	public void enableColorBackground() {
		isColorBackground = true;
	}

	public int width() {
		return _myWidth;
	}

	public int height() {
		return _myHeight;
	}

	public void setWidth(int theValue) {
		_myWidth = theValue;
	}

	public void setHeight(int theValue) {
		_myHeight = theValue;
	}

	public void setVisible(boolean theValue) {
		isVisible = theValue;
	}

	public String toString() {
		return _myText;
	}

	public String getText() {
		return _myText;
	}

	public ControllerStyle style() {
		return _myControllerStyle;
	}

}
