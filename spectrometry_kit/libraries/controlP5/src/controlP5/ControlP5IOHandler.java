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

import java.awt.Component;
import java.awt.Image;
import java.awt.MediaTracker;
import java.awt.Toolkit;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.text.CharacterIterator;
import java.text.StringCharacterIterator;
import java.util.Calendar;
import java.util.Hashtable;
import java.util.List;
import java.util.Vector;

import controlP5.Radio.RadioToggle;

/**
 * 
 */
public class ControlP5IOHandler {

	ControlP5 controlP5;

	String _myFilePath;

	String _myUrlPath;

	boolean isLock;

	public ControlP5IOHandler(ControlP5 theControlP5) {
		controlP5 = theControlP5;
	}

	public static Image loadImage(URL theURL) {
		return loadImage(ControlP5.papplet, theURL);
	}

	/**
	 * load an image with MediaTracker to prevent nullpointers e.g. in
	 * BitFontRenderer
	 * 
	 * @param theURL
	 * @return
	 */
	public static Image loadImage(Component theComponent, URL theURL) {
		if (theComponent == null) {
			theComponent = ControlP5.papplet;
		}
		Image img = null;
		img = Toolkit.getDefaultToolkit().createImage(theURL);

		MediaTracker mt = new MediaTracker(theComponent);
		mt.addImage(img, 0);
		try {
			mt.waitForAll();
		} catch (InterruptedException e) {
			ControlP5.logger().severe("loading image failed."+ e.toString());
		} catch (Exception e) {
			ControlP5.logger().severe("loading image failed."+ e.toString());
		}
		return img;
	}

	/**
	 * borrowed from http://www.javapractices.com/Topic96.cjp
	 * 
	 * 
	 * @param aURLFragment
	 *          String
	 * @return String
	 */
	public static String forURL(String aURLFragment) {
		String result = null;
		try {
			result = URLEncoder.encode(aURLFragment, "UTF-8");
		} catch (UnsupportedEncodingException ex) {
			throw new RuntimeException("UTF-8 not supported", ex);
		}
		return result;
	}

	/**
	 * borrowed from http://www.javapractices.com/Topic96.cjp
	 * 
	 * @param aTagFragment
	 *          String
	 * @return String
	 */
	public static String forHTMLTag(String aTagFragment) {
		final StringBuffer result = new StringBuffer();

		final StringCharacterIterator iterator = new StringCharacterIterator(aTagFragment);
		char character = iterator.current();
		while (character != CharacterIterator.DONE) {
			if (character == '<') {
				result.append("&lt;");
			} else if (character == '>') {
				result.append("&gt;");
			} else if (character == '\"') {
				result.append("&quot;");
			} else if (character == '\'') {
				result.append("&#039;");
			} else if (character == '\\') {
				result.append("&#092;");
			} else if (character == '&') {
				result.append("&amp;");
			} else {
				// the char is not a special one
				// add it to the result as is
				result.append(character);
			}
			character = iterator.next();
		}
		return result.toString();
	}

	/**
	 * http://processing.org/discourse/yabb_beta/YaBB.cgi?board=Programs;action=
	 * display;num=1159828167;start=0#0
	 * 
	 * @param string
	 *          String
	 * @return String
	 */
	String URLEncode(String string) {
		String output = new String();
		try {
			byte[] input = string.getBytes("UTF-8");
			for (int i = 0; i < input.length; i++) {
				if (input[i] < 0) {
					// output += ('%' + hex(input[i])); // see hex method in
					// processing
				} else if (input[i] == 32) {
					output += '+';
				} else {
					output += (char) (input[i]);
				}
			}
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}

		return output;
	}

	public static String replace(String theSourceString, String theSearchForString, String theReplaceString) {
		if (theSourceString.length() < 1) {
			return "";
		}
		int p = 0;

		while (p < theSourceString.length() && (p = theSourceString.indexOf(theSearchForString, p)) >= 0) {
			theSourceString = theSourceString.substring(0, p) + theReplaceString
					+ theSourceString.substring(p + theSearchForString.length(), theSourceString.length());
			p += theReplaceString.length();
		}
		return theSourceString;
	}

