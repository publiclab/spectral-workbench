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

import java.awt.Component;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.util.Hashtable;
import java.util.Vector;

import processing.core.PApplet;
import processing.core.PConstants;

/**
 * the purpose of a control window is to out-source controllers so that they
 * dont need to be drawn into the actual processing window. to save cpu, a
 * control window is not updated when not active - in focus. for the same reason
 * the framerate is set to 15.
 * 
 * @example ControlP5window
 */
public class ControlWindow implements MouseWheelListener {

	protected ControlP5 controlP5;

	protected int mouseX;

	protected int mouseY;

	protected int pmouseX;

	protected int pmouseY;

	protected boolean mousePressed;

	protected boolean mouselock;

	protected Controller isControllerActive;

	public int background = 0x00000000;

	protected CColor color = new CColor();

	private String _myName = "main";

	protected PApplet _myApplet;

	private boolean isPAppletWindow;

	protected ControllerList _myTabs;

	protected boolean isVisible = true;

	protected boolean isInit = false;

	protected boolean isRemove = false;

	protected CDrawable _myDrawable;

	protected boolean isAutoDraw;

	protected boolean isUpdate;

	public final static int NORMAL = PAppletWindow.NORMAL;

	public final static int ECONOMIC = PAppletWindow.ECONOMIC;

	protected Vector<ControlWindowCanvas> _myControlWindowCanvas;

	protected Vector<ControlCanvas> _myControlCanvas;

	protected boolean isMouseOver;

	protected boolean isDrawBackground = true;

	protected boolean isUndecorated = false;

	protected boolean is3D;

	protected CVector3f autoPosition = new CVector3f(10, 30, 0);

	protected float tempAutoPositionHeight = 0;

	protected ControlPicking _myPicking;

	protected boolean rendererNotification = false;

	/**
	 * 
	 * @param theControlP5 ControlP5
	 * @param theApplet PApplet
	 */
	public ControlWindow(final ControlP5 theControlP5, final PApplet theApplet) {
		controlP5 = theControlP5;
		_myApplet = theApplet;
		_myApplet.registerMouseEvent(this);
		_myApplet.addMouseWheelListener(this);
		isAutoDraw = true;
		init();
	}

	protected void init() {
		String myRenderer = _myApplet.g.getClass().toString().toLowerCase();
		is3D = (myRenderer.contains("gl") || myRenderer.contains("3d"));

		_myPicking = new ControlPicking(this);

		_myTabs = new ControllerList();
		_myControlWindowCanvas = new Vector<ControlWindowCanvas>();
		_myControlCanvas = new Vector<ControlCanvas>();

		// TODO next section conflicts with Android
		if (_myApplet instanceof PAppletWindow) {
			_myName = ((PAppletWindow) _myApplet).name();
			isPAppletWindow = true;
			((PAppletWindow) _myApplet).setControlWindow(this);
		}

		if (isPAppletWindow) {
			background = 0xff000000;
		}

		if (isInit == false) {
			// TODO next section conflicts with Android
			if (_myApplet instanceof PAppletWindow) {
				_myApplet.registerKeyEvent(new ControlWindowKeyListener(this));
			} else {
				ControlP5.keyHandler.update(this);
			}
		}

		_myTabs.add(new Tab(controlP5, this, "global"));
		_myTabs.add(new Tab(controlP5, this, "default"));

		activateTab((Tab) _myTabs.get(1));

		/*
		 * register a post event that will be called by processing after the draw
		 * method has been finished.
		 */

		if (_myApplet.g.getClass().getName().indexOf("PGraphics2D") > -1
				|| _myApplet.g.getClass().getName().indexOf("PGraphics3D") > -1) {
			if (rendererNotification == false) {
				ControlP5.logger().info("You are using renderer " + _myApplet.g.getClass().getName() + ".\n"
						+ "In order to render controlP5 elements you need to call the ControlP5's draw() manually.\n"
						+ "Suggestion is to put controlP5.draw(); at the bottom of the draw function of your sketch.");
				rendererNotification = true;
			}
		} else {
			if (isInit == false) {
				_myApplet.registerPre(this);
				// _myApplet.registerPost(this);
				_myApplet.registerDraw(this);
			}
		}
		isInit = true;
	}

