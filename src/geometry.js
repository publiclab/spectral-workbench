// Geometric utility storage
Fred.Geometry = {
	distance: function(x1,y1,x2,y2) {
		return Math.sqrt(Math.pow(Math.abs(x1-x2),2) + Math.pow(Math.abs(y1-y2),2))
	},
	/**
	 * Determines of a point is in a polygon. This should be rewritten at some point, as the source
	 * is really nasty.
	 * @param {Node[]} poly Array of nodes that make up the polygon
	 * @param {Number} x    X-coordinate of the point to check for
	 * @param {Number} y    Y-coordinate of the point to check for
	 * 
	 * @return True if the point is inside the polygon, else false
	 * @type Boolean
	 * 
	 * @author Jonas Raoni Soares Silva <a href="http://jsfromhell.com/math/is-point-in-poly">
	 *         http://jsfromhell.com/math/is-point-in-poly</a>
	 */
	is_point_in_poly: function(poly, x, y){
	    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
	        ((poly[i].y <= y && y < poly[j].y) || (poly[j].y <= y && y < poly[i].y))
	        && (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
	        && (c = !c);
	    return c;
	},
	/**
	 * Finds the centroid of a polygon
	 * @param {Node[]} polygon Array of nodes that make up the polygon
	 * @return A tuple, in [x, y] format, with the coordinates of the centroid
	 * @type Number[]
	 */
	poly_centroid: function(polygon) {
		var n = polygon.length
		var cx = 0, cy = 0
		var a = Fred.Geometry.poly_area(polygon,true)
		var centroid = []
		var i,j
		var factor = 0
		
		for (i=0;i<n;i++) {
			j = (i + 1) % n
			factor = (polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y)
			cx += (polygon[i].x + polygon[j].x) * factor
			cy += (polygon[i].y + polygon[j].y) * factor
		}
		
		a *= 6
		factor = 1/a
		cx *= factor
		cy *= factor
		centroid[0] = cx
		centroid[1] = cy
		return centroid
	},
        /**
         * Finds the area of a polygon
         * @param {Fred.Point[]}  points    Array of points with p.x and
		 p.y properties that make up the polygon 
         * @param {Boolean} [signed] If true, returns a signed area, else
		 returns a positive area.
         *                           Defaults to false.
         * @return Area of the polygon
         * @type Number
         */
        poly_area: function(points, signed) {
                var area = 0
                points.each(function(point,index) {
                        if (index < point.length-1) next = points[index+1]
                        else next = points[0]
                        if (index > 0) last = points[index-1]
                        else last = points[points.length-1]
                        area += last.x*point.y-point.x*last.y+point.x*next.y-next.x*point.y
                })
                if (signed) return area/2
                else return Math.abs(area/2)
        }
}
