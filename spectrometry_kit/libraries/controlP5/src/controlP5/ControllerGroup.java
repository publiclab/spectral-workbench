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

import java.awt.event.KeyEvent;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Vector;

import processing.core.PApplet;

/**
 * ControllerGroup is an abstract class and is extended by e.g. ControlGroup,
 * Tab, or ScrollList
 * 
 * ControlGroup ScrollList Tab Textarea
 */
public abstract class ControllerGroup implements ControllerInterface, ControlP5Constants {

	protected CVector3f position;

	protected CVector3f positionBuffer;

	protected CVector3f absolutePosition;

	protected ControllerList controllers;

	protected ControlWindow _myControlWindow;

	protected ControlP5 controlP5;

	protected ControllerGroup _myParent;

	protected String _myName;

	protected int _myId = -1;

	protected CColor color = new CColor();

	protected boolean isMousePressed = false;

	protected boolean isInside = false;

	protected boolean isVisible = true;

	protected boolean isOpen = true;

	protected boolean isMoveable = true;

	protected Label _myLabel;

	protected Label _myValueLabel;

	protected int _myWidth = 99;

	protected int _myHeight = 9;

	protected boolean isXMLsavable = true;

	protected boolean isUpdate;

	protected List<ControlCanvas> _myControlCanvas;

	protected float _myValue;

	protected String _myStringValue;

	protected float[] _myArrayValue;

	protected boolean isCollapse = true;

	protected int _myPickingColor = 0x6600ffff;

	protected CVector3f autoPosition = new CVector3f(10, 30, 0);

	protected float tempAutoPositionHeight = 0;

	protected float autoPositionOffsetX = 10;

	/**
	 * 
	 * @param theControlP5 ControlP5
	 * @param theParent ControllerGroup
	 * @param theName String
	 * @param theX float
	 * @param theY float
	 */
	public ControllerGroup(ControlP5 theControlP5, ControllerGroup theParent, String theName, float theX, float theY) {
		position = new CVector3f(theX, theY, 0);
		controlP5 = theControlP5;
		color.set((theParent == null) ? controlP5.color : theParent.color);
		_myName = theName;
		controllers = new ControllerList();
		_myControlCanvas = new Vector<ControlCanvas>();
		_myLabel = new Label(_myName, color.colorCaptionLabel);
		setParent((theParent == null) ? this : theParent);
	}

	protected ControllerGroup(int theX, int theY) {
		position = new CVector3f(theX, theY, 0);
		controllers = new ControllerList();
		_myControlCanvas = new Vector<ControlCanvas>();
	}

	/**
	 * 
	 */
	public void init() {
	}

	public ControllerInterface parent() {
		return _myParent;
	}

	/**
	 * 
	 * @param theParent ControllerGroup
	 */
	void setParent(ControllerGroup theParent) {
		if (_myParent != null && _myParent != this) {
			_myParent.remove(this);
		}

		_myParent = theParent;

		if (_myParent != this) {
			_myParent.add(this);
		}
		absolutePosition = new CVector3f(position);
		absolutePosition.add(_myParent.absolutePosition());
		positionBuffer = new CVector3f(position);
		_myControlWindow = _myParent.getWindow();

		for (int i = 0; i < controllers.size(); i++) {
			if (controllers.get(i) instanceof Controller) {
				((Controller) controllers.get(i))._myControlWindow = _myControlWindow;
			} else {
				((ControllerGroup) controllers.get(i))._myControlWindow = _myControlWindow;
			}
		}
	}

	/**
	 * set the group of the controller.
	 * 
	 * @param theGroup ControllerGroup
	 */
	public void setGroup(ControllerGroup theGroup) {
		setParent(theGroup);
	}

	/**
	 * @param theName String
	 */
	public void setGroup(String theName) {
		setParent(controlP5.getGroup(theName));
	}

	/**
	 * move the group.
	 * 
	 * @param theGroup ControlGroup
	 * @param theTab Tab
	 * @param theControlWindow ControlWindow
	 */
	public void moveTo(ControlGroup theGroup, Tab theTab, ControlWindow theControlWindow) {
		if (theGroup != null) {
			setGroup(theGroup);
			return;
		}

		if (theControlWindow == null) {
			theControlWindow = controlP5.controlWindow;
		}

		setTab(theControlWindow, theTab.name());
	}

