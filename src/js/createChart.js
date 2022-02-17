//hierarchical edge bundling was taken from : https://bl.ocks.org/mbostock/1044242

function createSVG(){
	var radius = params.diameter/2;
	var innerRadius = radius - params.outerWidth;

 	d3.select("body").append("div")
 		.attr('id', 'tooltip')
 		.attr('class', 'hidden');

	//define the SVG
	params.svg = d3.select("body").append("svg")
		.attr('id','svg')
		.attr("width", params.diameter + 2.*Math.max(params.xOffset, params.yOffset))
		.attr("height", params.diameter + 2.*Math.max(params.xOffset, params.yOffset))
		.append("g")
			.attr("transform", "translate(" + (radius + params.xOffset) + "," + (radius + params.yOffset) + ")");

	// for the bundling
	params.cluster = d3.cluster()
		.size([360, innerRadius]);

	params.line = d3.radialLine()
		.curve(d3.curveBundle.beta(0.85))
		.radius(function(d) { return d.y; })
		.angle(function(d) { return d.x/180*Math.PI; });

	//trying to have multiple layers so that I can keep the active ones on top
	params.link1 = params.svg.append("g").selectAll(".link");
	params.link2 = params.svg.append("g").selectAll(".link");
	params.link3 = params.svg.append("g").selectAll(".link");
	params.node = params.svg.append("g").selectAll(".node");

	//for the arcs
	params.chord = d3.chord()
		.padAngle(.04)
		.sortSubgroups(d3.descending)
		.sortChords(d3.descending);

	params.arc = d3.arc()
		.innerRadius(innerRadius)
		.outerRadius(innerRadius + params.arc1Width);
	params.arc2 = d3.arc()
		.innerRadius(innerRadius + params.arc1Width + 2)
		.outerRadius(innerRadius + params.arc1Width + params.arc2Width + 2);

}

///////////////////////////
//for hierarchical bundling
///////////////////////////
function populateBundles(classes){

	params.root = packageHierarchy(classes)
		.sum(function(d) { return d.size; });

	params.cluster(params.root);

	params.link1.data(packageResearchers(params.root.leaves(), 'submitted'))
		.enter().append("path")
			.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
			.attr("class", function(d){
				var tt = d.target.data.name.replaceAll(' ','');
				var t = tt.substr(0, tt.lastIndexOf('.')).replaceAll('.',' ');
				var ss = d.source.data.name.replaceAll(' ','');
				var s = ss.substr(0, ss).replaceAll('.',' ');
				return "link " + s + ' ' + t + ' ' + d.source.data.grantNumber;
			})
			.attr('fullTarget',function(d){return d.target.data.name})
			.attr('fullSource',function(d){return d.source.data.name})
			.attr('year', function(d){return d.source.data.year;})
			.attr('dollars', function(d){return d.source.data.dollars;})
			.attr('funded', function(d){return d.source.data.funded;})
			.attr('grantNumber', function(d){return d.source.data.grantNumber;})
			.attr('grantTitle', function(d){return d.source.data.title;})
			.attr("d", params.line);

	params.link2.data(packageResearchers(params.root.leaves(), 'funded'))
		.enter().append("path")
			.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
			.attr("class", function(d){
				var tt = d.target.data.name.replaceAll(' ','');
				var t = tt.substr(0, tt.lastIndexOf('.')).replaceAll('.',' ');
				var ss = d.source.data.name.replaceAll(' ','');
				var s = ss.substr(0, ss).replaceAll('.',' ');
				return "link " + s + ' ' + t + ' ' + d.source.data.grantNumber;
			})
			.attr('fullTarget',function(d){return d.target.data.name})
			.attr('fullSource',function(d){return d.source.data.name})
			.attr('year', function(d){return d.source.data.year;})
			.attr('dollars', function(d){return d.source.data.dollars;})
			.attr('funded', function(d){return d.source.data.funded;})
			.attr('grantNumber', function(d){return d.source.data.grantNumber;})
			.attr('grantTitle', function(d){return d.source.data.title;})
			.attr("d", params.line);


	params.link3.data(packageResearchers(params.root.leaves(), 'active'))
		.enter().append("path")
			.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
			.attr("class", function(d){
				var tt = d.target.data.name.replaceAll(' ','');
				var t = tt.substr(0, tt.lastIndexOf('.')).replaceAll('.',' ');
				var ss = d.source.data.name.replaceAll(' ','');
				var s = ss.substr(0, ss).replaceAll('.',' ');
				return "link " + s + ' ' + t + ' ' + d.source.data.grantNumber;
			})
			.attr('fullTarget',function(d){return d.target.data.name})
			.attr('fullSource',function(d){return d.source.data.name})
			.attr('year', function(d){return d.source.data.year;})
			.attr('dollars', function(d){return d.source.data.dollars;})
			.attr('funded', function(d){return d.source.data.funded;})
			.attr('grantNumber', function(d){return d.source.data.grantNumber;})
			.attr('grantTitle', function(d){return d.source.data.title;})
			.attr("d", params.line);




	d3.selectAll('.link').on('mouseover', function(){
		//populate the tooltip
		var year = d3.select(this).attr('year');
		var dollars = params.numberWithCommas(d3.select(this).attr('dollars'));
		var grantNumber = d3.select(this).attr('grantNumber');
		var title = d3.select(this).attr('grantTitle');
		var status =  d3.select(this).attr('funded');


		var x = d3.event.pageX + 10;
		var y = d3.event.pageY + 10;

		d3.select('#tooltip')
			.html(
				'<b>Grant No. : </b>' + grantNumber + '<br>' +
				'<b>Title : </b>' + title + '<br>' +
				'<b>Amount : </b>$' + dollars + '<br>' +
				'<b>Year : </b>' + year + '<br>' +
				'<b>Status : </b>' + status + '<br>'
			)
			.style('left',x + 'px')
			.style('top',y + 'px')
			.classed('hidden', false);

		d3.selectAll('.' + grantNumber).classed('highlighted', true);
		d3.selectAll('.link:not(.' + grantNumber + ')').classed('deemphasized', true);

		console.log(grantNumber, year, status, dollars, d3.select(this).attr('fullSource'), d3.select(this).attr('fullTarget'))

	})

	d3.selectAll('.link').on('mouseout', function(){
		d3.select('#tooltip')
			.classed('hidden', true)
			.html('');

		d3.selectAll('.link').classed('highlighted', false).classed('deemphasized', false);
	})

	// text (all the names)
	// params.node = params.node.data(params.root.leaves())
	// 	.enter().append("text")
	// 		.attr("class", "node")
	// 		.attr("dy", "0.31em")
	// 		.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 50) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
	// 		.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
	// 		.text(function(d) { 
	// 			//console.log(d.data)
	// 			//return d.data.key; 
	// 			return d.data.name; 
	// 		});

	// Lazily construct the package hierarchy from class names.
	function packageHierarchy(classes) {
		var map = {};

		function find(name, data) {
			var node = map[name], i;
			if (!node) {
				node = map[name] = data || {name: name, children: []};
				if (name.length) {
					node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
					node.parent.children.push(node);
					node.key = name.substring(i + 1);
				}
			}
			return node;
		}

		classes.forEach(function(d) {
			find(d.name, d);
		});

		return d3.hierarchy(map[""]);
	}

	// Return a list of researchers for the given array of nodes.
	function packageResearchers(nodes, funding = null) {
		var map = {},
			researchers = [];

		// Compute a map from name to node.
		var usenodes = nodes;
		if (funding) usenodes = nodes.filter(function(d){return d.data.funded == funding; })
		usenodes.forEach(function(d) {
			map[d.data.name] = d;
		});

		// For each import, construct a link from the source to target node.
		usenodes.forEach(function(d) {
			if (d.data.researchers) d.data.researchers.forEach(function(i) {
				researchers.push(map[d.data.name].path(map[i]));
			});
		});

		return researchers;
	}

}


