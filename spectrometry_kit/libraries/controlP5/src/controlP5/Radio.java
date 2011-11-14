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
import java.util.Hashtable;
import processing.core.PApplet;

/**
 * 
 * @deprecated use RadioButton or CheckBox instead
 *  ControlP5
 *  Bang
 *  Button
 *  Knob
 *  Numberbox
 *  Radio
 *  Slider
 *  Tab
 *  Textfield
 *  Toggle
 * 
 * @example ControlP5radio
 * @nosuperclasses Controller
 *  Controller
 */
public class Radio extends Controller {
	
	ArrayList<RadioToggle> _myRadioButtons;

	private int myLineSpacing = 14;

	int labelOffsetX = 14;

	int labelOffsetY = 2;

	CVector3f _myMousePosition = new CVector3f();

	RadioToggle _myCurrentRadioButton;

	int _myRadioButtonWidth = 10;

	int _myRadioButtonHeight = 10;

	boolean isSetupLocked = false;

	int _myHeight;

	int _myWidth;
	
	public int defaultValue = -1;
	
	boolean isDeactivateAll = false;
	/**
	 * 
	 * @param theControlP5
	 *            ControlP5
	 * @param theParent
	 *            ControllerGroup
	 * @param theName
	 *            String
	 * @param theX
	 *            float
	 * @param theY
	 *            float
	 */
	public Radio(
	        ControlP5 theControlP5,
	        ControllerGroup theParent,
	        String theName,
	        float theX,
	        float theY) {
		super(theControlP5, theParent, theName, theX, theY, 30, 30);
		_myRadioButtons = new ArrayList<RadioToggle>();
	}

	public Radio(
	        ControlP5 theControlP5,
	        ControllerGroup theParent,
	        String theName,
	        float theX,
	        float theY,
	        int theWidth,
	        int theHeight,
	        int theLineSpacing) {
		super(theControlP5, theParent, theName, theX, theY, 30, 30);
		_myRadioButtons = new ArrayList<RadioToggle>();
		myLineSpacing = theLineSpacing;
		_myRadioButtonWidth = theWidth;
		_myRadioButtonHeight = theHeight;
		labelOffsetX = _myRadioButtonWidth + 4;
	}

	/**
	 * @deprecated
	 * 
	 * @param theLabel
	 *            String
	 * @param theValue
	 *            int
	 * @return RadioButton
	 */
	public RadioToggle add(
	        final String theLabel,
	        final int theValue) {
		return addItem(theLabel, theValue);
	}

	/**
	 * add a new radio button item.
	 * 
	 * @param theLabel
	 *            String
	 * @param theValue
	 *            int
	 */
	public RadioToggle addItem(
	        final String theLabel,
	        final int theValue) {
		RadioToggle myRadioButton = new RadioToggle(0, _myRadioButtons.size() * myLineSpacing, theLabel, theValue);
		_myRadioButtons.add(myRadioButton);
		getDimensions();
		if (_myRadioButtons.size() == 1 && isDeactivateAll==false) {
			activate(myRadioButton.name());
		}
		return myRadioButton;
	}

	public void removeItem(
	        String theName) {
		for (int i = _myRadioButtons.size() - 1; i >= 0; i--) {
			if (((RadioToggle) _myRadioButtons.get(i)).name().equals(theName)) {
				_myRadioButtons.remove(i);
				for (int j = i; j < _myRadioButtons.size(); j++) {
					((RadioToggle) _myRadioButtons.get(j))._myY -= myLineSpacing;
				}
				return;
			}
		}
	}

	private void getDimensions() {
		int myWidth = 0;
		for (int i = 0; i < _myRadioButtons.size(); i++) {
			int myRadioButtonWidth = ((RadioToggle) _myRadioButtons.get(i)).label.width() + labelOffsetX;
			myWidth = (myRadioButtonWidth > myWidth) ? myRadioButtonWidth : myWidth;
		}
		width = myWidth;
		height = _myRadioButtons.size() * myLineSpacing;
	}

	/**
	 * 
	 * @param theApplet
	 *            PApplet
	 */
	public void draw(
	        PApplet theApplet) {
		theApplet.pushMatrix();
		theApplet.translate(position.x(), position.y());
		for (int i = 0; i < _myRadioButtons.size(); i++) {
			((RadioToggle) _myRadioButtons.get(i)).updateInternalEvents(theApplet);
			((RadioToggle) _myRadioButtons.get(i)).draw(theApplet);
		}
		theApplet.popMatrix();
	}
	
	
	/**
	 * set the default value of a Radio controller, in case no radio button is
	 * selected.
	 * 
	 * @param theValue
	 */
	public void setDefaultValue(int theValue) {
		defaultValue = theValue;
	}
	
	
	
	/**
	 * 
	 * @param theValue
	 *            float
	 */
	public void setValue(
	        float theValue) {
		for (int i = 0; i < _myRadioButtons.size(); i++) {
			RadioToggle myRadioButton = ((RadioToggle) _myRadioButtons.get(i));
			if (myRadioButton.value == theValue) {
				myRadioButton.activate();
				current(myRadioButton);
			} else {
				myRadioButton.deactivate();
			}
		}
		_myValue = theValue;
		broadcast(FLOAT);
	}

	public void update() {
		setValue(_myValue);
	}

