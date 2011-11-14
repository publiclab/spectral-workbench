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
import processing.core.PGraphics;

/**
 * TODO
 * ColorPicking will eventually take over the mouse position check for each
 * controller to determine mouse location based event like enter, leave, etc.
 * 
 * @author andreas
 * 
 */
class ControlPicking {

	PGraphics _myLookupImage;
	ControlWindow _myWindow;
	protected boolean isImplemeted = false;

	protected ControlPicking(ControlWindow theWindow) {
		_myWindow = theWindow;
		if (isImplemeted) {
			_myLookupImage = theWindow.papplet().createGraphics(theWindow.papplet().width, theWindow.papplet().height, PApplet.P3D);
		}
	}

	public void reset() {
		if (isImplemeted) {
			_myLookupImage.beginDraw();
			_myLookupImage.background(0x44000000);
			_myLookupImage.endDraw();
		}
	}

	public void update(ControllerInterface theController) {
		if (isImplemeted) {
			_myLookupImage.beginDraw();
			_myLookupImage.noStroke();
			_myLookupImage.fill(theController.getPickingColor());
			float x = theController.position().x() + theController.parent().absolutePosition().x();
			float y = theController.position().y() + theController.parent().absolutePosition().y();
			_myLookupImage.rect(x, y, theController.getWidth(), theController.getHeight());
			_myLookupImage.endDraw();
		}
	}

	public void display(PApplet theApplet) {
		if (isImplemeted) {
			theApplet.image(_myLookupImage, 0, 0);
		}
	}

	public int getNextColor() {
		return 100;
	}

}
