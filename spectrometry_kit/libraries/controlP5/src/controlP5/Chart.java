package controlP5;

import java.util.ArrayList;

import processing.core.PApplet;

public class Chart extends Controller {

	// pie-chart
	// histogram-chart
	// bar chart
	// line chart

	// what is the difference in meaning between chart and graph
	// http://answers.yahoo.com/question/index?qid=20090101193325AA3mgMl

	// setType(int type,int allignment HORIZONTAL/VERTICAL);
	public final static int LINE = 0;
	public final static int BAR = 1;
	public final static int HISTOGRAM = 2;
	public final static int PIE = 3;
	public final static int AREA = 4;

	protected ArrayList<ChartDataSet> _myDataSet;

	protected float resolution = 1;

	protected float strokeWeight = 1;
	
	
	protected Chart(
			ControlP5 theControlP5,
			ControllerGroup theParent,
			String theName,
			float theX,
			float theY,
			int theWidth,
			int theHeight) {
		super(theControlP5, theParent, theName, theX, theY, theWidth, theHeight);
		_myDataSet = new ArrayList<ChartDataSet>();
		addDataSet();
	}

	public ChartData addData(ChartData theItem) {
		return addData(0, theItem);
	}

	public ChartData addData(int theSetIndex, ChartData theItem) {
		getDataSet(theSetIndex).add(theItem);
		return theItem;
	}

	public ChartData addData(float theValue) {
		ChartData cdi = new ChartData(theValue);
		getDataSet().add(cdi);
		return cdi;
	}

	public ChartData addData(int theSetIndex, float theValue) {
		ChartData cdi = new ChartData(theValue);
		getDataSet(theSetIndex).add(cdi);
		return cdi;
	}

	public ChartData addData(ChartDataSet theChartData, float theValue) {
		ChartData cdi = new ChartData(theValue);
		theChartData.add(cdi);
		return cdi;
	}

	public ChartData push(float theValue) {
		return push(0, theValue);
	}

	public ChartData push(int theSetIndex, float theValue) {
		if(getDataSet(theSetIndex).size()>(width/resolution)) {
			removeLast(theSetIndex);
		}
		return addFirst(theSetIndex, theValue);
	}

	public ChartData addFirst(float theValue) {
		return addFirst(0, theValue);
	}

	public ChartData addFirst(int theSetIndex, float theValue) {
		ChartData cdi = new ChartData(theValue);
		getDataSet(theSetIndex).add(0, cdi);
		return cdi;
	}

	public Chart removeLast() {
		return removeLast(0);
	}

	public Chart removeLast(int theSetIndex) {
		return removeData(getDataSet(theSetIndex).size() - 1);
	}

	public Chart removeData(ChartData theItem) {
		removeData(0, theItem);
		return this;
	}

	public Chart removeData(int theSetIndex, ChartData theItem) {
		getDataSet(theSetIndex).remove(theItem);
		return this;
	}

	public Chart removeData(int theItemIndex) {
		removeData(0, theItemIndex);
		return this;
	}

	public Chart removeData(int theSetIndex, int theItemIndex) {
		if (getDataSet(theSetIndex).size() < 1) {
			return this;
		}
		getDataSet(theSetIndex).remove(theItemIndex);
		return this;
	}

	public ChartData setData(int theItemIndex, ChartData theItem) {
		getDataSet().set(theItemIndex, theItem);
		return theItem;
	}

	public ChartData setData(int theSetItem, int theItemIndex, ChartData theItem) {
		getDataSet(theSetItem).set(theItemIndex, theItem);
		return theItem;
	}

	public ChartDataSet addDataSet() {
		ChartDataSet cd = new ChartDataSet();
		_myDataSet.add(cd);
		return cd;
	}

	public ChartDataSet setDataSet(ChartDataSet theItems) {
		setDataSet(0, theItems);
		return getDataSet();
	}

	public ChartDataSet setDataSet(int theIndex, ChartDataSet theChartData) {
		_myDataSet.set(theIndex, theChartData);
		return theChartData;
	}

	public Chart removeDataSet(ChartDataSet theChartData) {
		_myDataSet.remove(theChartData);
		return this;
	}

	public void removeDataSet(int theIndex) {
		_myDataSet.remove(theIndex);
	}

	public ChartDataSet updateData(float[] theValues) {
		updateData(0, theValues);
		return getDataSet();
	}

	public ChartDataSet updateData(int theSetIndex, float[] theValues) {
		if (_myDataSet.get(theSetIndex).size() != theValues.length) {
			_myDataSet.get(theSetIndex).clear();
			for (int i = 0; i < theValues.length; i++) {
				_myDataSet.get(theSetIndex).add(new ChartData(0));
			}
		}
		int n = 0;
		resolution = (float) width / (_myDataSet.get(theSetIndex).size() - 1);
		for (float f : theValues) {
			_myDataSet.get(theSetIndex).get(n++).setValue(f);
		}
		return getDataSet(theSetIndex);
	}

	public ChartDataSet getDataSet(int theTableIndex) {
		return _myDataSet.get(theTableIndex);
	}

	public ChartDataSet getDataSet() {
		return getDataSet(0);
	}

	public ChartData getData(int theTableIndex, int theItemIndex) {
		return getDataSet(theTableIndex).get(theItemIndex);
	}

	public ChartData getData(int theIndex) {
		return getDataSet().get(theIndex);
	}

	public int size() {
		return _myDataSet.size();
	}

	@Override
	public void onEnter() {
	}

	@Override
	public void onLeave() {
	}

	@Override
	public void setValue(float theValue) {
		// TODO Auto-generated method stub
	}

	@Override
	public void addToXMLElement(ControlP5XMLElement theXMLElement) {
		// TODO Auto-generated method stub
	}

	public void setStrokeWeight(float theWeight) {
		strokeWeight = theWeight;
	}


	public float getStrokeWeight() {
		return strokeWeight;
	}

	public void setResolution(int theValue) {
		resolution = theValue;
	}
	
	public int getResolution() {
		return (int)resolution;
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
			_myDisplay = new ChartDisplay();
			break;
		case (IMAGE):
			// _myDisplay = new ChartImageDisplay();
			break;
		case (SPRITE):
			// _myDisplay = new ChartSpriteDisplay();
			break;
		case (CUSTOM):
		default:
			break;
		}
	}

	class ChartDisplay implements ControllerDisplay {
		public void display(PApplet theApplet, Controller theController) {
			theApplet.pushStyle();
			theApplet.fill(getColor().getBackground());
			theApplet.rect(0, 0, getWidth(), getHeight());
			
			for (int n = 0; n < size(); n++) {
				theApplet.stroke(getDataSet(n).getColor().getForeground());
				theApplet.strokeWeight(getDataSet(n).getStrokeWeight());
				theApplet.beginShape();
				for (int i = 0; i < getDataSet(n).size(); i++) {
					theApplet.vertex(i * resolution, getHeight() - getDataSet(n).get(i).getValue());
				}
				theApplet.endShape();
			}
			theApplet.noStroke();
			theApplet.popStyle();
		}
	}
}
