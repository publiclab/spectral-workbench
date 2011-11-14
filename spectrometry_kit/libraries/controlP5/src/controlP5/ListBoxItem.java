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

public class ListBoxItem {
	protected String name;
	protected String text;
	protected int value;
	protected boolean isActive;
	protected CColor color;
	protected int id = -1;
		
	protected ListBoxItem(
			ListBox theListBox,
	        String theName,
	        int theValue) {
		name = theName;
		text = theName;
		value = theValue;
		color = new CColor(theListBox.color);
	}
	
	public CColor getColor() {
		return color;
	}
	
	public void setColor(CColor theColor) {
		color.set(theColor);
	}
	
	public void setColorActive(int theColor) {
		color.colorActive = theColor;
	}
	
	public void setColorForeground(int theColor) {
		color.colorForeground = theColor;
	}
	
	public void setColorBackground(int theColor) {
		color.colorBackground = theColor;
	}
	
	public void setColorLabel(int theColor) {
		color.colorCaptionLabel = theColor;
	}
	
	
	public void setId(int theId) {
		id = theId;
	}
	public int getId() {
		return id;
	}
}