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
 * Tab extends ControllerGroup, for more available methods
 * see the ControllerGroup documentation.
 * 
 * @example ControlP5tab
 * @nosuperclasses ControllerGroup
 *  ControllerGroup
 */
public class Tab extends ControllerGroup {

	/*
	 * @todo
	 * enable positioning of tabs.
	 */

	protected int _myOffsetX = -1000;

	protected int _myOffsetY = -1000;

	protected boolean isActive = false;

	protected boolean isEventActive = false;

	protected float _myValue = 0;

	protected String _myStringValue = "";

	protected int _myRightBorder = 4;

	/**
	 * 
	 * @param theControlP5 ControlP5
	 * @param theControlWindow ControlWindow
	 * @param theName String
	 */
	public Tab(ControlP5 theControlP5, ControlWindow theControlWindow, String theName) {
		super(theControlP5, null, theName, 0, 0);
		_myControlWindow = theControlWindow;

		position = new CVector3f();
		positionBuffer = new CVector3f();
		absolutePosition = new CVector3f();
		isMoveable = false;
		isEventActive = theControlP5.isTabEventsActive;
		_myHeight = 16;
		_myLabel.update();
		_myWidth = _myLabel.width() + _myRightBorder;
		width();
	}

	protected void setOffset(int theValueX, int theValueY) {
		_myOffsetX = theValueX;
		_myOffsetY = theValueY;
	}

	protected int height() {
		return _myHeight;
	}

	protected boolean updateLabel() {
		isInside = inside();
		return _myControlWindow.tabs().size() > 2;
	}

	protected void drawLabel(PApplet theApplet) {
		theApplet.pushMatrix();
		theApplet.fill(isInside ? color.colorForeground : color.colorBackground);
		if (isActive) {
			theApplet.fill(color.colorActive);
		}
		theApplet.rect(_myOffsetX, _myOffsetY, _myWidth - 1 + _myRightBorder, _myHeight);
		_myLabel.draw(theApplet, _myOffsetX + 4, _myOffsetY + 5);
		theApplet.popMatrix();
	}

	/**
	 * set the label of the group.
	 * TODO overwriting COntrollerGroup.setLabel to set the Width of a tab
	 * after renaming. this should be temporary and fixed in the future.
	 * 
	 * @param theLabel
	 *        String
	 */
	public void setLabel(String theLabel) {
		_myLabel.setFixedSize(false);
		_myLabel.set(theLabel);
		_myLabel.setFixedSize(true);
		setWidth(_myLabel.width());
	}

	protected int width() {
		return _myWidth + _myRightBorder;
	}
	
	
	/**
	 * @param theWidth
	 * @return
	 */
	public Tab setWidth(int theWidth) {
		_myWidth = theWidth + _myRightBorder;
		return this;
	}
	
	public Tab setHeight(int theHeight) {
		_myHeight = theHeight;
		return this;
	}
	

	protected boolean inside() {
		return (_myControlWindow.mouseX > _myOffsetX
			&& _myControlWindow.mouseX < _myOffsetX + _myWidth + _myRightBorder
			&& _myControlWindow.mouseY > _myOffsetY && _myControlWindow.mouseY < _myOffsetY + _myHeight);
	}

	/**
	 * 
	 */
	public void mousePressed() {
		_myControlWindow.activateTab(this);
		if (isEventActive) {
			controlP5.controlbroadcaster().broadcast(new ControlEvent(this), ControlP5Constants.METHOD);
		}
	}

	/**
	 * 
	 * @param theFlag boolean
	 */
	public void setActive(boolean theFlag) {
		isActive = theFlag;
	}

	/**
	 * 
	 * @return boolean
	 */
	protected boolean isActive() {
		return isActive;
	}

	public void moveTo(ControlWindow theWindow) {
		_myControlWindow.removeTab(this);
		setTab(theWindow, name());
	}

	/**
	 * activate or deactivate the Event status of a tab.
	 * 
	 * @param theFlag boolean
	 */
	public Tab activateEvent(boolean theFlag) {
		isEventActive = theFlag;
		return this;
	}

	/**
	 * 
	 * @param theElement ControlP5XMLElement
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setName("tab");
		theElement.setAttribute("name", name());
		theElement.setAttribute("id", new Integer(id()));
		theElement.setAttribute("width", new Integer(width()));
		theElement.removeAttribute("x");
		theElement.removeAttribute("y");
	}

	/**
	 * get the string value of the tab.
	 * 
	 * @return String
	 */
	public String stringValue() {
		return _myStringValue;
	}

	/**
	 * get the value of the tab.
	 * 
	 * @return float
	 */
	public float value() {
		return _myValue;
	}

	/**
	 * set the value of the tab.
	 * 
	 * @param theValue float
	 */
	public void setValue(float theValue) {
		_myValue = theValue;
	}

	/**
	 * set the string value of the tab.
	 * 
	 * @param theValue String
	 */
	public void setStringValue(String theValue) {
		_myStringValue = theValue;
	}

}
