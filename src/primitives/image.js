// Very basic images. Not distortable, just drag & rotate.
Fred.Image = Class.create({
	initialize: function(x,y,src,scale) {
		this.x = x
		this.y = y
		this.src = src
		this.scale = 0.25
		this.r = 0 // rotation
		if (src && typeof src == 'string') {
			this.src = src
			this.image = new Image
			this.image.src = src
		}
	},
	draw: function() {
		// for convenience!
		if (this.image.width) {
			this.width = this.image.width
			this.height = this.image.height
		}
		save()
			translate(this.x,this.y)
			rotate(this.r)
			scale(this.scale,this.scale)
			drawImage(this.image,this.image.width/-2,this.image.height/-2)
		restore()
		save()
		// Draw corner control points
				this.corners = [[this.x-this.width/2,this.y-this.height/2],[this.x-this.width/2,this.x+this.width/2],[this.x+this.width/2,this.y+this.height/2],[this.x-this.width/2,this.y-this.height/2]]
				this.corners.each(function(corner) {
					strokeStyle('white')
					opacity(0.2)
					// if the mouse is in the circle
					if (true) circle(corner[0],corner[1],Fred.click_radius)
					opacity(0.9)
					strokeCircle(corner[0],corner[1],Fred.click_radius)
				},this)
		restore()
	},
	set_to_natural_size: function() {
		if (this.image.width) {
			// the image loaded completely, and we can use its dimensions
			this.points[1].x = this.points[0].x
			this.points[1].y = this.points[0].y
			this.points[2].x = this.points[0].x
			this.points[2].y = this.points[0].y
			this.points[3].x = this.points[0].x
			this.points[3].y = this.points[0].y

			this.points[1].x += this.image.width/(Map.zoom*2)
			this.points[2].x += this.image.width/(Map.zoom*2)
			this.points[2].y += this.image.height/(Map.zoom*2)
			this.points[3].y += this.image.height/(Map.zoom*2)
			this.reset_centroid()
			this.area = Geometry.poly_area(this.points)
			this.waiting_for_natural_size = false
		}
	},
})
