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

/**
 * press the mouse inside a numberbox and move up and down to change the values
 * of a numberbox.
 * 
 * by default you increase and decrease numbers by dragging the mouse up and
 * down. use setDirection(Controller.HORIZONTAL) to change the mouse control to
 * left and right.
 * 
 * Why do I get -1000000 as initial value when creating a numberbox without a
 * default value? the value of a numberbox defaults back to its minValue, which
 * is -1000000. either use a default value or link a variable to the numberbox -
 * this is done by giving a float or int variable the same name as the
 * numberbox.
 * 
 * Use setMultiplier(float) to change the sensitivity of values
 * increasing/decreasing, by default the multiplier is 1.
 * 
 * 
 * @example ControlP5numberbox
 * @nosuperclasses Controller Controller
 */
public class Numberbox extends Controller {

	protected int cnt;

	protected boolean isActive;

	public static int LEFT = 0;

	public static int UP = 1;

	public static int RIGHT = 2;

	public static int DOWN = 3;

	protected int _myNumberCount = VERTICAL;

	protected float _myMultiplier = 1;

	protected static int autoWidth = 70;

	protected static int autoHeight = 15;

	protected CVector3f autoSpacing = new CVector3f(10, 20, 0);

	/**
	 * 
	 * 
	 * 
	 * @param theControlP5
	 *          ControlP5
	 * @param theParent
	 *          Tab
	 * @param theName
	 *          String
	 * @param theDefaultValue
	 *          float
	 * @param theX
	 *          int
	 * @param theY
	 *          int
	 * @param theWidth
	 *          int
	 * @param theHeight
	 *          int
	 */
	public Numberbox(
			ControlP5 theControlP5,
			Tab theParent,
			String theName,
			float theDefaultValue,
			int theX,
			int theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myValue = theDefaultValue;
		_myValueLabel = new Label("" + _myValue, theWidth, 12, color.colorValueLabel);
		_myMin = -1000000;
		_myMax = 1000000;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see ControllerInterfalce.updateInternalEvents
	 */
	public void updateInternalEvents(PApplet theApplet) {
		if (isActive) {
			if (!ControlP5.keyHandler.isAltDown) {
				if (_myNumberCount == VERTICAL) {
					setValue(_myValue + (_myControlWindow.mouseY - _myControlWindow.pmouseY) * _myMultiplier);
				} else {
					setValue(_myValue + (_myControlWindow.mouseX - _myControlWindow.pmouseX) * _myMultiplier);
				}
			}
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#mousePressed()
	 */
	public void mousePressed() {
		isActive = true;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#mouseReleased()
	 */
	public void mouseReleased() {
		isActive = false;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#mouseReleasedOutside()
	 */
	public void mouseReleasedOutside() {
		mouseReleased();
	}

	public void setMultiplier(float theMultiplier) {
		_myMultiplier = theMultiplier;
	}

	public float multiplier() {
		return _myMultiplier;
	}

	/**
	 * set the value of the numberbox.
	 * 
	 * @param theValue
	 *          float
	 */
	public void setValue(float theValue) {
		_myValue = theValue;
		_myValue = Math.max(_myMin, Math.min(_myMax, _myValue));
		broadcast(FLOAT);
		_myValueLabel.set(adjustValue(_myValue));
	}

	/**
	 * set the direction for changing the numberbox value when dragging the mouse.
	 * by default this is up/down (VERTICAL), use
	 * setDirection(Controller.HORIZONTAL) to change to left/right or back with
	 * setDirection(Controller.VERTICAL).
	 * 
	 * @param theValue
	 */
	public void setDirection(int theValue) {
		if (theValue == HORIZONTAL || theValue == VERTICAL) {
			_myNumberCount = theValue;
		} else {
			_myNumberCount = VERTICAL;
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#update()
	 */
	public void update() {
		setValue(_myValue);
	}

	public Controller linebreak() {
		controlP5.linebreak(this, true, autoWidth, autoHeight, autoSpacing);
		return this;
	}

	/**
	 * 
	 * @param theElement
	 *          ControlP5XMLElement
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "numberbox");
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#updateDisplayMode(int)
	 */
	public void updateDisplayMode(int theMode) {
		_myDisplayMode = theMode;
		switch (theMode) {
		case (DEFAULT):
			_myDisplay = new NumberboxDisplay();
		case (SPRITE):
		case (IMAGE):
		case (CUSTOM):
		default:
			break;

		}
	}

	class NumberboxDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			theApplet.fill(color.colorBackground);
			theApplet.rect(0, 0, width, height);
			theApplet.fill((isActive) ? color.colorActive : color.colorForeground);
			int h = height / 2;
			theApplet.triangle(0, h - 6, 6, h, 0, h + 6);

			_myCaptionLabel.draw(theApplet, 0, height + 4);
			_myValueLabel.draw(theApplet, 10, h - _myValueLabel.height() / 2 + 3);
		}
	}

}
