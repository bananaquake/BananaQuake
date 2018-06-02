
//area: {houseID: house_area, houseID2: house_area2}
function calNum(area) {
	global_nums = {};
	for (var key in area) {
		global_nums[key] = Math.pow(area[key], 2)/15;
	}
}

//points: [[houseID, pubsID, dist],[...]]
function calRatio(points) {
	global_ratio = new Array();
	var sum_houses = {}
	for (var i = 0; i < points.length; ++i) {
		if (!sum_houses.hasOwnProperty(points[i][0])) {
			sum_houses[points[i][0]] = 0;
		}
		sum_houses[points[i][0]] += points[i][2];
	}
	for (var i = 0; i < points.length; ++i) {
		global_ratio.push([points[i][0],points[i][1],(sum_houses[points[i][0]] - points[i][2])/sum_houses[points[i][0]]]);
	}
}

//points: [[lat, lon, weight],[...]]
function calHeat(points) {
	var data = new ol.source.Vector();   
	for (var i = 0; i < points.length; ++i) {
		var lonLat = new ol.geom.Point(points[i][1],points[i][0]);
		var pointFeature = new ol.Feature({
			geometry: lonLat,
			weight: points[i][2]
		});

		data.addFeature(pointFeature);    
		
	}
	heatMapLayer = new ol.layer.Heatmap({
		source: data,
		radius: 10
	});
	map.addLayer(heatMapLayer);
}