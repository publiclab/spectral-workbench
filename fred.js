Fred = {
	click_radius: 6,
	height: '100%',
	width: '100%',
	layers: [],
	tools: [],
	frame: 0,
	timestamp: 0,
	date: new Date,
	times: [],
	init: function(args) {
		Fred.element = $('fred')
		Fred.select_tool('pen')
		new Fred.Layer('main',{active:true})
		new Fred.Layer('background')
		Fred.active_layer = Fred.layers.first()
		$C = Fred.active_layer.canvas
		Fred.observe('mousemove',Fred.on_mousemove)
		Fred.element.style.position = 'absolute'
		Fred.element.style.top = 0
		Fred.element.style.left = 0
		Fred.resize(Fred.width,Fred.height)
		setInterval(Fred.draw.bind(this),30)
	},
	resize: function(width,height) {
		if (width[width.length-1] == '%') Fred.width = parseInt(document.viewport.getWidth()*100/width.substr(0,width.length-1))
		else Fred.width = width
		if (height[height.length-1] == '%') Fred.height = parseInt(document.viewport.getHeight()*100/height.substr(0,height.length-1))
		else Fred.height = height
		Fred.element.style.width = width
		Fred.element.style.height = height
		Fred.layers.each(function(layer){
			layer.element.width = Fred.width
			layer.element.height = Fred.height
		})
	},
	on_mousemove: function(event) {
		Fred.pointer_x = Event.pointerX(event)
		Fred.pointer_y = Event.pointerY(event)
		Fred.draw()
	},
	select_tool: function(tool) {
		if (Fred.active_tool) Fred.active_tool.deselect()
		Fred.active_tool = Fred.tools[tool]
		Fred.active_tool.select()
		events = [	'on_mousedown',
				'on_mousemove',
				'on_mouseup',
				'dblclick',
				'on_touchstart',
				'on_touchmove',
				'on_touchend',
				'on_touchmove',
				'on_gesturestart',
				'on_gestureend']
	},
	observe: function(a,b,c) {
		Fred.element.observe(a,b,c)
	},
	fire: function(a,b,c) {
		Fred.element.fire(a,b,c)
	},
	stop_observing: function(a,b,c) {
		Fred.element.stopObserving(a,b,c)
	},
	draw: function() {
		Fred.fire('fred:predraw')
		Fred.timestamp = Fred.date.getTime()
		Fred.times.unshift(Fred.timestamp)
		if (Fred.times.length > 100) Fred.times.pop()
		Fred.fps = parseInt(Fred.times.length/(Fred.timestamp - Fred.times.last())*1000)
		Fred.date = new Date
		this.layers.each(function(layer){layer.draw()})
		Fred.fire('fred:postdraw')
	}
}

Fred.Layer = Class.create({
	initialize: function(name,args) {
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

Fred.Point = Class.create({
	initialize: function(x,y) {
		this.x = x
		this.y = y
		this.bezier = new Array
		this.bezier[0] = false // first bezier point, optional
		this.bezier[1] = false // second bezier point, optional
	},
	add_bezier: function(x,y) {
		this.bezier.push([x,y])
		if (this.bezier.length > 2) this.bezier.splice(0,1)
	},
	is_bezier: function() {
		if (this.bezier.length > 0) return true
		else return false
	}
})
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
	draw: function() {
		if (this.points && this.points.length > 0) {
		this.apply_style()
		beginPath()
		var over_point = false
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
		if (this.style.fill) fill(this.style.fill)
		}
	}
})

Fred.Tool = Class.create({
	initialize: function(description,args){
		this.description = description
		Object.extend(this,args)
	},
	on_select: function() {

	}
})

Fred.tools.pen = new Fred.Tool('draw polygons',{
	polygon: false,
	deselect: function() {
		Fred.stop_observing('dblclick',this.on_dblclick)
		Fred.stop_observing('mousedown',this.on_mousedown)
		Fred.stop_observing('mouseup',this.on_mouseup)
		Fred.stop_observing('touchstart',this.on_touchstart)
		Fred.stop_observing('touchend',this.on_touchend)
		Fred.stop_observing('fred:postdraw',this.draw)
	},
	select: function() {
		Fred.observe('dblclick',this.on_dblclick.bindAsEventListener(this))
		Fred.observe('mousedown',this.on_mousedown.bindAsEventListener(this))
		Fred.observe('mouseup',this.on_mouseup.bindAsEventListener(this))
		Fred.observe('touchstart',this.on_touchstart.bindAsEventListener(this))
		Fred.observe('touchend',this.on_touchend.bindAsEventListener(this))
		Fred.observe('fred:postdraw',this.draw.bindAsEventListener(this))
	},
	on_mousedown: function() {
		if (this.polygon) {
			var on_final = (this.polygon.points.length > 0 && ((Math.abs(this.polygon.points[0].x - Fred.pointer_x) < Fred.click_radius) && (Math.abs(this.polygon.points[0].y - Fred.pointer_y) < Fred.click_radius)))
			if (on_final && this.polygon.points.length > 1) {
				this.polygon.closed = true
				this.complete_polygon()
			} else if (!on_final) this.polygon.points.push(new Fred.Point(Fred.pointer_x,Fred.pointer_y))
		} else {
			this.polygon = new Fred.Polygon
		}
	},
	on_dblclick: function() {
		if (this.polygon.points.length > 1) {
			this.complete_polygon()
		}
	},
	on_mouseup: function() {
	},
	on_touchstart: function(e) {
		this.on_mousedown(e)
	},
	on_touchend: function(e) {
		this.on_mouseup(e)
	},
	draw: function() {
		if (this.polygon) this.polygon.draw()
	},
	complete_polygon: function() {
		Fred.active_layer.objects.push(this.polygon)
		this.polygon = false
		Fred.stop_observing('fred:postdraw',this.draw)
	}
})


Fred.Geometry = {
	distance: function(x1,y1,x2,y2) {
		return Math.sqrt(Math.pow(Math.abs(x1-x2),2) + Math.pow(Math.abs(y1-y2),2))
	}
}


