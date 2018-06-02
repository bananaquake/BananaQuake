function road(u, v, dis, width, shelter, broken = false)  {
	this.u = u;
	this.v = v;
	this.dis = dis;
	this.width = width;
	this.shelter = shelter;
	this.broken = false;
}

function init()  {
	global_points = {};
	global_roads = new Array();
	global_graphs = {};
	global_pubs = new Array();
	
	nodes = data.node;
	for (var i = 0; i < nodes.length; ++i) {
		if ('@public_transport' in nodes[i]) {
			global_pubs.push([nodes[i]['@lon'], nodes[i]['@lat'], nodes[i]['@public_transport']]);
		}
		global_points[nodes[i]['@id']] = nodes[i];
	}
	ways = data.way;
	for (var i = 0; i < ways.length; ++i) {
		nds = ways[i]['@nd'];
		for (var j = 0; j < nds.length - 1; ++j) {
			var dis = Math.sqrt(Math.pow(global_points[nds[j]]['@lon']-global_points[nds[j+1]]['@lon'],2) + Math.pow(global_points[nds[j]]['@lat']-global_points[nds[j+1]]['@lat'],2));
			global_roads.push(new road(nds[j], nds[j+1], dis, ways[i]['@width'], ways[i]['@shelter']));
			if (!global_graphs.hasOwnProperty(nds[j])) {
				global_graphs[nds[j]] = {};
			} 
			global_graphs[nds[j]][nds[j+1]] = global_roads.length-1;
			if (!global_graphs.hasOwnProperty(nds[j+1])) {
				global_graphs[nds[j+1]] = {};
			}
			global_graphs[nds[j]][nds[j+1]] = global_roads.length-1;
		}
	}
	return [global_points, global_roads, global_graphs, global_pubs];
}