///////////////////////////
//for chord diagram, using only exterior arcs 
///////////////////////////
function populateArcs(classes){

	//compile the departments and sub_departments
	var depts = [];
	var subDepts = [];
	d3.selectAll('.link').each(function(){
		var sourceList = d3.select(this).attr('fullSource').split('.');
		var d = sourceList[0];
		var s = sourceList[1];
		if (!depts.includes(d)) depts.push(d);
		if (!subDepts.includes(d + '.' + s)) subDepts.push(d + '.' + s);

		var targetList = d3.select(this).attr('fullTarget').split('.');
		d = targetList[0];
		s = targetList[1];
		if (!depts.includes(d)) depts.push(d);
		if (!subDepts.includes(d + '.' + s)) subDepts.push(d + '.' + s);
	})

	//get the startAngle and endAngle for each of these
	//there is probably a more efficient way to do this
	var deptArcs = [];
	var subDeptArcs = [];
	var skinnyDepts = [];
	depts.forEach(function(d,i){
		var anglesDict = {'index':i, 'startAngle':2*Math.PI, 'endAngle':0, 'angle':2*Math.PI, 'dept':d};
		var angles = [];
		params.root.leaves().forEach(function(dd){
			var deptList = dd.data.name;
			if (deptList.includes(d)){
				angles.push(dd.x*Math.PI/180.)
			}
		})
		var ex = d3.extent(angles);
		anglesDict.startAngle = ex[0];
		anglesDict.endAngle = ex[1];
		anglesDict.angle = anglesDict.endAngle - anglesDict.startAngle;
		if (anglesDict.angle < params.minDeptTextAngle) skinnyDepts.push(d)
		deptArcs.push(anglesDict)
	})

	var padding = 0.00;
	subDepts.forEach(function(d,i){
		var anglesDict = {'index':i, 'startAngle':2*Math.PI, 'endAngle':0, 'angle':2*Math.PI, 'subDept':d};
		var angles = [];
		params.root.leaves().forEach(function(dd){
			var deptList = dd.data.name;
			if (deptList.includes(d)){
				if (dd.data.name == 'ANL-CLS.Mathematics and Computer Science (MCS).BarrySmith'){
					console.log('here', dd.data.name, d, dd.x, dd.x*Math.PI/180., dd)
				}
				angles.push(dd.x*Math.PI/180.)
			}
		})
		var ex = d3.extent(angles);
		anglesDict.startAngle = ex[0] - padding;
		anglesDict.endAngle = ex[1] + padding;
		anglesDict.angle = anglesDict.endAngle - anglesDict.startAngle;
		subDeptArcs.push(anglesDict)
	})


	console.log(deptArcs)
	console.log(subDeptArcs)
	//deptArcs = [deptArcs[0]]
	// for subDepts, I will also need to make sure the angle is within the Dept angle (since some sub-depts have multiple depts)
	//draw the arcs
	//dept
	var g = params.svg.append("g")
		.attr("class","arcsDept")
		.selectAll(".dept")
		.data(deptArcs).enter().append("g")
			.attr("class", "dept")

	g.append("path")
		.attr("id", function(d){return "deptArc_" + d.dept;})
		.style("fill", function(d) { return params.fillDept(d.dept); })
		.style("stroke", function(d) { return params.fillDept(d.dept); })
		.attr("d", params.arc);

	//add the text
	g.append("text")
		.attr("class", "deptText")
		.attr("x", function(d){
			// not sure why this doesn't center it properly.  Had to add a fudge factor (20) 
			var a = d.angle/2.;
			return a*(params.diameter/2. + params.arc1Width) - 20
		})  
		.attr("dy", params.arc1Width/2. + params.fontsize/2. - 2) 
		.style('font-size', params.fontsize + 'px')
		.style('line-height', params.fontsize + 'px')
		.style('text-anchor','middle')
		.style('fill','white')
		.append("textPath")
			.attr("xlink:href",function(d){return "#deptArc_" +  d.dept;})
			.text(function(d){if (d.angle > params.minDeptTextAngle) return d.dept;});

	//subDept
	var g = params.svg.append("g")
		.attr("class","arcsSubDept")
		.selectAll(".subDept")
		.data(subDeptArcs).enter().append("g")
			.attr("class", "subDept");

	g.append("path")
		.attr("id", function(d){return "subDeptArc_" + d.subDept;})
		.style("fill", function(d) { return params.fillDept(d.subDept); })
		.style("stroke", function(d) { return params.fillDept(d.subDept); })
		.attr("d", params.arc2);

	//add the text, similar to bundling
	g.append("text")
		.attr("class", function(d){
			var cls = 'subDeptText';
			var dd = d.subDept.substring(0, d.subDept.indexOf('.'));
			if (skinnyDepts.includes(dd)){
				cls += ' skinny';
			}
			return cls;
		})
		.attr("dy", "0.3em")
		.attr("transform", function(d) { 
			var rot = (d.startAngle + (d.endAngle - d.startAngle)/2.)*180/Math.PI;
			var x =  params.diameter/2 - params.outerWidth + params.arc1Width + params.arc2Width + 4;
			return "rotate(" + (rot - 90) + ")translate(" + x + ",0)" + (rot < 180 ? "" : "rotate(180)"); 
		})
		.attr("text-anchor", function(d) { 
			var rot = (d.startAngle + (d.endAngle - d.startAngle)/2.)*180/Math.PI;
			return rot < 180 ? "start" : "end"; 
		})
		.text(function(d) { 
			var txt = d.subDept.substring(d.subDept.indexOf('.') + 1);
			//use only the acronyms
			// if (txt.includes('(')){
			// 	var p1 = txt.indexOf('(') + 1;
			// 	var p2 = txt.indexOf(')');
			// 	txt = txt.substring(p1, p2)
			// }
			return txt;
		});

	d3.selectAll('.subDeptText.skinny').append('tspan')
		.style('font-weight', 'bold')
		.text(function(d){
			var dd = d.subDept.substring(0, d.subDept.indexOf('.'));
			return ' [' + dd + ']';
		})
}

function styleBundles(){
	//there is probably a more efficient way to do this
	d3.selectAll('.link').each(function(){
		var elem = d3.select(this);

		elem.style('stroke-linecap','round');
		// //color by year
		// var year = elem.attr('year');
		// if (year > 0){
		// 	elem.style('stroke', params.fillYear(year))
		// } else {
		// 	console.log(year, elem.attr('fullSource'))
		// }

		//size by dollar amount
		var dollars = elem.attr('dollars');
		elem.style('stroke-width', Math.min(params.sizeDollar(dollars), params.maxSize))
		//elem.style('stroke-width', 2.)

		//color by funded
		var funded = elem.attr('funded');
		elem.classed(funded, true);


	})
}

function exportSVG(){
	//https://morioh.com/p/287697cc17da
	svgExport.downloadSvg(
		document.getElementById("svg"), // 
		"NAISE_bundling", // chart title: file name of exported image
		{ width: 3840, height: 3840 } // options 
	);
}

///////////////////////////////
//runs on load
defineParams();
createSVG();
d3.json("src/data/NAISE_bundling.json", function(error, classes) {
	if (error) throw error;

	params.classes = classes;
	populateBundles(classes);
	populateArcs(classes);
	styleBundles(classes);

});