	/**
	 * get the current active tab of a control window.
	 * 
	 * @return Tab
	 */
	public Tab currentTab() {
		for (int i = 1; i < _myTabs.size(); i++) {
			if (((Tab) _myTabs.get(i)).isActive()) {
				return (Tab) _myTabs.get(i);
			}
		}
		return null;
	}

	/**
	 * activate a tab of a control window.
	 * 
	 * @param theTab String
	 */
	public void activateTab(String theTab) {
		for (int i = 1; i < _myTabs.size(); i++) {
			if (((Tab) _myTabs.get(i)).name().equals(theTab)) {
				activateTab((Tab) _myTabs.get(i));
			}
		}
	}

	/**
	 * remove a tab from a control window.
	 * 
	 * @param theTab Tab
	 */
	public void removeTab(Tab theTab) {
		_myTabs.remove(theTab);
	}

	/**
	 * add a tab to the control window.
	 * 
	 * @param theTab Tab
	 * @return Tab
	 */
	public Tab add(Tab theTab) {
		_myTabs.add(theTab);
		return theTab;
	}

	public Tab addTab(String theTab) {
		return tab(theTab);
	}

	/**
	 * 
	 * @param theTab Tab
	 */
	protected void activateTab(Tab theTab) {
		for (int i = 1; i < _myTabs.size(); i++) {
			if (_myTabs.get(i) == theTab) {
				((Tab) _myTabs.get(i)).setActive(true);
			} else {
				((Tab) _myTabs.get(i)).setActive(false);
			}
		}
	}

	/**
	 * 
	 * @return ControllerList
	 */
	public ControllerList tabs() {
		return _myTabs;
	}

	/**
	 * get a tab by name of a control window
	 * 
	 * @param theTabName String
	 * @return Tab
	 */
	public Tab tab(String theTabName) {
		return controlP5.tab(this, theTabName);
	}

	/**
	 * remove a control window from controlP5.
	 */
	public void remove() {
		for (int i = _myTabs.size() - 1; i >= 0; i--) {
			((Tab) _myTabs.get(i)).remove();
		}
		_myTabs.clear();
		_myTabs.clearDrawable();
		controlP5.controlWindowList.remove(this);
	}

	/**
	 * clear the control window, delete all controllers from a control window.
	 */
	public void clear() {
		remove();
		if (_myApplet instanceof PAppletWindow) {
			_myApplet.unregisterMouseEvent(this);
			_myApplet.removeMouseWheelListener(this);
			_myApplet.stop();
			((PAppletWindow) _myApplet).dispose();
			_myApplet = null;
			System.gc();
		}
	}

	protected void updateFont(ControlFont theControlFont) {
		for (int i = 0; i < _myTabs.size(); i++) {
			((Tab) _myTabs.get(i)).updateFont(theControlFont);
		}
	}

	/**
	 * 
	 */
	public void updateEvents() {
		isMouseOver = false;
		if (_myTabs.size() <= 0) {
			return;
		}
		((ControllerInterface) _myTabs.get(0)).updateEvents();
		for (int i = 1; i < _myTabs.size(); i++) {
			((Tab) _myTabs.get(i)).continuousUpdateEvents();
			if (((Tab) _myTabs.get(i)).isActive() && ((Tab) _myTabs.get(i)).isVisible()) {
				((ControllerInterface) _myTabs.get(i)).updateEvents();
			}
		}
	}

	/**
	 * returns true if the mouse is inside a controller. !!! doesnt work for
	 * groups yet.
	 * 
	 * @return
	 */
	public boolean isMouseOver() {
		// TODO doesnt work for groups yet, implement.
		return isMouseOver;
	}

	/**
	 * update all controllers contained in the control window if update is
	 * enabled.
	 */
	public void update() {
		((ControllerInterface) _myTabs.get(0)).update();
		for (int i = 1; i < _myTabs.size(); i++) {
			((Tab) _myTabs.get(i)).update();
		}
	}

	/**
	 * enable or disable the update function of a control window.
	 * 
	 * @param theFlag boolean
	 */
	public void setUpdate(boolean theFlag) {
		isUpdate = theFlag;
		for (int i = 0; i < _myTabs.size(); i++) {
			((ControllerInterface) _myTabs.get(i)).setUpdate(theFlag);
		}
	}

	/**
	 * check the update status of a control window.
	 * 
	 * @return boolean
	 */
	public boolean isUpdate() {
		return isUpdate;
	}

