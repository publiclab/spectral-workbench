// Default editing tool -- selection, translation, rotation, etc.
Fred.tools.select = new Fred.Tool('select & manipulate objects',{
	select: function() {
		// here go things which must happen when the tool is deactivated
	},
	deselect: function() {
		// here go things which must happen when the tool is activated
	},
	on_dblclick: function() {

	},
	on_mousedown: function() {
		this.selected_object = false
		// inefficient - we should crap out of this once we find a match
		// whats that, break?
		Fred.active_layer.objects.each(function(object){
			// iterate through point_in_poly-able classnames
			var selectables = [Fred.Polygon,Fred.Group]
			if (object instanceof Fred.Polygon || object instanceof Fred.Group) {
				if (Fred.Geometry.is_point_in_poly(object.points,Fred.pointer_x,Fred.pointer_y)) {
					this.selected_object = object
					this.selected_object_x = object.x
					this.selected_object_y = object.y
					// record offset of x,y from mouse
					this.click_x = Fred.pointer_x
					this.click_y = Fred.pointer_y
				}
			}
		},this)
	},
	on_mousemove: function() {
		if (this.selected_object && Fred.drag) {
			var x = this.selected_object_x + Fred.pointer_x - this.click_x
			var y = this.selected_object_y + Fred.pointer_y - this.click_y
			Fred.move(this.selected_object,x,y,true)
		}
	},
	on_mouseup: function() {
		if (this.selected_object && Fred.drag) {
			this.selected_object.refresh()
			this.selected_object = false
		}
	},
	on_touchstart: function(event) {
		this.on_mousedown(event)
	},
	on_touchmove: function(event) {
		this.on_mousemove(event)
	},
	on_touchend: function(event) {
		this.on_mouseup(event)
	},
	draw: function() {

	}
})
