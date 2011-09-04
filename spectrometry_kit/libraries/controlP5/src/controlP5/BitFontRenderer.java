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
 * adopted from fasttext by Glen Murphy @ http://glenmurphy.com/
 */

import java.awt.Component;
import processing.core.PImage;

/**
 * The bitfontRenderer is used to draw any text labels used by controlP5 by
 * default. The bitfontRenderer is based on a per pixel technique and is not
 * using processing's PFont renderer. To use PFonts within controlP5, take a
 * look at ControlFont
 * 
 * @see controlP5.ControlFont
 * 
 * 
 */
public class BitFontRenderer {
	/**
	 * ftext - fast text for processing. to create a font graphic use the
	 * following string (first character being a space)
	 * !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`
	 * abcdefghijklmnopqrstuvwxyz{|}~
	 * 
	 * free fonts http://www.dafont.com/advocut.font
	 * http://www.dafont.com/grixel-kyrou-9.font
	 * http://www.dafont.com/david-sans.font
	 * http://www.dafont.com/sven-stuber.d516
	 * http://www.dafont.com/supernatural.font
	 * http://www.dafont.com/supertext.font http://www.dafont.com/regupix.font
	 * http://www.dafont.com/optiate.font http://www.dafont.com/superhelio.font
	 * http://www.dafont.com/superbly.font
	 * http://www.fontsquirrel.com/fonts/Audimat-Mono
	 * http://www.fontsquirrel.com/fonts/Envy-Code-R
	 */

	protected static int numFonts = 4;

	protected int[] characters = new int[numFonts];

	protected int[][] charWidth = new int[numFonts][255];

	protected int[] charHeight = new int[numFonts];

	protected int[][][] chars = new int[numFonts][][];

	protected int[] lineHeight = new int[numFonts];

	protected int[] wh = new int[numFonts];

	protected static PImage[] font = new PImage[numFonts];

	public static final int standard58 = ControlP5.standard58;

	public static final int standard56 = ControlP5.standard56;

	public static final int synt24 = ControlP5.synt24;

	public static final int grixel = ControlP5.grixel;

	protected float height;

	// protected int _mySpacing = 0;

	public static boolean isInit = false;

	protected BitFontRenderer(final Component theComponent) {
		loadFonts(theComponent);
		init(0, numFonts);
	}

	private void loadFonts(Component theComponent) {
		if (!isInit) {
			font[0] = new PImage(ControlP5IOHandler.loadImage(theComponent, getClass().getResource("standard58.gif")));
			font[1] = new PImage(ControlP5IOHandler.loadImage(theComponent, getClass().getResource("standard56.gif")));
			font[2] = new PImage(ControlP5IOHandler.loadImage(theComponent, getClass().getResource("synt24.gif")));
			font[3] = new PImage(ControlP5IOHandler.loadImage(theComponent, getClass().getResource("GrixelKyrou9.gif")));
		}
	}

	/*
	 * (non-Javadoc)
	 */
	public BitFontRenderer() {
		loadFonts(null);
		init(0, numFonts);
	}

	private void init(int theStart, int theEnd) {
		isInit = true;

		for (int f = theStart; f < theEnd; f++) {
			charHeight[f] = font[f].height;
			lineHeight[f] = charHeight[f];
			int currWidth = 0;
			int maxWidth = 0;

			for (int i = 0; i < font[f].width; i++) {
				currWidth++;
				if (font[f].pixels[i] == 0xffff0000) {
					charWidth[f][characters[f]] = currWidth;
					characters[f]++;
					if (currWidth > maxWidth) {
						maxWidth = currWidth;
					}
					currWidth = 0;
				}
			}

			// create the character sprites.
			chars[f] = new int[characters[f]][maxWidth * charHeight[f]];
			int indent = 0;
			for (int i = 0; i < characters[f]; i++) {
				for (int u = 0; u < charWidth[f][i] * charHeight[f]; u++) {
					chars[f][i][u] = font[f].pixels[indent + (u / charWidth[f][i]) * font[f].width + (u % charWidth[f][i])];
				}
				indent += charWidth[f][i];
			}
		}
	}

	/**
	 * TODO implement addBitFont
	 * 
	 * @param theImage
	 * @return
	 */
	public int addBitFont(PImage theImage) {
		PImage[] myFonts = new PImage[numFonts];
		System.arraycopy(font, 0, myFonts, 0, font.length);
		numFonts++;

		// increase the array size for all font related containers
		font = new PImage[numFonts];
		System.arraycopy(myFonts, 0, font, 0, myFonts.length);

		int[] myCharacters = new int[numFonts];
		System.arraycopy(characters, 0, myCharacters, 0, characters.length);
		characters = myCharacters;

		int[][] myCharWidth = new int[numFonts][255];
		System.arraycopy(charWidth, 0, myCharWidth, 0, charWidth.length);
		charWidth = myCharWidth;

		int[] myCharHeight = new int[numFonts];
		System.arraycopy(charHeight, 0, myCharHeight, 0, charHeight.length);
		charHeight = myCharHeight;

		int[][][] myChars = new int[numFonts][][];
		System.arraycopy(chars, 0, myChars, 0, chars.length);
		chars = myChars;

		int[] myLineHeight = new int[numFonts];
		System.arraycopy(lineHeight, 0, myLineHeight, 0, lineHeight.length);
		lineHeight = myLineHeight;

		int[] mywh = new int[numFonts];
		System.arraycopy(mywh, 0, mywh, 0, mywh.length);
//		mywh = mywh;

		try {
			font[numFonts - 1] = (PImage) (theImage.get().clone());
		} catch (Exception e) {
			ControlP5.logger().severe(e.toString());
		}
		init(numFonts - 1, numFonts);
		return numFonts - 1;
	}

