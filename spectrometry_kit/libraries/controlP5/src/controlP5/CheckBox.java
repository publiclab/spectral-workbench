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
 * A checkBox is a multiple-choice radioButton. items are added to a checkBox
 * and can be organized in rows and columns. items of a checkBox are of type
 * Toggle.
 * 
 * @example ControlP5CheckBox
 * 
 * @see controlP5.Toggle
 * 
 */
public class CheckBox extends RadioButton {

	/**
	 * a CheckBox should only be added to controlP5 by using
	 * controlP5.addCheckBox()
	 * 
	 * @param theControlP5
	 * @param theParent
	 * @param theName
	 * @param theX
	 * @param theY
	 */
	public CheckBox(
			final ControlP5 theControlP5,
			final ControllerGroup theParent,
			final String theName,
			final int theX,
			final int theY) {
		super(theControlP5, theParent, theName, theX, theY);
		isMultipleChoice = true;
	}

	/**
	 * activate all checkBox items.
	 */
	public final void activateAll() {
		int n = _myRadioToggles.size();
		for (int i = 0; i < n; i++) {
			_myRadioToggles.get(i).activate();
		}
		updateValues();
	}

	/**
	 * activate a single checkbox item (by index);
	 */
	public final void activate(int theIndex) {
		if (theIndex < _myRadioToggles.size()) {
			_myRadioToggles.get(theIndex).activate();
			updateValues();
		}
	}

	/**
	 * deactivate a single checkbox item (by index);
	 */
	public final void deactivate(int theIndex) {
		if (theIndex < _myRadioToggles.size()) {
			_myRadioToggles.get(theIndex).deactivate();
			updateValues();
		}
	}

	/**
	 * toggle a single checkbox item (by index);
	 */
	public final void toggle(int theIndex) {
		if (theIndex < _myRadioToggles.size()) {
			Toggle t = _myRadioToggles.get(theIndex);
			if (t.getState() == true) {
				t.deactivate();
			} else {
				t.activate();
			}
			updateValues();
		}
	}
	
	/**
	 * deactivate a single checkbox item (by name);
	 */
	public final void toggle(String theRadioButtonName) {
		int n = _myRadioToggles.size();
		for (int i = 0; i < n; i++) {
			Toggle t = _myRadioToggles.get(i);
			if (theRadioButtonName.equals(t.name())) {
				if (t.getState() == true) {
					t.deactivate();
				} else {
					t.activate();
				}
				updateValues();
				return;
			}
		}
	}

	/**
	 * activate a single checkbox item (by name);
	 */
	public final void activate(String theRadioButtonName) {
		int n = _myRadioToggles.size();
		for (int i = 0; i < n; i++) {
			Toggle t = _myRadioToggles.get(i);
			if (theRadioButtonName.equals(t.name())) {
				t.activate();
				updateValues();
				return;
			}
		}
	}

	/**
	 * deactivate a single checkbox item (by name);
	 */
	public final void deactivate(String theRadioButtonName) {
		int n = _myRadioToggles.size();
		for (int i = 0; i < n; i++) {
			Toggle t = _myRadioToggles.get(i);
			if (theRadioButtonName.equals(t.name())) {
				t.deactivate();
				updateValues();
				return;
			}
		}
	}

	private final void updateValues() {
		_myValue = -1;
		updateValues(true);
	}
	
	@Override
	public String toString() {
		return "type:\tCheckBox\n"+super.toString();
	}
}
