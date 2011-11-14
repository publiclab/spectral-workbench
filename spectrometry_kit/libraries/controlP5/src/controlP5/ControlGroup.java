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
 * use a controlGroup to bundle several controllers, controlGroups can be closed
 * and opened to keep the screen organized.
 * 
 * ControlGroup extends ControllerGroup, for a list and documentation of
 * available methods see the <a
 * href="./controllergroup_class_controllergroup.htm">ControllerGroup</a>
 * documentation.
 * 
 * @example ControlP5group
 */
public class ControlGroup extends ControllerGroup implements ControlListener {

	protected Button _myCloseButton;

	protected int _myBackgroundHeight = 0;

	protected int _myBackgroundColor = 0x00ffffff;

	protected boolean isEventActive = false;

	protected boolean isBarVisible = true;

	public ControlGroup(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			int theX,
			int theY,
			int theW,
			int theH) {
		super(theControlP5, theParent, theName, theX, theY);
		_myValueLabel = new Label("");
		_myWidth = theW;
		_myHeight = theH;
		
	}

	public void mousePressed() {
		if (isCollapse) {
			if (!ControlP5.keyHandler.isAltDown) {
				isOpen = !isOpen;
				if (isEventActive) {
					controlP5.controlbroadcaster().broadcast(new ControlEvent(this), ControlP5Constants.METHOD);
				}
			}
		}
	}

	/**
	 * activate or deactivate the Event status of a tab.
	 * 
	 * @param theFlag
	 *          boolean
	 */
	public ControlGroup activateEvent(boolean theFlag) {
		isEventActive = theFlag;
		return this;
	}

	/**
	 * get the height of the controlGroup's background.
	 * 
	 * @return
	 */
	public int getBackgroundHeight() {
		return _myBackgroundHeight;
	}

	/**
	 * set the height of the controlGroup's background.
	 * 
	 * @param theHeight
	 */
	public void setBackgroundHeight(int theHeight) {
		_myBackgroundHeight = theHeight;
	}

	/**
	 * set the background color of a controlGroup.
	 * 
	 * @param theColor
	 */
	public void setBackgroundColor(int theColor) {
		_myBackgroundColor = theColor;
	}

	/**
	 * set the height of the top bar (used to open/close and move a controlGroup).
	 * 
	 * @param theHeight
	 */
	public void setBarHeight(int theHeight) {
		_myHeight = theHeight;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.ControllerGroup#preDraw(processing.core.PApplet)
	 */
	protected void preDraw(PApplet theApplet) {
		if (isOpen) {
			theApplet.fill(_myBackgroundColor);
			theApplet.rect(0, 0, _myWidth, _myBackgroundHeight-1);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.ControllerGroup#postDraw(processing.core.PApplet)
	 */
	protected void postDraw(PApplet theApplet) {
		if (isBarVisible) {
			theApplet.fill(isInside ? color.colorForeground : color.colorBackground);
			theApplet.rect(0, -1, _myWidth, -_myHeight);
			_myLabel.draw(theApplet, 2, -_myHeight);
			if (isCollapse) {
				theApplet.fill(color.colorActive);
				if (isOpen) {
					theApplet.triangle(_myWidth - 10, -_myHeight / 2 - 3, _myWidth - 4, -_myHeight / 2 - 3, _myWidth - 7, -_myHeight / 2);
				} else {
					theApplet.triangle(_myWidth - 10, -_myHeight / 2, _myWidth - 4, -_myHeight / 2, _myWidth - 7, -_myHeight / 2 - 3);
				}
			}
		}
	}

	/*
	 * (non-Javadoc)
	 * @see controlP5.ControllerInterface#addToXMLElement(controlP5.ControlP5XMLElement)
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setName("group");
		theElement.setAttribute("width", new Integer(_myWidth));
		theElement.setAttribute("height", new Integer(_myHeight));
		for (int i = 0; i < controllers.size(); i++) {
			if (((ControllerInterface) controllers.get(i)).isXMLsavable()) {
				theElement.addChild(((ControllerInterface) controllers.get(i)).getAsXML());
			}
		}
	}

	/**
	 * TODO redesign or deprecate add a close button to the controlbar of this
	 * controlGroup.
	 */
	public void addCloseButton() {
		if (_myCloseButton == null) {
			_myCloseButton = new Button(controlP5, this, name() + "close", 1, _myWidth + 1, -10, 12, 9);
			_myCloseButton.setLabel("X");
			_myCloseButton.addListener(this);
		}
	}

	/**
	 * TODO redesign or deprecate remove the close button.
	 */
	public void removeCloseButton() {
		if (_myCloseButton == null) {
			_myCloseButton.remove();
		}
		_myCloseButton = null;
	}

	public void hideBar() {
		isBarVisible = false;
	}

	public void showBar() {
		isBarVisible = true;
	}

	public boolean isBarVisible() {
		return isBarVisible;
	}

	/*
	 * (non-Javadoc)
	 * @see controlP5.ControlListener#controlEvent(controlP5.ControlEvent)
	 */
	public void controlEvent(ControlEvent theEvent) {
		if (theEvent.controller().name().equals(name() + "close")) {
			hide();
		}
	}

	/**
	 * !!! experimental, see ControllerGroup.value()
	 * 
	 * 
	 * @return String
	 */
	public String stringValue() {
		return "" + _myValue;
	}

	/**
	 * !!! experimental, see ControllerGroup.value()
	 * 
	 * 
	 * @return float
	 */
	public float value() {
		return _myValue;
	}

	public float[] arrayValue() {
		return _myArrayValue;
	}

	public void setArrayValue(float[] theArray) {
		_myArrayValue = theArray;
	}
	
	@Override
	public String toString() {
		return super.toString();
	} 
	
	
}