	public void moveTo(ControlGroup theGroup) {
		moveTo(theGroup, null, null);
	}

	public void moveTo(Tab theTab) {
		moveTo(null, theTab, null);
	}

	public void moveTo(ControlWindow theControlWindow) {
		moveTo(null, theControlWindow.tab("default"), theControlWindow);
	}

	public void moveTo(String theTabName) {
		moveTo(null, controlP5.controlWindow.tab(theTabName), controlP5.controlWindow);
	}

	public void moveTo(String theTabName, ControlWindow theControlWindow) {
		moveTo(null, theControlWindow.tab(theTabName), theControlWindow);
	}

	public void moveTo(ControlWindow theControlWindow, String theTabName) {
		moveTo(null, theControlWindow.tab(theTabName), theControlWindow);
	}

	public void moveTo(Tab theTab, ControlWindow theControlWindow) {
		moveTo(null, theTab, theControlWindow);
	}

	/**
	 * set the tab of the controller.
	 * 
	 * @param theName String
	 */
	public void setTab(String theName) {
		setParent(controlP5.getTab(theName));
	}

	public void setTab(ControlWindow theWindow, String theName) {
		setParent(controlP5.getTab(theWindow, theName));
	}

	/**
	 * set the tab of the controller.
	 * 
	 * @param theTab Tab
	 */
	public void setTab(Tab theTab) {
		setParent(theTab);
	}

	/**
	 * get the instance of the tab this controller belongs to.
	 * 
	 * @return Tab
	 */
	public Tab getTab() {
		if (this instanceof Tab) {
			return (Tab) this;
		}
		if (_myParent instanceof Tab) {
			return (Tab) _myParent;
		}
		return _myParent.getTab();
	}

	protected void updateFont(ControlFont theControlFont) {
		_myLabel.updateFont(theControlFont);
		if (_myValueLabel != null) {
			_myValueLabel.updateFont(theControlFont);
		}
		for (int i = 0; i < controllers.size(); i++) {
			if (controllers.get(i) instanceof Controller) {
				((Controller) controllers.get(i)).updateFont(theControlFont);
			} else {
				((ControllerGroup) controllers.get(i)).updateFont(theControlFont);
			}
		}
	}

	/**
	 * 
	 * @return CVector3f
	 */
	public CVector3f position() {
		return position;
	}

	/**
	 * 
	 * @return CVector3f
	 */
	public CVector3f absolutePosition() {
		return absolutePosition;
	}

	/**
	 * set the position of this controller.
	 * 
	 * @param theX float
	 * @param theY float
	 */
	public void setPosition(float theX, float theY) {
		position.set((int) theX, (int) theY);
		positionBuffer.set(position);
		updateAbsolutePosition();
	}

	/**
	 * 
	 */
	public void updateAbsolutePosition() {
		absolutePosition.set(position);
		absolutePosition.add(_myParent.absolutePosition());
		for (int i = 0; i < controllers.size(); i++) {
			((ControllerInterface) controllers.get(i)).updateAbsolutePosition();
		}

	}

	/**
	 * 
	 */
	public void continuousUpdateEvents() {
		if (controllers.size() <= 0) {
			return;
		}
		for (int i = controllers.size() - 1; i >= 0; i--) {
			((ControllerInterface) controllers.get(i)).continuousUpdateEvents();
		}
	}

	/**
	 * call update if you want to update the value of or function call of a
	 * controller.
	 */
	public void update() {
		if (controllers.size() <= 0) {
			return;
		}
		for (int i = controllers.size() - 1; i >= 0; i--) {
			if (((ControllerInterface) controllers.get(i)).isUpdate()) {
				((ControllerInterface) controllers.get(i)).update();
			}
		}
	}

	/**
	 * enable or disable the update function of a controller.
	 * 
	 * @param theFlag boolean
	 */
	public void setUpdate(boolean theFlag) {
		isUpdate = theFlag;
		for (int i = 0; i < controllers.size(); i++) {
			((ControllerInterface) controllers.get(i)).setUpdate(theFlag);
		}
	}

	/**
	 * check the update status of a controller.
	 * 
	 * @return boolean
	 */
	public boolean isUpdate() {
		return isUpdate;
	}