	public void addCanvas(ControlWindowCanvas theCanvas) {
		_myControlWindowCanvas.add(theCanvas);
		theCanvas.setControlWindow(this);
	}

	public void removeCanvas(ControlWindowCanvas theCanvas) {
		_myControlWindowCanvas.remove(theCanvas);
	}

	/**
	 * 
	 */
	public void pre() {
		if (isVisible) {
			if (isPAppletWindow) {
				if (isDrawBackground) {
					_myApplet.background(background);
				}
			}
		}
	}

	/**
	 * 
	 */
	public void draw() {
		if (controlP5.blockDraw == false) {

			_myPicking.reset();

			updateEvents();
			if (isVisible) {

				// TODO save stroke, noStroke, fill, noFill, strokeWeight
				// parameters and restore after drawing controlP5 elements.

				int myRectMode = _myApplet.g.rectMode;
				int myEllipseMode = _myApplet.g.ellipseMode;
				int myImageMode = _myApplet.g.imageMode;

				_myApplet.rectMode(PConstants.CORNER);
				_myApplet.ellipseMode(PConstants.CORNER);
				_myApplet.imageMode(PConstants.CORNER);
				
			// TODO next section conflicts with Android
				if (isPAppletWindow) {
					_myApplet.background(background);
				}
				
				if (_myDrawable != null) {
					_myDrawable.draw(_myApplet);
				}

				for (int i = 0; i < _myControlWindowCanvas.size(); i++) {
					if ((_myControlWindowCanvas.get(i)).mode() == ControlWindowCanvas.PRE) {
						(_myControlWindowCanvas.get(i)).draw(_myApplet);
					}
				}

				

				_myApplet.noStroke();
				_myApplet.noFill();
				int myOffsetX = 0;
				int myOffsetY = 0;
				int myHeight = 0;			
				if (_myTabs.size() > 0) {
					for (int i = 1; i < _myTabs.size(); i++) {
						if (((Tab) _myTabs.get(i)).isVisible()) {
							if (myHeight < ((Tab) _myTabs.get(i)).height()) {
								myHeight = ((Tab) _myTabs.get(i)).height();
							}
							if (myOffsetX > component().getWidth() - ((Tab) _myTabs.get(i)).width()) {
								myOffsetY += myHeight + 1;
								myOffsetX = 0;
								myHeight = 0;
							}

							((Tab) _myTabs.get(i)).setOffset(myOffsetX, myOffsetY);
							if (((Tab) _myTabs.get(i)).updateLabel()) {
								((Tab) _myTabs.get(i)).drawLabel(_myApplet);
							}
							if (((Tab) _myTabs.get(i)).isActive()) {
								((Tab) _myTabs.get(i)).draw(_myApplet);
							}
							myOffsetX += ((Tab) _myTabs.get(i)).width();
						}
					}
					((ControllerInterface) _myTabs.get(0)).draw(_myApplet);
				}
				for (int i = 0; i < _myControlWindowCanvas.size(); i++) {
					if ((_myControlWindowCanvas.get(i)).mode() == ControlWindowCanvas.POST) {
						(_myControlWindowCanvas.get(i)).draw(_myApplet);
					}
				}

				pmouseX = mouseX;
				pmouseY = mouseY;
				_myApplet.rectMode(myRectMode);
				_myApplet.ellipseMode(myEllipseMode);
				_myApplet.imageMode(myImageMode);

			}
		}
		_myPicking.display(_myApplet);

	}

	/**
	 * 
	 * @param theDrawable CDrawable
	 */
	public void setContext(CDrawable theDrawable) {
		_myDrawable = theDrawable;
	}

	/**
	 * get the name of the control window.
	 * 
	 * @return String
	 */
	public String name() {
		return _myName;
	}

	/**
	 * 
	 * @param theMouseEvent MouseEvent
	 */
	public void mouseEvent(MouseEvent theMouseEvent) {
		mouseX = theMouseEvent.getX();
		mouseY = theMouseEvent.getY();
		if (isVisible) {
			if (theMouseEvent.getID() == MouseEvent.MOUSE_PRESSED) {
				mousePressed = true;
				for (int i = 0; i < _myTabs.size(); i++) {
					if (((ControllerInterface) _myTabs.get(i)).setMousePressed(true)) {
						mouselock = true;
						return;
					}
				}

			}
			if (theMouseEvent.getID() == MouseEvent.MOUSE_RELEASED) {
				mousePressed = false;
				mouselock = false;
				for (int i = 0; i < _myTabs.size(); i++) {
					((ControllerInterface) _myTabs.get(i)).setMousePressed(false);
				}
			}
		}
	}

