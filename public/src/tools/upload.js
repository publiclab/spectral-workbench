// General import tool. Works for images for now, but may offer more formats.
// For now, you use it only by calling Fred.tools.upload.image() or prompt()
Fred.tools.upload = new Fred.Tool('select & manipulate objects',{
	select: function() {
		// here go things which must happen when the tool is deactivated
	},
	deselect: function() {
		// here go things which must happen when the tool is activated
	},
	image: function(uri) {
		this.image_obj = new Fred.Image(Fred.width/2,Fred.height/2,uri)
		Fred.active_layer.objects.push(this.image_obj)
	},
	prompt: function() {
		uri = prompt("Enter a URI for an image.",'test.jpg')
		this.image(uri)
	}
})
