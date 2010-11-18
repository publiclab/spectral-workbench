// Simple point class, with ability to contain bezier points for curve construction.
Fred.Point = Class.create({
	initialize: function(x,y) {
		this.x = x
		this.y = y
		this.bezier = { prev: false, next: false }
	},
})
