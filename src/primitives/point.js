// Simple point class, with ability to contain bezier points for curve construction.
Fred.Point = Class.create({
	initialize: function(x,y) {
		this.x = x
		this.y = y
		this.bezier = new Array
		this.bezier[0] = false // first bezier point, optional
		this.bezier[1] = false // second bezier point, optional
	},
	// Can add 1 bezier point, for a curved line. 
	// If you run it twice, it'll maintain 2 bezier points. 
	// If you run it thrice, it'll drop the first point to make space for a new one.
	add_bezier: function(x,y) {
		this.bezier.push({x:0,y:0})
		if (this.bezier.length > 2) this.bezier.splice(0,1)
	},
	is_bezier: function() {
		if (this.bezier[0] || this.bezier[1]) return true
		else return false
	}
})
