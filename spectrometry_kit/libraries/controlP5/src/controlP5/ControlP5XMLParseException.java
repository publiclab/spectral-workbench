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
 * An XMLParseException is thrown when an error occures while parsing an XML
 * string.
 * <P>
 * $Revision: 1.1 $<BR>
 * $Date: 2005/03/23 12:41:56 $
 * <P>
 *
 * @see nanoxml.XMLElement
 *
 * @author Marc De Scheemaecker
 * @version $Name: $, $Revision: 1.1 $
 * 
 */
public class ControlP5XMLParseException
    extends RuntimeException {

    /**
     *
     */
    private static final long serialVersionUID = 1746316333291927094L;

    /**
     * Indicates that no line number has been associated with this exception.
     */
    public static final int NO_LINE = -1;

    /**
     * The line number in the source code where the error occurred, or
     * <code>NO_LINE</code> if the line number is unknown.
     *
     * <dl>
     * <dt><b>Invariants:</b></dt>
     * <dd>
     * <ul>
     * <li><code>lineNr &gt 0 || lineNr == NO_LINE</code>
     * </ul>
     * </dd>
     * </dl>
     */
    private int lineNr;

    /**
     * Creates an exception.
     *
     * @param name
     *            The name of the element where the error is located.
     * @param message
     *            A message describing what went wrong.
     *
     * </dl>
     * <dl>
     * <dt><b>Preconditions:</b></dt>
     * <dd>
     * <ul>
     * <li><code>message != null</code>
     * </ul>
     * </dd>
     * </dl>
     *
     * <dl>
     * <dt><b>Postconditions:</b></dt>
     * <dd>
     * <ul>
     * <li>getLineNr() => NO_LINE
     * </ul>
     * </dd>
     * </dl>
     * <dl>
     */
    public ControlP5XMLParseException(String name, String message) {
        super("XML Parse Exception during parsing of "
              + ( (name == null) ? "the XML definition"
                 : ("a " + name + " element")) + ": " + message);
        this.lineNr = ControlP5XMLParseException.NO_LINE;
    }


    /**
     * Creates an exception.
     *
     * @param name
     *            The name of the element where the error is located.
     * @param lineNr
     *            The number of the line in the input.
     * @param message
     *            A message describing what went wrong.
     *
     * </dl>
     * <dl>
     * <dt><b>Preconditions:</b></dt>
     * <dd>
     * <ul>
     * <li><code>message != null</code>
     * <li><code>lineNr &gt; 0</code>
     * </ul>
     * </dd>
     * </dl>
     *
     * <dl>
     * <dt><b>Postconditions:</b></dt>
     * <dd>
     * <ul>
     * <li>getLineNr() => lineNr
     * </ul>
     * </dd>
     * </dl>
     * <dl>
     */
    public ControlP5XMLParseException(String name, int lineNr, String message) {
        super("XML Parse Exception during parsing of "
              + ( (name == null) ? "the XML definition"
                 : ("a " + name + " element")) + " at line " + lineNr
              + ": " + message);
        this.lineNr = lineNr;
    }


    /**
     * Where the error occurred, or <code>NO_LINE</code> if the line number is
     * unknown.
     *
     * @see nanoxml.XMLParseException#NO_LINE
     */
    public int getLineNr() {
        return this.lineNr;
    }

}
