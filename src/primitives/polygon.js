// Basic, universal Polygon class
Fred.Polygon = Class.create({
	initialize: function(points) {
		this.point_size = 12
		if (points) this.points = points
		else this.points = []
		this.selected = true
		this.x = 0
		this.y = 0
	},
	name: 'untitled polygon',
	style: {
		fill: '#ccc',
		stroke: '#222'
	},
	apply_style: function() {
		lineWidth(2)
	},
	// run after editing -- refreshes things like area, centroid, x and y
	refresh: function() {
		centroid = Fred.Geometry.poly_centroid(this.points)
		this.x = centroid[0]
		this.y = centroid[1]
	},
	// Checks if the mouse is inside a control point
	// and returns the control point or false
	in_point: function() {
		if (this.points) {
			var in_point = false
			this.points.each(function(point) {
				if (Fred.Geometry.distance(Fred.pointer_x,Fred.pointer_y,point.x,point.y) < this.point_size) in_point = point
			},this)
			return in_point
		} else  {
			return false
		}
	},
	draw: function() {
		// when first creating the poly, there are no points:
		if (this.points && this.points.length > 0) {
			this.apply_style()
			var over_point = false
			beginPath()
			moveTo(this.points[0].x,this.points[0].y)
			// bezier madness. There's probably a better way but i'm jetlagged
			this.points.each(function(point,index){
				var last_point = this.points[index-1]
				var next_point = this.points[index+1]
				if (index = 0 && !this.closed) last_point = false
				if (point.is_bezier() && last_point.is_bezier()) {
					bezierCurveTo(last_point.x+last_point.bezier[0].x,last_point.y+last_point.bezier[0].y,point.x+point.bezier[1].x,point.y+point.bezier[1].y,point.x,point.y)	
				} else if (!point.is_bezier() && (last_point && last_point.is_bezier())) {
					bezierCurveTo(last_point.x+last_point.bezier[0].x,last_point.y+last_point.bezier[0].y,point.x,point.y,point.x,point.y)	
				} else if (point.is_bezier()) {
					bezierCurveTo(point.x,point.y,point.x+point.bezier[1].x,point.y+point.bezier[1].y,point.x,point.y)	
				} else lineTo(point.x,point.y)
			},this)
			if (this.closed) {
				lineTo(this.points[0].x,this.points[0].y)
				fillStyle(this.style.fill)
				fill()
			}
			if (this.style.stroke) stroke(this.style.stroke)
			// draw text here

			this.points.each(function(point){
				save()
				opacity(0.2)
				if (Fred.Geometry.distance(Fred.pointer_x,Fred.pointer_y,point.x,point.y) < this.point_size) {
					opacity(0.4)
					over_point = true
					fillStyle('#a22')
					rect(point.x-this.point_size/2,point.y-this.point_size/2,this.point_size,this.point_size)
				} else if (this.selected) {
					strokeStyle('#a22')
					strokeRect(point.x-this.point_size/2,point.y-this.point_size/2,this.point_size,this.point_size)
				}
				restore()
			},this)
			this.points.each(function(point){
				if (point.is_bezier()) {
					point.bezier.each(function(bezier){
						save()
						lineWidth(1)
						opacity(0.3)
						strokeStyle('#a00')
						moveTo(point.x,point.y)
						lineTo(point.x+bezier.x,point.y+bezier.y)
							save()
							fillStyle('#a00')
							var width = 6
							rect(point.x+bezier.x-width/2,point.y+bezier.y-width/2,width,width)
							restore()
						stroke()
						restore()
					},this)
				}
			},this)
		}
	}
})
