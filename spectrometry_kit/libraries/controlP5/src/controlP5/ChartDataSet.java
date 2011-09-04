package controlP5;

import java.util.ArrayList;
import java.util.ListIterator;

@SuppressWarnings("serial")
public class ChartDataSet extends ArrayList<ChartData> {
	
	private CColor _myColors;
	
	private int _myStrokeWeight = 1;
	
	public ChartDataSet() {
		_myColors = new CColor();
	}
	
	public CColor getColor() {
		return _myColors;
	}
	
	public ChartDataSet setColor(int theColor) {
		_myColors.setForeground(theColor);
		return this;
	}
	
	public ChartDataSet setStrokeWeight(int theStrokeWeight) {
		_myStrokeWeight = theStrokeWeight;
		return this;
	}
	
	public int getStrokeWeight() {
		return _myStrokeWeight;
	}
	
	public float[] values() {
		float[] v = new float[size()];
		int n = 0;
		ListIterator<ChartData> litr = listIterator();
    while (litr.hasNext()) {
      v[n++] = litr.next().getValue();
    }
    return v;
	}
	
}
