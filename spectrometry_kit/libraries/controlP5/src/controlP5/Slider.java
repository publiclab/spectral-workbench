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
import java.util.Vector;

import controlP5.Button.ButtonDisplay;
import controlP5.Button.ButtonImageDisplay;
import controlP5.Button.ButtonSpriteDisplay;

import processing.core.PApplet;

/**
 * a slider is either used horizontally or vertically. when adding a slider to
 * controlP5, the width is compared versus the height. width is bigger, you get
 * a horizontal slider, height is bigger, you get a vertical slider. a slider
 * can have a fixed slide controller (one end of the slider is fixed to the left
 * or bottom side of the controller), or a flexible slide control (a knob that
 * you can drag).
 * 
 * 
 * @example ControlP5slider
 * @nosuperclasses Controller Controller
 */
public class Slider extends Controller {

	private int _myDirection;

	public final static int FIX = 1;

	public final static int FLEXIBLE = 0;

	protected int _mySliderMode = FIX;

	protected float _myValuePosition;

	protected float _mySliderbarSize = 0;

	protected ArrayList<TickMark> _myTickMarks;

	protected boolean isShowTickMarks;

	protected boolean isSnapToTickMarks;

	protected static int autoWidth = 150;

	protected static int autoHeight = 10;

	// TODO replace and include Label alignments
	// and positioning in Controller class

	protected int alignValueLabel = CENTER;

	public int valueLabelPositioning = FIX;

	/*
	 * @todo currently the slider value goes up and down linear, provide an option
	 * to make it logarithmic, potential, curved.
	 */
	/**
	 * 
	 * @example ControlP5slider
	 * 
	 * @param theControlP5 ControlP5
	 * @param theParent ControllerGroup
	 * @param theName String
	 * @param theMin float
	 * @param theMax float
	 * @param theDefaultValue float
	 * @param theX int
	 * @param theY int
	 * @param theWidth int
	 * @param theHeight int
	 */
	public Slider(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			float theMin,
			float theMax,
			float theDefaultValue,
			int theX,
			int theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myCaptionLabel = new Label(theName, color.colorCaptionLabel);
		_myMin = theMin;
		_myMax = theMax;
		// initialize the valueLabel with the longest string available, which is
		// either theMax or theMin.
		_myValueLabel = new Label(""
				+ (((adjustValue(_myMax)).length() > (adjustValue(_myMin)).length()) ? adjustValue(_myMax)
						: adjustValue(_myMin)), color.colorValueLabel);
		// after initializing valueLabel, set the value to
		// the default value.
		_myValueLabel.set("" + adjustValue(_myValue));
		_myValue = theDefaultValue;
		_myTickMarks = new ArrayList<TickMark>();
		setSliderMode(FIX);
		_myDirection = (width > height) ? HORIZONTAL : VERTICAL;
		if (_myDirection == HORIZONTAL) {
			alignValueLabel = CENTER;
			valueLabelPositioning = FIX;
		} else {
			valueLabelPositioning = FLEXIBLE;
		}
		valueLabel();
	}

	/**
	 * use the slider mode to set the mode of the slider bar, which can be
	 * Slider.FLEXIBLE or Slider.FIX
	 * 
	 * @param theMode int
	 */
	public void setSliderMode(int theMode) {
		_mySliderMode = theMode;
		if (_mySliderMode == FLEXIBLE) {
			_mySliderbarSize = 10;
		} else {
			_mySliderbarSize = 0;
		}
		_myUnit = (_myMax - _myMin) / ((width > height) ? width - _mySliderbarSize : height - _mySliderbarSize);
		setValue(_myValue);
	}

	/**
	 * @see ControllerInterface.updateInternalEvents
	 * 
	 */
	public void updateInternalEvents(PApplet theApplet) {
		if (isVisible) {
			if (isMousePressed && !ControlP5.keyHandler.isAltDown) {
				if (_myDirection == HORIZONTAL) {
					setValue(_myMin + (_myControlWindow.mouseX - (_myParent.absolutePosition().x() + position.x)) * _myUnit);
				} else {
					setValue(_myMin + (-(_myControlWindow.mouseY - (_myParent.absolutePosition().y() + position.y) - height))
							* _myUnit);
				}
			}
		}
	}

