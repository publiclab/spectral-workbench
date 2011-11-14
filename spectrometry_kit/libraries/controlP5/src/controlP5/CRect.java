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
/**
 * 
 */
public class CRect {
	private float x, y;

	private float width, height;

	private float x0, y0, x1, y1;

	public CRect() {
		x = 0;
		y = 0;
		width = 0;
		height = 0;
		x0 = 0;
		x1 = 0;
		y0 = 0;
		y1 = 0;
	}

	public CRect(float theX, float theY, float theWidth, float theHeight) {
		x = theX;
		y = theY;
		width = theWidth;
		height = theHeight;
		x0 = theX;
		y0 = theY;
		x1 = x0 + width;
		y1 = y0 + height;
	}

	public CRect(CRect theRect) {
		x = theRect.x;
		y = theRect.y;
		x0 = theRect.x0;
		y0 = theRect.y0;
		x1 = theRect.x1;
		y1 = theRect.y1;
		width = theRect.width;
		height = theRect.height;
	}

	public float x() {
		return x;
	}

	public float y() {
		return y;
	}

	public float x0() {
		return x0;
	}

	public float y0() {
		return y0;
	}

	public float x1() {
		return x1;
	}

	public float y1() {
		return y1;
	}

	public void x(float theX) {
		x = theX;
		x0 = x;
		x1 = x + width;
	}

	public void y(float theY) {
		y = theY;
		y0 = y;
		y1 = y + height;
	}

	public void x0(float theX0) {
		x(theX0);
	}

	public void y0(float theY0) {
		y(theY0);
	}

	public void x1(float theX1) {
		x1 = theX1;
		width = x1 - x0;
	}

	public void y1(float theY1) {
		y1 = theY1;
		height = y1 - y0;
	}

	public float width() {
		return width;
	}

	public float height() {
		return height;
	}

	public void width(float theWidth) {
		width = theWidth;
		x1 = x + width;
	}

	public void height(float theHeight) {
		height = theHeight;
		y1 = y + height;
	}

	public String toString() {
		return x0 + " " + y0 + " " + x1 + " " + y1;
	}

	public static boolean inside(CRect theRect, CVector3f theVector) {
		return (theVector.x > theRect.x0 && theVector.x < theRect.x1 && theVector.y > theRect.y0 && theVector.y < theRect.y1);
	}

	public static boolean inside(CRect theRect, float theX, float theY) {
		return (theX > theRect.x0 && theX < theRect.x1 && theY > theRect.y0 && theY < theRect.y1);
	}

}
