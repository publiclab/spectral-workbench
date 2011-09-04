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
 * a toggle can have two states, true and false, where true has the value 1 and
 * false is 0.
 * 
 * @example ControlP5toggle
 * @nosuperclasses Controller Controller
 */
public class Toggle extends Controller {

	int cnt;

	protected boolean isOn = false;

	protected float internalValue = -1;

	protected static int autoWidth = 40;

	protected static int autoHeight = 20;

	protected CVector3f autoSpacing = new CVector3f(10, 20, 0);

	/**
	 * 
	 * @param theControlP5 ControlP5
	 * @param theParent Tab
	 * @param theName String
	 * @param theValue float
	 * @param theX float
	 * @param theY float
	 * @param theWidth int
	 * @param theHeight int
	 */
	public Toggle(
			ControlP5 theControlP5,
			Tab theParent,
			String theName,
			float theValue,
			float theX,
			float theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myValue = theValue;
	}

	/**
	 * 
	 * @param theApplet PApplet
	 */
	public void draw(PApplet theApplet) {
		theApplet.pushMatrix();
		theApplet.translate(position().x(), position().y());
		_myDisplay.display(theApplet, this);
		theApplet.popMatrix();
	}

	protected void onEnter() {
		isActive = true;
	}

	protected void onLeave() {
		isActive = false;
	}

	/**
	 * 
	 */
	public void mousePressed() {
		setState(!isOn);
		isActive = false;
	}

	/**
	 * 
	 * @param theValue float
	 */
	public void setValue(float theValue) {
		if (theValue == 0) {
			setState(false);
		} else {
			setState(true);
		}
	}

	public void setValue(boolean theValue) {
		setValue((theValue == true) ? 1 : 0);
	}

	public void update() {
		setValue(_myValue);
	}

	/**
	 * set the state of the toggle, which can be true or false.
	 * 
	 * @param theFlag boolean
	 */
	public void setState(boolean theFlag) {
		isOn = theFlag;
		_myValue = (isOn == false) ? 0 : 1;
		broadcast(FLOAT);
	}

	public boolean getState() {
		return isOn;
	}

	protected void deactivate() {
		isOn = false;
		_myValue = (isOn == false) ? 0 : 1;
	}

	protected void activate() {
		isOn = true;
		_myValue = (isOn == false) ? 0 : 1;
	}

	/**
	 * switch the state of a toggle.
	 */
	public void toggle() {
		if (isOn) {
			setState(false);
		} else {
			setState(true);
		}
	}

	/**
	 * set the visual mode of a Toggle. use setMode(ControlP5.DEFAULT) or
	 * setMode(ControlP5.SWITCH)
	 * 
	 * @param theMode
	 */
	public void setMode(int theMode) {
		updateDisplayMode(theMode);
	}

	/**
	 * 
	 * @param theElement ControlP5XMLElement
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "toggle");
	}

	/**
	 * by default a toggle returns 0 (for off) and 1 (for on). the internal value
	 * variable can be used to store an additional value for a toggle event.
	 * 
	 * @param theInternalValue
	 */
	public void setInternalValue(float theInternalValue) {
		internalValue = theInternalValue;
	}

	public float internalValue() {
		return internalValue;
	}

	public Controller linebreak() {
		controlP5.linebreak(this, true, autoWidth, autoHeight, autoSpacing);
		return this;
	}

	public void updateDisplayMode(int theState) {
		_myDisplayMode = theState;
		switch (theState) {
		case (DEFAULT):
			_myDisplay = new ToggleDisplay();
			break;
		case (SPRITE):
			_myDisplay = new ToggleSpriteDisplay();
			break;
		case (IMAGE):
			_myDisplay = new ToggleImageDisplay();
			break;
		case (SWITCH):
			_myDisplay = new ToggleSwitchDisplay();
			break;
		case (CUSTOM):
		default:
			break;

		}
	}

	class ToggleDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			if (isActive) {
				theApplet.fill(color.colorActive);
			} else {
				theApplet.fill(isOn ? color.colorActive : color.colorBackground);
			}
			theApplet.rect(0, 0, width, height);
			if (isLabelVisible) {
				_myCaptionLabel.draw(theApplet, 0, height + 4);
			}
		}
	}

	class ToggleSpriteDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			if (isActive) {
				sprite.setState(1);
			} else {
				if (isOn) {
					sprite.setState(1);
				} else {
					sprite.setState(0);
				}
			}
		}
	}

	class ToggleImageDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			if (isActive) {
				theApplet.image((availableImages[ACTIVE] == true) ? images[ACTIVE] : images[DEFAULT], 0, 0);
			} else {
				if (isOn) {
					theApplet.image((availableImages[ACTIVE] == true) ? images[ACTIVE] : images[DEFAULT], 0, 0);
				} else {
					theApplet.image(images[DEFAULT], 0, 0);
				}
			}
			theApplet.rect(0, 0, width, height);
		}
	}

	class ToggleSwitchDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			theApplet.fill(color.colorBackground);
			theApplet.rect(0, 0, width, height);
			theApplet.fill(color.colorActive);
			if (isOn) {
				theApplet.rect(0, 0, width / 2, height);
			} else {
				theApplet.rect((width % 2 == 0 ? 0 : 1) + width / 2, 0, width / 2, height);
			}
			if (isLabelVisible) {
				_myCaptionLabel.draw(theApplet, 0, height + 4);
			}
		}
	}
}
