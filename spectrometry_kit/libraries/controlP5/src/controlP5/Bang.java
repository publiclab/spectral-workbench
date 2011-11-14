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
 * a bang controller triggers an event when pressed. A bang can only be assigned
 * to a function in your program but not to a field like other controllers. Bang
 * extends superclass Controller, for a full documentation follow this link, <a
 * href="./controller_class_controller.htm">controller</a>.
 * 
 * @example ControlP5bang
 */
public class Bang extends Controller {

	protected int cnt;

	protected int triggerId = PRESSED;

	protected Bang(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			float theX,
			float theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myValue = 1;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#onEnter()
	 */
	protected void onEnter() {
		cnt = 0;
		isActive = true;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#onLeave()
	 */
	protected void onLeave() {
		isActive = false;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#mousePressed()
	 */
	protected void mousePressed() {
		if (triggerId == PRESSED) {
			cnt = -3;
			isActive = true;
			update();
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#mouseReleased()
	 */
	protected void mouseReleased() {
		if (triggerId == RELEASE) {
			cnt = -3;
			isActive = true;
			update();
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#mouseReleasedOutside()
	 */
	protected void mouseReleasedOutside() {
		// if _myTriggerId==RELEASE, the event is not
		// triggered when mouse is released outside, since
		// the event would be triggered for any mouse
		// release even though the controller is not acitve.
		// therefore mouseReleased() is not called in here.
		onLeave();
	}

	/**
	 * by default a bang is triggered when the mouse is pressed. use
	 * setTriggerEvent(Bang.PRESSED) or setTriggerEvent(Bang.RELEASE) to define
	 * the action for triggering a bang. currently only Bang.PRESSED and
	 * Bang.RELEASE are supported.
	 * 
	 * @param theEventID
	 */
	public void setTriggerEvent(int theEventID) {
		triggerId = theEventID;
	}

	/**
	 * set the value of the bang controller. since bang can be true or false,
	 * false=0 and true=1
	 * 
	 * @param theValue float
	 */
	public void setValue(float theValue) {
		_myValue = theValue;
		broadcast(FLOAT);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#update()
	 */
	public void update() {
		setValue(_myValue);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * controlP5.ControllerInterface#addToXMLElement(controlP5.ControlP5XMLElement
	 * )
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "bang");
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
			_myDisplay = new BangDisplay();
			break;
		case (SPRITE):
			_myDisplay = new BangSpriteDisplay();
			break;
		case (IMAGE):
			_myDisplay = new BangImageDisplay();
			break;
		case (CUSTOM):
		default:
			break;
		}
	}

	class BangSpriteDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			if (isActive) {
				sprite.setState(1);
			} else {
				sprite.setState(0);
			}
			if (cnt < 0) {
				sprite.setState(0);
				cnt++;
			}
			theApplet.fill(0);
			sprite.draw(theApplet);
		}
	}

	class BangDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			if (isActive) {
				theApplet.fill(color.colorActive);
			} else {
				theApplet.fill(color.colorForeground);
			}

			if (cnt < 0) {
				theApplet.fill(color.colorForeground);
				cnt++;
			}
			theApplet.rect(0, 0, width, height);
			if (isLabelVisible) {
				_myCaptionLabel.draw(theApplet, 0, height + 4);
			}
		}
	}

	class BangImageDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			if (isActive) {
				theApplet.image((availableImages[ACTIVE] == true) ? images[ACTIVE] : images[DEFAULT], 0, 0);
			} else {
				theApplet.image((availableImages[OVER] == true) ? images[OVER] : images[DEFAULT], 0, 0);
			}
			if (cnt < 0) {
				theApplet.image((availableImages[OVER] == true) ? images[OVER] : images[DEFAULT], 0, 0);
				cnt++;
			}
			if (!isActive && cnt >= 0) {
				theApplet.image(images[DEFAULT], 0, 0);
			}
		}
	}

	@Override
	public String toString() {
		return "type:\tBang\n"+super.toString();
	}
}