	/**
	 * convert a hex number into an int
	 * 
	 * @param theHex
	 * @return
	 */
	public static int parseHex(String theHex) {
		int myLen = theHex.length();
		int a, r, b, g;
		switch (myLen) {
		case (8):
			break;
		case (6):
			theHex = "ff" + theHex;
			break;
		default:
			theHex = "ff000000";
			break;
		}
		a = (new Integer(Integer.parseInt(theHex.substring(0, 2), 16))).intValue();
		r = (new Integer(Integer.parseInt(theHex.substring(2, 4), 16))).intValue();
		g = (new Integer(Integer.parseInt(theHex.substring(4, 6), 16))).intValue();
		b = (new Integer(Integer.parseInt(theHex.substring(6, 8), 16))).intValue();
		return (a << 24 | r << 16 | g << 8 | b);
	}

	public static String intToString(int theInt) {
		int a = ((theInt >> 24) & 0xff);
		int r = ((theInt >> 16) & 0xff);
		int g = ((theInt >> 8) & 0xff);
		int b = ((theInt >> 0) & 0xff);
		String sa = ((Integer.toHexString(a)).length() == 1) ? "0" + Integer.toHexString(a) : Integer.toHexString(a);
		String sr = ((Integer.toHexString(r)).length() == 1) ? "0" + Integer.toHexString(r) : Integer.toHexString(r);
		String sg = ((Integer.toHexString(g)).length() == 1) ? "0" + Integer.toHexString(g) : Integer.toHexString(g);
		String sb = ((Integer.toHexString(b)).length() == 1) ? "0" + Integer.toHexString(b) : Integer.toHexString(b);
		return sa + sr + sg + sb;
	}

