function road(u, v, dis, width, shelter)  {
	this.u = u;
	this.v = v;
	this.dis = dis;
	this.width = width;
	this.shelter = shelter;
}

function init()  {
	var points = {};
	var roads = new Array();
	var graphs = {};
	
	nodes = data.node;
	for (var i = 0; i < nodes.length; ++i) {
		points[nodes[i]['@id']] = nodes[i];
	}
	ways = data.way;
	for (var i = 0; i < ways.length; ++i) {
		nds = ways[i]['@nd'];
		for (var j = 0; j < nds.length - 1; ++j) {
			var dis = Math.sqrt(Math.pow(points[nds[j]]['@lon'],2) + Math.pow(points[nds[j]]['@lat'],2));
			roads.push(new road(nds[j], nds[j+1], dis, ways[i]['@width'], ways[i]['@shelter']));
			if (!graphs.hasOwnProperty(nds[j])) {
				graphs[nds[j]] = new Array();
			} 
			m = {};
			m[nds[j+1]] = roads.length-1;
			graphs[nds[j]].push(m);
			if (!graphs.hasOwnProperty(nds[j+1])) {
				graphs[nds[j+1]] = new Array();
			}
			m = {};
			m[nds[j+1]] = roads.length-1;
			graphs[nds[j+1]].push(m);
		}
	}
	return [points, roads, graphs];
}