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

import java.util.List;

import processing.core.PApplet;

/**
 * multilist has the effect of a menu-tree. see the example for more information
 * and usage.
 * 
 * @example ControlP5multiList
 * @nosuperclasses Controller
 *  Controller
 */
public class MultiList extends Controller implements MultiListInterface, ControlListener {

	/*
	 * @todo reflection does not work properly.
	 * 
	 */

	protected Tab _myTab;

	protected boolean isVisible = true;

	private int cnt;

	protected boolean isOccupied;

	protected boolean isUpdateLocation = false;

	protected MultiListInterface mostRecent;

	protected CRect _myRect;
	
	protected int _myDirection = ControlP5Constants.RIGHT;

	public int closeDelay = 30;

	protected int _myDefaultButtonHeight = 10;

	public MultiList(
	        ControlP5 theControlP5,
	        Tab theParent,
	        String theName,
	        int theX,
	        int theY,
	        int theWidth,
	        int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, 0);
		_myDefaultButtonHeight = theHeight;
		setup();
	}

	public void setup() {
		mostRecent = this;
		isVisible = true;
		updateRect(position().x, position().y, width, _myDefaultButtonHeight);
	}

	public List<Controller> subelements() {
		return subelements;
	}

	protected void updateRect(
	        float theX,
	        float theY,
	        float theW,
	        float theH) {
		_myRect = new CRect(theX, theY, theW, theH);
	}

	public int getDirection() {
		return _myDirection;
	}
	
	public void setDirection(int theDirection) {
		_myDirection = (theDirection == LEFT) ? LEFT:RIGHT;
		for (int i = 0; i < subelements.size(); i++) {
			((MultiListButton) subelements.get(i)).setDirection(_myDirection);
		}
	}
	
	/**
	 * 
	 * @param theX
	 *            float
	 * @param theY
	 *            float
	 */
	public void updateLocation(
	        float theX,
	        float theY) {
		position().x += theX;
		position().y += theY;
		updateRect(position().x, position().y, width, _myDefaultButtonHeight);
		for (int i = 0; i < subelements.size(); i++) {
			((MultiListInterface) subelements.get(i)).updateLocation(theX, theY);
		}

	}

	/**
	 * remove a multilist.
	 */
	public void remove() {

		if (_myParent != null) {
			_myParent.remove(this);
		}
		if (controlP5 != null) {
			controlP5.remove(this);
		}
		for (int i = 0; i < subelements.size(); i++) {
			((MultiListButton) subelements.get(i)).removeListener(this);
			((MultiListButton) subelements.get(i)).remove();
		}
	}

	/**
	 * add multilist buttons to the multilist.
	 * 
	 * @param theName
	 *            String
	 * @param theValue
	 *            int
	 * @return MultiListButton
	 */
	public MultiListButton add(
	        String theName,
	        int theValue) {
		MultiListButton b = new MultiListButton(controlP5, theName, theValue, (int) position().x, (int) position().y
		        + (_myDefaultButtonHeight + 1) * subelements.size(), width, _myDefaultButtonHeight, this, this);
		b.isMoveable = false;
		controlP5.register(b);
		b.addListener(this);
		subelements.add(b);
		b.show();
		updateRect(position().x, position().y, width, (_myDefaultButtonHeight + 1) * subelements.size());
		return b;
	}

	// TODO add an option to remove MultiListButtons

	/**
	 * TODO experimental. see scrollList. needs controllerPlug.
	 * 
	 * @param theEvent
	 */
	public void controlEvent(
	        ControlEvent theEvent) {
		if (theEvent.controller() instanceof MultiListButton) {
			_myValue = theEvent.controller().value();
			ControlEvent myEvent = new ControlEvent(this);
			controlP5.controlbroadcaster().broadcast(myEvent, ControlP5Constants.FLOAT);
		}
	}

	/**
	 * 
	 * @param theApplet
	 *            PApplet
	 */
	public void draw(
	        PApplet theApplet) {
		update(theApplet);
	}

	/**
	 * 
	 * @param theApplet
	 *            PApplet
	 * @return boolean
	 */
	public boolean update(
	        PApplet theApplet) {
		if (!isOccupied) {
			cnt++;
			if (cnt == closeDelay) {
				close();
			}
		}

		if (isUpdateLocation) {
			updateLocation((_myControlWindow.mouseX - _myControlWindow.pmouseX),
			        (_myControlWindow.mouseY - _myControlWindow.pmouseY));
			isUpdateLocation = theApplet.mousePressed;
		}

		if (isOccupied) {
			if (theApplet.keyPressed && theApplet.mousePressed) {
				if (theApplet.keyCode == theApplet.ALT) {
					isUpdateLocation = true;
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * 
	 * @param theFlag
	 *            boolean
	 */
	public void occupied(
	        boolean theFlag) {
		isOccupied = theFlag;
		cnt = 0;
	}

	/**
	 * 
	 * @return boolean
	 */
	public boolean observe() {
		return CRect.inside(_myRect, _myControlWindow.mouseX, _myControlWindow.mouseY);
	}

	/**
	 * 
	 * @param theInterface
	 *            MultiListInterface
	 */
	public void close(
	        MultiListInterface theInterface) {
		for (int i = 0; i < subelements.size(); i++) {
			if (theInterface != (MultiListInterface) subelements.get(i)) {
				((MultiListInterface) subelements.get(i)).close();
			}
		}

	}

	/**
	 * 
	 */
	public void close() {
		for (int i = 0; i < subelements.size(); i++) {
			((MultiListInterface) subelements.get(i)).close();
		}
	}

	/**
	 * 
	 */
	public void open() {
		for (int i = 0; i < subelements.size(); i++) {
			((MultiListInterface) subelements.get(i)).open();
		}
	}

	/**
	 * 
	 * @param theValue
	 *            float
	 */
	public void setValue(
	        float theValue) {}

	public void update() {
		setValue(_myValue);
	}

	public void mouseReleased() {
	}

	/**
	 * 
	 * @param theElement
	 *            ControlP5XMLElement
	 */
	public void addToXMLElement(
	        ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "multilist");
		for (int i = 0; i < subelements.size(); i++) {
			((MultiListInterface) subelements.get(i)).addToXMLElement(theElement);
		}
	}

}