	protected void snapValue(float theValue) {
		if (isSnapToTickMarks) {
			_myValuePosition = ((_myValue - _myMin) / _myUnit);
			float n = PApplet.round(PApplet.map(_myValuePosition, 0, (_myDirection == HORIZONTAL) ? getWidth() : getHeight(), 0, _myTickMarks.size() - 1));
			_myValue = PApplet.map(n, 0, _myTickMarks.size() - 1, _myMin, _myMax);
		}
	}

	/**
	 * set the value of the slider.
	 * 
	 * @param theValue float
	 */
	public void setValue(float theValue) {
		_myValue = theValue;
		snapValue(_myValue);
		_myValue = (_myValue <= _myMin) ? _myMin : _myValue;
		_myValue = (_myValue >= _myMax) ? _myMax : _myValue;
		_myValuePosition = ((_myValue - _myMin) / _myUnit);
		_myValueLabel.set(adjustValue(_myValue));
		broadcast(FLOAT);
	}

	public void update() {
		setValue(_myValue);
	}

	/**
	 * set the minimum value of the slider.
	 * 
	 * @param theValue float
	 */
	public void setMin(float theValue) {
		_myMin = theValue;
		setSliderMode(_mySliderMode);
	}

	/**
	 * set the maximum value of the slider.
	 * 
	 * @param theValue float
	 */
	public void setMax(float theValue) {
		_myMax = theValue;
		setSliderMode(_mySliderMode);
	}

	/**
	 * set the width of the slider.
	 * 
	 * @param theValue int
	 */
	public Controller setWidth(int theValue) {
		width = theValue;
		setSliderMode(_mySliderMode);
		return this;
	}

	/**
	 * set the height of the slider.
	 * 
	 * @param theValue int
	 */
	public Controller setHeight(int theValue) {
		height = theValue;
		setSliderMode(_mySliderMode);
		return this;
	}

	/**
	 * 
	 * @param theElement ControlP5XMLElement
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		theElement.setAttribute("type", "slider");
		theElement.setAttribute("min", new Float(min()));
		theElement.setAttribute("max", new Float(max()));
	}

	public void onEnter() {
	}

	public void onLeave() {
	}

	/*
	 * TODO new implementations follow:
	 * http://www.ibm.com/developerworks/java/library/j-dynui/ take interface
	 * builder as reference
	 */

	protected void setTickMarks() {

	}

	public void setNumberOfTickMarks(int theNumber) {
		int n = theNumber - _myTickMarks.size();
		if (n <= theNumber) {
			for (int i = 0; i < n; i++) {
				_myTickMarks.add(new TickMark(this));
			}
		}
		showTickMarks(true);
		snapToTickMarks(true);
		setValue(_myValue);
	}

	public int getNumberOfTickMarks() {
		return _myTickMarks.size();
	}

	public void showTickMarks(boolean theFlag) {
		isShowTickMarks = theFlag;
	}

	public void snapToTickMarks(boolean theFlag) {
		isSnapToTickMarks = theFlag;
	}

	// set the label of a tick.
	public TickMark getTickMark(int theIndex) {
		if (theIndex >= 0 && theIndex < _myTickMarks.size()) {
			return _myTickMarks.get(theIndex);
		} else {
			return null;
		}
	}

	public ArrayList<TickMark> getTickMarks() {
		return _myTickMarks;
	}

	/**
	 * use static variables ControlP5.TOP, ControlP5.CENTER, ControlP5.BOTTOM to
	 * align the ValueLabel of a slider.
	 * 
	 * @param theValue
	 */
	public void alignValueLabel(int theValue) {
		alignValueLabel = theValue;
	}

