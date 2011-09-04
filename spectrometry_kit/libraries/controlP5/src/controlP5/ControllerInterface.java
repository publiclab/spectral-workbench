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
import java.awt.event.KeyEvent;

/**
 * 
 */
public interface ControllerInterface {

	/**
	 * 
	 */
	public void init();
	
	public int getWidth();
	
	public int getHeight();
	

	/**
	 * 
	 * @return CVector3f
	 */
	public CVector3f position();

	/**
	 * 
	 * @param theX
	 *        float
	 * @param theY
	 *        float
	 */
	public void setPosition(float theX, float theY);

	/**
	 * 
	 * @return CVector3f
	 */
	public CVector3f absolutePosition();

	/**
	 * 
	 */
	public void updateAbsolutePosition();

	/**
	 * 
	 */
	public void update();

	/**
	 * 
	 */
	public void setUpdate(boolean theFlag);

	/**
	 * 
	 * @return boolean
	 */
	public boolean isUpdate();

	/**
	 * 
	 */
	public void updateEvents();

	/**
	 * 
	 */
	public void continuousUpdateEvents();

	/**
	 * a method for putting input events like e.g. mouse or keyboard events and
	 * queries. this has been taken out of the draw method for better
	 * overwriting capability.
	 * 
	 * 
	 */
	public void updateInternalEvents(PApplet theApplet);

	/**
	 * 
	 * @param theApplet
	 *        PApplet
	 */
	public void draw(PApplet theApplet);

	/**
	 * 
	 * @param theElement
	 *        ControllerInterface
	 */
	public void add(ControllerInterface theElement);

	/**
	 * 
	 * @param theElement
	 *        ControllerInterface
	 */
	public void remove(ControllerInterface theElement);

	/**
	 * 
	 */
	public void remove();

	/**
	 * 
	 * @return String
	 */
	public String name();

	/**
	 * 
	 * @return ControlWindow
	 */
	public ControlWindow getWindow();

	/**
	 * 
	 * @return Tab
	 */
	public Tab getTab();

	/**
	 * 
	 * @param theStatus
	 *        boolean
	 * @return boolean
	 */
	public boolean setMousePressed(boolean theStatus);

	/**
	 * 
	 * @param theEvent
	 *        KeyEvent
	 */
	public void keyEvent(KeyEvent theEvent);

	/**
	 * 
	 * @param theValue
	 *        int
	 */
	public void setId(int theValue);

	/**
	 * 
	 * @return int
	 */
	public int id();

	/**
	 * 
	 * @param theString
	 *        String
	 */
	public void setLabel(String theString);

	/**
	 * 
	 * @param theColor
	 *        int
	 */
	public void setColorActive(int theColor);

	/**
	 * 
	 * @param theColor
	 *        int
	 */
	public void setColorForeground(int theColor);

	/**
	 * 
	 * @param theColor
	 *        int
	 */
	public void setColorBackground(int theColor);

	/**
	 * 
	 * @param theColor
	 *        int
	 */
	public void setColorLabel(int theColor);

	/**
	 * 
	 * @param theColor
	 *        int
	 */
	public void setColorValue(int theColor);

	public CColor color();

	/**
	 * 
	 * @param theXMLElement
	 *        ControlP5XMLElement
	 */
	public void addToXMLElement(ControlP5XMLElement theXMLElement);

	/**
	 * 
	 * @return ControlP5XMLElement
	 */
	public ControlP5XMLElement getAsXML();

	/**
	 * 
	 */
	public void show();

	/**
	 * 
	 */
	public void hide();

	/**
	 * 
	 * @return boolean
	 */
	public boolean isVisible();

	/**
	 * 
	 * @param theGroup
	 *        ControlGroup
	 * @param theTab
	 *        Tab
	 * @param theWindow
	 *        ControlWindow
	 */
	public void moveTo(ControlGroup theGroup, Tab theTab, ControlWindow theWindow);

	public float value();

	public String stringValue();

	public boolean isXMLsavable();

	public int getPickingColor();
	
	public ControllerInterface parent();
}
