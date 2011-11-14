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


import java.util.Hashtable;

import processing.core.PApplet;

/**
 * @shortdesc the scroll list is a list of selectable items.
 *  
 * the list has scrollbars if the visible area is too small. for a list of 
 * and the documentation for available methods see the 
 * <a href="./controllergroup_class_controllergroup.htm">ControllerGroup</a>
 * documentation.
 * 
 *  ScrollList is if type ControlGroup. when an item in a scrollList is activated,
 *  2 controlEvents will be broadcasted. the first one from the ScrollList, the second
 *  one from the button that has been pressed inside the scrollList. to avoid 
 *  an error message from controlP5, you need to check what type of item triggered the
 *  event, either a controller or a group.
 *  
 * @example ControlP5scrollList
 * @nosuperclasses Controller
 *  Controller
 *  ControlGroup
 *  ControllerGroup
 */
public class ScrollList extends ControlGroup implements ControlListener {

	/*
	 * TODO (1) add hideBar, but keep the drag-functionality when hidden. (2)
	 * add only as many buttons as possibly visible but change the label
	 * dynamically to prevent the scrolllist to create an overload of buttons.
	 * (3) problem with (2) is, that in the example the setId() would not work
	 * anymore find new solution, actually dont use Button as scroll-list-item
	 * anymore but maybe ScrollListItem. (4) reflection does not work properly.
	 *
	 * add option to hide the scroll-list area but only keep the scrollbar.
	 */

	protected int _myListHeight;
	
	protected int _myAdjustedListHeight;

	protected int _myItemHeight = 13;

	protected Slider _myScrollbar;

	protected String _myName;

	protected float _myScrollValue = 0;
	
	protected boolean isScrollbarVisible = true;
	
	protected int _myHeight;

	/**
	 * 
	 * @param theControlP5
	 *            ControlP5
	 * @param theGroup
	 *            ControllerGroup
	 * @param theName
	 *            String
	 * @param theX
	 *            int
	 * @param theY
	 *            int
	 * @param theW
	 *            int
	 * @param theH
	 *            int
	 */
	protected ScrollList(
	        ControlP5 theControlP5,
	        ControllerGroup theGroup,
	        String theName,
	        int theX,
	        int theY,
	        int theW,
	        int theH) {
		super(theControlP5, theGroup, theName, theX, theY, theW, 9);
		_myWidth = theW;
		_myListHeight = theH;
		_myAdjustedListHeight = (((int) (_myListHeight / _myItemHeight)) * _myItemHeight + 1) - 2;
		_myScrollbar = new Slider(controlP5, _myParent, theName + "Scroller", 0, 1, 1, _myWidth + 1, 0, 10,
		        _myAdjustedListHeight);
		_myName = theName;
		_myScrollbar.setBroadcast(false);
		_myScrollbar.setSliderMode(Slider.FLEXIBLE);
		_myScrollbar.setMoveable(false);
		_myScrollbar.setLabelVisible(false);
		_myScrollbar.setParent(this);
		add(_myScrollbar);
		_myScrollbar.addListener(this);
		_myScrollbar.setVisible(false);
		_myScrollbar.hide();	
	}
	
	
	public void hideScrollbar() {
		isScrollbarVisible = false;
		_myScrollbar.hide();
	}
	
	public void showScrollbar() {
		isScrollbarVisible = true;
		if ((controllers.size() - 1) * _myItemHeight > _myAdjustedListHeight && isScrollbarVisible) {
			_myScrollbar.show();
		}
	}
	
	public boolean isScrollbarVisible() {
		return isScrollbarVisible;
	}
	
	/**
	 * scroll the scrollList remotely. values must range from 0 to 1.
	 * 
	 * @param theValue
	 */
	public void scroll(
	        float theValue) {
		if ((controllers.size() - 1) * _myItemHeight > _myAdjustedListHeight) {
			_myScrollbar.setValue(PApplet.abs(1 - PApplet.min(PApplet.max(0, theValue), 1)));
		}
	}

