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

/**
 * a matrix is a 2d array with one pointer that traverses through the matrix
 * with a timed interval. if an item of a matrix-column is active, the x and y
 * position of the corresponding cell will trigger an event. see the example for
 * more information.
 * 
 * TODO add multi-cells access to the vertical axis
 * 
 * @example ControlP5matrix
 */
public class Matrix extends Controller {

	protected int cnt;

	protected int[][] myMarkers;

	protected int stepX;

	protected int stepY;

	protected int cellX;

	protected int cellY;

	protected boolean isPressed;

	protected int _myCellX;

	protected int _myCellY;

	protected int sum;

	protected long _myTime;

	protected int _myInterval;

	protected int currentX = -1;

	protected int currentY = -1;

	public Matrix(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			int theCellX,
			int theCellY,
			int theX,
			int theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myCellX = theCellX;
		_myCellY = theCellY;
		sum = _myCellX * _myCellY;
		stepX = width / _myCellX;
		stepY = height / _myCellY;
		myMarkers = new int[_myCellX][_myCellY];
		for (int x = 0; x < _myCellX; x++) {
			for (int y = 0; y < _myCellY; y++) {
				myMarkers[x][y] = -1;
			}
		}
		_myTime = System.currentTimeMillis();
		_myInterval = 100;
	}

	/**
	 * set the speed of intervals in millis iterating through the matrix.
	 * 
	 * @param theInterval int
	 */
	public void setInterval(int theInterval) {
		_myInterval = theInterval;
	}
	
	public int getInterval() {
		return _myInterval;
	}

	/**
	 * @see ControllerInterfalce.updateInternalEvents
	 * 
	 */
	public void updateInternalEvents(PApplet theApplet) {
		if (System.currentTimeMillis() > _myTime + _myInterval) {
			cnt += 1;
			cnt %= _myCellX;
			_myTime = System.currentTimeMillis();
			for (int i = 0; i < _myCellY; i++) {
				if (myMarkers[cnt][i] == 1) {
					_myValue = 0;
					_myValue = (cnt << 0) + (i << 8);
					setValue(_myValue);
				}
			}
		}

		setIsInside(inside());

		if (getIsInside()) {
			if (isPressed) {
				int tX = (int) ((theApplet.mouseX - position.x) / stepX);
				int tY = (int) ((theApplet.mouseY - position.y) / stepY);
				if (tX != currentX || tY != currentY) {
					boolean isMarkerActive = (myMarkers[tX][tY] == 1) ? true : false;
					for (int i = 0; i < _myCellY; i++) {
						myMarkers[tX][i] = 0;
					}
					if (!isMarkerActive) {
						myMarkers[tX][tY] = 1;
					}
					currentX = tX;
					currentY = tY;
				}
			}
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#onEnter()
	 */
	protected void onEnter() {
		isActive = true;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#onLeave()
	 */
	protected void onLeave() {
		isActive = false;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#mousePressed()
	 */
	public void mousePressed() {
		isActive = getIsInside();
		if (getIsInside()) {
			isPressed = true;
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#mouseReleasedOutside()
	 */
	protected void mouseReleasedOutside() {
		mouseReleased();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#mouseReleased()
	 */
	public void mouseReleased() {
		if (isActive) {
			isActive = false;
		}
		isPressed = false;
		currentX = -1;
		currentY = -1;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#setValue(float)
	 */
	public void setValue(float theValue) {
		_myValue = theValue;
		broadcast(FLOAT);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#update()
	 */
	public void update() {
		setValue(_myValue);
	}

	/**
	 * set the state of a particular cell in a matrix. use true or false for
	 * parameter theValue
	 * 
	 * @param theX
	 * @param theY
	 * @param theValue
	 */
	public void set(int theX, int theY, boolean theValue) {
		myMarkers[theX][theY] = (theValue == true) ? 1 : 0;
	}

	public static int getX(int thePosition) {
		return ((thePosition >> 0) & 0xff);
	}

	public static int getY(int thePosition) {
		return ((thePosition >> 8) & 0xff);
	}

	public static int getX(float thePosition) {
		return (((int) thePosition >> 0) & 0xff);
	}

	public static int getY(float thePosition) {
		return (((int) thePosition >> 8) & 0xff);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * controlP5.ControllerInterface#addToXMLElement(controlP5.ControlP5XMLElement
	 * )
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "matrix");
	}

	public void updateDisplayMode(int theMode) {
		_myDisplayMode = theMode;
		switch (theMode) {
		case (DEFAULT):
			_myDisplay = new MatrixDisplay();
			break;
		case (IMAGE):
		case (SPRITE):
		case (CUSTOM):
		default:
			break;
		}
	}

	class MatrixDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			theApplet.noStroke();
			theApplet.fill(color.colorBackground);
			theApplet.rect(0, 0, width, height);
			theApplet.noStroke();
			if (isInside()) {
				theApplet.fill(color.colorForeground);
				theApplet.rect((int) ((theApplet.mouseX - position.x) / stepX) * stepX, (int) ((theApplet.mouseY - position.y) / stepY)
						* stepY, stepX, stepY);
			}
			theApplet.stroke(color.colorActive);
			theApplet.line(cnt * stepX, 0, cnt * stepX, height);
			theApplet.noStroke();
			theApplet.fill(color.colorActive);
			for (int x = 0; x < _myCellX; x++) {
				for (int y = 0; y < _myCellY; y++) {
					if (myMarkers[x][y] == 1) {
						theApplet.rect(x * stepX, y * stepY, stepX - 1, stepY - 1);

					}
				}
			}
		}
	}
}
