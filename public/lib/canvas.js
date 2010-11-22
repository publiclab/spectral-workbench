6/**
 * @namespace Canvas functions, wrapped into shorter, simpler names and abstracted for cross-browser
 *            compatability. Adapted from the <a href="http://cartagen.org">Cartagen framework</a>
 * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes>
 *      MDC Docs</a>
 */

//whats this?
//CanvasTextFunctions.enable(this.canvas)

/**
 * The namespace has been stripped in favor of global functions for the most common drawing functions.
 * However, additional and less common functions may still be stored in the $C namespace.
 */
$C = {}

/**
 * Clears the canvas; if 'name' is supplied, clears the canvas with name 'name'
 */
function clear(){
	$C.clearRect(0, 0, Fred.width, Fred.height)
}	

/**
 * Sets canvas.fillStyle
 * @param {String} color Color to use for future fill operations
 */
function fillStyle(color) {
	if (color) $C.fillStyle = color
	else $C.fillStyle = 'rgba(0,0,0,0)'
}

/**
 * Sets the fill style of the canvas to a pattern.
 * @param {Image}  image  Image to use for pattern
 * @param {String} repeat How to repeat pattern - "repeat", "repeat-x", "repeat-y", or
 *                        "no-repeat"
 */
function fillPattern(image, repeat) {
	if (image.width) {
		$C.fillStyle = $C.createPattern(image, repeat)
	}
}

/**
 * Draws an image at x,y
 * @param {Image}  image  Image to display: a JavaScript Image object. 
 * 		Can also accept a Canvas element, but check Canvas docs.
 * 		Fails gracefully if the image hasn't loaded yet.
 * @param {Number} x coordinate at which to display image
 * @param {Number} y coordinate at which to display image
 */
function drawImage(image, x,y) {
	if (image && image.width) $C.drawImage(image, x, y) 
}

/**
 * Alias of canvas.translate
 * @param {Number} x Number of pixels to tranlate in the x direction
 * @param {Number} y Number of pixels to tranlate in the y direction
 */
function translate(x,y) {
	$C.translate(x,y)
}
	
/**
 * Alias of canvas.scale
 * @param {Number} x Number of pixels to stretch/shring in the x 
 *                   direction
 * @param {Number} y Number of pixels to stretch/shring in the y 
 *                   direction
 */
function scale(x,y) {
	$C.scale(x,y)
}
	
/**
 * Alias of canvas.rotate
 * @param {Number} rotation Amount, in radians, to rotate
 */
function rotate(rotation){
	$C.rotate(rotation)
}
	
/**
 * Alias of canvas.fillRect (filled rectangle)
 * @param {Number} x X-coord of the top-left corner
 * @param {Number} y Y-coord of the top-left corner
 * @param {Number} w Width of the rectangle
 * @param {Number} h Height of the rectangle
 */
function rect(x, y, w, h){
	$C.fillRect(x, y, w, h)
}

/**
 * Draws a filled circle at x,y with radius r
 * @param {Number} x X-coord of the center of the circle
 * @param {Number} y Y-coord of the center of the circle
 * @param {Number} r Radius of the circle
 */
function circle(x, y, r){
	beginPath()
	arc(x, y, r, 0, 2*Math.PI, true)
	fill()
}

/**
 * Draws an unfilled circle at x,y with radius r
 * @param {Number} x X-coord of the center of the circle
 * @param {Number} y Y-coord of the center of the circle
 * @param {Number} r Radius of the circle
 */
function strokeCircle(x, y, r){
	beginPath()
	arc(x, y, r, 0, 2*Math.PI, true)
	stroke()
}

/**
 * Alias of canvas.strokeRect (unfilled rectangle)
 * @param {Number} x X-coord of the top-left corner
 * @param {Number} y Y-coord of the top-left corner
 * @param {Number} w Width of the rectangle
 * @param {Number} h Height of the rectangle
 */
function strokeRect(x, y, w, h){
	$C.strokeRect(x, y, w, h)
}
	
/**
 * Alias of canvas.strokeStyle
 * @param {String} color Color to use for future stroke operations
 */
function strokeStyle(color) {
	if (color) $C.strokeStyle = color
	else $C.strokeStyle = "rgba(0,0,0,0)"
}
	
/**
 * Sets how succesive lines are joined.
 * @param {String} style Style string - 'round', 'bevel', or 'miter'
 */
function lineJoin(style) {
	$C.lineJoin = style
}
	
/**
 * Sets how the end of a line is styled.
 * @param {String} style Style string - 'round', 'butt', or 'square'
 */
function lineCap(style) {
	$C.lineCap = style
}
	
/**
 * Sets canvas.lineWidth
 * @param {Number} lineWidth New width, in pixels, to use for stroke
 *                           operations
 */
function lineWidth(lineWidth){
	if (parseInt(lineWidth) == 0) {
		$C.lineWidth = 0.000000001	
	} else {
		$C.lineWidth = lineWidth
	}
}
	
/**
 * Alias of canvas.beginPath
 */
function beginPath(){
	$C.beginPath()
}
	