	/**
	 * 
	 */
	private void scroll() {
		int myValue = (int) (((_myScrollValue * (((controllers.size() - 1) * _myItemHeight) - _myAdjustedListHeight)) / _myItemHeight))
		        * _myItemHeight;
		for (int i = 1; i < controllers.size(); i++) {
			controllers.get(i).position().y = (int) myValue + ((i - 1) * _myItemHeight);
			if (controllers.get(i).position().y() < 0 || controllers.get(i).position().y() > (_myAdjustedListHeight)) {
				controllers.get(i).hide();
			} else {
				controllers.get(i).show();
			}
		}
	}

	public void setItemHeight(int theHeight) {
		_myItemHeight = theHeight;
		_myAdjustedListHeight = (((int) (_myListHeight / _myItemHeight)) * _myItemHeight + 1) - 2;
		_myScrollbar.setHeight((int)_myAdjustedListHeight);
		
	}
	/**
	 * add an item to the scrollList.
	 * 
	 * @param theName
	 *            String
	 * @param theValue
	 *            int
	 * @return Button
	 */
	public Button addItem(
	        String theName,
	        int theValue) {
		int myLength = controllers.size() - 1;
		Button b = new Button(controlP5, (ControllerGroup) this, theName, theValue, 0, myLength * _myItemHeight, _myWidth,
		        _myItemHeight - 1);
		b.setMoveable(false);
		add(b);
		controlP5.register(b);
		b.addListener(this);
		_myScrollValue = _myScrollbar.value();
		_myScrollbar.setValue(_myScrollValue);
		if ((controllers.size() - 1) * _myItemHeight > _myAdjustedListHeight && isScrollbarVisible) {
			_myScrollbar.show();
		}
		scroll();
		return b;
	}

	/**
	 * remove an item from the scroll list.
	 * 
	 * @param theItemName
	 *            String
	 */
	public void removeItem(
	        String theItemName) {
		try {
			for (int i = controllers.size() - 1; i >= 0; i--) {
				if (controllers.get(i).name().equals(theItemName)) {
					((Button) controllers.get(i)).removeListener(this);
					controllers.get(i).remove();
					controllers.remove(controllers.get(i));
					if ((controllers.size() - 1) * _myItemHeight > _myAdjustedListHeight && isScrollbarVisible) {
						_myScrollValue = _myScrollbar.value();
						_myScrollbar.show();
					} else {
						_myScrollValue = 1;
						_myScrollbar.hide();
					}
					_myScrollbar.setValue(_myScrollValue);

				}
			}
		} catch (Exception e) {
				ControlP5.logger().finer("ScrollList.removeItem exception:" + e);
		}
		scroll();
	}

	/**
	 * 
	 * @param theEvent
	 *            ControlEvent
	 */
	public void controlEvent(
	        ControlEvent theEvent) {
		if (theEvent.controller() instanceof Button) {
			_myValue = theEvent.controller().value();
			ControlEvent myEvent = new ControlEvent(this);
			controlP5.controlbroadcaster().broadcast(myEvent, ControlP5Constants.FLOAT);
		} else {
			_myScrollValue = -(1 - theEvent.value());
			scroll();
		}

	}

	/**
	 * 
	 * @param theElement
	 *            ControlP5XMLElement
	 */
	public void addToXMLElement(
	        ControlP5XMLElement theElement) {
		theElement.setName("controller");
		theElement.setAttribute("type", "scrolllist");
		theElement.setAttribute("width", new Integer(_myWidth));
		theElement.setAttribute("height", new Integer(_myAdjustedListHeight + 1));
		for (int i = 1; i < controllers.size(); i++) {
			ControlP5XMLElement myXMLElement = new ControlP5XMLElement(new Hashtable(), true, false);
			myXMLElement.setName("item");
			myXMLElement.setAttribute("name", ((Controller) controllers.get(i)).name());
			myXMLElement.setAttribute("id", new Integer(((Controller) controllers.get(i)).id()));
			myXMLElement.setAttribute("value", new Float(((Controller) controllers.get(i)).value()));
			theElement.addChild(myXMLElement);
		}
	}

}
