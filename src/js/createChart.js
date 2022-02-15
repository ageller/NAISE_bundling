//hierarchical edge bundling was taken from : https://bl.ocks.org/mbostock/1044242

function createSVG(){
	var radius = params.diameter/2;
	var innerRadius = radius - params.outerWidth;

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

	params.link = params.svg.append("g").selectAll(".link");
	params.node = params.svg.append("g").selectAll(".node");

	//for the arcs
	params.chord = d3.chord()
		.padAngle(.04)
		.sortSubgroups(d3.descending)
		.sortChords(d3.descending);

	params.arc = d3.arc()
		.innerRadius(innerRadius)
		.outerRadius(innerRadius + params.arcWidth);
	params.arc2 = d3.arc()
		.innerRadius(innerRadius + params.arcWidth + 2)
		.outerRadius(innerRadius + 2.*params.arcWidth + 2);

}

///////////////////////////
//for hierarchical bundling
///////////////////////////
function populateBundles(classes){

	params.root = packageHierarchy(classes)
		.sum(function(d) { return d.size; });

	params.cluster(params.root);

	params.link = params.link.data(packageImports(params.root.leaves()))
		.enter().append("path")
			.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
			.attr("class", function(d){
				return "link " + d.target.data.name.replaceAll(' ','').substr(0, d.target.data.name.lastIndexOf('.')).replaceAll('.',' ');
			})
			.attr('fullDept',function(d){return d.target.data.name})
			.attr('year', function(d){return d.target.data.year;})
			.attr('dollars', function(d){return d.target.data.dollars;})
			.attr('funded', function(d){return d.target.data.funded;})
			.attr("d", params.line);

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

	// Return a list of imports for the given array of nodes.
	function packageImports(nodes) {
		var map = {},
				imports = [];

		// Compute a map from name to node.
		nodes.forEach(function(d) {
			map[d.data.name] = d;
		});

		// For each import, construct a link from the source to target node.
		nodes.forEach(function(d) {
			if (d.data.imports) d.data.imports.forEach(function(i) {
				imports.push(map[d.data.name].path(map[i]));
			});
		});

		return imports;
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
		var deptList = d3.select(this).attr('fullDept').split('.');
		var d = deptList[0];
		var s = deptList[1];
		if (!depts.includes(d)) depts.push(d);
		if (!subDepts.includes(d + '.' + s)) subDepts.push(d + '.' + s);
	})

	//get the startAngle and endAngle for each of these
	//there is probably a more efficient way to do this
	var deptArcs = [];
	var subDeptArcs = [];
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
		deptArcs.push(anglesDict)
	})

	var padding = 0.00;
	subDepts.forEach(function(d,i){
		var anglesDict = {'index':i, 'startAngle':2*Math.PI, 'endAngle':0, 'angle':2*Math.PI, 'subDept':d};
		var angles = [];
		params.root.leaves().forEach(function(dd){
			var deptList = dd.data.name;
			if (deptList.includes(d)){
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
			return a*(params.diameter/2. + params.arcWidth) - 20
		})  
		.attr("dy", params.arcWidth/2. + params.fontsize/2. - 2) 
		.style('font-size', params.fontsize + 'px')
		.style('line-height', params.fontsize + 'px')
		.style('text-anchor','middle')
		.style('fill','white')
		.append("textPath")
			.attr("xlink:href",function(d){return "#deptArc_" +  d.dept;})
			.text(function(d){return d.dept;});

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
		.attr("class", "subDeptText")
		.attr("dy", "0.3em")
		.attr("transform", function(d) { 
			var rot = (d.startAngle + (d.endAngle - d.startAngle)/2.)*180/Math.PI;
			var x =  params.diameter/2 - params.outerWidth + 2.*params.arcWidth + 4;
			return "rotate(" + (rot - 90) + ")translate(" + x + ",0)" + (rot < 180 ? "" : "rotate(180)"); 
		})
		.attr("text-anchor", function(d) { 
			var rot = (d.startAngle + (d.endAngle - d.startAngle)/2.)*180/Math.PI;
			return rot < 180 ? "start" : "end"; 
		})
		.text(function(d) { 
			return d.subDept.substring(d.subDept.indexOf('.') + 1);; 
		});
}

function styleBundles(){
	//there is probably a more efficient way to do this
	d3.selectAll('.link').each(function(){
		var elem = d3.select(this);

		elem.style('stroke-linecap','round');
		//color by year
		var year = elem.attr('year');
		if (year > 0){
			elem.style('stroke', params.fillYear(year))
		} else {
			console.log(year, elem.attr('fullDept'))
		}

		//size by dollar amount
		var dollars = elem.attr('dollars');
		elem.style('stroke-width', params.sizeDollar(dollars))

		//opacity by funded
		var funded = elem.attr('funded');
		if (funded == 'funded'){
			elem.style('stroke-opacity', 0.7)
		} else {
			elem.style('stroke-opacity', 0.1)
		}

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