	/**
	 * set current radio button.
	 * 
	 * @param theRadioButton
	 *            RadioButton
	 */
	public void current(
	        RadioToggle theRadioButton) {
		_myCurrentRadioButton = theRadioButton;
	}

	/**
	 * get current radio button.
	 * 
	 * @return RadioButton
	 */
	public RadioToggle current() {
		return _myCurrentRadioButton;
	}

	/**
	 * activate a radio button by name.
	 * 
	 * @param theRadioButtonLabel
	 *            String
	 */
	public void activate(
	        String theRadioButtonName) {
		for (int i = 0; i < _myRadioButtons.size(); i++) {
			RadioToggle myRadioButton = ((RadioToggle) _myRadioButtons.get(i));
			if (theRadioButtonName.equals(myRadioButton.name())) {
				setValue(myRadioButton.value);
				return;
			}
		}
	}
	
	/**
	 * deactivate a RadioButton and set the value of the radio controller to
	 * the default value.
	 * 
	 * @param theRadioButtonName
	 */
	public void deactivate(String theRadioButtonName) {
		for (int i = 0; i < _myRadioButtons.size(); i++) {
			RadioToggle myRadioButton = ((RadioToggle) _myRadioButtons.get(i));
			if (theRadioButtonName.equals(myRadioButton.name())) {
				myRadioButton.deactivate();
				current(null);
				setValue(defaultValue);
				return;
			}
		}
	}
	
	public void deactivateAll() {
		for (int i = 0; i < _myRadioButtons.size(); i++) {
			RadioToggle myRadioButton = ((RadioToggle) _myRadioButtons.get(i));
			myRadioButton.deactivate();
		}
		current(null);
		setValue(defaultValue);
		isDeactivateAll = true;
	}

	public void setColorBackground(int theColor) {
		color.colorBackground = theColor;
	}

	public void setColorForeground(int theColor) {
		color.colorForeground = theColor;
	}
	
	public void setColorLabel(int theColor) {
		color.colorCaptionLabel = theColor;
		for (int i = 0; i < _myRadioButtons.size(); i++) {
			RadioToggle myRadioButton = ((RadioToggle) _myRadioButtons.get(i));
			myRadioButton.label.set(myRadioButton.label.toString(), color.colorCaptionLabel);
		}
	}

	public void setColorActive(int theColor) {
		color.colorActive = theColor;
	}

	/**
	 * 
	 * @param theElement
	 *            ControlP5XMLElement
	 */
	public void addToXMLElement(
	        ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "radio");
		for (int i = 0; i < _myRadioButtons.size(); i++) {
			theElement.addChild(((RadioToggle) _myRadioButtons.get(i)).getAsXML());
		}
	}

	class RadioToggle {

		int _myX, _myY;

		Label label;

		int value;

		int _myId = -1;

		boolean isActive;

		RadioToggle(
		        final int theX,
		        final int theY,
		        final String theLabel,
		        final int theValue) {
			_myX = theX;
			_myY = theY;
			label = new Label(theLabel);
			label.setColor(color.colorCaptionLabel);
			value = theValue;
		}

		public String name() {
			return label.toString();
		}

		public int id() {
			return _myId;
		}

		public void setId(
		        int theId) {
			_myId = theId;
		}

		protected void deactivate() {
			isActive = false;
		}

		protected void activate() {
			isActive = true;
		}

		/**
		 * @see ControllerInterfalce.updateInternalEvents
		 */
		public void updateInternalEvents(
		        PApplet theApplet) {
			if (getIsInside()) {
				if (insideRadioButton()) {
					if (isMousePressed && current() != this) {
						setValue(value);
					}
				}
			}
		}

		/**
		 * 
		 * @param theApplet
		 *            PApplet
		 */
		public void draw(
		        PApplet theApplet) {
			theApplet.noStroke();
			if (isActive) {
				theApplet.fill(color.colorActive);
			} else {
				theApplet.fill(color.colorForeground);
			}
			if (getIsInside()) {
				if (insideRadioButton()) {
					theApplet.fill(color.colorActive);
				}
			}
			theApplet.pushMatrix();
			theApplet.translate(_myX, _myY);
			theApplet.rect(0, 0, _myRadioButtonWidth, _myRadioButtonHeight);
			label.draw(theApplet, labelOffsetX, labelOffsetY);
			theApplet.popMatrix();
		}

		private boolean insideRadioButton() {
			return (_myControlWindow.mouseX > position.x() + _myParent.absolutePosition().x() + _myX
			        && _myControlWindow.mouseX < position.x() + _myParent.absolutePosition().x() + _myX
			                + _myRadioButtonWidth
			        && _myControlWindow.mouseY > position.y() + _myParent.absolutePosition().y() + _myY && _myControlWindow.mouseY < position
			        .y()
			        + _myParent.absolutePosition().y() + _myY + _myRadioButtonHeight);
		}

		protected ControlP5XMLElement getAsXML() {
			ControlP5XMLElement myXMLElement = new ControlP5XMLElement(new Hashtable(), true, false);
			myXMLElement.setName("radiobutton");
			myXMLElement.setAttribute("type", "radiobutton");
			myXMLElement.setAttribute("name", label.toString());
			myXMLElement.setAttribute("label", label.toString());
			myXMLElement.setAttribute("id", new Integer(id()));
			myXMLElement.setAttribute("value", new Float(value));
			myXMLElement.setAttribute("state", new Integer((isActive ? 1 : 0)));
			return myXMLElement;
		}

	}

}