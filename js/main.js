var nb = 40.0093;
var sb = 39.9854;
var wb = 116.3485;
var eb = 116.3953;
var centerx = (wb + eb) / 2;
var centery = (nb + sb) / 2;

var WIDTH = 1800;
var HEIGHT = 1200;

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

var ctx = $('#canv')[0].getContext('2d');
// map.on('click', function(ev) {
// 	console.log(ev);
// });

map.on(['postrender'], function(ev) {
	// console.log(ev);
	drawFrame();
});

function random(a, b) {
	var r = Math.random();
	r *= (b - a);
	r += a;
	return r;
}

function coordRealToCanvas(x, y) {
	// 输入经纬度，返回mask layer的坐标
	var extent = map.getView().calculateExtent(map.getSize());
	var box = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
	var w = box[2] - box[0];
	var h = box[3] - box[1];
	var x_ = (x - box[0]) / w * WIDTH;
	var y_ = HEIGHT - (y - box[1]) / h * HEIGHT;
	return [Math.round(x_), Math.round(y_)];
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

function drawFrame() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	drawBoundary();
	drawPeople();
}

// window.onresize = function() {
// 	drawFrame();
// }

window.setInterval(function() {
	drawFrame();
}, 500);

$(document).ready(function() {
	// drawFrame();
});
