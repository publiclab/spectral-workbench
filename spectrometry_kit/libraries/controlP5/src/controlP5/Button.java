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
 * A button triggers an event after it has been release. Events can be linked to
 * functions and fields inside your program/sketch. for a full documentation of
 * this controller see the {@link Controller} class.
 * 
 * @example ControlP5button
 */

public class Button extends Controller {

	protected int cnt;

	protected boolean isPressed;

	protected boolean isOn = false;

	protected static int autoWidth = 70;

	protected static int autoHeight = 20;

	protected int activateBy = RELEASE;

	protected boolean isSwitch = false;

	protected Button(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			float theDefaultValue,
			int theX,
			int theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myValue = theDefaultValue;
	}

	protected Button(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			float theDefaultValue,
			int theX,
			int theY,
			int theWidth,
			int theHeight,
			boolean theBroadcastFlag) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myValue = theDefaultValue;
	}

	public Button() {
		super(null, null, null, 0, 0, 1, 1);
	}

	public Button(ControlP5 theControlP5, String theName) {
		super(theControlP5, theControlP5.tab("default"), theName, 0, 0, 1, 1);
	}

	@Override
	protected void onEnter() {
		isActive = true;
	}

	@Override
	protected void onLeave() {
		isActive = false;
	}

	/**
	 * {@inheritDoc}
	 */
	public void mousePressed() {
		isActive = getIsInside();
		isPressed = true;
		if (activateBy == PRESSED) {
			activate();
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public void mouseReleased() {
		isPressed = false;
		if (activateBy == RELEASE) {
			activate();
		}
		isActive = false;
	}

	/**
	 * A button can be activated by a mouse PRESSED or mouse RELEASE. Default
	 * value is RELEASE.
	 * 
	 * @param theValue use ControlP5.PRESSED or ControlP5.RELEASE as parameter
	 * @return Button
	 */
	public Button activateBy(int theValue) {
		if (theValue == PRESSED) {
			activateBy = PRESSED;
		} else {
			activateBy = RELEASE;
		}
		return this;
	}

	protected void activate() {
		if (isActive) {
			isActive = false;
			if (parent() instanceof Tab) {
				setIsInside(false);
			}
			setValue(_myValue);
			isOn = !isOn;
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public void mouseReleasedOutside() {
		mouseReleased();
	}

	/**
	 * set the value of the button controller.
	 * 
	 * @param theValue float
	 */
	public void setValue(float theValue) {
		_myValue = theValue;
		broadcast(FLOAT);
	}

	/**
	 * {@inheritDoc}
	 */
	public void update() {
		setValue(_myValue);
	}

	/**
	 * {@inheritDoc}
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "button");
	}

	/**
	 * turn a button into a switch, or use toggle instead.
	 * 
	 * @see controlP5.Toggle
	 * @param theFlag turns the button into a switch when true
	 * @return Button
	 */
	public Button setSwitch(boolean theFlag) {
		isSwitch = theFlag;
		return this;
	}

	/**
	 * If the button acts as a switch, setOn will turn on the switch. Use
	 * {@link #setSwitch(boolean) setSwitch} to turn a button into a switch.
	 * 
	 * @return Button
	 */
	public Button setOn() {
		if (isSwitch) {
			isOn = false;
			isActive = true;
			activate();
		}
		return this;
	}

	/**
	 * If the button acts as a switch, setOff will turn off the switch. Use
	 * {@link #setSwitch(boolean) setSwitch} to turn a button into a switch.
	 * 
	 * @return Button
	 */
	public Button setOff() {
		if (isSwitch) {
			isOn = true;
			isActive = true;
			activate();
		}
		return this;
	}

	/**
	 * Returns true or false and indicates the switch state of the
	 * button. {@link setSwitch(boolean) setSwitch} should have been set before.
	 * 
	 * @see controlP5.Button#setSwitch(boolean)
	 * @return boolean 
	 */
	public boolean booleanValue() {
		return isOn;
	}

	/**
	 * {@inheritDoc}}
	 * 
	 * @see controlP5.Controller#updateDisplayMode(int)
	 */
	public void updateDisplayMode(int theMode) {
		_myDisplayMode = theMode;
		switch (theMode) {
		case (DEFAULT):
			_myDisplay = new ButtonDisplay();
			break;
		case (IMAGE):
			_myDisplay = new ButtonImageDisplay();
			break;
		case (SPRITE):
			_myDisplay = new ButtonSpriteDisplay();
			break;
		case (CUSTOM):
		default:
			break;

		}
	}


	class ButtonSpriteDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			if (isOn && isSwitch) {
				sprite.setState(2);
			} else {
				if (isActive) {
					if (isPressed) {
						sprite.setState(2);
					} else {
						sprite.setState(1);
					}
				} else {
					sprite.setState(0);
				}
			}
			theApplet.fill(0);
			sprite.draw(theApplet);
		}
	}

	class ButtonDisplay implements ControllerDisplay {

		public void display(PApplet theApplet, Controller theController) {
			if (isOn && isSwitch) {
				theApplet.fill(color.colorActive);
			} else {
				if (getIsInside()) {
					if (isPressed) {
						theApplet.fill(color.colorActive);
					} else {
						theApplet.fill(color.colorForeground);
					}
				} else {
					theApplet.fill(color.colorBackground);
				}
			}
			theApplet.rect(0, 0, width, height);
			if (isLabelVisible) {
				_myCaptionLabel.draw(theApplet, 4, height / 2 - 3);
			}
		}
	}

	class ButtonImageDisplay implements ControllerDisplay {

		public void display(PApplet theApplet, Controller theController) {
			if (isOn && isSwitch) {
				theApplet.image((availableImages[HIGHLIGHT] == true) ? images[HIGHLIGHT] : images[DEFAULT], 0, 0);
				return;
			}
			if (getIsInside()) {
				if (isPressed) {
					theApplet.image((availableImages[ACTIVE] == true) ? images[ACTIVE] : images[DEFAULT], 0, 0);
				} else {
					theApplet.image((availableImages[OVER] == true) ? images[OVER] : images[DEFAULT], 0, 0);
				}
			} else {
				theApplet.image(images[DEFAULT], 0, 0);
			}
		}
	}
	
	@Override
	public String toString() {
		return "type:\tButton\n"+super.toString();
	}
}
