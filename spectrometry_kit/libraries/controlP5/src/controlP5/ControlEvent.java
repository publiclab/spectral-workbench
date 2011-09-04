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

/**
 * a controlEvent is sent to a PApplet whenever a controlP5 action has been
 * made. you can receive events from controllers and tabs. by default tab events
 * are disabled and have to be enabled with Tab.activateEvent(). for detailed
 * information see the tab documentation.
 * 
 * @example ControlP5controlEvent
 */
public class ControlEvent {

	protected final ControllerInterface _myController;

	protected boolean isTab;

	protected boolean isController;

	protected boolean isGroup;

	public static final int PRESSED = 0;
	public static final int ENTER = 1;
	public static final int LEAVE = 2;
	public static final int RELEASED = 3;
	public static final int RELEASEDOUTSIDE = 3;

	public static int UNDEFINDED = -1;
	public static int CONTROLLER = 0;
	public static int TAB = 1;
	public static int GROUP = 2;

	protected int myAction;

	/**
	 * 
	 * @param theController
	 *          Controller
	 */
	protected ControlEvent(Controller theController) {
		_myController = theController;
		isTab = false;
		isController = true;
		isGroup = false;
	}

	/**
	 * 
	 * @param theController
	 *          Controller
	 */
	public ControlEvent(Tab theController) {
		_myController = theController;
		isTab = true;
		isGroup = false;
		isController = false;
	}

	/**
	 * 
	 * @param theController
	 *          Controller
	 */
	public ControlEvent(ControllerGroup theController) {
		_myController = theController;
		isTab = false;
		isGroup = true;
		isController = false;
	}

	/**
	 * returns the value of the controller as float.
	 * 
	 * @return float
	 */
	public float value() {
		return ((Controller) _myController).value();
	}

	/**
	 * returns a string value if applicable to the controller e.g. textfield has a
	 * string value.
	 * 
	 * @return String
	 */
	public String stringValue() {
		return ((Controller) _myController).stringValue();
	}

	/**
	 * returns a float array, apllies for e.g. Range.
	 * 
	 * @return
	 */
	public float[] arrayValue() {
		return ((Controller) _myController).arrayValue();
	}

	/**
	 * returns the instance of the controller.
	 * 
	 * @return Controller Bang Button Knob Numberbox Radio Slider Textfield Toggle
	 *         MultiList Matrix
	 */
	public Controller controller() {
		return ((Controller) _myController);
	}

	/**
	 * return the tab that evoked the event.
	 * 
	 * @return Tab Tab
	 */
	public Tab tab() {
		return (Tab) _myController;
	}

	/**
	 * return the tab that evoked the event.
	 * 
	 * @return Tab Tab
	 */
	public ControlGroup group() {
		return (ControlGroup) _myController;
	}

	/**
	 * get the label of the controller that evoked the event.
	 * 
	 * @return String
	 */
	public String label() {
		return ((Controller) _myController).label();
	}

	/**
	 * check if the event was evoked by a tab.
	 * 
	 * @return boolean
	 */
	public boolean isTab() {
		return isTab;
	}

	/**
	 * check if the event was evoked by a controller.
	 * 
	 * @return boolean
	 */
	public boolean isController() {
		return isController;
	}

	/**
	 * check if the event was evoked by a controlGroup.
	 * 
	 * @return boolean
	 */
	public boolean isGroup() {
		return isGroup;
	}

	public String name() {
		return _myController.name();
	}

	public int id() {
		return _myController.id();
	}

	public int type() {
		if (isController) {
			return CONTROLLER;
		} else if (isTab) {
			return TAB;
		} else if (isGroup) {
			return GROUP;
		}
		return -1;
	}
}
