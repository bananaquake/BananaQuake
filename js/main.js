var nb = 40.0093;
var sb = 39.9854;
var wb = 116.3485;
var eb = 116.3953;
var centerx = (wb + eb) / 2;
var centery = (nb + sb) / 2;

var WIDTH = 1800;
var HEIGHT = 1200;

var isDragging = false;
var dragStart = [];
var dragEnd = [];

var data = init();

var map = new ol.Map({
	target: 'map',
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		})
	],
	view: new ol.View({
		center: ol.proj.fromLonLat([centerx, centery]),
		zoom: 14
	}),
	controls: ol.control.defaults({
		// zoom: false,
		// rotate: false,
		attribution: false
	}),
	// interactions: []
});

updateBoundary();

var ctx = $('#canv')[0].getContext('2d');
// map.on('click', function(ev) {
// 	console.log(ev);
// });

map.on(['postrender'], function(ev) {
	// console.log(ev);
	updateBoundary();
	drawFrame();
});

$('#map').mousedown(function(e) {

});

map.on('pointerdrag', function(e) {
	// if (!isDragging) {
	// 	isDragging = true;
	// 	dragStart = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
	// }
	// dragEnd = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
	// drawFrame();
	// return false;
});

var geocoder = new Geocoder('nominatim', {
	provider: 'osm',
	key: '',
	lang: 'en-US', //en-US, fr-FR
	placeholder: 'Search for ...',
	targetType: 'text-input',
	limit: 5,
	keepOpen: false,
	autoComplete: true
});
map.addControl(geocoder);
geocoder.on('addresschosen', function(evt) {
	var feature = evt.feature,
		coord = evt.coordinate,
		address = evt.address;
	// some popup solution
	// content.innerHTML = '<p>' + address.formatted + '</p>';
	overlay.setPosition(coord);
});


$('#map').mouseup(function(e) {
	isDragging = false;
	finishDrag(dragStart, dragEnd);
	dragStart = [];
	dragEnd = [];
});

function random(a, b) {
	var r = Math.random();
	r *= (b - a);
	r += a;
	return r;
}

function updateBoundary() {
	var extent = map.getView().calculateExtent(map.getSize());
	var box = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
	wb = box[0];
	sb = box[1];
	eb = box[2];
	nb = box[3];
}

function coordRealToCanvas(x, y) {
	// 输入经纬度，返回mask layer的坐标
	// var extent = map.getView().calculateExtent(map.getSize());
	// var box = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
	var w = eb - wb; //box[2] - box[0];
	var h = nb - sb; //box[3] - box[1];
	var x_ = (x - wb) / w * WIDTH;
	var y_ = HEIGHT - (y - sb) / h * HEIGHT;
	return [Math.round(x_), Math.round(y_)];
}

function finishDrag(p1, p2) {

}

function drawDrag() {
	if (!dragStart.length) return;
	var p1 = coordRealToCanvas(dragStart[0], dragStart[1]);
	var p2 = coordRealToCanvas(dragEnd[0], dragEnd[1]);
	drawRect(p1, p2);
}

function drawRect(p1, p2) {
	// pixels, not 经纬度
	ctx.save();
	ctx.lineWidth = 3;
	ctx.strokeStyle = "black";
	ctx.fillStyle = "rgba(255,255,255,0.5)";
	ctx.strokeRect(p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1]);
	ctx.fillRect(p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1]);
	ctx.restore();
}

function drawLine(x1, y1, x2, y2) {
	var p1 = coordRealToCanvas(x1, y1);
	var p2 = coordRealToCanvas(x2, y2);
	ctx.save();
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.moveTo(p1[0], p1[1]);
	ctx.lineTo(p2[0], p2[1]);
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
}

function drawLine2(y1, x1, y2, x2) {
	drawLine(x1, y1, x2, y2);
}

function drawBoundary() {
	drawLine(eb, nb, wb, nb);
	drawLine(eb, sb, wb, sb);
	drawLine(eb, nb, eb, sb);
	drawLine(wb, nb, wb, sb);
}

function drawOnePerson(x, y) {
	var p = coordRealToCanvas(x, y);
	x = p[0];
	y = p[1];
	var size = 1;
	ctx.save();
	ctx.fillStyle = "#f00";
	ctx.fillRect(x - 1, y - 1, size * 2 + 1, size * 2 + 1);
	ctx.restore();
}

function drawPeople() {
	// draw random people
	var people = [];
	for (var i = 0; i < 10000; i++) {
		people.push([random(wb, eb), random(sb, nb)]);
	}

	for (var i = 0; i < people.length; i++) {
		drawOnePerson(people[i][0], people[i][1]);
	}
}

function drawOneStation(s) {
	if (!(s[0] >= wb && s[0] <= eb && s[1] >= sb && s[1] <= nb)) return;
	var p = coordRealToCanvas(s[0], s[1]);
	var x = p[0];
	var y = p[1];
	var size = 4;
	ctx.save();
	ctx.fillStyle = s[2] ? "#55f" : "#f55";
	ctx.fillRect(x - 1, y - 1, size * 2 + 1, size * 2 + 1);
	ctx.restore();
}

function drawStations() {
	for (var i = 0; i < data[3].length; i++) {
		drawOneStation(data[3][i]);
	}
}

function drawFrame() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	// drawBoundary();
	drawDrag();
	// drawPeople();
	drawStations();
}

// window.onresize = function() {
// 	drawFrame();
// }

// window.setInterval(function() {
// 	drawFrame();
// }, 1500);

$(document).ready(function() {
	// drawFrame();
	$('#right-panel').append($('#gcd-container'));
});