	public Controller linebreak() {
		controlP5.linebreak(this, true, autoWidth, autoHeight, autoSpacing);
		return this;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#updateDisplayMode(int)
	 */
	public void updateDisplayMode(int theMode) {
		_myDisplayMode = theMode;
		switch (theMode) {
		case (DEFAULT):
			_myDisplay = new SliderDisplay();
			break;
		case (IMAGE):
			// TODO
			// _myDisplay = new ButtonImageDisplay();
			break;
		case (SPRITE):
			// TODO
			// _myDisplay = new ButtonSpriteDisplay();
			break;
		case (CUSTOM):
		default:
			break;

		}
	}

	class SliderDisplay implements ControllerDisplay {

		public void display(PApplet theApplet, Controller theController) {
			theApplet.fill(color.colorBackground);
			theApplet.noStroke();
			theApplet.rect(0, 0, width, height);
			theApplet.fill(getIsInside() ? color.colorActive : color.colorForeground);
			if (_myDirection == HORIZONTAL) {
				if (_mySliderMode == FIX) {
					theApplet.rect(0, 0, _myValuePosition, height);
				} else {
					if (isShowTickMarks) {
						theApplet.triangle(_myValuePosition, 0, _myValuePosition + _mySliderbarSize, 0, _myValuePosition
								+ _mySliderbarSize / 2, height);
					} else {
						theApplet.rect(_myValuePosition, 0, _mySliderbarSize, height);
					}

				}
			} else {
				if (_mySliderMode == FIX) {
					theApplet.rect(0, height, width, -_myValuePosition);
				} else {
					if (isShowTickMarks) {
						theApplet.triangle(width, height - _myValuePosition, width, height - _myValuePosition - _mySliderbarSize, 0, height
								- _myValuePosition - _mySliderbarSize / 2);
					} else {
						theApplet.rect(0, height - _myValuePosition - _mySliderbarSize, width, _mySliderbarSize);
					}
				}
			}

			if (isLabelVisible) {
				int py = 0;
				int px = 0;
				if (_myDirection == HORIZONTAL) {
					_myCaptionLabel.draw(theApplet, width + 3, height / 2 - 3);
					switch (alignValueLabel) {
					case (TOP):
						py = -10;
						break;
					case (CENTER):
					default:
						py = height / 2 - 3;
						px = 3;
						break;
					case (BOTTOM):
						py = height + 3;
						break;
					}
					_myValueLabel.draw(theApplet, (valueLabelPositioning == FIX) ? px : (int) (_myValuePosition), py);

				} else {
					_myCaptionLabel.draw(theApplet, 0, height + 3);
					switch (alignValueLabel) {
					case (TOP):
					default:
						py = -10;
						break;
					case (CENTER):
						py = height / 2 - 3;
						px = 3;
						break;
					case (BOTTOM):
						py = height + 3;
						break;
					}
					_myValueLabel.draw(theApplet, (valueLabelPositioning == FIX) ? 0 : width + 4, (valueLabelPositioning == FIX) ? py
							: -(int) _myValuePosition + height - 8);
				}
			}

			if (isShowTickMarks) {
				theApplet.pushStyle();
				theApplet.pushMatrix();
				float n = (_myDirection == HORIZONTAL) ? getWidth() : getHeight();

				if (_myDirection == HORIZONTAL) {
					theApplet.translate((_mySliderMode == FIX) ? 0 : _mySliderbarSize / 2, getHeight());
				} else {
					theApplet.translate(-4, (_mySliderMode == FIX) ? 0 : _mySliderbarSize / 2);
				}

				float x = (n - ((_mySliderMode == FIX) ? 0 : _mySliderbarSize)) / (_myTickMarks.size() - 1);
				for (TickMark tm : _myTickMarks) {
					tm.draw(theApplet, _myDirection);
					if (_myDirection == HORIZONTAL) {
						theApplet.translate(x, 0);
					} else {
						theApplet.translate(0, x);
					}
				}
				theApplet.popMatrix();
				theApplet.popStyle();
			}
		}
	}
}
