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

import java.util.ArrayList;
import java.util.List;
import processing.core.PApplet;

/**
 * scrollList, a list of selectable and scrollable items.
 * 
 * @example ControlP5listBox
 */
public class ListBox extends ControlGroup implements ControlListener {

	protected int _myItemHeight = 13;

	protected int maxButtons = 0;

	protected int _myOriginalBackgroundHeight = 0;

	protected Slider _myScrollbar;

	protected String _myName;

	protected float _myScrollValue = 0;

	protected boolean isScrollbarVisible = true;

	protected int _myHeight;

	protected List<ListBoxItem> items;

	protected List<Button> buttons;

	protected int spacing = 1;

	protected boolean isMultipleChoice = false;

	protected boolean pulldown;

	protected ListBox(
			ControlP5 theControlP5,
			ControllerGroup theGroup,
			String theName,
			int theX,
			int theY,
			int theW,
			int theH) {
		super(theControlP5, theGroup, theName, theX, theY, theW, 9);

		items = new ArrayList<ListBoxItem>();
		buttons = new ArrayList<Button>();

		_myWidth = theW;
		_myName = theName;
		_myBackgroundHeight = theH;

		_myScrollbar = new Slider(controlP5, _myParent, theName + "Scroller", 0, 1, 1, _myWidth + 1, 0, 10, _myBackgroundHeight);
		_myScrollbar.setBroadcast(false);
		_myScrollbar.setSliderMode(Slider.FLEXIBLE);
		_myScrollbar.setMoveable(false);
		_myScrollbar.setLabelVisible(false);
		_myScrollbar.setParent(this);
		_myScrollbar.addListener(this);
		_myScrollbar.setVisible(false);
		_myScrollbar.hide();
		_myScrollbar.updateDisplayMode(DEFAULT);
		add(_myScrollbar);
		
		setHeight(_myBackgroundHeight);
	}

	/**
	 * hide the scrollbar.
	 */
	public void hideScrollbar() {
		isScrollbarVisible = false;
		_myScrollbar.hide();
	}

	/**
	 * show the scrollbar.
	 */
	public void showScrollbar() {
		isScrollbarVisible = true;
		if ((items.size()) * _myItemHeight > _myBackgroundHeight && isScrollbarVisible) {
			_myScrollbar.show();
		}
	}

	/**
	 * check if the scrollbar is visible.
	 * 
	 * @return
	 */
	public boolean isScrollbarVisible() {
		return isScrollbarVisible;
	}

	/**
	 * scroll the scrollList remotely. values must range from 0 to 1.
	 * 
	 * @param theValue
	 */
	public void scroll(float theValue) {
		if ((items.size()) * _myItemHeight > _myBackgroundHeight) {
			_myScrollbar.setValue(PApplet.abs(1 - PApplet.min(PApplet.max(0, theValue), 1)));
		}
	}

	/**
	 * internal scroll updates.
	 */
	private void scroll() {
		int n = 0;
		if (buttons.size() < items.size() && isScrollbarVisible) {
			_myScrollbar.show();
			n = (int) Math.abs(_myScrollValue * (items.size() - buttons.size()));
		} else {
			_myScrollbar.hide();
		}
		for (int i = 0; i < buttons.size(); i++) {
			buttons.get(i).setColor(items.get(n + i).getColor());
			buttons.get(i).captionLabel().set((items.get(n + i)).text);
			buttons.get(i)._myValue = (items.get(n + i)).value;
		}
	}

	/**
	 * set the height of list box items.
	 * 
	 * @param theHeight
	 */
	public void setItemHeight(int theHeight) {
		_myItemHeight = theHeight;
		for (int i = 0; i < buttons.size(); i++) {
			buttons.get(i).height = theHeight;
			buttons.get(i).position.y = (theHeight + spacing) * i;
		}
		setHeight(_myOriginalBackgroundHeight);
	}

	/**
	 * set the height of the list box.
	 * 
	 * @param theHeight
	 */
	public ListBox setHeight(int theHeight) {
		_myOriginalBackgroundHeight = theHeight;

		// re-adjust the _myAdjustedListHeight variable based on height change.
		_myBackgroundHeight = (_myOriginalBackgroundHeight / (_myItemHeight + spacing)) * (_myItemHeight + spacing);
		maxButtons = _myBackgroundHeight / (_myItemHeight + spacing);

		int pn = buttons.size();
		int n = (int) (_myBackgroundHeight / (_myItemHeight + spacing));

		if (n < pn) {
			for (int i = buttons.size() - 1; i >= n; i--) {
				controlP5.remove(controlP5.controller(buttons.get(i).name()));
				controllers.remove(buttons.get(i));
				buttons.remove(i);
			}
		} else if (pn < n) { // increase size of list
			int nn = Math.min(n, items.size());
			nn -= pn;
			addListButton(nn);
		}
		updateBackground();
		scroll();
		return this;
	}
	
	private void updateScroll() {
		_myScrollValue = _myScrollbar.value();
		_myScrollbar.setValue(_myScrollValue);
		if (buttons.size() < items.size() && isScrollbarVisible) {
			_myScrollbar.show();
		}
		updateBackground();
		scroll();
	}
	
	private void updateBackground() {
		if (items.size() * (_myItemHeight + spacing) < _myOriginalBackgroundHeight) {
			_myBackgroundHeight = items.size() * (_myItemHeight + spacing);
		}
		if (buttons.size()<items.size()) {
			_myScrollbar.setHeight(_myBackgroundHeight - spacing);
			_myScrollbar.show();
		} else {
			_myScrollbar.hide();
		}
		
	}

