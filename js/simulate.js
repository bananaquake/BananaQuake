function find_s(x, y)
{
	var minid = '-1', minv = 1000000000;
	var idx = 0;
	for(var key in global_points)
	{
		var p = global_points[key];
		var lon = parseFloat(p['@lon']), lat = parseFloat(p['@lat']);
		var dist = (lon-x)*(lon-x)+(lat-y)*(lat-y);
		if(dist<minv)
		{
			minv = dist;
			minid = key;
		}
		idx += 1;
	}
	return minid;
}
function simulate2points(x1, y1, x2, y2)//log, lat
{
	console.log(x1, y1, x2, y2);
	var idx = find_s(x1, y1);
	if(idx=='-1')
	{
		console.log('holly shit!', x1, y1);
		return ;
	}
	var target = find_s(x2, y2);
	if(target=='-1')
	{
		console.log('holly shit target!', x1, y1);
		return ;
	}
	console.log(idx, target);
	var graph = new Graph(global_graphs, global_roads);
	var path = graph.findShortestPath(idx, target);
	if(path[path.length-1]!=target)
	{
		path.push(target);
	}
	console.log(path);
	if(path.length==0)
	{
		console.log('No result!', x1, y1);
		return ;
	}

	var point = makeStruct("x y");
	var pos_arr = new Array();
	pos_arr[0] = new point(x1, y1);
	var idx = 1, pos_idx = 1;
	var tmp_point = global_points[path[0]], nxt_point = global_points[path[idx]];
	// console.log(tmp_point);
	var velocity = 0.00005;
	while(idx < path.length)
	{
		pos_arr[pos_idx] = new point(parseFloat(tmp_point['@lon']), parseFloat(tmp_point['@lat']));
		pos_idx += 1;
		var dx = parseFloat(nxt_point['@lon'])-parseFloat(tmp_point['@lon']);
		var dy = parseFloat(nxt_point['@lat'])-parseFloat(tmp_point['@lat']);
		var distance1 = Math.sqrt(dx*dx+dy*dy);
		// var distance = getGreatCircleDistance(tmp_point['@lat'], tmp_point['@lon'], nxt_point['@lat'], nxt_point['@lon']);
		if(distance1<velocity)
		{
			tmp_point = nxt_point;
			idx++;
			if(idx < path.length)
				nxt_point = global_points[path[idx]];
		}
		else
		{
			dx = dx/distance1;
			dy = dy/distance1;
			var new_x = parseFloat(tmp_point['@lon'])+dx*velocity;
			var new_y = parseFloat(tmp_point['@lat'])+dy*velocity;
			tmp_point['@lon'] = new_x;
			tmp_point['@lat'] = new_y;
		}
	}
	pos_arr[pos_idx] = new point(parseFloat(tmp_point['@lon']), parseFloat(tmp_point['@lat']));
	// console.log(pos_arr);
	var eps = 0.000001;
	for(var i = 0; i < pos_arr.length; i++)
	{
		var flag1 = Math.ceil(Math.random()*10)%2;
		var flag2 = Math.ceil(Math.random()*10);
		// console.log(flag1, flag2);
		if(flag1==0)
		{
			// console.log(pos_arr[i].x, pos_arr[i].x+flag2*eps);
			pos_arr[i].x = pos_arr[i].x+flag2*eps;
			// console.log(pos_arr[i].x);
		}
		else
		{
			pos_arr[i].x = pos_arr[i].x-flag2*eps;
		}
		flag1 = Math.ceil(Math.random()*10)%2;
		flag2 = Math.ceil(Math.random()*10);
		if(flag1==0)
		{
			pos_arr[i].y = pos_arr[i].y+flag2*eps;
		}
		else
		{
			pos_arr[i].y = pos_arr[i].y-flag2*eps;
		}
	}
	return pos_arr;

}
function simulate()
{
	init();
	var graph = new Graph(global_graphs, global_roads);
	var all_agent = [];
	var agent_num = 1000;
	for(var ii = 0; ii < agent_num; ii++)
	{
		// console.log(ii);
		var lat = random(sb, nb);
		var lon = random(wb, eb);
		// console.log(lon, lat);
		var idx = find_s(lon, lat);
		// console.log(idx);
		if(idx=='-1')continue;
		var path = graph.findShortestPath(idx);
		// console.log(path.length);
		if(path.length==0)continue;

		var point = makeStruct("x y");
		var pos_arr = new Array();
		pos_arr[0] = new point(lon, lat);
		var idx = 1, pos_idx = 1;
		var tmp_point = global_points[path[0]], nxt_point = global_points[path[idx]];
		// console.log(tmp_point);
		var velocity = 0.00005;
		while(idx < path.length)
		{
			pos_arr[pos_idx] = new point(parseFloat(tmp_point['@lon']), parseFloat(tmp_point['@lat']));
			pos_idx += 1;
			var dx = parseFloat(nxt_point['@lon'])-parseFloat(tmp_point['@lon']);
			var dy = parseFloat(nxt_point['@lat'])-parseFloat(tmp_point['@lat']);
			var distance1 = Math.sqrt(dx*dx+dy*dy);
			// var distance = getGreatCircleDistance(tmp_point['@lat'], tmp_point['@lon'], nxt_point['@lat'], nxt_point['@lon']);
			if(distance1<velocity)
			{
				tmp_point = nxt_point;
				idx++;
				if(idx < path.length)
					nxt_point = global_points[path[idx]];
			}
			else
			{
				dx = dx/distance1;
				dy = dy/distance1;
				var new_x = parseFloat(tmp_point['@lon'])+dx*velocity;
				var new_y = parseFloat(tmp_point['@lat'])+dy*velocity;
				tmp_point['@lon'] = new_x;
				tmp_point['@lat'] = new_y;
			}
		}
		pos_arr[pos_idx] = new point(parseFloat(tmp_point['@lon']), parseFloat(tmp_point['@lat']));
		// console.log(pos_arr);
		var eps = 0.000001;
		for(var i = 0; i < pos_arr.length; i++)
		{
			var flag1 = Math.ceil(Math.random()*10)%2;
			var flag2 = Math.ceil(Math.random()*10);
			// console.log(flag1, flag2);
			if(flag1==0)
			{
				// console.log(pos_arr[i].x, pos_arr[i].x+flag2*eps);
				pos_arr[i].x = pos_arr[i].x+flag2*eps;
				// console.log(pos_arr[i].x);
			}
			else
			{
				pos_arr[i].x = pos_arr[i].x-flag2*eps;
			}
			flag1 = Math.ceil(Math.random()*10)%2;
			flag2 = Math.ceil(Math.random()*10);
			if(flag1==0)
			{
				pos_arr[i].y = pos_arr[i].y+flag2*eps;
			}
			else
			{
				pos_arr[i].y = pos_arr[i].y-flag2*eps;
			}
			
		}
		all_agent.push(pos_arr);
	}
	// console.log(pos_arr);
	return all_agent;
}