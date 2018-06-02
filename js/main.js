var map = new ol.Map({
	target: 'map',
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		})
	],
	view: new ol.View({
		center: ol.proj.fromLonLat([116.32, 40]),
		zoom: 14
	}),
	controls: ol.control.defaults({
		zoom: false,
		rotate: false,
		attribution: false
	}),
	interactions: []
});

var ctx = $('#canv')[0].getContext('2d');
ctx.fillRect(100, 100, 200, 200);
