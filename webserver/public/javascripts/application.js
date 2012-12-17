// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

nanometers = function(n) {
	return n+" nm"
}
wavenumbers = function(n) {
	return parseInt(10000000/n)+" cm<sup>-1</sup>"
}
wavenumber_tickSize = 166.6666 

flotoptions = {
	series: {
		lines: { 
			show: true, 
			lineWidth: 1,
		},
	},
	crosshair: { mode: "x" },
	yaxis: { show: true, tickFormatter: function(n) { return (n+"").substr(0,4)+"%" }, max: 100, min: 0 }, 
	xaxis: { show: false, tickFormatter: nanometers },
	shadowSize: 0,
	threshold: { below: 0, color: "#a00" }, //non-functional... not sure why
	grid: {
		clickable: true,
//		hoverable:true,
		borderWidth: 0,
	        backgroundColor: "#eee",
		markers: []
	},
	// Palette "i eat the rainbow" by svartedauden on Colourlovers: http://www.colourlovers.com/palette/1630898/i_eat_the_rainbow, CC-BY-NC
	colors: [ "#aaa", "#E02130", "#FAB243", "#429867", "#2B5166" ]//, "#482344" ]
}
