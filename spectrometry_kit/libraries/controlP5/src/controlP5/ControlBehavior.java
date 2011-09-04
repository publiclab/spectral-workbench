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
 * control behavior is an abstract class and must be extended, update() must be
 * implemented in your custom control behavior. how to use ControlBehavior
 * please see the ControlP5behavior example in the examples folder.
 * 
 * @example ControlP5behavior
 */
public abstract class ControlBehavior {

	protected Controller _myController;

	protected float value;

	protected boolean isActive = true;

	protected void init(Controller theController) {
		_myController = theController;
	}

	/**
	 * returns the controller this behavior is connected to.
	 * 
	 * @return Controller
	 */
	public Controller controller() {
		return _myController;
	}

	protected float getValue() {
		return value;
	}

	/**
	 * set the value of the controller.
	 * 
	 * @param theValue float
	 */
	public void setValue(float theValue) {
		value = theValue;
		_myController.setValue(value);
	}

	/**
	 * get the value of the controller this behavior is connected to.
	 * 
	 * @return float
	 */

	public float value() {
		return value;
	}

	/**
	 * when extending ControlBehavior, update() has to be overwritten.
	 */
	public abstract void update();

	/**
	 * (de)activate the behavior.
	 * 
	 * @param theFlag boolean
	 */
	public void setActive(boolean theFlag) {
		isActive = theFlag;
	}

	/**
	 * check if the behavior is active or not.
	 * 
	 * @return boolean
	 */
	public boolean isActive() {
		return isActive;
	}

}
