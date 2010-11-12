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
		stroke: 'red'
	},
	apply_style: function() {
		lineWidth(2)
	},
	draw: function() {
		this.apply_style()
		beginPath()
		var over_point = false
		this.points.each(function(point){
			lineTo(point.x,point.y)
			save()
				opacity(0.2)
				if (Fred.Geometry.distance(Fred.pointer_x,Fred.pointer_y,point.x,point.y) < this.point_size) {
					opacity(0.4)
					over_point = true
				}
				strokeStyle('#22a')
				strokeRect(point.x-this.point_size/2,point.y-this.point_size/2,this.point_size,this.point_size)
			restore()
		},this)
		if (this.style.stroke) stroke(this.style.stroke)
		if (this.style.fill) fill(this.style.fill)
	}
})
