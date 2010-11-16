// Basic, universal Polygon class
Fred.Polygon = Class.create({
	initialize: function(points) {
		this.point_size = 12
		if (points) this.points = points
		else this.points = []
		this.selected = true
	},
	name: 'untitled polygon',
	style: {
		fill: false,
		stroke: '#002'
	},
	apply_style: function() {
		lineWidth(2)
	},
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
			this.points.each(function(point){
				lineTo(point.x,point.y)
				save()
					opacity(0.2)
					if (Fred.Geometry.distance(Fred.pointer_x,Fred.pointer_y,point.x,point.y) < this.point_size) {
						opacity(0.4)
						over_point = true
						fillStyle('#22a')
						rect(point.x-this.point_size/2,point.y-this.point_size/2,this.point_size,this.point_size)
					} else if (this.selected) {
						strokeStyle('#22a')
						strokeRect(point.x-this.point_size/2,point.y-this.point_size/2,this.point_size,this.point_size)
					}
				restore()
			},this)
			if (this.closed) {
				lineTo(this.points[0].x,this.points[0].y)
				fillStyle('#ccf')
				fill()
			}
			if (this.style.stroke) stroke(this.style.stroke)
			//if (this.style.fill) fill(this.style.fill)
		}
	}
})