	/**
	 * save controlP5 settings to your local disk or to a remote server. a file
	 * controlP5.xml will be written to the data folder of your sketch. you can
	 * set another file path with method setFilePath(). to save a file to a remote
	 * server set the url with setUrlPath() e.g.
	 * setUrlPath("http://yourdomain.com/controlP5/upload.php");
	 * 
	 * @shortdesc save controlP5 settings to your local disk or to a remote
	 *            server.
	 * @param theFilename
	 *          String
	 * @return boolean setFilePath ( ) setUrlPath ( ) load ( ) loadUrl ( )
	 * @todo saving in application mode does write the xml file into a folder data
	 *       on top level, but does not load from there. therefore loading in
	 *       application mode one would have to use the inputstreamreader used
	 *       before switching to loadStrings.
	 */
	protected boolean save(ControlP5 theControlP5, String theFilePath) {

		String myHeader = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n";

		ControlP5XMLElement myRoot = new ControlP5XMLElement(new Hashtable(), true, false);

		// setting root element controlP5
		myRoot.setName("controlP5");
		Calendar myCalender = Calendar.getInstance();
		myRoot.setAttribute("date", myCalender.getTime().toString());
		myRoot.setAttribute("filepath", theControlP5.filePath());
		myRoot.setAttribute("urlpath", theControlP5.urlPath());
		myRoot.setAttribute("lock", "" + ControlP5.isMoveable);
		myRoot.setAttribute("colorBackground", ControlP5IOHandler.intToString(theControlP5.color.colorBackground));
		myRoot.setAttribute("colorForeground", ControlP5IOHandler.intToString(theControlP5.color.colorForeground));
		myRoot.setAttribute("colorActive", ControlP5IOHandler.intToString(theControlP5.color.colorActive));
		myRoot.setAttribute("colorLabel", ControlP5IOHandler.intToString(theControlP5.color.colorCaptionLabel));
		myRoot.setAttribute("colorValue", ControlP5IOHandler.intToString(theControlP5.color.colorValueLabel));
		CColor myColor = new CColor(controlP5.color);
		// getting ControlWindows
		for (int k = 0; k < theControlP5.controlWindows().size(); k++) {
			ControlWindow myControlWindow = (ControlWindow) theControlP5.controlWindows().get(k);

			ControllerList myTabs = myControlWindow.tabs();
			ControlP5XMLElement myPappletXMLElement = myControlWindow.getAsXML();

			if (!myColor.equals(myControlWindow.color)) {
				myColor.set(myControlWindow.color);
				myPappletXMLElement.setAttribute("colorBackground", ControlP5IOHandler.intToString(myColor.colorBackground));
				myPappletXMLElement.setAttribute("colorForeground", ControlP5IOHandler.intToString(myColor.colorForeground));
				myPappletXMLElement.setAttribute("colorActive", ControlP5IOHandler.intToString(myColor.colorActive));
				myPappletXMLElement.setAttribute("colorLabel", ControlP5IOHandler.intToString(myColor.colorCaptionLabel));
				myPappletXMLElement.setAttribute("colorValue", ControlP5IOHandler.intToString(myColor.colorValueLabel));
			}

			for (int j = 0; j < myTabs.size(); j++) {
				ControllerGroup myTab = (ControllerGroup) myTabs.get(j);
				/* tab */
				ControlP5XMLElement myTabXMLElement = myTab.getAsXML();

				ControllerList myControllerList = myTab.controllers;

				if (!myColor.equals(myTab.color)) {
					myColor.set(myTab.color);
					myTabXMLElement.setAttribute("colorBackground", ControlP5IOHandler.intToString(myColor.colorBackground));
					myTabXMLElement.setAttribute("colorForeground", ControlP5IOHandler.intToString(myColor.colorForeground));
					myTabXMLElement.setAttribute("colorActive", ControlP5IOHandler.intToString(myColor.colorActive));
					myTabXMLElement.setAttribute("colorLabel", ControlP5IOHandler.intToString(myColor.colorCaptionLabel));
					myTabXMLElement.setAttribute("colorValue", ControlP5IOHandler.intToString(myColor.colorValueLabel));
				}

				for (int i = 0; i < myControllerList.size(); i++) {
					/* controller */
					if (myControllerList.get(i).isXMLsavable()) {
						ControlP5XMLElement c = myControllerList.get(i).getAsXML();
						if (!myColor.equals((myControllerList.get(i)).color())) {
							myColor.set((myControllerList.get(i)).color());
							c.setAttribute("colorBackground", ControlP5IOHandler.intToString(myColor.colorBackground));
							c.setAttribute("colorForeground", ControlP5IOHandler.intToString(myColor.colorForeground));
							c.setAttribute("colorActive", ControlP5IOHandler.intToString(myColor.colorActive));
							c.setAttribute("colorLabel", ControlP5IOHandler.intToString(myColor.colorCaptionLabel));
							c.setAttribute("colorValue", ControlP5IOHandler.intToString(myColor.colorValueLabel));
						}

						myTabXMLElement.addChild(c);
					}
				}
				myPappletXMLElement.addChild(myTabXMLElement);
			}

			myRoot.addChild(myPappletXMLElement);
		}
		// upload xml to a webspace.
		if (theControlP5.urlPath().toLowerCase().startsWith("http://")
				|| theControlP5.urlPath().toLowerCase().startsWith("https://")) {
			try {
				URL url = new URL(theControlP5.urlPath());
				URLConnection connection = url.openConnection();
				((HttpURLConnection) connection).setRequestMethod("POST");
				connection.setDoInput(true);
				connection.setDoOutput(true);
				OutputStreamWriter out = new OutputStreamWriter(connection.getOutputStream());
				out.write("controlP5="
						+ ControlP5IOHandler.forURL(myHeader + ControlP5IOHandler.replace(myRoot.toString(), ">", ">\n")));
				out.flush();
				out.close();
				BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
				while (br.ready()) {
					br.readLine();
				}
				ControlP5.logger().info("uploading xml to " + theControlP5.urlPath() + " .");
			} catch (Exception e) {
				ControlP5.logger().severe("Uploading xml to " + theControlP5.urlPath() + " failed. " + e);
			}
		}
		// save xml to file.
		try {
			if (!ControlP5.papplet.online) {
				if (theFilePath.length() > 1) {
					if (theFilePath.startsWith("data/") == false) {
						if (theFilePath.indexOf('/') == -1 && theFilePath.indexOf('\\') == -1) {
							theFilePath = "data/" + theFilePath;
						}
					}
					ControlP5.papplet.saveStrings(theFilePath, new String[] { myHeader,
							ControlP5IOHandler.replace(myRoot.toString(), ">", ">\n") });
					ControlP5.logger().info("ControlP5 writing file " + theFilePath + " to disk.");
				} else {
					ControlP5.logger().warning("Please specify a filepath in order to save settings to xml.");
				}
			}
		} catch (Exception e) {
			ControlP5.logger().warning("File has not been written to " + theFilePath + " due to " + e);
		}
		return true;
	}

