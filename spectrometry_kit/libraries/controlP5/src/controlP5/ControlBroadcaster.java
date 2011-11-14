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

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;

public class ControlBroadcaster {

	private int _myControlEventType = ControlP5Constants.INVALID;

	private ControllerPlug _myControlEventPlug = null;

	private ControlP5 _myControlP5;

	private String _myEventMethod = "controlEvent";
	
	private ArrayList<ControlListener> _myControlListeners;
	

	protected ControlBroadcaster(ControlP5 theControlP5) {
		_myControlP5 = theControlP5;
		_myControlListeners = new ArrayList<ControlListener>();
		_myControlEventPlug = checkObject(ControlP5.papplet, getEventMethod(), new Class[] { ControlEvent.class });
		if (_myControlEventPlug != null) {
			_myControlEventType = ControlP5Constants.METHOD;
		}
	}
	
	public void addListener(ControlListener theListener) {
		_myControlListeners.add(theListener);
	}
	
	public void removeListener(ControlListener theListener) {
		_myControlListeners.remove(theListener);
	}
	
	public ControlListener getListener(int theIndex) {
		if(theIndex<0 || theIndex>=_myControlListeners.size()) {
			return null;
		} 
		return _myControlListeners.get(theIndex);
	}
	
	public int listenerSize() {
		return _myControlListeners.size();
	}

	@Deprecated
	public void plug(final String theControllerName, final String theTargetMethod) {
		plug(ControlP5.papplet, theControllerName, theTargetMethod);
	}

	public void plug(Object theObject, final String theControllerName, final String theTargetMethod) {
		plug(theObject, _myControlP5.controller(theControllerName), theTargetMethod);
	}

	public void plug(Object theObject, final Controller theController, final String theTargetMethod) {
		if (theController != null) {
			ControllerPlug myControllerPlug = checkObject(theObject, theTargetMethod, ControlP5Constants.acceptClassList);
			if (myControllerPlug == null) {
				return;
			} else {
				if (theController.checkControllerPlug(myControllerPlug) == false) {
					theController.addControllerPlug(myControllerPlug);
				}
				return;
			}
		}
	}

	/**
	 * TODO parameterCheck erweitern.
	 * 
	 */
	protected static ControllerPlug checkObject(
			final Object theObject,
			final String theTargetName,
			final Class<?>[] theAcceptClassList) {
		Class<?> myClass = theObject.getClass();
		Method[] myMethods = myClass.getDeclaredMethods();
		for (int i = 0; i < myMethods.length; i++) {
			if ((myMethods[i].getName()).equals(theTargetName)) {
				if (myMethods[i].getParameterTypes().length == 1) {
					if (myMethods[i].getParameterTypes()[0] == ControlP5Constants.controlEventClass) {
						return new ControllerPlug(theObject, theTargetName, ControlP5Constants.EVENT, -1, null);
					}
					for (int j = 0; j < theAcceptClassList.length; j++) {
						if (myMethods[i].getParameterTypes()[0] == theAcceptClassList[j]) {
							return new ControllerPlug(theObject, theTargetName, ControlP5Constants.METHOD, j, theAcceptClassList);
						}
					}
				} else if (myMethods[i].getParameterTypes().length == 0) {
					return new ControllerPlug(theObject, theTargetName, ControlP5Constants.METHOD, -1, theAcceptClassList);
				}
				break;
			}
		}
		Field[] myFields = myClass.getDeclaredFields();
		for (int i = 0; i < myFields.length; i++) {
			if ((myFields[i].getName()).equals(theTargetName)) {
				for (int j = 0; j < theAcceptClassList.length; j++) {
					if (myFields[i].getType() == theAcceptClassList[j]) {
						return new ControllerPlug(theObject, theTargetName, ControlP5Constants.FIELD, j, theAcceptClassList);
					}
				}
				break;
			}
		}
		return null;
	}

