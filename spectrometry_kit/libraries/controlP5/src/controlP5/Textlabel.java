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
import processing.core.PMatrix;

/**
 * a textlabel is an image containing text rendered from a bitfont source image.
 * available bit fonts are: standard56, standard58, synt24, grixel. the font of
 * a textlabel can be changed by using setFont(int theFontIndex) theFontIndex is
 * of type int and available indexes are stored in the constants
 * ControlP5.standard56, ControlP5.standard58, ControlP5.synt24,
 * ControlP5.grixel available characters for each pixelfont range from ascii
 * code 32-126 <a href="asciitable"
 * atrget="_blank">http://www.asciitable.com/</a>
 * 
 * @example ControlP5textlabel
 * @nosuperclasses Controller
 *  Controller
 *  Textarea
 */
public class Textlabel extends Controller {

	protected int _myLetterSpacing = 0;

	/**
	 * 
	 * @param theControlP5
	 *        ControlP5
	 * @param theParent
	 *        Tab
	 * @param theName
	 *        String
	 * @param theValue
	 *        String
	 * @param theX
	 *        int
	 * @param theY
	 *        int
	 */
	protected Textlabel(
	  final ControlP5 theControlP5,
	  final Tab theParent,
	  final String theName,
	  final String theValue,
	  final int theX,
	  final int theY) {
		super(theControlP5, theParent, theName, theX, theY, 200, 20);
		_myStringValue = theValue;
		setup();
	}

	/**
	 * 
	 * @param theValue
	 *        String
	 * @param theX
	 *        int
	 * @param theY
	 *        int
	 */
	protected Textlabel(final String theValue, final int theX, final int theY) {
		super(theX, theY);
		_myStringValue = theValue;
		setup();
	}

	protected Textlabel(
	  final String theValue,
	  final int theX,
	  final int theY,
	  final int theW,
	  final int theH,
	  final int theColor) {
		super(theX, theY);
		_myStringValue = theValue;
		_myValueLabel = new Label(_myStringValue, theW, theH, theColor);
		if (!ControlP5.isControlFont) {
			_myValueLabel.setFont(ControlP5.synt24);
		}
		_myValueLabel.multiline(false);
		_myValueLabel.toUpperCase(false);
		_myValueLabel.update();
	}

	/**
	 * ..
	 * 
	 * @param theComponent
	 *        PApplet
	 * @param theValue
	 *        String
	 * @param theX
	 *        int
	 * @param theY
	 *        int
	 * @param theW
	 *        int
	 * @param theH
	 *        int
	 * @param theColor
	 *        int
	 * @param theFont
	 *        int
	 */
	public Textlabel(
	  final PApplet theComponent,
	  final String theValue,
	  final int theX,
	  final int theY,
	  final int theW,
	  final int theH,
	  final int theColor,
	  final int theFont) {
		super(theX, theY);
		_myStringValue = theValue;
		_myValueLabel = new Label(theComponent, _myStringValue, theW, theH, theColor);
		_myValueLabel.setFont(theFont);
		_myValueLabel.multiline(false);
		_myValueLabel.toUpperCase(false);
		_myValueLabel.update();
	}

	/**
	 * ..
	 * 
	 * @param theComponent
	 *        PApplet
	 * @param theValue
	 *        String
	 * @param theX
	 *        int
	 * @param theY
	 *        int
	 */
	public Textlabel(final PApplet theComponent, final String theValue, final int theX, final int theY) {
		super(theX, theY);
		_myStringValue = theValue;
		_myValueLabel = new Label(theComponent, _myStringValue, 400, 300, 0xffffffff);
		if (!ControlP5.isControlFont) {
			_myValueLabel.setFont(ControlP5.synt24);
		}
		_myValueLabel.multiline(false);
		_myValueLabel.toUpperCase(false);
		_myValueLabel.update();
	}