	protected boolean parse(final String theString) {

		try {
			// deactivate auto initialization. and trigger each controller
			// that has been loaded in a for loop at the end of this "try
			// event".
			// do so, because the otherwise the id of a controller gets updated
			// only after the controller has triggered its initialization event.
			boolean myInit = controlP5.isAutoInitialization;
			controlP5.isAutoInitialization = false;

			ControlP5XMLElement myXML = new ControlP5XMLElement();
			myXML.parseString(theString);

			List<ControlP5XMLElement> myControlWindows = myXML.getChildren();

			_myFilePath = myXML.getStringAttribute("filepath");
			_myUrlPath = myXML.getStringAttribute("urlpath");
			isLock = (myXML.getStringAttribute("lock").equals("true")) ? true : false;
			CColor myColor = new CColor();
			myColor.colorBackground = ControlP5IOHandler.parseHex(myXML.getStringAttribute("colorBackground"));
			myColor.colorForeground = ControlP5IOHandler.parseHex(myXML.getStringAttribute("colorForeground"));
			myColor.colorActive = ControlP5IOHandler.parseHex(myXML.getStringAttribute("colorActive"));
			myColor.colorCaptionLabel = ControlP5IOHandler.parseHex(myXML.getStringAttribute("colorLabel"));
			myColor.colorValueLabel = ControlP5IOHandler.parseHex(myXML.getStringAttribute("colorValue"));

			for (int a = 0; a < myControlWindows.size(); a++) {
				ControlP5XMLElement myWindowXMLElement = myControlWindows.get(a);
				/* check for ControlWindow */
				ControlWindow myControlWindow = null;
				if (myWindowXMLElement.getStringAttribute("colorBackground") != null) {
					myColor.colorBackground = ControlP5IOHandler.parseHex(myWindowXMLElement.getStringAttribute("colorBackground"));
					myColor.colorForeground = ControlP5IOHandler.parseHex(myWindowXMLElement.getStringAttribute("colorForeground"));
					myColor.colorActive = ControlP5IOHandler.parseHex(myWindowXMLElement.getStringAttribute("colorActive"));
					myColor.colorCaptionLabel = ControlP5IOHandler.parseHex(myWindowXMLElement.getStringAttribute("colorLabel"));
					myColor.colorValueLabel = ControlP5IOHandler.parseHex(myWindowXMLElement.getStringAttribute("colorValue"));
				}
				if ((myWindowXMLElement.getStringAttribute("class")).startsWith("controlP5.PAppletWindow")) {

					myControlWindow = controlP5.addControlWindow(myWindowXMLElement.getStringAttribute("name"), myWindowXMLElement.getIntAttribute("x"), myWindowXMLElement.getIntAttribute("y"), myWindowXMLElement.getIntAttribute("width"), myWindowXMLElement.getIntAttribute("height"));
					myControlWindow.setBackground(ControlP5IOHandler.parseHex(myWindowXMLElement.getStringAttribute("background")));
				} else {
					myControlWindow = controlP5.controlWindow;
					controlP5.controlWindow.init();
					controlP5.controlWindowList.add(controlP5.controlWindow);
					myControlWindow.setBackground(ControlP5IOHandler.parseHex(myWindowXMLElement.getStringAttribute("background")));
				}

				List<ControlP5XMLElement> myTabs = myWindowXMLElement.getChildren();
				/**
				 * @todo
				 * @todo save the default name in the xml file.
				 */
				String myTabName = "default";

				/**
				 * get tabs for current ControlWindow
				 */
				for (int i = 0; i < myTabs.size(); i++) {
					ControlP5XMLElement myTabXMLElement = myTabs.get(i);

					myTabName = myTabXMLElement.getStringAttribute("name");
					Tab myTab = controlP5.tab(myControlWindow, myTabName);
					myTab.setLabel(myTabXMLElement.getStringAttribute("label"));
					myColor = checkColor(myTabXMLElement, myColor);
					myTab.color.set(myColor);

					List<ControlP5XMLElement> myControllers = myTabXMLElement.getChildren();
					ControlGroup myGroup = null;

					for (int j = 0; j < myControllers.size(); j++) {
						ControlP5XMLElement myControllerElement = myControllers.get(j);
						if (myControllerElement.getName().equals("controller")) {
							parseController(myControllerElement, myGroup, myTab, myControlWindow, myColor);
						} else if (myControllerElement.getName().equals("group")) {
							parseGroup(myControllerElement, myGroup, myTab, myControlWindow, myColor);
						}
					}
				}
			}

			if (myInit == true) {
				for (int i = 0; i < controlP5.getControllerList().length; i++) {
					controlP5.getControllerList()[i].update();
				}
			}
			controlP5.isAutoInitialization = myInit;
			return true;
		} catch (Exception e) {
			ControlP5.logger().severe("Unable to parse file. make sure the file exists. " + e);
			e.printStackTrace();
			return false;
		}
	}