	/*
	 * (non-Javadoc)
	 */
	public int getWidth(Label theLabel) {
		return getWidth(theLabel.getText(), theLabel, theLabel.getText().length());
	}

	/**
	 * get the width of a text line based on used bit font.
	 * 
	 * @param theText
	 * @param theFontIndex
	 * @return
	 */
	public int getWidth(String theText, final Label theLabel) {
		return getWidth(theText, theLabel, theText.length());
	}

	protected int getWidth(String theText, final Label theLabel, int theLength) {
		int myWidth = 0;
		if (theText == null) {
			theText = " ";
		}
		theText = (theLabel.isToUpperCase) ? theText.toUpperCase() : theText;
		for (int i = 0; i < theLength; i++) {
			final int myIndex = ((int) theText.charAt(i) - 32);
			if (myIndex >= 0 && myIndex <= 95) {
				myWidth += charWidth[theLabel.getFontIndex()][myIndex] + theLabel.getLetterSpacing();
			} else {
				ControlP5.logger().warning("You are using a character that is not supported by controlP5's BitFont-Renderer, you could use ControlFont instead (see the ControlP5controlFont example).");
			}
		}
		return myWidth;
	}

	private void putchar(
			final int theC,
			final int theX,
			final int theY,
			final int theColor,
			boolean theHighlight,
			final PImage theImage,
			final PImage theMask,
			final int theFontIndex) {
		final int myWH = theImage.width * theImage.height;
		final int len = charWidth[theFontIndex][theC] * charHeight[theFontIndex];
		final int w = theY * theImage.width;
		for (int i = 0; i < len; i++) {
			final int xpos = theX + i % charWidth[theFontIndex][theC];
			final int pos = xpos + w + (i / charWidth[theFontIndex][theC]) * theImage.width;
			if (chars[theFontIndex][theC][i] == 0xff000000 && xpos < theImage.width && xpos >= 0 && pos >= 0 && pos < myWH) {
				theImage.pixels[pos] = (!theHighlight) ? theColor : 0xff999999;
				theMask.pixels[pos] = 0xffffffff;
			}
		}
	}

	
	private int writeCharacters(final Label theLabel) {
		int indent = 0;
		final int myOriginalY = theLabel.getOffsetY();
		int myY = theLabel.getOffsetY();
		final String myText = theLabel.isToUpperCase ? theLabel.getText().toUpperCase() : theLabel.getText();
		int myWrap = (theLabel.isMultiline()) ? theLabel.getImage().width : -1;
		final Letter[] letters = new Letter[myText.length()];
		int err = 0;
		for (int i = 0; i < myText.length(); i++) {
			int c = (int) myText.charAt(i);
			
			if (c != 10) {
				if ((myWrap > 0 && indent > myWrap)) {
					indent = theLabel.getOffsetX(); // 0;
					myY += theLabel.getLineHeight();
					final int j = i;
					err++;
					while (i > 0 && err < myText.length()) {
						i--;
						// in case a word longer than the actual width.
						if (i == 1) {
							i = j;
							break;
						}
						// go back until you find a space or a dash.
						if (myText.charAt(i) == ' ' || myText.charAt(i) == '-') {
							i++;
							c = (int) myText.charAt(i);
							break;
						}
					}
				}
				
				if (c >= 127 || c<=32) {
					c = 32;
				}
				
				letters[i] = new Letter(indent, c - 32, myY, (i == theLabel.getCursorPosition() - 1));
				indent += charWidth[theLabel.getFontIndex()][c - 32] + theLabel.getLetterSpacing();
			} else {
				myY += theLabel.getLineHeight();
				indent = 0;
				letters[i] = new Letter(0, -1, 0, false);
			}
		}
		for (int i = 0; i < letters.length; i++) {
			if (letters[i].letter != -1) {
				putchar(letters[i].letter, theLabel.getOffsetX() + letters[i].indent, letters[i].lineheight, theLabel.getColor(), letters[i].isHighlight, theLabel.getImage(), theLabel.getImageMask(), theLabel.getFontIndex());
			}
		}
		return myY - myOriginalY;
	}

	/*
	 * (non-Javadoc)
	 */
	public int write(final Label theLabel) {
		final int myWH = theLabel.getImage().width * theLabel.getImage().height;
		for (int i = 0; i < myWH; i++) {
			theLabel.getImage().pixels[i] = 0x00ffffff;
			theLabel.getImageMask().pixels[i] = 0xff000000;
		}
		final int myHeight = writeCharacters(theLabel);
		theLabel.getImage().mask(theLabel.getImageMask());
		return myHeight;
	}

	private class Letter {
		int indent;
		int letter;
		boolean isHighlight;
		int lineheight;

		Letter(final int theIndent, final int theLetter, final int theLine, final boolean theHighlight) {
			indent = theIndent;
			letter = theLetter;
			isHighlight = theHighlight;
			lineheight = theLine;
		}
	}
}
