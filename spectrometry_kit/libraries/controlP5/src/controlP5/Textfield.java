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
import processing.core.PApplet;
import java.awt.event.KeyEvent;

/**
 * description for singleline textfield. create a texfield with<br />
 * <br />
 * controlP5.addTextfield(theName,theX,theY,theWidth,theHeight);
 * 
 * the Textfield implementation for ControlP5 tries its best to imitate the
 * usage and behavior of a terminal, the command line.
 * 
 * @example ControlP5textfield
 * @nosuperclasses Controller Controller
 */
public class Textfield extends Controller {

	/*
	 * TODO needs a lot of work! has gone through massive amounts of little
	 * changes and adjustments. implement new fonts, current one is too small.
	 * make the text go to the left when cursor goes beyond right border. make
	 * textfield work for controlWindow
	 */

  protected ArrayList<String> myTextList = new ArrayList<String>();

	int myIndex = 1;

	int myPosition = 0;

	StringBuffer myTextline = new StringBuffer();

	private boolean isTexfieldActive = false;

	private boolean isPasswordMode = false;

	protected boolean isAutoClear = true;

	protected boolean isKeepFocus = false;

	/**
	 * 
	 * @param theControllerProperties
	 *          ControllerProperties
	 */
	public Textfield(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			String theDefaultValue,
			int theX,
			int theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myCaptionLabel = new Label(theName.toUpperCase(), color.colorCaptionLabel);
		_myCaptionLabel.setFixedSize(false);
		myBroadcastType = STRING;
		_myValueLabel.setWidth(width - 10);
		_myValueLabel.setHeight(15);
		_myValueLabel.set("|");
		_myValueLabel.setColor(color.colorValueLabel);
		_myValueLabel.toUpperCase(false);
		_myValueLabel.setFixedSize(true);
		_myValueLabel.setFont(ControlP5.standard56);

	}

	/**
	 * 
	 * @param theValue
	 *          float
	 */
	public void setValue(float theValue) {
	}

	/**
	 * set the mode of the textfield to password mode, each character is shown as
	 * a "*" like e.g. in online password forms.
	 * 
	 * @param theFlag
	 *          boolean
	 */
	public void setPasswordMode(boolean theFlag) {
		isPasswordMode = theFlag;
	}

	/**
	 * set the textfield's focus to true or false.
	 * 
	 * @param theFlag
	 *          boolean
	 */
	public void setFocus(boolean theFlag) {
		if (theFlag == true) {
			mousePressed();
		} else {
			mouseReleasedOutside();
		}
	}

	/**
	 * use true as parameter to force the textfield to stay in focus. to go back
	 * to normal focus behavior, use false.
	 * 
	 * @param theFlag
	 */
	public void keepFocus(boolean theFlag) {
		isKeepFocus = theFlag;
		if (isKeepFocus) {
			setFocus(true);
		}
	}

	/**
	 * check if the textfield is active and in focus.
	 * 
	 * @return boolean
	 */
	public boolean isFocus() {
		return isTexfieldActive;
	}

	/**
	 * set the value of the textfield and will broadcast the new string value
	 * immediately. what is the difference between setValue and setText? setValue
	 * does broadcast the value that has been set, setText does not broadcast the
	 * value, but only updates the content of a textfield. for further information
	 * about how setText works, see the setText documentation.
	 * 
	 * @param theValue
	 *          String
	 */
	public void setValue(String theValue) {
		myTextline = new StringBuffer(theValue);
		// myPosition = myTextline.length() - 1;
		_myStringValue = theValue;
		myPosition = myTextline.length();
		_myValueLabel.setWithCursorPosition(myTextline.toString(), myPosition);
		broadcast(myBroadcastType);
	}

	/**
	 * setText does set the text of a textfield, but will not broadcast its value.
	 * use setText to force the textfield to change its text. you can call setText
	 * any time, nevertheless when autoClear is set to true (which is the
	 * default), it will NOT work when called from within controlEvent or within a
	 * method that has been identified by ControlP5 to forward messages to, when
	 * return has been pressed to confirm a textfield.<br />
	 * use setAutoClear(false) to enable setText to be executed for the above
	 * case. use yourTextfield.isAutoClear() to check if autoClear is true or
	 * false. <br />
	 * setText replaces the current/latest content of a textfield but does NOT
	 * overwrite the content. when scrolling through the list of textlines (use
	 * key up and down), the previous content that has been replaced will be put
	 * back into place again - since it has not been confirmed with return.
	 * 
	 * @param theValue
	 */
	public void setText(String theValue) {
		myTextline = new StringBuffer(theValue);
		// myPosition = myTextline.length() - 1;
		_myStringValue = theValue;
		myPosition = myTextline.length();
		_myValueLabel.setWithCursorPosition(myTextline.toString(), myPosition);
	}

	/**
	 * 
	 */
	public void update() {
		_myStringValue = myTextline.toString();
		setValue(_myStringValue);
	}

	/**
	 * click the texfield to activate.
	 * 
	 * 
	 * 
	 */
	protected void mousePressed() {
		isTexfieldActive = isActive = true;
	}

	/**
	 * 
	 */
	protected void mouseReleasedOutside() {
		if (isKeepFocus == false) {
			isTexfieldActive = isActive = false;
		}
	}

