function road(u, v, dis, width, shelter, broken = false)  {
	this.u = u;
	this.v = v;
	this.dis = dis;
	this.width = width;
	this.shelter = shelter;
	this.broken = false;
}

function init()  {
	var points = {};
	var roads = new Array();
	var graphs = {};
	var pubs = new Array();

	nodes = data.node;
	for (var i = 0; i < nodes.length; ++i) {
		if ('@public_transport' in nodes[i]) {
			pubs.push([nodes[i]['@lon'], nodes[i]['@lat'], nodes[i]['@public_transport']]);
		}
		points[nodes[i]['@id']] = nodes[i];
	}
	ways = data.way;
	for (var i = 0; i < ways.length; ++i) {
		nds = ways[i]['@nd'];
		for (var j = 0; j < nds.length - 1; ++j) {
			var dis = Math.sqrt(Math.pow(points[nds[j]]['@lon'],2) + Math.pow(points[nds[j]]['@lat'],2));
			roads.push(new road(nds[j], nds[j+1], dis, ways[i]['@width'], ways[i]['@shelter']));
			if (!graphs.hasOwnProperty(nds[j])) {
				graphs[nds[j]] = {};
			} 
			graphs[nds[j]][nds[j+1]] = roads.length-1;
			if (!graphs.hasOwnProperty(nds[j+1])) {
				graphs[nds[j+1]] = {};
			}
			graphs[nds[j]][nds[j+1]] = roads.length-1;
		}
	}
	return [points, roads, graphs, pubs];
}
