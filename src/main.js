// Central Fred source file; all other files are linked to from here.
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
		//Event handling setup:
		Fred.observe('mousemove',Fred.on_mousemove)
		Fred.observe('touchmove',Fred.on_touchmove)
		// not sure if these are necessary to preventDefault(), they exist as methods below though.
		Fred.observe('touchstart',Fred.on_touchstart)
		Fred.observe('touchend',Fred.on_touchend)
		//Fred.observe('mouseup',Fred.on_mouseup)
		//Set up the main Fred DOM element:
		Fred.element.style.position = 'absolute'
		Fred.element.style.top = 0
		Fred.element.style.left = 0
		Fred.resize(Fred.width,Fred.height)
		//main loop:
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
	on_touchstart: function(event) {
		console.log('touch!!')
		event.preventDefault()
		Fred.draw()
	},
	on_touchmove: function(event) {
		event.preventDefault()
		Fred.pointer_x = event.touches[0].pageX
		Fred.pointer_y = event.touches[0].pageY
		Fred.draw()
	},
	on_touchend: function(event) {
		event.preventDefault()
	},
	select_tool: function(tool) {
		if (Fred.active_tool) Fred.active_tool.deselect()
		Fred.active_tool = Fred.tools[tool]
		Fred.active_tool.select()
		// Scan tool for on_foo handlers, connect them to available events:
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
		// tool.methods.each(function(method) {
		//
		//})
	},
        /**
	 * Binds all events to the 'fred' DOM element. Use instead of native Prototype observe.
	 */
	observe: function(a,b,c) {
		Fred.element.observe(a,b,c)
	},
	/**	
	 * Fires events. Use instead of native Prototype observe.
	 */
	fire: function(a,b,c) {
		Fred.element.fire(a,b,c)
	},
	/**
	 * Unbinds all events from the main canvas. 
	 */
	stop_observing: function(a,b,c) {
		Fred.element.stopObserving(a,b,c)
	},
	draw: function() {
		Fred.fire('fred:predraw')
		//calculate fps:
		Fred.timestamp = Fred.date.getTime()
		Fred.times.unshift(Fred.timestamp)
		if (Fred.times.length > 100) Fred.times.pop()
		Fred.fps = parseInt(Fred.times.length/(Fred.timestamp - Fred.times.last())*1000)
		Fred.date = new Date
		this.layers.each(function(layer){layer.draw()})
		Fred.fire('fred:postdraw')
		fillStyle('red')
		rect(10,10,20,20)
	}
}

//= require <layer>

//= require <primitives/point>
//= require <primitives/polygon>

//= require <tools/tool>
//= require <tools/pen>

//= require <geometry>