	public ListBox setWidth(int theWidth) {
		_myWidth = theWidth;
		for (int i = 1; i < controllers.size(); i++) {
			((Button) controllers.get(i)).width = theWidth;
		}
		_myScrollbar.position.x = _myWidth + 1;
		return this;
	}

	protected void addListButton(int theNum) {
		for (int i = 0; (i < theNum) && (buttons.size() < maxButtons); i++) {
			int index = buttons.size();
			Button b = new Button(controlP5, (ControllerGroup) this, _myName + "Button" + index, index, 0, index
					* (_myItemHeight + spacing), _myWidth, _myItemHeight, false);
			b.setMoveable(false);
			add(b);
			controlP5.register(b);
			b.setBroadcast(false);
			b.addListener(this);
			buttons.add(b);
		}
		updateScroll();
	}



	/**
	 * Adds an item to the ListBox.
	 * 
	 * @see #removeItem(String,int)
	 * @param theName String
	 * @param theValue int
	 */
	public ListBoxItem addItem(String theName, int theValue) {
		ListBoxItem lbi = new ListBoxItem(this, theName, theValue);
		items.add(lbi);
		addListButton(1);
		return lbi;
	}

	/**
	 * Removes an item from the ListBox using the unique name of the item given
	 * when added to the list.
	 * 
	 * @see #addItem(String,int)
	 * @param theItemName String
	 */
	public void removeItem(String theItemName) {
		try {
			for (int i = items.size() - 1; i >= 0; i--) {
				if ((items.get(i)).name.equals(theItemName)) {
					items.remove(i);
				}
			}
			if ((buttons.size()) > items.size()) {
				String buttonName = ((Button) controllers.get(buttons.size())).name();
				buttons.remove(controlP5.controller(buttonName));
				controllers.remove(controlP5.controller(buttonName));
				controlP5.remove(buttonName);

			}
			updateScroll();
		} catch (Exception e) {
			ControlP5.logger().finer("ScrollList.removeItem exception:" + e);
		}
	}

	/**
	 * returns a listBoxItem by index in the list of items.
	 * 
	 * @param theIndex
	 * @return
	 */
	public ListBoxItem item(int theIndex) {
		return ((ListBoxItem) items.get(theIndex));
	}

	/**
	 * TODO faulty returns a listBoxItem by name.
	 * 
	 * @param theItemName
	 * @return
	 */
	public ListBoxItem item(String theItemName) {
		for (int i = items.size() - 1; i >= 0; i--) {
			if ((items.get(i)).name.equals(theItemName)) {
				return items.get(i);
			}
		}
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.ControlGroup#controlEvent(controlP5.ControlEvent)
	 */
	public void controlEvent(ControlEvent theEvent) {
		if (theEvent.controller() instanceof Button) {
			try {
				_myValue = theEvent.controller().value();
				ControlEvent myEvent = new ControlEvent(this);
				if (pulldown) {
					close();
					setLabel(theEvent.label());
				}
				controlP5.controlbroadcaster().broadcast(myEvent, ControlP5Constants.FLOAT);
				((Button) theEvent.controller()).onLeave();
				((Button) theEvent.controller()).setIsInside(false);
			} catch (Exception e) {
				ControlP5.logger().warning("ScrollList.controlEvent exception:" + e);
			}
		} else {
			_myScrollValue = -(1 - theEvent.value());
			scroll();
		}

	}

	/**
	 * Enable a ListBox to act as a pulldown menu. Alternatively use class
	 * PulldownMenu instead.
	 * 
	 * @see controlP5.PulldownMenu
	 * @param theValue
	 */
	public void actAsPulldownMenu(boolean theValue) {
		pulldown = theValue;
		if (pulldown) {
			close();
		}
	}

	/**
	 * remove all items from a list box
	 */
	public void clear() {
		for (int i = items.size() - 1; i >= 0; i--) {
			removeItem(items.get(i).name);
		}
		items.clear();
		for (int i = buttons.size() - 1; i >= 0; i--) {
			controlP5.remove(buttons.get(i));
		}
		_myBackgroundHeight = 0;
	}

	/**
	 * {@inheritDoc}
	 */
	public void setColorActive(int theColor) {
		super.setColorActive(theColor);
		for (int i = 0; i < items.size(); i++) {
			(items.get(i)).getColor().colorActive = theColor;
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public void setColorForeground(int theColor) {
		super.setColorForeground(theColor);
		for (int i = 0; i < items.size(); i++) {
			(items.get(i)).getColor().colorForeground = theColor;
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public void setColorBackground(int theColor) {
		super.setColorBackground(theColor);
		for (int i = 0; i < items.size(); i++) {
			(items.get(i)).getColor().colorBackground = theColor;
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public void setColorLabel(int theColor) {
		super.setColorLabel(theColor);
		for (int i = 0; i < items.size(); i++) {
			(items.get(i)).getColor().colorCaptionLabel = theColor;
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public void setColorValue(int theColor) {
		super.setColorValue(theColor);
		for (int i = 0; i < items.size(); i++) {
			(items.get(i)).getColor().colorValueLabel = theColor;
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.ControlGroup#addToXMLElement(controlP5.ControlP5XMLElement)
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "listBox");
	}

}
