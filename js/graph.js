function makeStruct(names)
{
  var names = names.split(' ');
  var count = names.length;
  function constructor() {
    for (var i = 0; i < count; i++) {
      this[names[i]] = arguments[i];
    }
  }
  return constructor;
}
var Graph = (function (undefined) {

	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		this.limit = 80;
		infinity = infinity || Infinity;

		this.end = end;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		var node_bk;
		costs[start] = 0;
		/*
		open[u]距离start为u的地点列表
		keys放的是
		*/
		while (open) {

			// if(!(keys = extractKeys(open)).length) break;
			// keys.sort(sorter);
			// var key = keys[0];

			var key = 10000000000;
			for(var tmp in open)
			{
				key = parseFloat(tmp);
				break;
			}
			// console.log('key', key);
			if(key > 1000000000)break;
			var bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};
			// console.log('node', node);
			node_bk = node;
			this.limit -= 1;
			if(this.limit<0)
			{
				this.end = node;
				break;
			}

			if (!bucket.length) delete open[key];
			var node_pre = predecessors[node];
			if(node_pre!=undefined)
			{
				var road_idx = global_graphs[node_pre][node];
				if(global_roads[road_idx].shelter==1)
				{
					if(this.end == undefined)
						this.end = node;
					break;
				}
			}

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var road_idx = parseInt(adjacentNodes[vertex]);
					var cost = global_roads[road_idx].dis,
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];
					if(global_roads[road_idx].broken)
						continue;
					// console.log(node, vertex, road_idx, cost);

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}
		if(this.end == undefined||predecessors[this.end] == undefined)
			this.end = node_bk;

		return predecessors;

		// if (costs[end] === undefined) {
		// 	return null;
		// } else {
		// 	return predecessors;
		// }

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;

		while (u !== undefined) {
			nodes.push(u);
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		// console.log(nodes);
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		// while (nodes.length) {
		while (true) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, this.end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}

			start = end;
			break;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var Graph = function (map, road_arr) {
		this.map = map;
	}

	Graph.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	Graph.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return Graph;

})();