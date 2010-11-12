// Basic bezier and polygon drawing pen tool
Fred.tools.pen = new Fred.Tool('draw polygons',{
	polygon: false,
	deselect: function() {
		Fred.stop_observing('mousedown',this.on_mouseup)
		Fred.stop_observing('mouseup',this.on_mouseup)
		Fred.stop_observing('touchstart',this.on_touchend)
		Fred.stop_observing('touchend',this.on_touchend)
		Fred.stop_observing('fred:postdraw',this.draw)
	},
	select: function() {
		Fred.observe('mousedown',this.on_mouseup.bindAsEventListener(this))
		Fred.observe('mouseup',this.on_mouseup.bindAsEventListener(this))
		Fred.observe('touchstart',this.on_touchend.bindAsEventListener(this))
		Fred.observe('touchend',this.on_touchend.bindAsEventListener(this))
		Fred.observe('fred:postdraw',this.draw.bindAsEventListener(this))
	},
	on_mousedown: function() {

	},
	on_mouseup: function() {
		if (!this.polygon) this.polygon = new Fred.Polygon()
		// close polygon if you click on first point
		var on_final = (this.polygon.points.length > 0 && ((this.polygon.points.first().x - Fred.pointer_x > Fred.click_radius) && (this.polygon.points.first().y - Fred.pointer_y > Fred.click_radius)))
		if (on_final && this.polygon.points.length > 1) {
			Fred.active_layer.objects.push(this.polygon)
			this.polygon = false
		} else if (!on_final) this.polygon.points.push(new Fred.Point(Fred.pointer_x,Fred.pointer_y))
	},
	on_touchstart: function(e) {
		this.on_mousedown(e)
	},
	on_touchend: function(e) {
		this.on_mouseup(e)
	},
	draw: function() {
		//console.log(Fred.timestamp)
		if (this.polygon) this.polygon.draw()
	}
})

