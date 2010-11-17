// Setup keybindings here. 
// We may switch to a JSON or CSS style keybinding definition file. 
// 
// For now, we are using near-alphabetic convention.
// We may switch to an Adobe Illustrator or OmniGraffle convention

Fred.keys = {
	shift: false,
	control: false,
	alt: false,
	meta: false,
	// modifier keys which you can hold down to modify tool behavior, like the alt key
	modifiers: $H({
		'control': false,
	}),
	// create the main/default keybindings here; they will not be affected by tool-specific keybindings
	master: $H({
		's': function(){ Fred.select_tool('select') },
		'p': function(){ Fred.select_tool('pen') },
	}),
	current: $H({
		
	}),
	initialize: function() {
		// loads the immutable keybindings
		Fred.keys.master.keys().each(function(key){
			Fred.keys.add(key,Fred.keys.master.get(key))
		},this)
		// These are weird. Listen for mouse events, but cue key listeners!
		// this is because we want to listen for modifier keys like ctrl, shift, alt... 
		// on linux at least, regular abc keys stop mouse motion
		Fred.observe('mouseup',this.on_keydown.bindAsEventListener(this))
		Fred.observe('mousemove',this.on_keydown.bindAsEventListener(this))
		Fred.observe('mouseup',this.on_keyup.bindAsEventListener(this))
	},
	add: function(a,b,c) {
		// here we could choose to filter out those that conflict with master keybindings
		shortcut.add(a,b,c)
	},
	remove: function(a) {
		shortcut.remove(a)
	},
	add_modifier: function(key) {
		Fred.keys.modifiers.set(key,false)
	},
	remove_modifier: function(key) {
		Fred.keys.modifiers.unset(key)
	},
	load: function(set) {
		Fred.keys.clear()
		Fred.keys.current = set
		Fred.keys.current.keys().each(function(key){
			Fred.keys.add(key,Fred.keys.current.get(key))
		},this)
	},
	clear: function() {
		Fred.keys.current.keys().each(function(key){
			Fred.keys.remove(key)
		},this)
	},
	on_keydown: function(event) {
		if (event.keyCode) code = event.keyCode;
		else if (event.which) code = event.which;
		var character = String.fromCharCode(code).toLowerCase();
		this.modifiers.keys().each(function(modifier) {
			if (modifier == character) Fred.keys.modifiers.set(modifier,true)
			if (modifier == 'alt' && event.altKey) Fred.keys.modifiers.set(modifier,true)	
			if (modifier == 'shift' && event.shiftKey) Fred.keys.modifiers.set(modifier,true)	
			if (modifier == 'meta' && event.metaKey) Fred.keys.modifiers.set(modifier,true)	
			if (modifier == 'control' && event.ctrlKey) Fred.keys.modifiers.set(modifier,true)	
		},this)
	},
	on_keyup: function(event) {
		if (event.keyCode) code = event.keyCode;
		else if (event.which) code = event.which;
		var character = String.fromCharCode(code).toLowerCase();
		this.modifiers.keys().each(function(modifier) {
			if (modifier == character) Fred.keys.modifiers.set(modifier,false)
			if (modifier == 'alt' && event.altKey) Fred.keys.modifiers.set(modifier,false)	
			if (modifier == 'shift' && event.shiftKey) Fred.keys.modifiers.set(modifier,false)	
			if (modifier == 'meta' && event.metaKey) Fred.keys.modifiers.set(modifier,false)	
			if (modifier == 'control' && event.ctrlKey) Fred.keys.modifiers.set(modifier,false)	
		},this)
	}
}
