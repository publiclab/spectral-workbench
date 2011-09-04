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
import java.awt.event.KeyEvent;

/**
 * 
 */
public interface ControlP5Constants {

	public final static String eventMethod = "controlEvent";

	public final static boolean VERBOSE = false;

	public final static float PI = (float) Math.PI;

	public final static float TWO_PI = PI * 2;

	public final static float HALF_PI = PI / 2;

	public final static int INVALID = -1;

	public final static int METHOD = 0;

	public final static int FIELD = 1;
	
	public final static int EVENT = 2;

	public final static int INTEGER = 0;

	public final static int FLOAT = 1;

	public final static int BOOLEAN = 2;

	public final static int STRING = 3;

	public final static int ARRAY = 4;

	public final static Class<?>[] acceptClassList = {
	  int.class, float.class, boolean.class, String.class
	};

	public final static Class<?> controlEventClass = ControlEvent.class;
	
	public final static int UP = KeyEvent.VK_UP;

	public final static int DOWN = KeyEvent.VK_DOWN;

	public final static int LEFT = KeyEvent.VK_LEFT;

	public final static int RIGHT = KeyEvent.VK_RIGHT;

	public final static int SHIFT = KeyEvent.VK_SHIFT;

	public final static int DELETE = KeyEvent.VK_DELETE;

	public final static int BACKSPACE = KeyEvent.VK_BACK_SPACE;

	public final static int ENTER = KeyEvent.VK_ENTER;

	public final static int ESCAPE = KeyEvent.VK_ESCAPE;

	public final static int ALT = KeyEvent.VK_ALT;

	public final static int CONTROL = KeyEvent.VK_CONTROL;

	public final static int TAB = KeyEvent.VK_TAB;

	public final static char INCREASE = KeyEvent.VK_UP;

	public final static char DECREASE = KeyEvent.VK_DOWN;

	public final static char SWITCH_FORE = KeyEvent.VK_LEFT;

	public final static char SWITCH_BACK = KeyEvent.VK_RIGHT;

	public final static char SAVE = 'S';

	public final static char RESET = 'R';

	public final static char PRINT = ' ';

	public final static char HIDE = 'H';

	public final static char LOAD = 'L';

	public final static char MENU = 'M';

	public final static char KEYCONTROL = 'K';

	public final static int TOP = 1;

	public final static int BOTTOM = 2;

	public final static int CENTER = 3;

	public static final int HORIZONTAL = 0;

	public static final int VERTICAL = 1;
	
	public static final int DEFAULT = 0;
	
	public static final int OVER = 1;
	
	public static final int ACTIVE = 2;
	
	public static final int HIGHLIGHT = 3;
	
	public static final int IMAGE = 1;
	
	public static final int SPRITE = 2;
	 
	public static final int CUSTOM = 3;
	
	public static final int SWITCH = 100;
	
	public static final int MOVE = 0;

	public static final int RELEASE = 1;

	public static final int PRESSED = 2;

	public static final int LINE = 1;
	
	public static final int ELLIPSE = 2;
	
	public static final int ARC = 3;
}