	public void mouseWheelMoved(MouseWheelEvent e) {
		String message;
		int notches = e.getWheelRotation();
		if (notches < 0) {
			message = "Mouse wheel moved UP " + -notches + " notch";
		} else {
			message = "Mouse wheel moved DOWN " + notches + " notch";
		}
	}

	public void multitouch(int[][] theCoordinates) {
		for (int n = 0; n < theCoordinates.length; n++) {
			mouseX = theCoordinates[n][0];
			mouseY = theCoordinates[n][1];
			if (isVisible) {
				if (theCoordinates[n][2] == MouseEvent.MOUSE_PRESSED) {
					mousePressed = true;
					for (int i = 0; i < _myTabs.size(); i++) {
						if (((ControllerInterface) _myTabs.get(i)).setMousePressed(true)) {
							mouselock = true;
							ControlP5.logger().finer(" mouselock = " + mouselock);
							return;
						}
					}

				}
				if (theCoordinates[n][2] == MouseEvent.MOUSE_RELEASED) {
					mousePressed = false;
					mouselock = false;
					for (int i = 0; i < _myTabs.size(); i++) {
						((ControllerInterface) _myTabs.get(i)).setMousePressed(false);
					}
				}
			}
		}
	}

	public boolean isMousePressed() {
		return mousePressed;
	}

	/**
	 * 
	 * @param theKeyEvent KeyEvent
	 */
	public void keyEvent(KeyEvent theKeyEvent) {
		for (int i = 0; i < _myTabs.size(); i++) {
			((ControllerInterface) _myTabs.get(i)).keyEvent(theKeyEvent);
		}
	}

	/**
	 * set the color for the controller while active.
	 * 
	 * 
	 * @param theColor int
	 */
	public void setColorActive(int theColor) {
		color.colorActive = theColor;
		for (int i = 0; i < tabs().size(); i++) {
			((Tab) tabs().get(i)).setColorActive(theColor);
		}
	}

	/**
	 * set the foreground color of the controller.
	 * 
	 * 
	 * @param theColor int
	 */
	public void setColorForeground(int theColor) {
		color.colorForeground = theColor;
		for (int i = 0; i < tabs().size(); i++) {
			((Tab) tabs().get(i)).setColorForeground(theColor);
		}
	}

	/**
	 * set the background color of the controller.
	 * 
	 * 
	 * @param theColor int
	 */
	public void setColorBackground(int theColor) {
		color.colorBackground = theColor;
		for (int i = 0; i < tabs().size(); i++) {
			((Tab) tabs().get(i)).setColorBackground(theColor);
		}
	}

	/**
	 * set the color of the text label of the controller.
	 * 
	 * 
	 * @param theColor int
	 */
	public void setColorLabel(int theColor) {
		color.colorCaptionLabel = theColor;
		for (int i = 0; i < tabs().size(); i++) {
			((Tab) tabs().get(i)).setColorLabel(theColor);
		}
	}

	/**
	 * set the color of the values.
	 * 
	 * @param theColor int
	 */
	public void setColorValue(int theColor) {
		color.colorValueLabel = theColor;
		for (int i = 0; i < tabs().size(); i++) {
			((Tab) tabs().get(i)).setColorValue(theColor);
		}
	}

	/**
	 * set the background color of the control window.
	 * 
	 * @param theValue int
	 */
	public void setBackground(int theValue) {
		background = theValue;
	}

	/**
	 * get the papplet instance of the ControlWindow.
	 * 
	 * 
	 * @return PApplet
	 */
	public PApplet papplet() {
		return _myApplet;
	}

	public Component component() {
		return papplet();
	}

	/**
	 * set the title of a control window. only applies to control windows of type
	 * PAppletWindow.
	 */
	public void setTitle(String theTitle) {
		if (_myApplet instanceof PAppletWindow) {
			((PAppletWindow) _myApplet).setTitle(theTitle);
		}
	}

	/**
	 * shows the xy coordinates displayed in the title of a control window. only
	 * applies to control windows of type PAppletWindow.
	 * 
	 * @param theFlag
	 */
	public void showCoordinates() {
		if (_myApplet instanceof PAppletWindow) {
			((PAppletWindow) _myApplet).showCoordinates();
		}
	}

