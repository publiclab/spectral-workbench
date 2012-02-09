// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

nanometers = function(n) {
	return n+" nm"
}

flotoptions = {
	series: {
		lines: { 
			show: true, 
			lineWidth: 1,
		},
	},
	crosshair: { mode: "x" },
	yaxis: { show: true, tickFormatter: function(n) { return n+"%" } }, 
	//xaxis: { show: false, tickFormatter: nanometers },
	xaxes: [{ tickFormatter: nanometers }, { show:false, tickFormatter: function(n) { return n+" cm<sup>-1</sup>" } }],
	shadowSize: 0,
	grid: {
		clickable: true,
		hoverable:true,
		borderWidth: 0,
	        backgroundColor: "#eee"
	},
	// Palette "i eat the rainbow" by svartedauden on Colourlovers: http://www.colourlovers.com/palette/1630898/i_eat_the_rainbow, CC-BY-NC
	colors: [ "#333333", "#E02130", "#FAB243", "#429867", "#2B5166" ]//, "#482344" ]
}
