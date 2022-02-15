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
		this.link = null;
		this.node = null;
		this.chord = null;
		this.arc = null;

		this.arcWidth = 20;
		this.diameter = 960;
		this.outerWidth = 120;
		this.xOffset = 220;
		this.yOffset = 140;

		this.fontsize = 12;

		this.fillYear = d3.scaleLinear().domain([2012,2022]).range(['#00708F', '#FF101F']);
		//this.sizeDollar = d3.scaleLog().base(2).domain([1,6e6]).range([1, 3]);
		this.sizeDollar = d3.scaleLinear().domain([1, 600000000]).range([1, 12]);

		this.fillDept = function(name){
			//Northwestern : https://www.northwestern.edu/brand/visual-identity/color-palettes/
			if (name.startsWith('NU-')) return '#4E2A84';
			//Argonne: https://www.csm.ornl.gov/SC2007/pres/White_Collaborators_Judy/Collaborators%20logos/Labs/Argonne_ANL/ANL_Guidelines_022806.pdf
			return '#009900'
		}


	}
}
