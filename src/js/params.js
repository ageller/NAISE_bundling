//all "global" variables are contained within params object
var params;

function defineParams(){
	params = new function() {
		this.classes = null;
		this.root = null;
		this.matrix = null;

		this.svg = null;
		this.cluster = null;
		this.line = null;
		this.link1 = null;
		this.link2 = null;
		this.link3 = null;
		this.node = null;
		this.chord = null;
		this.arc = null;

		this.arc1Width = 30;
		this.arc2Width = 15;
		this.diameter = 960;
		this.outerWidth = 120;
		this.xOffset = 220;
		this.yOffset = 140;

		this.fontsize = 12;

		this.minDeptTextAngle = 0.1;

		this.fillYear = d3.scaleLinear().domain([2012,2022]).range(['#00708F', '#FF101F']);
		//this.sizeDollar = d3.scaleLog().base(2).domain([1,6e6]).range([1, 3]);
		this.sizeDollar = d3.scaleLinear().domain([1, 600000000]).range([1, 12]);

		//I'm going to define the fills based on the departments, and just hard code it in here
		// Argonne : https://www.csm.ornl.gov/SC2007/pres/White_Collaborators_Judy/Collaborators%20logos/Labs/Argonne_ANL/ANL_Guidelines_022806.pdf
		// Northwestern : https://www.northwestern.edu/brand/visual-identity/color-palettes/
		this.deptColors = {
			'ANL-CLS'   : '#006600', // Dark green
			'ANL-EGS'   : '#009900', // Grass
			'ANL-PSC'   : '#35bd35', // 
			'ANL-PSE'   : '#67db67', //
			'NU-FEIN'   : '#401F68', // Purple 120
			'NU-MCC'    : '#4E2A84', // Northwestern purple
			'NU-Medill' : '#684c96', // Purple 80
			'NU-WCAS'   : '#836EAA', // Purple 60
			'NU-NAISE'  : '#a495c3'  // Purple 40
		}
		this.fillDept = function(name){
			var i = name.indexOf('.');
			if (i <= 0) i = name.length;
			var prefix = name.substring(0, i)
			if (prefix in params.deptColors) return params.deptColors[prefix];
			console.log(prefix, name, i)
			return 'black'
		}


	}
}