/**
 * Alias of canvas.moveTo
 * @param {Number} x X-coord of location to move to
 * @param {Number} y Y-coord of location to move to
 */
function moveTo(x, y){
	$C.moveTo(x, y)
}
	
/**
 * Alias of canvas.lineTo
 * @param {Number} x X-coord of location to draw line to
 * @param {Number} y Y-coord of location to draw line to
 */
function lineTo(x, y){
	$C.lineTo(x, y)
}
	
/**
 * Draws a bezier curve
 * @param {Number} cp_x X-coord of control point
 * @param {Number} cp_y Y-coord of control point
 * @param {Number} cp2_x X-coord of 2nd control point
 * @param {Number} cp2_y Y-coord of 2nd control point
 * @param {Number} x    X-coord of point to draw to
 * @param {Number} y    Y-coord of point to draw to
 * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves">
 *      MDC Docs</a>
 * @function
 */
function bezierCurveTo(cp_x, cp_y, cp2_x, cp2_y, x, y){
	$C.bezierCurveTo(cp_x, cp_y, cp2_x, cp2_y, x, y)
}

/**
 * Draws a quadratic curve
 * @param {Number} cp_x X-coord of control point
 * @param {Number} cp_y Y-coord of control point
 * @param {Number} x    X-coord of point to draw to
 * @param {Number} y    Y-coord of point to draw to
 * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves">
 *      MDC Docs</a>
 * @function
 */
function quadraticCurveTo(cp_x, cp_y, x, y){
	$C.quadraticCurveTo(cp_x, cp_y, x, y)
}
	
/**
 * Draws a stroke along the current path.
 * @function
 */
function stroke(){
	$C.stroke()
}
	
/**
 * Draws an outlined (dotted, outlined, etc) stroke along the current path.
 * @function
 */
function outline(color,width){
	save()
	// this should eventually inherit from the master default styles
		strokeStyle(color)
		lineWidth(lineWidth+(width*2))
	stroke()
	restore()
	stroke()
}
	
/**
 * Closes the current path, then fills it.
 */
function fill(){
	$C.fill()
}
	
/**
 * Draws an arc
 * @param {Number} x                   X-coord of circle's center
 * @param {Number} y                   Y-coord of circle's center
 * @param {Number} radius              Radius of circle
 * @param {Number} startAngle          Angle, in radians, from the +x axis to start the arc
 *                                     from
 * @param {Number} endAngle            Angle, in radians, from the +x axis to end the arc 
 *                                     at
 * @param {Boolean} [counterclockwise] If true, arc is drawn counterclockwise. Else, it is
 *                                     drawn clockwise
 */
function arc(x, y, radius, startAngle, endAngle, counterclockwise){
	$C.arc(x, y, radius, startAngle, endAngle, counterclockwise)
}

/**
 * Draws text on the canvas. Fonts are not supported in all
 * broswers.
 * @param {String} font Font to use
 * @param {Number} size Size, in pts, of text
 * @param {Number} x    X-coord to start drawing at
 * @param {Number} y    Y-coord to start drawing at
 * @param {String} text Text to draw
 */
function drawText(font, size, color, x, y, text){
	if ($C.fillText) {
		$C.fillStyle = color
		$C.font = size+'pt ' + font
		$C.fillText(text, x, y)
	} else {
		$C.strokeStyle = color
		$C.drawText(font, size, x, y, text)
	}
}

/**
 * Measures the width, in pixels, that the text will be
 * @param {Object} font Font that will be drawn with
 * @param {Object} size Size, in pts, of text
 * @param {Object} text Text to be measured
 */
function measureText(font, size, text) {
	if ($C.fillText) {
		$C.font = size + 'pt ' + font
		var width = $C.measureText(text)
		// some browsers return TextMetrics
		if (width.width) return width.width
		return width
	} else {
		return $C.measureCanvasText(font, size, text)
	}
}

/**
 * Sets the canvas' globalAlpha.
 * @param {Number} alpha New alpha value, between 0 and 1.
 */
function opacity(alpha) {
	$C.globalAlpha = alpha
}

/**
 * Saves the state of the canvas
 * @see $C.restore
 */
function save() {
	$C.save()
}

/**
 * Restores the canvas its last saved state.
 * @see $C.save
 */
function restore() {
	// if ($C.frozen) return
	$C.restore()
}
/**
 * Return a url that contains all the data in the canvas. Essentially,
 * it is a link to an image of the canvas.
 * @return Data url
 * @type String
 */
function toDataUrl() {
	return $C.toDataURL()
}

/**
 * Identical to to_data_url, but produces an image much larger than the screen, for print quality
 * @param {Number} width Width of resulting image in pixels
 * @param {Number} height Height of resulting image in pixels
 * @return Data url
 * @type String
 */
function toPrintDataUrl(width,height) {
	var _height = Glop.height, _width = Glop.width
	Glop.width = width
	Glop.height = height
	Glop.draw(true) // with a custom size
	var url = $C.toDataURL()
	Glop.width = _width
	Glop.height = _height
	return url
}

function cursor(cursor) {
	Fred.element.style.cursor = cursor
}