	private void parseGroup(
			ControlP5XMLElement theControllerElement,
			ControlGroup theGroup,
			Tab theTab,
			ControlWindow theControlWindow,
			CColor theColor) {
		ControlGroup g = controlP5.addGroup(theControllerElement.getStringAttribute("name"), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), (int) theControllerElement.getDoubleAttribute("width"));
		g.setLabel(theControllerElement.getStringAttribute("label"));
		g.setId(theControllerElement.getIntAttribute("id"));
		g.moveTo(theGroup, theTab, theControlWindow);
		g.setVisible((int) theControllerElement.getDoubleAttribute("visible") > 0 ? true : false);
		g.setMoveable((int) theControllerElement.getDoubleAttribute("moveable") > 0 ? true : false);
		g.setOpen((int) theControllerElement.getDoubleAttribute("open") > 0 ? true : false);
		theGroup = g;

		theColor = checkColor(theControllerElement, theColor);
		g.color.set(theColor);

		List<ControlP5XMLElement> myChilds = theControllerElement.getChildren();
		for (int j = 0; j < myChilds.size(); j++) {
			ControlP5XMLElement myControllerElement = myChilds.get(j);
			if (myControllerElement.getName().equals("controller")) {
				parseController(myControllerElement, theGroup, theTab, theControlWindow, theColor);
			} else if (myControllerElement.getName().equals("group")) {
				parseGroup(myControllerElement, theGroup, theTab, theControlWindow, theColor);
			}
		}
	}

	private void parseController(
			ControlP5XMLElement theControllerElement,
			ControlGroup theGroup,
			Tab theTab,
			ControlWindow theControlWindow,
			CColor theColor) {
		ControllerInterface myController = null;
		/* slider */
		if (theControllerElement.getStringAttribute("type").equals("slider")) {
			myController = controlP5.addSlider(theControllerElement.getStringAttribute("name"), (float) theControllerElement.getDoubleAttribute("min"), (float) theControllerElement.getDoubleAttribute("max"), (float) theControllerElement.getDoubleAttribute("value"), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), theControllerElement.getIntAttribute("width"), theControllerElement.getIntAttribute("height"));

			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		/* knob */
		else if (theControllerElement.getStringAttribute("type").equals("knob")) {
			myController = controlP5.addKnob(theControllerElement.getStringAttribute("name"), (float) theControllerElement.getDoubleAttribute("min"), (float) theControllerElement.getDoubleAttribute("max"), (float) theControllerElement.getDoubleAttribute("value"), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), theControllerElement.getIntAttribute("width"));
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		/* bang */
		else if (theControllerElement.getStringAttribute("type").equals("bang")) {
			myController = controlP5.addBang(theControllerElement.getStringAttribute("name"), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), (int) theControllerElement.getDoubleAttribute("width"), (int) theControllerElement.getDoubleAttribute("height"));
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		/* textarea */
		else if (theControllerElement.getStringAttribute("type").equals("textarea")) {
			myController = controlP5.addTextarea(theControllerElement.getStringAttribute("name"), theControllerElement.getContent(), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), (int) theControllerElement.getDoubleAttribute("width"), (int) theControllerElement.getDoubleAttribute("height"));
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		/* textlabel */
		else if (theControllerElement.getStringAttribute("type").equals("textlabel")) {
			myController = controlP5.addTextlabel(theControllerElement.getStringAttribute("name"), theControllerElement.getContent(), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"));
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}

		/* radio */
		else if (theControllerElement.getStringAttribute("type").equals("radio")) {
			Radio myRadio = controlP5.addRadio(theControllerElement.getStringAttribute("name"), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"));
			List<ControlP5XMLElement> myRadioButtons = theControllerElement.getChildren();
			for (int k = 0; k < myRadioButtons.size(); k++) {
				ControlP5XMLElement myRadioButtonElement = myRadioButtons.get(k);
				String myRadioToggleLabel = myRadioButtonElement.getStringAttribute("name");
				int myRadioToggleValue = (int) myRadioButtonElement.getDoubleAttribute("value");
				RadioToggle myRadioToggle = myRadio.addItem(myRadioToggleLabel, myRadioToggleValue);
				myRadioToggle.setId(theControllerElement.getIntAttribute("id"));
				if (myRadioButtonElement.getIntAttribute("state") == 1) {
					(myRadio).activate(myRadioToggle.name());
				}
			}
			myController = myRadio;
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		/* ScrollList */
		else if (theControllerElement.getStringAttribute("type").equals("scrolllist")) {
			ScrollList myScrollList = controlP5.addScrollList(theControllerElement.getStringAttribute("name"), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), (int) theControllerElement.getDoubleAttribute("width"), (int) theControllerElement.getDoubleAttribute("height"));
			List<ControlP5XMLElement> myScrollListButtons = theControllerElement.getChildren();
			for (int k = 0; k < myScrollListButtons.size(); k++) {
				ControlP5XMLElement myRadioButtonElement = myScrollListButtons.get(k);
				myScrollList.addItem(myRadioButtonElement.getStringAttribute("name"), (int) myRadioButtonElement.getDoubleAttribute("value")).setId(myRadioButtonElement.getIntAttribute("id"));
			}
			myScrollList.setOpen((int) theControllerElement.getDoubleAttribute("open") > 0 ? true : false);
			myController = myScrollList;
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		/* toggle */
		else if (theControllerElement.getStringAttribute("type").equals("toggle")) {
			myController = controlP5.addToggle(theControllerElement.getStringAttribute("name"), (float) theControllerElement.getDoubleAttribute("value") > 0.5 ? true
					: false, (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), (int) theControllerElement.getDoubleAttribute("width"), (int) theControllerElement.getDoubleAttribute("height"));
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		/* textfield */
		else if (theControllerElement.getStringAttribute("type").equals("textfield")) {
			myController = controlP5.addTextfield(theControllerElement.getStringAttribute("name"), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), theControllerElement.getIntAttribute("width"), theControllerElement.getIntAttribute("height"));
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		/* numberbox */
		else if (theControllerElement.getStringAttribute("type").equals("numberbox")) {
			myController = controlP5.addNumberbox(theControllerElement.getStringAttribute("name"), (float) theControllerElement.getDoubleAttribute("value"), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), (int) theControllerElement.getDoubleAttribute("width"), (int) theControllerElement.getDoubleAttribute("height"));
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		/* button */
		else if (theControllerElement.getStringAttribute("type").equals("button")) {
			myController = controlP5.addButton(theControllerElement.getStringAttribute("name"), (float) theControllerElement.getDoubleAttribute("value"), (int) theControllerElement.getDoubleAttribute("x"), (int) theControllerElement.getDoubleAttribute("y"), (int) theControllerElement.getDoubleAttribute("width"), (int) theControllerElement.getDoubleAttribute("height"));
			int myId = (int) theControllerElement.getIntAttribute("id");
			myController.setId(myId);
		}
		if (myController != null) {
			myController.setLabel(theControllerElement.getStringAttribute("label"));
			myController.setId(theControllerElement.getIntAttribute("id"));
			myController.moveTo(theGroup, theTab, theControlWindow);
			if ((int) theControllerElement.getDoubleAttribute("visible") > 0) {
				myController.show();
			} else {
				myController.hide();
			}

			theColor = checkColor(theControllerElement, theColor);
			if (myController instanceof Controller) {
				((Controller) myController).color().set(theColor);
			} else if (myController instanceof ControlGroup) {
				// ((ControlGroup) myController).color().set(theColor);
			}
		}
	}

	private CColor checkColor(ControlP5XMLElement theControllerElement, CColor theColor) {
		if (theControllerElement.getStringAttribute("colorBackground") != null) {
			theColor.colorBackground = ControlP5IOHandler.parseHex(theControllerElement.getStringAttribute("colorBackground"));
			theColor.colorForeground = ControlP5IOHandler.parseHex(theControllerElement.getStringAttribute("colorForeground"));
			theColor.colorActive = ControlP5IOHandler.parseHex(theControllerElement.getStringAttribute("colorActive"));
			theColor.colorCaptionLabel = ControlP5IOHandler.parseHex(theControllerElement.getStringAttribute("colorLabel"));
			theColor.colorValueLabel = ControlP5IOHandler.parseHex(theControllerElement.getStringAttribute("colorValue"));
		}
		return theColor;
	}

}