	public void broadcast(final ControlEvent theControlEvent, final int theType) {
		for(ControlListener cl:_myControlListeners) {
			cl.controlEvent(theControlEvent);
		}
		if (theControlEvent.isTab() == false && theControlEvent.isGroup() == false) {
			if (theControlEvent.controller().getControllerPlugList().size() > 0) {
				if (theType == ControlP5Constants.STRING) {
					for (ControllerPlug cp : theControlEvent.controller().getControllerPlugList()) {
						callTarget(cp, theControlEvent.stringValue());
					}
				} else if (theType == ControlP5Constants.ARRAY) {

				} else {
					for (ControllerPlug cp : theControlEvent.controller().getControllerPlugList()) {
						if (cp.checkType(ControlP5Constants.EVENT)) {
							invokeMethod(cp.object(), cp.getMethod(), new Object[] { theControlEvent });
						} else {
							callTarget(cp, theControlEvent.value());
						}
					}
				}
			}
		}
		if (_myControlEventType == ControlP5Constants.METHOD) {
			invokeMethod(_myControlEventPlug.object(), _myControlEventPlug.getMethod(), new Object[] { theControlEvent });
		}

	}

	/**
	 * 
	 * @param theName String
	 * @param theValue float
	 */
	protected void callTarget(final ControllerPlug thePlug, final float theValue) {
		if (thePlug.checkType(ControlP5Constants.METHOD)) {
			invokeMethod(thePlug.object(), thePlug.getMethod(), thePlug.getMethodParameter(theValue));
		} else if (thePlug.checkType(ControlP5Constants.FIELD)) {
			invokeField(thePlug.object(), thePlug.getField(), thePlug.getFieldParameter(theValue));
		}

	}

	/**
	 * 
	 * @param theName String
	 * @param theValue String
	 */
	protected void callTarget(final ControllerPlug thePlug, final String theValue) {
		if (thePlug.checkType(ControlP5Constants.METHOD)) {
			invokeMethod(thePlug.object(), thePlug.getMethod(), new Object[] { theValue });
		} else if (thePlug.checkType(ControlP5Constants.FIELD)) {
			invokeField(thePlug.object(), thePlug.getField(), theValue);
		}
	}

	/**
	 * 
	 * @param theObject Object
	 * @param theField Field
	 * @param theParam Object
	 */
	private void invokeField(final Object theObject, final Field theField, final Object theParam) {
		try {
			theField.set(theObject, theParam);
		} catch (IllegalAccessException e) {
			ControlP5.logger().warning(e.toString());
		}
	}

	/**
	 * 
	 * @param theObject Object
	 * @param theMethod Method
	 * @param theParam Object[]
	 */
	private void invokeMethod(final Object theObject, final Method theMethod, final Object[] theParam) {
		try {
			if (theParam[0] == null) {
				theMethod.invoke(theObject, new Object[0]);
			} else {
				theMethod.invoke(theObject, theParam);
			}
		} catch (IllegalArgumentException e) {
			ControlP5.logger().warning(e.toString());
			/**
			 * TODO thrown when plugging a String method/field.
			 */
		} catch (IllegalAccessException e) {
			printMethodError(theMethod, e);
		} catch (InvocationTargetException e) {
			printMethodError(theMethod, e);
		} catch (NullPointerException e) {
			printMethodError(theMethod, e);
		}

	}

	protected String getEventMethod() {
		return _myEventMethod;
	}

	/**
	 * 
	 * @param theMethod Method
	 * @param theException Exception
	 */
	private void printMethodError(Method theMethod, Exception theException) {
		ControlP5.logger().severe("An error occured while forwarding a Controller value\n "
				+ "to a method in your program. Please check your code for any \n"
				+ "possible errors that might occur in this method .\n "
				+ "e.g. check for casting errors, possible nullpointers, array overflows ... .\n" + "method: "
				+ theMethod.getName() + "\n" + "exception:  " + theException);
	}

}