	/**
	 * 
	 * @param theApplet
	 *          PApplet
	 */
	public void draw(PApplet theApplet) {
		if (isTexfieldActive && isActive) {
			theApplet.stroke(color.colorActive);
		} else {
			theApplet.stroke(color.colorForeground);
		}
		theApplet.fill(color.colorBackground);
		theApplet.pushMatrix();
		theApplet.translate(position().x(), position().y());
		theApplet.rect(0, 0, width, height);
		theApplet.noStroke();
		_myValueLabel.draw(theApplet, 4, 7);
		_myCaptionLabel.draw(theApplet, 0, height + 4);
		theApplet.noFill();
		theApplet.popMatrix();
	}

	/**
	 * flip throught the texfield history with cursor keys UP and DOWN. go back
	 * and forth with cursor keys LEFT and RIGHT.
	 * 
	 * 
	 */
	public void keyEvent(KeyEvent theKeyEvent) {
		if (!ControlP5.keyHandler.isAltDown && isUserInteraction && isTexfieldActive && isActive && theKeyEvent.getID() == KeyEvent.KEY_PRESSED) {
			if (ControlP5.keyHandler.keyCode == UP) {
				if (myTextList.size() > 0 && myIndex > 0) {
					myIndex--;
					myTextline = new StringBuffer((String) myTextList.get(myIndex));
					adjust();
				}
			} else if (ControlP5.keyHandler.keyCode == DOWN) {
				myIndex++;
				if (myIndex >= myTextList.size()) {
					myIndex = myTextList.size();
					myTextline = new StringBuffer();
				} else {
					myTextline = new StringBuffer((String) myTextList.get(myIndex));
				}
				adjust();
			} else if (ControlP5.keyHandler.keyCode == LEFT) {
				if (myPosition > 0) {
					myPosition--;
				}
			} else if (ControlP5.keyHandler.keyCode == RIGHT) {
				if (myPosition < myTextline.length()) {
					myPosition++;
				}
			} else if (ControlP5.keyHandler.keyCode == DELETE || ControlP5.keyHandler.keyCode == BACKSPACE) {
				if (myTextline.length() > 0) {
					if (myPosition > 0) {
						myTextline.deleteCharAt(myPosition - 1);
						myPosition--;
					}
				}
			} else if (ControlP5.keyHandler.keyCode == ENTER) {
				submit();
			} else if (ControlP5.keyHandler.keyCode != SHIFT && ControlP5.keyHandler.keyCode != ALT
					&& ControlP5.keyHandler.keyCode != TAB && ControlP5.keyHandler.keyCode != CONTROL) {
				if ((int) ControlP5.keyHandler.key > 31 && (int) ControlP5.keyHandler.key < 127) {
					myTextline.insert(myPosition, ControlP5.keyHandler.key);
					myPosition++;
				}
			}
			updateField();
		}
	}

	private void updateField() {
		if (isPasswordMode) {
			String myPasswordTextline = "";
			for (int i = 0; i < myTextline.length(); i++) {
				myPasswordTextline += "*";
			}
			_myValueLabel.setWithCursorPosition(myPasswordTextline, myPosition);
		} else {
			int offset = 0;
			int m = _myValueLabel.bitFontRenderer.getWidth(myTextline.toString(), _myValueLabel, myPosition);
			offset = (m > _myValueLabel.width()) ? _myValueLabel.width() - m : 0;
			_myValueLabel.setWithCursorPosition(myTextline.toString(), myPosition, offset);
		}
	}

	/**
	 * get the current text of the textfield.
	 * 
	 * @return String
	 */
	public String getText() {
		return myTextline.toString();
	}

	/**
	 * returns a string array that lists all text lines that have been confirmed
	 * with a return.
	 * 
	 * @return
	 */
	public String[] getTextList() {
		String[] s = new String[myTextList.size()];
		myTextList.toArray(s);
		return s;
	}

	/**
	 * clear the current content of the textfield.
	 */
	public void clear() {
		myTextline = new StringBuffer();
		myIndex = myTextList.size();
		myPosition = 0;
		updateField();
	}

	protected void checkClear() {
		if (isAutoClear) {
			myTextline = new StringBuffer();
			myIndex = myTextList.size();
			myPosition = 0;
			updateField();
		}
	}

	/**
	 * use setAutoClear(false) to not clear the content of the textfield after
	 * confirming with return.
	 * 
	 * @param theFlag
	 */
	public void setAutoClear(boolean theFlag) {
		isAutoClear = theFlag;
	}

	/**
	 * returns the current state of the autoClear flag.
	 * 
	 * @return
	 */
	public boolean isAutoClear() {
		return isAutoClear;
	}

	/**
	 * make the controller execute a return event. submit the current content of
	 * the texfield.
	 * 
	 */
	public void submit() {
		if (myTextline.length() > 0) {
			myTextList.add(myTextline.toString());
			update();
			checkClear();
		}
	}

	
	protected void adjust() {
		myPosition = myTextline.length();
		if (myPosition < 0) {
			myPosition = 0;
		}
	}

	/**
	 * 
	 * @param theElement
	 *          ControlP5XMLElement
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "textfield");
		theElement.setAttribute("value", "" + stringValue());
	}

}
