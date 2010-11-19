// Central Fred source file; all other files are linked to from here.
Fred = {
	click_radius: 6,
	speed: 30,
	height: '100%',
	width: '100%',
	layers: [],
	tools: [],
	frame: 0,
	timestamp: 0,
	date: new Date,
	times: [],
	// Whether the user is dragging.
	drag: false,
	// Events which will be auto-connected when new tools are added,
	// if there are corresponding on_<foo> methods defined.
	listeners: [	'mousedown',
			'mousemove',
			'mouseup',
			'dblclick',
			'touchstart',
			'touchmove',
			'touchend',
			'gesturestart',
			'gestureend'],
			// 'every_<time>', // listener to trigger periodical execution
	init: function(args) {
		Fred.element = $('fred')
		Fred.select_tool('pen')
		new Fred.Layer('main',{active:true})
		new Fred.Layer('background')
		Fred.active_layer = Fred.layers.first()
		$C = Fred.active_layer.canvas
		// Event handling setup:
		Fred.observe('mousemove',Fred.on_mousemove)
		Fred.observe('touchmove',Fred.on_touchmove)
		// Fred.observe('mouseup',Fred.on_mouseup)
		Fred.observe('touchstart',Fred.on_touchstart)
		Fred.observe('touchend',Fred.on_touchend)
		// Set up the main Fred DOM element:
		Fred.element.style.position = 'absolute'
		Fred.element.style.top = 0
		Fred.element.style.left = 0
		Fred.resize(Fred.width,Fred.height)
		// Initiate main loop:
		setInterval(Fred.draw.bind(this),Fred.speed)
		// Access main program grid:
		var whtrbtobj
		// Initialize other modules which are waiting for Fred to be ready
		Fred.keys.initialize()
	},
	resize: function(width,height) {
		// document.viewport.getWidth() yields undefined in Android browser
		// try running without resizing just in Android -- disable rotate anyway 
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
	on_mouseup: function(e) {
		Fred.drag = false
	},
	on_mousedown: function(e) {
		Fred.drag = true
	},
	on_mousemove: function(e) {
		console.log('move')
		Fred.pointer_x = Event.pointerX(e)
		Fred.pointer_y = Event.pointerY(e)
		Fred.draw()
	},
	on_touchstart: function(e) {
		console.log('touch!!')
		e.preventDefault()
		Fred.drag = true
	},
	on_touchmove: function(e) {
		e.preventDefault()
		Fred.pointer_x = e.touches[0].pageX
		Fred.pointer_y = e.touches[0].pageY
	},
	on_touchend: function(e) {
		e.preventDefault()
		Fred.drag = false
	},
	select_tool: function(tool) {
		console.log('selecting '+tool)
		if (Fred.active_tool) Fred.active_tool.deselect()
		// Deactivate old listeners
		$H(Fred.active_tool).keys().each(function(method) {
			Fred.listeners.each(function(event) {
				if (method == ('on_'+event)) {
					Fred.stop_observing(event,Fred.active_tool[method].bindAsEventListener(Fred.active_tool))
				}
			},this)
			if (method == 'draw') Fred.stop_observing('fred:postdraw',Fred.active_tool.draw)
		},this)
		Fred.active_tool = Fred.tools[tool]
		Fred.active_tool.select()
		// Scan tool for on_foo listeners, connect them to available events:
		$H(Fred.tools[tool]).keys().each(function(method) {
			Fred.listeners.each(function(event) {
				if (method == ('on_'+event)) {
					Fred.observe(event,Fred.active_tool[method].bindAsEventListener(Fred.active_tool))
				}
			},this)
			if (method == 'draw') Fred.observe('fred:postdraw',Fred.active_tool.draw.bindAsEventListener(Fred.active_tool))
		})
	},
	/**
	 * Moves the object (all its points as object.points, including beziers)
	 * but yields to the objects object.move(x,y,absolute) method if that exists
	 * and moves either to an absolute position or one relative to the object's
	 * current position.
	 */
	move: function(object,x,y,absolute) {
		if (object.move) {
			object.move(x,y,absolute)
		} else if (object instanceof Fred.Polygon || object instanceof Fred.Group) {
			// we know how to deal with these
			object.points.each(function(point){
				if (absolute) {
					point.x = x
					point.y = y
				} else {
					point.x += x
					point.y += y
				}
			},this)
		}
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
		// debug image
		fillStyle('red')
		rect(10,10,20,20)
	}
}

//= require <layer>

//= require <primitives/point>
//= require <primitives/polygon>
//= require <primitives/group>

//= require <tools/tool>
//= require <tools/select>
//= require <tools/pen>

//= require <geometry>
//= require <keys>


