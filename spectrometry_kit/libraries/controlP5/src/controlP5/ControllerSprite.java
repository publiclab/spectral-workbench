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
import processing.core.PImage;

public class ControllerSprite implements Cloneable {

	// cc - andreas - I had to remove comment so I could post to BB

	protected PImage sprite;
	protected PImage display;
	protected PImage mask;
	protected int offsetX;
	protected int offsetY;
	protected int width;
	protected int height;
	protected int wh;
	protected boolean isMask;
	protected int _myState;
	// cc - added to support forcing of state
	// and count of total states
	protected int _forceState = 0;
	// default value (3 total states 0-2)
	protected int _totalStates = 2;

	public ControllerSprite(ControlP5 theControlP5, PImage theImage, int theWidth, int theHeight) {
		sprite = theImage;
		width = theWidth;
		height = theHeight;
		wh = width * height;
		_myState = 0;

		display = new PImage(theWidth, theHeight);
		display = ControlP5.papplet.createImage(theWidth, theHeight, PApplet.RGB);
		update();

	}

	public ControllerSprite(ControlP5 theControlP5, PImage theImage, int theWidth, int theHeight, int theStates) {
		sprite = theImage;
		width = theWidth;
		height = theHeight;
		wh = width * height;
		_myState = 0;

		// cc - added to support a specified # of states
		// specify total states, not index - e.g.:
		// two total states arg should = 2, even though
		// max state index is 1.

		theStates--;

		// cc - make sure we have at least one state
		_totalStates = (theStates >= 0) ? theStates : 0;

		display = new PImage(theWidth, theHeight);
		display = theControlP5.papplet.createImage(theWidth, theHeight, PApplet.RGB);
		update();

	}

	public void draw(PApplet theApplet) {
		theApplet.pushStyle();
		theApplet.imageMode(PApplet.CORNER);
		if (isMask) {
			display.mask(mask);
		}
		theApplet.image(display, 0, 0);
		theApplet.popStyle();
	}

	public void update() {

		// cc - added to limit to a given # of
		// states, also force state if forced state
		// is greater than 0

		int state = _forceState > 0 ? _forceState : _myState;

		if (state > _totalStates) state = _totalStates;

		display.loadPixels();
		System.arraycopy(sprite.pixels, wh * state, display.pixels, 0, wh);
		display.updatePixels();
	}

	// cc - added to support a specified # of states
	// specify total states, not index - e.g.:
	// two total states arg should = 2, even though
	// max state index is 1.

	public void setTotalStates(int count) {
		// reduce index value
		count--;
		// cc - make sure we have at least one state
		_totalStates = (count >= 0) ? count : 0;
	}

	// cc - added, to force state

	public void setForceState(int state) {
		_forceState = state;
		offsetY = height * _forceState;
		update();

	}

	// cc - added to query count of states

	public int getStateCount() {
		return _totalStates;
	}

	public void setOffset(int theX, int theY) {
		offsetX = theX;
		offsetY = theY;
		update();
	}

	public void setState(int theState) {
		if (theState != _myState) {
			_myState = theState;
			offsetY = height * _myState;
			update();
		}
	}

	public int getState() {
		return _myState;
	}

	public int width() {
		return width;
	}

	public int height() {
		return height;
	}

	public void setMask(PImage theImage) {
		mask = theImage;
	}

	public void enableMask() {
		isMask = true;
	}

	public void disableMask() {
		isMask = true;
	}

	public ControllerSprite clone() {
		try {
			ControllerSprite cs = (ControllerSprite) super.clone();
			cs.sprite = (PImage) sprite.clone();
			cs.display = (PImage) display.clone();
			cs.mask = (PImage) mask.clone();
			return cs;
		} catch (CloneNotSupportedException e) {
			throw new InternalError(e.toString());
		}
	}

}
