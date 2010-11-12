Fred.Layer = Class.create({
	initialize: function(name,args) {
		//validate uniqueness of name in validation namespace
		Fred.layers.push(this)
		Fred.element.insert("<canvas style='position:absolute;top:0;left:0;' id='"+name+"'></canvas>")
		this.name = name
		this.static = ''
		this.active = false
		this.objects = []
		this.element = $(this.name)
		this.element.onselectstart = function() {return false}
		this.element.width = Fred.width
		this.element.height = Fred.height
		this.canvas = $(name).getContext('2d')
		Object.extend(this,args)
		// default styles
		strokeStyle('#222')
		fillStyle('#eee')
	},
	draw: function() {
		$C = this.canvas
		clear()
		if (this.last_draw != Fred.timestamp) {
			this.last_draw = Fred.timestamp
			this.objects.each(function(object){
				object.draw()
			})
		}
	}
}) 
