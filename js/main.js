var nb; // = 40.0093;
var sb; // = 39.9854;
var wb; // = 116.3485;
var eb; // = 116.3953;
var centerx = 116.3907817; //(wb + eb) / 2;
var centery = 39.9174311; //(nb + sb) / 2;

var WIDTH = 1800;
var HEIGHT = 1200;

var isDragging = false;
var dragStart = [];
var dragEnd = [];
var global_flag = false;

// var data = init();

var buildings_in_view = [];
var global_buildings = {};
var global_tooltip = null;

var need_draw_stations = false;

var map = new ol.Map({
	target: 'map',
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		})
	],
	view: new ol.View({
		center: ol.proj.fromLonLat([centerx, centery]),
		zoom: 11
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
// geocoder.on('addresschosen', function(evt) {
// 	var feature = evt.feature,
// 		coord = evt.coordinate,
// 		address = evt.address;
// 	// some popup solution
// 	// content.innerHTML = '<p>' + address.formatted + '</p>';
// 	// overlay.setPosition(coord);
// });

init();
// pos_arr = simulate2points(centerx, centery, parseFloat(global_pubs[0][0]), parseFloat(global_pubs[0][1]));

// pos_arr = result[1];
// agent_path = result[0];
time = 0;


$('#map').mouseup(function(e) {
	isDragging = false;
	finishDrag(dragStart, dragEnd);
	dragStart = [];
	dragEnd = [];
});

$('#buildings-container').hide();

function random(a, b) {
	var r = Math.random();
	r *= (b - a);
	r += a;
	return r;
}

function getLength(x1, y1, x2, y2) {
	// 米
	var points = [
		ol.proj.transform([x1, y1], 'EPSG:4326', 'EPSG:3857'),
		ol.proj.transform([x2, y2], 'EPSG:4326', 'EPSG:3857')
	];
	var featureLine = new ol.Feature({
		geometry: new ol.geom.LineString(points)
	});
	return featureLine.getGeometry().getLength();
}

function getArea(x1, y1, x2, y2) {
	// 平方米
	var w = getLength(x1, y1, x2, y1);
	var h = getLength(x1, y1, x1, y2);
	return Math.abs(w * h);
}

function getPolyArea(poly) {
	var points = [];
	for (var i = 0; i < poly.length; i++) {
		points.push(ol.proj.transform(poly[i], 'EPSG:4326', 'EPSG:3857'));
	}
	var geometry = new ol.geom.Polygon([points]);
	return geometry.getArea();
}

function getPolyCenter(poly) {
	var center = [0, 0];
	for (var i = 0; i < poly.length; i++) {
		center[0] += poly[i][0];
		center[1] += poly[i][1];
	}
	center[0] /= poly.length;
	center[1] /= poly.length;
	return center;
}

function findNearStations(x, y) {
	var result = [];
	for (var i = 0; i < global_pubs.length; i++) {
		var l = getLength(x, y, parseFloat(global_pubs[i][0]), parseFloat(global_pubs[i][1]));
		if (l <= 1500) {
			result.push(global_pubs[i]);
		}
	}
	return result;
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

var img = new Image();
img.src = 'img/person.png';

function drawOnePerson(x, y) {
	if (x < 0)
		return;
	var p = coordRealToCanvas(x, y);
	x = p[0];
	y = p[1];
	var size = 18;
	ctx.save();
	ctx.fillStyle = "rgba(255, 167, 39, 1)";
	// ctx.font = "bold 24px Arial";
	// ctx.fillRect(x - 1, y - 1, size * 2 + 1, size * 2 + 1);
	ctx.drawImage(img, x - size, y - size, size * 2 + 1, size * 2 + 1);

	ctx.restore();
}

function drawPeople() {
	// draw random people
	// var people = [];
	// for (var i = 0; i < 10000; i++) {
	// 	people.push([random(wb, eb), random(sb, nb)]);
	// }

	// for (var i = 0; i < people.length; i++) {
	// 	drawOnePerson(people[i][0], people[i][1]);
	// }

	// {
	// 	drawOnePerson(pos_arr[time].x, pos_arr[time].y);
	// }
	for (var i = 0; i < all_agent.length; i++) {
		if (time < all_agent[i].length) {
			drawOnePerson(all_agent[i][time].x, all_agent[i][time].y);
		}
		// else
		// {
		// 	drawOnePerson(all_agent[i][all_agent[i].length-1].x, all_agent[i][all_agent[i].length-1].y);
		// }
	}

}

function drawOneStation(s) {
	s[0] = parseFloat(s[0]);
	s[1] = parseFloat(s[1]);
	if (!(s[0] >= wb && s[0] <= eb && s[1] >= sb && s[1] <= nb)) return;
	var p = coordRealToCanvas(s[0], s[1]);
	var x = p[0];
	var y = p[1];
	var size = 4;
	ctx.save();
	ctx.fillStyle = parseInt(s[2]) ? "#55f" : "#f55";
	ctx.fillRect(x - 1, y - 1, size * 2 + 1, size * 2 + 1);
	ctx.restore();
}

function drawStations() {
	for (var i = 0; i < global_pubs.length; i++) {
		drawOneStation(global_pubs[i]);
	}
}

function drawFrame() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	// drawBoundary();
	drawDrag();
	// drawPeople(time);
	if (need_draw_stations) {
		drawStations();
	}
	drawTooltip();
	if (global_flag)
		drawPeople(time);
}
// for(var i = 0; i < agent_path.length-1; i++)
// {
// 	var p1 = global_points[agent_path[i]], p2 = global_points[agent_path[i+1]];
// 	var road_idx = global_graphs[p1['@id']][p2['@id']];
// 	var road = global_roads[road_idx];
// 	console.log(road);
// }
// for(var i = 0; i < pos_arr.length-1; i++)
// {
// 	var p1 = pos_arr[i], p2 = pos_arr[i+1];
// 	drawLine(p1.x, p1.y, p2.x, p2.y);
// }

// window.onresize = function() {
// 	drawFrame();
// }

window.setInterval(function() {
	drawFrame();
	if (global_flag)
		time += 1;
}, 50);

function inView(s) {
	return s[0] >= wb && s[0] <= eb && s[1] >= sb && s[1] <= nb;
}

function inView2(s) {
	var w = (eb - wb) / 4 + wb;
	var e = eb - (eb - wb) / 4;
	var ss = (nb - sb) / 4 + sb;
	var n = nb - (nb - sb) / 4;
	return s[0] >= w && s[0] <= e && s[1] >= ss && s[1] <= n;
}



function getBuildingsInView() {
	buildings_in_view = [];
	global_buildings = {};
	for (var i = 0; i < buildings.length; i++) {
		var polys = buildings[i].geometry.coordinates;
		// for (var j = 0; j < polys.length; j++) {
		var j = 0;
		if (polys[j].length && inView2(polys[j][0])) {
			var area = getPolyArea(polys[j]);
			var center = getPolyCenter(polys[j]);
			var building = {
				poly: polys[j],
				id: buildings[i].id + "@" + j,
				name: buildings[i].properties.name,
				area: area,
				people: calNum(area),
				center: center
			};
			if (building.name == undefined) continue;
			buildings_in_view.push(building);
			global_buildings[building.id] = building.people;
		}
		// }
	}
}

function draw_heatmap() {
	var road_weight = {};
	for (var i = 0; i < all_path.length; i++) {
		var path = all_path[i];
		for (var j = 0; j < path.length - 1; j++) {
			var id1 = path[j],
				id2 = path[j + 1];
			var road_idx = global_graphs[id1][id2];
			var road = global_roads[road_idx];
			var str_idx = '' + road_idx;
			if (str_idx in road_weight)
				road_weight[str_idx] += all_number[i];
			else
				road_weight[str_idx] = all_number[i];
		}
	}
	var weight_lst = []
	for (var key in road_weight) {
		var road_idx = parseInt(key);
		// console.log(road_idx);
		var road = global_roads[road_idx];
		// console.log(road.u);
		var p1 = global_points['' + road.u],
			p2 = global_points[road.v];
		// console.log(p1);
		weight_lst.push([
			[parseFloat(p1['@lat']), parseFloat(p1['@lon'])],
			[parseFloat(p2['@lat']), parseFloat(p2['@lon'])], road_weight[key]
		]);
	}
	// console.log(weight_lst);
	calHeat(weight_lst);
}

function startSimulation() {
	var bbpair = [];
	var coorpair = [];
	all_agent = [];
	all_path = [];
	all_number = [];
	for (var i = 0; i < buildings_in_view.length; i++) {
		var pos = buildings_in_view[i].center;
		var stations = findNearStations(parseFloat(pos[0]), parseFloat(pos[1]));
		// console.log(pos, stations);
		for (var j = 0; j < stations.length; j++) {
			var dist = 1.0 / getLength(parseFloat(pos[0]), parseFloat(pos[1]), parseFloat(stations[j][0]), parseFloat(stations[j][1]));
			bbpair.push([buildings_in_view[i].id, stations[j][3], dist]);
			coorpair.push([parseFloat(stations[j][0]), parseFloat(stations[j][1]), parseFloat(pos[0]), parseFloat(pos[1])]);
		}
	}
	calRatio(bbpair);
	// console.log(global_ratio);
	var point = makeStruct("x y");
	console.log(global_ratio.length);
	for (var i = 0; i < global_ratio.length; i++) {
		if (i % 10 == 0)
			console.log(i);
		if (i > 1000) break;
		var pair = coorpair[i];
		var path = simulate2points(pair[0], pair[1], pair[2], pair[3]);
		if (path.length < 3) continue;
		var p1 = global_points[path[0]],
			p2 = global_points[path[path.length - 1]];
		var total_dist = getLength(pair[2], pair[3], parseFloat(p2['@lon']), parseFloat(p2['@lat']));
		if (total_dist > 1500) continue;
		total_dist = getLength(parseFloat(p1['@lon']), parseFloat(p1['@lat']),
			parseFloat(p2['@lon']), parseFloat(p2['@lat']));
		console.log(total_dist);
		if (total_dist < 350) continue;
		all_path.push(path);
		all_number.push(global_ratio[i][2]);
		// var pos_arr = simulate2points(pair[0], pair[1], pair[2], pair[3]);
		// all_agent.push(pos_arr);
		for (var j = 0; j < Math.max(global_ratio[i][2], 100); j++) {
			var pos_arr = sample(path);
			var step = Math.round(random(1, 500));
			var nxt_pos_arr = new Array();
			for (var k = 0; k < step; k++) {
				nxt_pos_arr.push(new point(-1, -1));
			}
			for (var k = 0; k < pos_arr.length; k++) {
				nxt_pos_arr.push(pos_arr[k]);
			}

			all_agent.push(nxt_pos_arr);
		}
		// break;
	}
	global_flag = true;
	time = 0;
	draw_heatmap();
	restoreState();
}

function listBuildingsInView() {
	$('#buildings-container').html('');
	var count = 0;
	$('#buildings-container').show();
	buildings_in_view.sort(function(a, b) {
		return -a.area + b.area;
	});
	for (var i = 0; i < buildings_in_view.length; i++) {
		if (buildings_in_view[i].name) {
			count++;
			var tooltip = JSON.stringify(buildings_in_view[i]);
			var html = '<a class="collection-item" ' +
				'onmouseover=\'showTooltip(' +
				tooltip +
				');\'' +
				'>' +
				buildings_in_view[i].name +
				'</a>';
			$('#buildings-container').append(html);
		}
		// if (count > 5) break;
	}
	if (!count) $('#buildings-container').hide();
	$('#start-button').show();
	$('#find-button').hide();
	need_draw_stations = false;
	console.log(buildings_in_view);
}

function drawTooltip() {
	if (global_tooltip == null) return;
	var t = global_tooltip;
	var c = coordRealToCanvas(t.center[0], t.center[1]);
	// console.log(t.center);
	ctx.save();
	ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	ctx.fillRect(c[0] - 12, c[1] + 12, t.name.length * 24 + 24, -24 - 24);
	ctx.fillStyle = "#444";
	ctx.font = "bold 24px Arial";
	ctx.fillText(t.name, c[0], c[1]);
	ctx.restore();
}

function showTooltip(tooltip) {
	// console.log(tooltip);
	var pos = tooltip.center;
	if (!inView(pos)) {
		global_tooltip = null;
		return;
	}
	global_tooltip = tooltip;
	drawTooltip();
}

function restoreState() {
	$('#start-button').hide();
	$('#find-button').show();
	need_draw_stations = false;
	$('#buildings-container').html('');
	$('#buildings-container').hide();
}

$(document).ready(function() {
	// drawFrame();
	$('#right-panel').prepend($('#gcd-container'));
});