	/**
	 * 
	 */
	public void updateEvents() {

		if (isOpen) {
			for (int i = controllers.size() - 1; i >= 0; i--) {
				((ControllerInterface) controllers.get(i)).updateEvents();
			}
		}
		if (isVisible) {

			if ((isMousePressed == _myControlWindow.mouselock)) {
				if (isMousePressed && ControlP5.keyHandler.isAltDown && isMoveable) {
					if (!ControlP5.isMoveable) {
						positionBuffer.x += _myControlWindow.mouseX - _myControlWindow.pmouseX;
						positionBuffer.y += _myControlWindow.mouseY - _myControlWindow.pmouseY;
						if (ControlP5.keyHandler.isShiftDown) {
							position.x = ((int) (positionBuffer.x) / 10) * 10;
							position.y = ((int) (positionBuffer.y) / 10) * 10;
						} else {
							position.set(positionBuffer);
						}
						updateAbsolutePosition();
					}
				} else {
					if (inside()) {
						if (!isInside) {
							isInside = true;
							onEnter();
						}
					} else {
						if (isInside && !isMousePressed) {
							onLeave();
							isInside = false;
						}
					}
				}
			}
		}
	}

	/**
	 * @see ControllerInterface.updateInternalEvents
	 * 
	 */
	public void updateInternalEvents(PApplet theApplet) {
	}

	/**
	 * 
	 * @param theApplet PApplet
	 */
	public final void draw(PApplet theApplet) {
		if (isVisible) {
			theApplet.pushMatrix();
			theApplet.translate(position.x(), position.y());
			preDraw(theApplet);
			_myControlWindow._myPicking.update(this);
			drawControllers(theApplet);
			postDraw(theApplet);
			theApplet.popMatrix();
		}
	}

	protected void drawControllers(PApplet theApplet) {
		if (isOpen) {

			for (int i = 0; i < _myControlCanvas.size(); i++) {
				if (((ControlCanvas) _myControlCanvas.get(i)).mode() == ControlCanvas.PRE) {
					((ControlCanvas) _myControlCanvas.get(i)).draw(theApplet);
				}
			}

			for (int i = 0; i < controllers.size(); i++) {
				if (((ControllerInterface) controllers.get(i)).isVisible()) {
					((ControllerInterface) controllers.get(i)).updateInternalEvents(theApplet);
					((ControllerInterface) controllers.get(i)).draw(theApplet);
				}
			}
			for (int i = 0; i < controllers.sizeDrawable(); i++) {
				((CDrawable) controllers.getDrawable(i)).draw(theApplet);
			}

			for (int i = 0; i < _myControlCanvas.size(); i++) {
				if (((ControlCanvas) _myControlCanvas.get(i)).mode() == ControlCanvas.POST) {
					((ControlCanvas) _myControlCanvas.get(i)).draw(theApplet);
				}
			}
		}
	}

	protected void preDraw(PApplet theApplet) {
	}

	protected void postDraw(PApplet theApplet) {
	}

	/**
	 * add a canvas to a controllerGroup such as a tab or group. use regular
	 * processing draw methods to add visual content.
	 * 
	 * @param theCanvas
	 */
	public ControlCanvas addCanvas(ControlCanvas theCanvas) {
		_myControlCanvas.add(theCanvas);
		return theCanvas;
	}

	/**
	 * remove a canvas from a controller group.
	 * 
	 * @param theCanvas
	 */
	public void removeCanvas(ControlCanvas theCanvas) {
		_myControlCanvas.remove(theCanvas);
	}

	/**
	 * add a controller to the group, but use Controller.setGroup() instead.
	 * 
	 * @param theElement ControllerInterface
	 */
	public void add(ControllerInterface theElement) {
		controllers.add(theElement);
	}

	/**
	 * remove a controller from the group, but use Controller.setGroup() instead.
	 * 
	 * @param theElement ControllerInterface
	 */

	public void remove(ControllerInterface theElement) {
		controllers.remove(theElement);
	}

	/**
	 * 
	 * @param theElement CDrawable
	 */
	public void addDrawable(CDrawable theElement) {
		controllers.addDrawable(theElement);
	}

	/**
	 * 
	 * @param theElement CDrawable
	 */
	public void remove(CDrawable theElement) {
		controllers.removeDrawable(theElement);
	}

