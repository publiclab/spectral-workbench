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

public class ControlP5Base implements ControlP5Constants {

	ControlP5 controlP5;

	protected void init(ControlP5 theControlP5) {
		controlP5 = theControlP5;
		currentGroupPointer = controlP5.controlWindow.tab("default");
	}

	/**
	 * add a tab to controlP5. by default the tab will be added to the main
	 * window.
	 * 
	 * @param theName String
	 * @return Tasaveb
	 */
	public Tab addTab(String theName) {
		return addTab(controlP5.controlWindow, theName);
	}

	public Tab addTab(PApplet theWindow, String theName) {
		return addTab(controlP5.controlWindow, theName);
	}

	public Tab addTab(ControlWindow theWindow, String theName) {
		for (int i = 0; i < theWindow.tabs().size(); i++) {
			if (theWindow.tabs().get(i).name().equals(theName)) {
				return (Tab) theWindow.tabs().get(i);
			}
		}
		Tab myTab = new Tab(controlP5, theWindow, theName);
		theWindow.tabs().add(myTab);
		return myTab;
	}

	/**
	 * 
	 * a button to controlP5. by default it will be added to the default tab of
	 * the main window.
	 * 
	 * @param theName String
	 * @param theValue float
	 * @param theX int
	 * @param theY int
	 * @param theW int
	 * @param theH int
	 * @return Button
	 */
	public Button addButton(
			final String theName,
			final float theValue,
			final int theX,
			final int theY,
			final int theW,
			final int theH) {
		Button myController = new Button(controlP5, (ControllerGroup) controlP5.controlWindow.tabs().get(1), theName, theValue, theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a bang to controlP5. by default it will be added to the default tab of
	 * the main window.
	 * 
	 * @param theName String
	 * @param theX int
	 * @param theY int
	 * @param theWidth int
	 * @param theHeight int
	 * @return Bang
	 */
	public Bang addBang(final String theName, final int theX, final int theY, final int theWidth, final int theHeight) {
		Bang myController = new Bang(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theWidth, theHeight);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a toggle to controlP5. by default it will be added to the default tab
	 * of the main window.
	 * 
	 * @param theName String
	 * @param theDefaultValue boolean
	 * @param theX float
	 * @param theY float
	 * @param theWidth int
	 * @param theHeight int
	 * @return Toggle
	 */
	public Toggle addToggle(
			final String theName,
			final boolean theDefaultValue,
			final float theX,
			final float theY,
			final int theWidth,
			final int theHeight) {
		Toggle myController = new Toggle(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, (theDefaultValue == true) ? 1f
				: 0f, theX, theY, theWidth, theHeight);
		controlP5.register(myController);
		return myController;

	}

	/**
	 * add a toggle to controlP5. by default it will be added to the default tab
	 * of the main window.
	 * 
	 * @param theName String
	 * @param theDefaultValue boolean
	 * @param theX float
	 * @param theY float
	 * @param theWidth int
	 * @param theHeight int
	 * @return Toggle Toggle
	 */
	public Toggle addToggle(
			final String theName,
			final float theX,
			final float theY,
			final int theWidth,
			final int theHeight) {
		Toggle myController = new Toggle(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, Float.NaN, theX, theY, theWidth, theHeight);
		controlP5.register(myController);
		return myController;

	}

	public Matrix addMatrix(
			final String theName,
			final int theCellX,
			final int theCellY,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight) {
		Matrix myController = new Matrix(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theCellX, theCellY, theX, theY, theWidth, theHeight);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a 2D slider to controlP5.
	 * 
	 * @param theName
	 * @param theX
	 * @param theY
	 * @param theW
	 * @param theH
	 * @return
	 */
	public Slider2D addSlider2D(String theName, int theX, int theY, int theW, int theH) {
		return addSlider2D(theName, 0, theW, 0, theH, 0, 0, theX, theY, theW, theH);
	}

	public Slider2D addSlider2D(
			String theName,
			float theMinX,
			float theMaxX,
			float theMinY,
			float theMaxY,
			float theDefaultValueX,
			float theDefaultValueY,
			int theX,
			int theY,
			int theW,
			int theH) {
		Slider2D myController = new Slider2D(controlP5, (ControllerGroup) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theW, theH);
		controlP5.register(myController);

		myController.setMinX(theMinX);
		myController.setMaxX(theMaxX);
		myController.setMinY(theMinY);
		myController.setMaxY(theMaxY);
		myController.setArrayValue(new float[] { theDefaultValueX, theDefaultValueY });
		myController.updateValue();

		return myController;
	}

	/**
	 * add a slider to controlP5. by default it will be added to the default tab
	 * of the main window.
	 * 
	 * @param theName String
	 * @param theMin float
	 * @param theMax float
	 * @param theDefaultValue float
	 * @param theX int
	 * @param theY int
	 * @param theW int
	 * @param theH int
	 * @return Slider
	 */
	public Slider addSlider(
			String theName,
			float theMin,
			float theMax,
			float theDefaultValue,
			int theX,
			int theY,
			int theW,
			int theH) {
		Slider myController = new Slider(controlP5, (ControllerGroup) controlP5.controlWindow.tabs().get(1), theName, theMin, theMax, theDefaultValue, theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a slider to controlP5. by default a slider will be added to the default
	 * tab of the main window.
	 * 
	 * @param theName String
	 * @param theMin float
	 * @param theMax float
	 * @param theX int
	 * @param theY int
	 * @param theWidth int
	 * @param theHeight int
	 * @return Slider
	 */
	public Slider addSlider(
			final String theName,
			final float theMin,
			final float theMax,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight) {
		return addSlider(theName, theMin, theMax, Float.NaN, theX, theY, theWidth, theHeight);
	}

	public Range addRange(
			String theName,
			float theMin,
			float theMax,
			float theDefaultMinValue,
			float theDefaultMaxValue,
			int theX,
			int theY,
			int theW,
			int theH) {
		Range myController = new Range(controlP5, (ControllerGroup) controlP5.controlWindow.tabs().get(1), theName, theMin, theMax, theDefaultMinValue, theDefaultMaxValue, theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a slider to controlP5. by default it will be added to the default tab
	 * of the main window.
	 * 
	 * @param theName String
	 * @param theMin float
	 * @param theMax float
	 * @param theX int
	 * @param theY int
	 * @param theWidth int
	 * @param theHeight int
	 * @return Slider
	 */
	public Range addRange(
			final String theName,
			final float theMin,
			final float theMax,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight) {
		return addRange(theName, theMin, theMax, theMin, theMax, theX, theY, theWidth, theHeight);
	}

	/**
	 * add a numberbox to controlP5. by default it will be added to the default
	 * tab of the main window.
	 * 
	 * @param theName String
	 * @param theX float
	 * @param theY float
	 * @param theWidth int
	 * @param theHeight int
	 * @return Numberbox Numberbox
	 */
	public Numberbox addNumberbox(
			final String theName,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight) {
		return addNumberbox(theName, 0, theX, theY, theWidth, theHeight);
	}

	/**
	 * add a numberbox to controlP5. by default it will be added to the default
	 * tab of the main window.
	 * 
	 * @param theName String
	 * @param theDefaultValue int
	 * @param theX float
	 * @param theY float
	 * @param theWidth int
	 * @param theHeight int
	 * @return Numberbox Numberbox
	 */
	public Numberbox addNumberbox(
			final String theName,
			final float theDefaultValue,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight) {
		Numberbox myController = new Numberbox(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theDefaultValue, theX, theY, theWidth, theHeight);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a knob to your controlP5 setup.
	 * 
	 * @param theName String
	 * @param theMin float
	 * @param theMax float
	 * @param theX float
	 * @param theY float
	 * @param theDiameter int
	 * @return Knob Knob
	 */
	public Knob addKnob(
			final String theName,
			final float theMin,
			final float theMax,
			final int theX,
			final int theY,
			final int theDiameter) {
		return addKnob(theName, theMin, theMax, Float.NaN, theX, theY, theDiameter);
	}

	public MultiList addMultiList(
			final String theName,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight) {
		MultiList myMultiList = new MultiList(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theWidth, theHeight);
		controlP5.register(myMultiList);
		return myMultiList;
	}

	/**
	 * add a knob to controlP5. by default it will be added to the default tab of
	 * the main window.
	 * 
	 * @param theName String
	 * @param theMin float
	 * @param theMax float
	 * @param theDefaultValue float
	 * @param theX float
	 * @param theY float
	 * @param theDiameter int
	 * @return Knob Knob
	 */
	public Knob addKnob(
			final String theName,
			final float theMin,
			final float theMax,
			final float theDefaultValue,
			final int theX,
			final int theY,
			final int theDiameter) {
		Knob myController = new Knob(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theMin, theMax, theDefaultValue, theX, theY, theDiameter);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a textlabel to controlP5. by default it will be added to the default
	 * tab of the main window.
	 * 
	 * @param theName String
	 * @param theText String
	 * @param theX int
	 * @param theY int
	 * @param theW int
	 * @param theH int
	 * @return Textlabel
	 */
	public Textarea addTextarea(
			final String theName,
			final String theText,
			final int theX,
			final int theY,
			final int theW,
			final int theH) {
		Textarea myController = new Textarea(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theText, theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}

	public Textlabel addTextlabel(final String theName, final String theText, final int theX, final int theY) {
		Textlabel myController = new Textlabel(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theText, theX, theY);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a textfield to controlP5. by default it will be added to the default
	 * tab of the main window.
	 * 
	 * @param theName String
	 * @param theX int
	 * @param theY int
	 * @param theW int
	 * @param theH int
	 * @return Textfield
	 */
	public Textfield addTextfield(final String theName, final int theX, final int theY, final int theW, final int theH) {
		Textfield myController = new Textfield(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, "", theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a radio list to controlP5. by default it will be added to the default
	 * tab of the main window.
	 * 
	 * @param theName String
	 * @param theX int
	 * @param theY int
	 * @return Radio
	 */
	public Radio addRadio(final String theName, final int theX, final int theY) {
		Radio myController = new Radio(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY);
		controlP5.register(myController);
		return myController;
	}

	public Radio addRadio(
			final String theName,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight,
			final int theLineSpacing) {
		Radio myController = new Radio(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theWidth, theHeight, theLineSpacing);
		controlP5.register(myController);
		return myController;
	}

	public RadioButton addRadioButton(final String theName, final int theX, final int theY) {
		RadioButton myController = new RadioButton(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY);
		controlP5.register(myController);
		return myController;
	}

	public CheckBox addCheckBox(final String theName, final int theX, final int theY) {
		CheckBox myController = new CheckBox(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a scroll list to controlP5. by default it will be added to the default
	 * tab of the main window.
	 * 
	 * @param theName String
	 * @param theX int
	 * @param theY int
	 * @param theW int
	 * @param theH int
	 * @return ScrollList
	 */
	public ScrollList addScrollList(final String theName, final int theX, final int theY, final int theW, final int theH) {
		ScrollList myController = new ScrollList(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * adds a ListBox.
	 * 
	 * @param theName
	 * @param theX
	 * @param theY
	 * @param theW
	 * @param theH
	 * @return ListBox
	 */
	public ListBox addListBox(final String theName, final int theX, final int theY, final int theW, final int theH) {
		ListBox myController = new ListBox(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * adds a pulldown-menu.
	 * 
	 * @param theName
	 * @param theX
	 * @param theY
	 * @param theW
	 * @param theH
	 * @return PulldownMenu
	 */
	public DropdownList addDropdownList(
			final String theName,
			final int theX,
			final int theY,
			final int theW,
			final int theH) {
		DropdownList myController = new DropdownList(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}
	
	
	/**
	 * add a simple RGB colorpicker.
	 * 
	 * @param theName
	 * @param theX
	 * @param theY
	 * @param theW
	 * @param theH
	 * @return
	 */
	public ColorPicker addColorPicker(final String theName, final int theX, final int theY, final int theW, final int theH) {
		ColorPicker myController = new ColorPicker(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}

	public Chart addChart(String theName, int theX, int theY, int theW, int theH) {
		Chart myController = new Chart(controlP5, (Tab) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theW, theH);
		controlP5.register(myController);
		return myController;
	}

	/**
	 * add a group to controlP5. by default it will be added to the default tab of
	 * the main window.
	 * 
	 * @param theName String
	 * @param theX int
	 * @param theY int
	 * @return ControlGroup
	 */
	public ControlGroup addGroup(String theName, int theX, int theY, int theW) {
		ControlGroup myController = new ControlGroup(controlP5, (ControllerGroup) controlP5.controlWindow.tabs().get(1), theName, theX, theY, theW, 9);
		controlP5.register(myController);
		return myController;
	}

	public ControlGroup addGroup(String theName, int theX, int theY) {
		return addGroup(theName, theX, theY, 99);
	}

	/**
	 * create a new ControlWindow.
	 * 
	 * @param theWindowName String
	 * @param theWidth int
	 * @param theHeight int
	 * @return ControlWindow ControlWindow
	 */
	public ControlWindow addControlWindow(final String theWindowName, final int theWidth, final int theHeight) {
		return addControlWindow(theWindowName, 400, 200, theWidth, theHeight, "", 15);
	}

	public ControlWindow addControlWindow(
			final String theWindowName,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight) {
		return addControlWindow(theWindowName, theX, theY, theWidth, theHeight, "", 15);
	}

	public ControlWindow addControlWindow(
			final String theWindowName,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight,
			final int theFrameRate) {
		return addControlWindow(theWindowName, theX, theY, theWidth, theHeight, "", theFrameRate);
	}

	/**
	 * create a new ControlWindow.
	 * 
	 * @param theWindowName String
	 * @param theX int
	 * @param theY int
	 * @param theWidth int
	 * @param theHeight int
	 * @return ControlWindow ControlWindow
	 */
	public ControlWindow addControlWindow(
			final String theWindowName,
			final int theX,
			final int theY,
			final int theWidth,
			final int theHeight,
			String theRenderer,
			int theFrameRate) {
		for (int i = 0; i < controlP5.controlWindowList.size(); i++) {
			if (((ControlWindow) controlP5.controlWindowList.get(i)).name().equals(theWindowName)) {
				ControlP5.logger().warning("ControlWindow with name " + theWindowName + " already exists. overwriting now.");
			}
		}
		PAppletWindow myPAppletWindow = new PAppletWindow(theWindowName, theX, theY, theWidth, theHeight, theRenderer, theFrameRate);
		myPAppletWindow.setParent(controlP5);
		myPAppletWindow.setMode(PAppletWindow.ECONOMIC);
		ControlWindow myControlWindow = new ControlWindow(controlP5, myPAppletWindow);
		controlP5.controlWindowList.add(myControlWindow);
		return myControlWindow;
	}

	/**
	 * very simple and automated adding of certain controllers.
	 */

	protected ControllerGroup currentGroupPointer;

	protected boolean isCurrentGroupPointerClosed = true;

	protected void setCurrentPointer(ControllerGroup theGroup) {
		currentGroupPointer = theGroup;
		isCurrentGroupPointerClosed = false;
	}

	protected void releaseCurrentPointer(ControllerGroup theGroup) {
		if (isCurrentGroupPointerClosed == false) {
			currentGroupPointer = theGroup;
			isCurrentGroupPointerClosed = true;
		} else {
			ControlP5.logger().warning("use .end() first before using .begin() again.");
		}
	}

	protected void linebreak(Controller theController, boolean theFlag, int theW, int theH, CVector3f theSpacing) {
		if (theFlag == true) {
			currentGroupPointer.autoPosition.y += currentGroupPointer.tempAutoPositionHeight;
			currentGroupPointer.autoPosition.x = currentGroupPointer.autoPositionOffsetX;
			currentGroupPointer.tempAutoPositionHeight = 0;
		} else {
			if (theController instanceof Slider) {
				currentGroupPointer.autoPosition.x += theController.captionLabel().width();
			}
			currentGroupPointer.autoPosition.x += theController.autoSpacing.x + theW;
			if ((theH + theSpacing.y) > currentGroupPointer.tempAutoPositionHeight) {
				currentGroupPointer.tempAutoPositionHeight = theH + theSpacing.y;
			}
		}
	}

	public Slider addSlider(String theName, float theMin, float theMax) {
		Slider s = addSlider(theName, theMin, theMax, (int) currentGroupPointer.autoPosition.x(), (int) currentGroupPointer.autoPosition.y(), Slider.autoWidth, Slider.autoHeight);
		linebreak(s, false, Slider.autoWidth, Slider.autoHeight, s.autoSpacing);
		s.moveTo(currentGroupPointer);
		return s;
	}

	public Button addButton(String theName) {
		Button b = addButton(theName, 1);
		b.moveTo(currentGroupPointer);
		return b;
	}

	public Button addButton(String theName, float theValue) {
		Button b = addButton(theName, theValue, (int) currentGroupPointer.autoPosition.x, (int) currentGroupPointer.autoPosition.y, Button.autoWidth, Button.autoHeight);
		linebreak(b, false, Button.autoWidth, Button.autoHeight, b.autoSpacing);
		b.moveTo(currentGroupPointer);
		return b;
	}

	public Toggle addToggle(String theName) {
		Toggle t = addToggle(theName, currentGroupPointer.autoPosition.x, currentGroupPointer.autoPosition.y, Toggle.autoWidth, Toggle.autoHeight);
		linebreak(t, false, Toggle.autoWidth, Toggle.autoHeight, t.autoSpacing);
		t.moveTo(currentGroupPointer);
		return t;
	}

	public Numberbox addNumberbox(String theName) {
		Numberbox n = addNumberbox(theName, (int) currentGroupPointer.autoPosition.x, (int) currentGroupPointer.autoPosition.y, Numberbox.autoWidth, Numberbox.autoHeight);
		linebreak(n, false, Numberbox.autoWidth, Numberbox.autoHeight, n.autoSpacing);
		n.moveTo(currentGroupPointer);
		return n;
	}

	public ControlWindow addControlWindow(String theName) {
		return addControlWindow(theName, 20, 20, 400, 400);
	}

}