	/**
	 * 
	 * @param theComponent
	 * @param theValue
	 * @param theX
	 * @param theY
	 * @param theW
	 * @param theH
	 */
	public Textlabel(
	  final PApplet theComponent,
	  final String theValue,
	  final int theX,
	  final int theY,
	  final int theW,
	  final int theH) {
		super(theX, theY);
		_myStringValue = theValue;
		_myValueLabel = new Label(theComponent, _myStringValue, theW, theH, 0xffffffff);
		if (!ControlP5.isControlFont) {
			_myValueLabel.setFont(ControlP5.synt24);
		}
		_myValueLabel.multiline(false);
		_myValueLabel.toUpperCase(false);
		_myValueLabel.update();
	}

	protected void setup() {
		_myValueLabel = new Label(_myStringValue);
		if (!ControlP5.isControlFont) {
			_myValueLabel.setFont(ControlP5.standard56);
		}
		_myValueLabel.multiline(false);
		_myValueLabel.toUpperCase(false);
		_myValueLabel.update();
	}

	public Controller setWidth(int theValue) {
		_myValueLabel.setWidth(theValue);
		_myValueLabel.update();
		return this;
	}

	public Controller setHeight(int theValue) {
		_myValueLabel.setHeight(theValue);
		return this;
	}

	/**
	 * draw the textlabel.
	 * 
	 * @param theApplet
	 *        PApplet
	 */
	public void draw(final PApplet theApplet) {
		theApplet.pushMatrix();
		theApplet.translate(position().x(), position().y());
			_myValueLabel.draw(theApplet, 0, 0);
		theApplet.popMatrix();
	}

	/**
	 * 
	 * @param theValue
	 *        float
	 */
	public void setValue(float theValue) {
	}

	public void update() {
	}

	/**
	 * set the text of the textlabel.
	 * 
	 * @param theText
	 *        String
	 */
	public Textlabel setValue(final String theText) {
		_myStringValue = theText;
		_myValueLabel.set(theText);
		width = _myValueLabel.width();
		height = _myValueLabel.height();
		return this;
	}

	/**
	 * set the position of the textlabel.
	 * 
	 * @param theX
	 *        float
	 * @param theY
	 *        float
	 */
	public void setPosition(final float theX, final float theY) {
		position.x = theX;
		position.y = theY;
	}

	/**
	 * set the letter spacing of the font.
	 * 
	 * @param theValue
	 *        int
	 * @return Textlabel
	 */
	public Textlabel setLetterSpacing(final int theValue) {
		_myLetterSpacing = theValue;
		_myValueLabel.setLetterSpacing(_myLetterSpacing);
		return this;
	}

	/**
	 * a textlabel is an image containing text rendered from a bitfont source
	 * image. available bit fonts are: standard56, standard58, synt24, grixel.
	 * the font of a textlabel can be changed by using setFont(int theFontIndex)
	 * theFontIndex is of type int and available indexes are stored in the
	 * constants ControlP5.standard56, ControlP5.standard58, ControlP5.synt24,
	 * ControlP5.grixel available characters for each pixelfont range from ascii
	 * code 32-126
	 * 
	 * @shortdesc set the Pixel-Font-Family of the Textlabel.
	 * @param theFont
	 *        int
	 */
	public void setFont(final int theFont) {
		_myValueLabel.setFont(theFont);
	}

	public ControlFont setControlFont(ControlFont theControlFont) {
		_myValueLabel.setControlFont(theControlFont);
		return theControlFont;
	}
	
	protected boolean inside() {
		return (_myControlWindow.mouseX > position.x() + _myParent.absolutePosition().x()
		  && _myControlWindow.mouseX < position.x() + _myParent.absolutePosition().x() + _myValueLabel.width()
		  && _myControlWindow.mouseY > position.y() + _myParent.absolutePosition().y() && _myControlWindow.mouseY < position
		  .y()
		  + _myParent.absolutePosition().y()
		  + _myValueLabel.height());
	}

	public Label valueLabel() {
		return _myValueLabel;
	}

	/**
	 * 
	 * @param theElement
	 *        ControlP5XMLElement
	 */
	public void addToXMLElement(final ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "textlabel");
		theElement.setContent(stringValue());
	}

}