	/**
	 * hide the xy coordinates displayed in the title of a control window. only
	 * applies to control windows of type PAppletWindow.
	 * 
	 * @param theFlag
	 */
	public void hideCoordinates() {
		if (_myApplet instanceof PAppletWindow) {
			((PAppletWindow) _myApplet).hideCoordinates();
		}
	}

	/**
	 * hide the controllers and tabs of the ControlWindow.
	 */
	public void hide() {
		isVisible = false;
		if (isPAppletWindow) {
			((PAppletWindow) _myApplet).visible(false);
		}
	}

	/**
	 * @deprecated
	 * @param theMode
	 */
	public void setMode(int theMode) {
		setUpdateMode(theMode);
	}

	/**
	 * set the draw mode of a control window. a separate control window is only
	 * updated when in focus. to update the context of the window continuously,
	 * use yourControlWindow.setUpdateMode(ControlWindow.NORMAL); otherwise use
	 * yourControlWindow.setUpdateMode(ControlWindow.ECONOMIC); for an economic,
	 * less cpu intensive update.
	 * 
	 * @param theMode
	 */
	public void setUpdateMode(int theMode) {
		if (isPAppletWindow) {
			((PAppletWindow) _myApplet).setMode(theMode);
		}
	}

	/**
	 * set the frame rate of the control window.
	 * 
	 * @param theFrameRate
	 */
	public void frameRate(int theFrameRate) {
		_myApplet.frameRate(theFrameRate);
	}

	/**
	 * show the controllers and tabs of the ControlWindow.
	 */
	public void show() {
		isVisible = true;
		if (isPAppletWindow) {
			((PAppletWindow) _myApplet).visible(true);
		}

	}

	/**
	 * by default the background of a controlWindow is filled with a backgorund
	 * color every frame. to enable or disable the background from drawing, use
	 * setDrawBackgorund(true/false).
	 * 
	 * @param theFlag
	 */
	public void setDrawBackground(boolean theFlag) {
		isDrawBackground = theFlag;
	}

	/**
	 * returns a boolean indicating if the background is drawn automatically or
	 * not.
	 * 
	 * @return
	 */
	public boolean isDrawBackground() {
		return isDrawBackground;
	}

	/**
	 * check if the content of the control window is visible.
	 * 
	 * @return boolean
	 */
	public boolean isVisible() {
		return isVisible;
	}

	protected boolean isControllerActive(Controller theController) {
		if (isControllerActive == null) {
			return false;
		}
		return isControllerActive.equals(theController);
	}

	protected void setControllerActive(Controller theController) {
		isControllerActive = theController;
	}

	public void toggleUndecorated() {
		setUndecorated(!isUndecorated());
	}

	public void setUndecorated(boolean theFlag) {
		if (theFlag != isUndecorated()) {
			isUndecorated = theFlag;
			_myApplet.frame.removeNotify();
			_myApplet.frame.setUndecorated(isUndecorated);
			_myApplet.setSize(_myApplet.width, _myApplet.height);
			_myApplet.setBounds(0, 0, _myApplet.width, _myApplet.height);
			_myApplet.frame.setSize(_myApplet.width, _myApplet.height);
			_myApplet.frame.addNotify();
		}
	}

	public boolean isUndecorated() {
		return isUndecorated;
	}

	public void setLocation(int theX, int theY) {
		_myApplet.frame.setLocation(theX, theY);
	}

	protected ControlP5XMLElement getAsXML() {
		ControlP5XMLElement myXMLElement = new ControlP5XMLElement(new Hashtable(), true, false);
		myXMLElement.setName("window");
		myXMLElement.setAttribute("class", _myApplet.getClass().getName());
		myXMLElement.setAttribute("name", name());
		myXMLElement.setAttribute("width", "" + _myApplet.width);
		myXMLElement.setAttribute("height", "" + _myApplet.height);
		myXMLElement.setAttribute("background", ControlP5IOHandler.intToString(background));
		if (_myApplet.getClass().getName().indexOf("controlP5.PAppletWindow") != -1) {
			myXMLElement.setAttribute("x", "" + ((PAppletWindow) _myApplet).x);
			myXMLElement.setAttribute("y", "" + ((PAppletWindow) _myApplet).y);
		}
		return myXMLElement;
	}

}
