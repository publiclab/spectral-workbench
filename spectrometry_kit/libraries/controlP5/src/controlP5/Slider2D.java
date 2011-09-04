package controlP5;

import processing.core.PApplet;

public class Slider2D extends Controller {

	protected int cWidth = 10, cHeight = 10;

	protected float cX, cY;

	protected float _myMinX, _myMinY;

	protected float _myMaxX, _myMaxY;

	protected boolean isCrosshairs;

	protected Slider2D(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			int theX,
			int theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myArrayValue = new float[] { 0.0f, 0.0f };
		_myMinX = 0;
		_myMinY = 0;
		_myMaxX = theWidth;
		_myMaxY = theHeight;

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#updateInternalEvents(processing.core.PApplet)
	 */
	public void updateInternalEvents(PApplet theApplet) {
		if (isInside()) {
			if (!ControlP5.keyHandler.isAltDown) {
				float tX = PApplet.constrain(theApplet.mouseX - position.x(), 0, width - cWidth);
				float tY = PApplet.constrain(theApplet.mouseY - position.y(), 0, height - cHeight);
				if (isMousePressed) {
					cX = tX;
					cY = tY;
					updateValue();
				}
			}
		}
	}

	protected void updateValue() {
		setValue(0);
	}

	public void setMinX(float theMinX) {
		_myMinX = theMinX;
		updateValue();
	}

	public void setMinY(float theMinY) {
		_myMinY = theMinY;
		updateValue();
	}

	public void setMaxX(float theMaxX) {
		_myMaxX = theMaxX;
		updateValue();
	}

	public void setMaxY(float theMaxY) {
		_myMaxY = theMaxY;
		updateValue();
	}

	public float getMinX() {
		return _myMinX;
	}

	public float getMinY() {
		return _myMinY;
	}

	public float getMaxX() {
		return _myMaxX;
	}

	public float getMaxY() {
		return _myMaxY;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#setArrayValue(float[])
	 */
	public void setArrayValue(float[] theArray) {
		_myArrayValue = theArray;
		float rX = (width - cWidth) / (float) (_myMaxX - _myMinX);
		float rY = (height - cHeight) / (float) (_myMaxY - _myMinY);
		cX = PApplet.constrain(theArray[0] * rX, 0, width - cWidth);
		cY = PApplet.constrain(theArray[1] * rY, 0, height - cHeight);
		updateValue();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see controlP5.Controller#setValue(float)
	 */
	public void setValue(float theValue) {
		_myArrayValue[0] = cX / ((float) (width - cWidth) / (float) width);
		_myArrayValue[1] = cY / ((float) (height - cHeight) / (float) height);
		_myArrayValue[0] = PApplet.map(_myArrayValue[0], 0, width, _myMinX, _myMaxX);
		_myArrayValue[1] = PApplet.map(_myArrayValue[1], 0, height, _myMinY, _myMaxY);
		_myValueLabel.set(adjustValue(_myArrayValue[0], 0) + "," + adjustValue(_myArrayValue[1], 0));
		broadcast(FLOAT);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * controlP5.ControllerInterface#addToXMLElement(controlP5.ControlP5XMLElement
	 * )
	 */
	public void addToXMLElement(ControlP5XMLElement theElement) {
		ControlP5.logger().info("saving Slider2D is not implemented yet.");
	}
	
	
	public void updateDisplayMode(int theMode) {
		_myDisplayMode = theMode;
		switch (theMode) {
		case (DEFAULT):
			_myDisplay = new Slider2DDisplay();
			break;
		case (IMAGE):
		case (SPRITE):
		case (CUSTOM):
		default:
			break;
		}
	}

	class Slider2DDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {

			theApplet.pushStyle();

			if (theController.isInside()) {
				theApplet.fill(theController.color().colorForeground);
			} else {
				theApplet.fill(theController.color().colorBackground);
			}

			theApplet.rect(0, 0, width, height);

			if (isCrosshairs) {
				if (theController.isInside()) {
					theApplet.stroke(theController.color().colorBackground);
				} else {
					theApplet.stroke(theController.color().colorForeground);
				}
				theApplet.line(0, cY, width, cY);
				theApplet.line(cX, 0, cX, height);
				theApplet.noStroke();
			}

			theApplet.fill(theController.color().colorActive);
			theApplet.rect(cX, cY, cWidth, cHeight);

			theApplet.popStyle();

			_myCaptionLabel.draw(theApplet, 0, height + 4);
			_myValueLabel.draw(theApplet, _myCaptionLabel.width() + 4, height + 4);
		}

	}
}
