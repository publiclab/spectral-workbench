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
public class CVector3f {
	public float x = 0, y = 0, z = 0;

	public CVector3f() {
		x = 0;
		y = 0;
		z = 0;
	}

	public CVector3f(float theX, float theY, float theZ) {
		x = theX;
		y = theY;
		z = theZ;
	}

	public CVector3f(CVector3f theVector3f) {
		x = theVector3f.x();
		y = theVector3f.y();
		z = theVector3f.z();
	}

	public float x() {
		return x;
	}

	public float y() {
		return y;
	}

	public float z() {
		return z;
	}

	public void set(float theX, float theY) {
		x = theX;
		y = theY;
	}

	public void set(CVector3f theVector) {
		x = theVector.x();
		y = theVector.y();
		z = theVector.z();
	}

	public void set(float theX, float theY, float theZ) {
		x = theX;
		y = theY;
		z = theZ;
	}

	public void add(CVector3f theVector) {
		x += theVector.x;
		y += theVector.y;
		z += theVector.z;
	}

	public void sub(CVector3f theVector) {
		x -= theVector.x;
		y -= theVector.y;
		z -= theVector.z;
	}

	public String toString() {
		return x + ", " + y + ", " + z;
	}

}
