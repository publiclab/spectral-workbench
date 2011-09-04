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


import java.awt.event.KeyEvent;

public class ControlWindowKeyHandler implements ControlP5Constants {

	private ControlWindow _myMasterControlWindow;

	public boolean isShiftDown = false;

	public boolean isKeyDown = false;

	public boolean isAltDown = false;

	public boolean isKeyMenu = false;

	protected char key = ' ';

	protected int keyCode = -1;

	public ControlWindowKeyHandler(ControlP5 theControlP5) {
		_myMasterControlWindow = theControlP5.controlWindow;
	}

	public void update(ControlWindow theControlWindow) {
		_myMasterControlWindow = theControlWindow;
	}

	public void keyEvent(final KeyEvent theKeyEvent, final ControlWindow theControlWindow, final boolean isMasterWindow) {
		
			if (theKeyEvent.getID() == KeyEvent.KEY_PRESSED) {
				switch (theKeyEvent.getKeyCode()) {
					case (KeyEvent.VK_SHIFT):
						isShiftDown = true;
						break;
					case (KeyEvent.VK_ALT):
						isAltDown = true;
						break;
				}
				key = theKeyEvent.getKeyChar();
				keyCode = theKeyEvent.getKeyCode();
				isKeyDown = true;
			}
			if (theKeyEvent.getID() == KeyEvent.KEY_RELEASED) {
				switch (theKeyEvent.getKeyCode()) {
					case (KeyEvent.VK_SHIFT):
						isShiftDown = false;
						break;
					case (KeyEvent.VK_ALT):
						isAltDown = false;
						break;

				}
				isKeyDown = false;
			}

			if (theKeyEvent.getID() == KeyEvent.KEY_PRESSED) {
				if (isAltDown) {
					if (theKeyEvent.getKeyCode() == KEYCONTROL) {
						isKeyMenu = !isKeyMenu;
						// _myMasterControlWindow.keyMenu(isKeyMenu);
					}
				}
			}
			if (theKeyEvent.getID() == KeyEvent.KEY_PRESSED && isAltDown && _myMasterControlWindow.controlP5.isShortcuts) {
				if (isKeyMenu) {
					handleInputEvent(theKeyEvent.getKeyCode());
				}
				if (theKeyEvent.getKeyCode() == SAVE) {
					_myMasterControlWindow.controlP5.save(_myMasterControlWindow.controlP5.filePath());
				}
				if (theKeyEvent.getKeyCode() == LOAD) {
					if (isMasterWindow) {
						_myMasterControlWindow.controlP5.load(_myMasterControlWindow.controlP5.filePath());
						isAltDown = false;
						isShiftDown = false;
					}
				}
				if (theKeyEvent.getKeyCode() == HIDE) {
					if (_myMasterControlWindow.isVisible) {
						_myMasterControlWindow.controlP5.hide();
					} else {
						_myMasterControlWindow.controlP5.show();
					}
				}
			}
	
			/*
			 * during re/loading period of settings theControlWindow might be
			 * null
			 */
			if (theControlWindow != null) {
				theControlWindow.keyEvent(theKeyEvent);
			}
	}

	/**
	 * @param theKey
	 *        char
	 */
	protected void handleInputEvent(int theKeyCode) {
		switch (theKeyCode) {
			case (SWITCH_FORE):
			case (SWITCH_BACK):
			case (PRINT):
			case (DECREASE):
			case (INCREASE):
			case (RESET):
				ControlP5.logger().warning("Key controls are not supported in this version anymore.");
		}
	}

}