	/**
	 * remove the controller from controlP5.
	 */
	public void remove() {
		if (_myParent != null) {
			_myParent.remove(this);
		}
		if (controlP5 != null) {
			controlP5.remove(this);
		}

		for (int i = controllers.size() - 1; i >= 0; i--) {
			controllers.get(i).remove();
		}
		controllers.clear();
		controllers.clearDrawable();
		controllers = new ControllerList();
		if (this instanceof Tab) {
			_myControlWindow.removeTab((Tab) this);
		}
	}

	/**
	 * get the name of the group.
	 * 
	 * @return String
	 */
	public String name() {
		return _myName;
	}

	/**
	 * 
	 * @return ControlWindow
	 */
	public ControlWindow getWindow() {
		return _myControlWindow;
	}

	/**
	 * 
	 * @param theEvent KeyEvent
	 */
	public void keyEvent(KeyEvent theEvent) {
		for (int i = 0; i < controllers.size(); i++) {
			((ControllerInterface) controllers.get(i)).keyEvent(theEvent);
		}
	}

	/**
	 * 
	 * @param theStatus boolean
	 * @return boolean
	 */
	public boolean setMousePressed(boolean theStatus) {
		if (!isVisible) {
			return false;
		}
		for (int i = controllers.size() - 1; i >= 0; i--) {
			if (((ControllerInterface) controllers.get(i)).setMousePressed(theStatus)) {
				return true;
			}
		}
		if (theStatus == true) {
			if (isInside) {
				isMousePressed = true;
				mousePressed();
				return true;
			}
		} else {
			if (isMousePressed == true) {
				isMousePressed = false;
				mouseReleased();
			}
		}
		return false;
	}

	void mousePressed() {
	}

	void mouseReleased() {
	}

	void onEnter() {
	}

	void onLeave() {
	}

	/**
	 * 
	 * @param theId int
	 */
	public void setId(int theId) {
		_myId = theId;
	}

	/**
	 * 
	 * @return int
	 */
	public int id() {
		return _myId;
	}

	/**
	 * set the color for the group when active.
	 * 
	 * @param theColor int
	 */
	public void setColorActive(int theColor) {
		color.colorActive = theColor;
		for (int i = 0; i < controllers.size(); i++) {
			((ControllerInterface) controllers.get(i)).setColorActive(theColor);
		}
	}

	/**
	 * set the foreground color of the group.
	 * 
	 * @param theColor int
	 */
	public void setColorForeground(int theColor) {
		color.colorForeground = theColor;
		for (int i = 0; i < controllers.size(); i++) {
			((ControllerInterface) controllers.get(i)).setColorForeground(theColor);
		}
	}

	/**
	 * set the background color of the group.
	 * 
	 * @param theColor int
	 */
	public void setColorBackground(int theColor) {
		color.colorBackground = theColor;
		for (int i = 0; i < controllers.size(); i++) {
			((ControllerInterface) controllers.get(i)).setColorBackground(theColor);
		}
	}

	/**
	 * set the color of the text label of the group.
	 * 
	 * @param theColor int
	 */
	public void setColorLabel(int theColor) {
		color.colorCaptionLabel = theColor;
		if (_myLabel != null) {
			_myLabel.set(_myLabel.toString(), color.colorCaptionLabel);
		}
		for (int i = 0; i < controllers.size(); i++) {
			((ControllerInterface) controllers.get(i)).setColorLabel(theColor);
		}
	}

	/**
	 * set the color of the value label.
	 * 
	 * @param theColor int
	 */
	public void setColorValue(int theColor) {
		color.colorValueLabel = theColor;
		if (_myValueLabel != null) {
			_myValueLabel.set(_myValueLabel.toString(), color.colorValueLabel);
		}
		for (int i = 0; i < controllers.size(); i++) {
			((ControllerInterface) controllers.get(i)).setColorValue(theColor);
		}
	}

	/**
	 * set the label of the group.
	 * 
	 * @param theLabel String
	 */
	public void setLabel(String theLabel) {
		_myLabel.setFixedSize(false);
		_myLabel.set(theLabel);
		_myLabel.setFixedSize(true);
	}

	/**
	 * check if the group is visible.
	 * 
	 * @return boolean
	 */
	public boolean isVisible() {
		return isVisible;
	}

	/**
	 * set the group's visibility.
	 * 
	 * @param theFlag boolean
	 */
	public void setVisible(boolean theFlag) {
		isVisible = theFlag;
	}

	/**
	 * hide the group.
	 */
	public void hide() {
		isVisible = false;
	}

