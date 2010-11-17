// Setup keybindings here. 
// We may switch to a JSON or CSS style keybinding definition file. 
// 
// For now, we are using near-alphabetic convention.
// We may switch to an Adobe Illustrator or OmniGraffle convention

Fred.keys = {
	add: function(a,b,c) {
		shortcut.add(a,b,c)
	},
	remove: function(a) {
		shortcut.remove(a)
	},
	load: function(set) {
		Fred.keys.clear()
		Fred.keys.current = set
		Fred.keys.current.keys().each(function(key){
			Fred.keys.add(key,Fred.keys.current.get(key))
		},this)
	},
	// loads the immutable keybindings
	load_master: function() {
		Fred.keys.master.keys().each(function(key){
			Fred.keys.add(key,Fred.keys.master.get(key))
		},this)
	},
	clear: function() {
		Fred.keys.current.keys().each(function(key){
			Fred.keys.remove(key)
		},this)
	},
	defaults: {
	},
	master: $H({
		's': function(){ Fred.select_tool('select') },
		'p': function(){ Fred.select_tool('pen') },
	}),
	current: $H({
		
	})
}

Fred.keys.load_master()
