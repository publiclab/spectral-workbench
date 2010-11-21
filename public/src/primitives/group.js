// Allows manipulation of groups of objects
Fred.Group = Class.create({
	initialize: function(members) {
		this.members = members
		// Remove members from active layer
		
		// Calculate bounding box
		// this.x = 
		// this.y = 
		this.r = 0 // no rotation
		this.selected = true
	},
	draw: function() {
		save()
		// transform(x,y)
		// rotate(r)
			this.members.each(function(member) {
				member.draw()
			},this)
		restore()
		if (this.selected) {
			// Draw bounding box
		}
	},
	on_mousedown: function() {
		// If we're within the bounding box? or if we're within bounds of members?
		if (this.mouseover()) {

		}
	},
	on_mousemove: function() {
		if (this.drag) {

		}
		if (this.mouseover()) {

		}
	},
	on_mouseup: function() {
		this.drag = false
	},
	mouseover: function() {

	},
})