	/**
	 * show the group.
	 */
	public void show() {
		isVisible = true;
	}

	/**
	 * set the moveable status of the group.
	 * 
	 * @param theFlag boolean
	 */
	public void setMoveable(boolean theFlag) {
		isMoveable = theFlag;
	}

	/**
	 * check if the group is moveable.
	 * 
	 * @return boolean
	 */
	public boolean isMoveable() {
		return isMoveable;
	}

	/**
	 * 
	 * @param theFlag boolean
	 */
	public void setOpen(boolean theFlag) {
		isOpen = theFlag;
		if (_myValueLabel != null) {
			_myValueLabel.set(isOpen ? "-" : "+");
		}
	}

	/**
	 * 
	 * @return boolean
	 */
	public boolean isOpen() {
		return isOpen;
	}

	/**
	 * set the status of the group to open.
	 */
	public void open() {
		setOpen(true);
	}

	/**
	 * set the status of the group to closed.
	 */
	public void close() {
		setOpen(false);
	}

	public int getPickingColor() {
		return _myPickingColor;
	}

	/**
	 * 
	 * @return CColor
	 */
	public CColor color() {
		return color;
	}

	public CColor getColor() {
		return color;
	}

	/**
	 * !!! experimental, have to check if this spoils anything. implemented for
	 * ScrollList and MultiList to forward values to a dedicated method
	 */
	public float value() {
		return _myValue;
	}

	public String stringValue() {
		return _myStringValue;
	}

	public float[] arrayValue() {
		return _myArrayValue;
	}

	/**
	 * get a controller of the group.
	 * 
	 * @param theController String
	 * @return Controller
	 */
	public Controller controller(String theController) {
		return controlP5.controller(theController);
	}

	public Label captionLabel() {
		return _myLabel;
	}

	public Label valueLabel() {
		return _myValueLabel;
	}

	public void enableCollapse() {
		isCollapse = true;
	}

	public void disableCollapse() {
		isCollapse = false;
	}

	public boolean isCollapse() {
		return isCollapse;
	}

	public int getWidth() {
		return _myWidth;
	}

	public int getHeight() {
		return _myHeight;
	}

	public ControllerGroup setWidth(int theWidth) {
		_myWidth = theWidth;
		return this;
	}

	public ControllerGroup setHeight(int theHeight) {
		_myHeight = theHeight;
		return this;
	}

	protected boolean inside() {
		return (_myControlWindow.mouseX > position.x() + _myParent.absolutePosition().x()
				&& _myControlWindow.mouseX < position.x() + _myParent.absolutePosition().x() + _myWidth
				&& _myControlWindow.mouseY > position.y() + _myParent.absolutePosition().y() - _myHeight && _myControlWindow.mouseY < position.y()
				+ _myParent.absolutePosition().y());
	}

	/**
	 * 
	 * @return boolean
	 */
	public boolean isXMLsavable() {
		return isXMLsavable;
	}

	/**
	 * 
	 * @return ControlP5XMLElement
	 */
	public ControlP5XMLElement getAsXML() {
		ControlP5XMLElement myXMLElement = new ControlP5XMLElement(new Hashtable(), true, false);
		myXMLElement.setAttribute("name", name());
		myXMLElement.setAttribute("label", _myLabel.toString());
		myXMLElement.setAttribute("id", new Integer(id()));
		myXMLElement.setAttribute("x", new Float(position().x()));
		myXMLElement.setAttribute("y", new Float(position().y()));
		myXMLElement.setAttribute("open", new Float(isOpen == true ? 1 : 0));
		myXMLElement.setAttribute("visible", new Float(isVisible == true ? 1 : 0));
		myXMLElement.setAttribute("moveable", new Float(isMoveable == true ? 1 : 0));
		addToXMLElement(myXMLElement);
		return myXMLElement;
	}

	@Override
	public String toString() {
		return "\nname:\t" + _myName + "\n" + "label:\t" + _myLabel.getText() + "\n" + "id:\t" + _myId + "\n" + "value:\t"
				+ _myValue + "\n" + "position:\t" + position + "\n" + "absolute:\t" + absolutePosition + "\n" + "width:\t"
				+ getWidth() + "\n" + "height:\t" + getHeight() + "\n" + "color:\t" + getColor() + "\n" + "visible:\t"
				+ isVisible + "\n" + "moveable:\t" + isMoveable + "\n";
	}
}
