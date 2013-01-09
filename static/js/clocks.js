TringClock = {

	svg: null, 
	colour: null,
	colourList: ["#0000FF", "#FF0000"],

	svgWidth : 1024,
	svgHeight : 500,
	clockRadius : 200,
	exampleDate: "2011-09-01",

	init: function()
	{
		//Date 
		var currentTime = TringClock.exampleDate;

		//Create svg stage
		TringClock.svg = d3.select("#graphArea").append("svg")
		    .attr("width", TringClock.svgWidth)
		    .attr("height", TringClock.svgHeight);

		//Testing api - getting day data
		TRINGJS.Api.get_raw_day(currentTime, function(data){
        	var hourData = new TRINGJS.DataFormatter(data);

        	TringClock.createClock(hourData.get_hours());
        });


		//Jquery UI Initializers
		//----------------------
		// $( "#slider-date" ).dateRangeSlider({
		//     bounds:{min: new Date(currentTime.getFullYear(), currentTime.getMonth(), 0), 
		//     		max: new Date(currentTime.getFullYear(), currentTime.getMonth()+1, 0)
		//     	}});
		// $( "#slider-date" ).on("valuesChanged", function(e, data){
			 
		// });
	},

	getMaxMinDomain: function(sampleData)
	{
		var domain = {max: 0, min: 0};

		for(var entry in sampleData)
		{
			for(var index in sampleData[entry].data)
			{
				var diff = sampleData[entry].data[index].reading;
				
				if(domain.max == 0 && domain.min == 0) domain.min = domain.max = diff;
				if(Math.max(diff, domain.max) > domain.max) domain.max = diff;
				if(Math.min(diff, domain.min) < domain.min) domain.min = diff;
			}
		}

		return domain;
	},

	createClock: function(sampleData)
	{
		//Get max-min ranges from data and map positions against how many colours we're using for the fill range
		var domain = TringClock.getMaxMinDomain(sampleData);
		var domainRange = [];
		var range = domain.max - domain.min;
		var increment = range / TringClock.colourList.length;
		for(var i=0; i < TringClock.colourList.length; i++) domainRange.push(domain.min + (increment * i));

		//Create d3 colour scaler
		TringClock.colour = d3.scale.linear();
		TringClock.colour.range(TringClock.colourList);
		TringClock.colour.domain(domainRange);

		//Circle radius scaling
		var radiusMult = domain.max / domain.min * 20;
		var angleInc = Math.PI*2 / sampleData[0].data.length;

		//Set up root group transformation
		var svgGroup = TringClock.svg.append("g")
			.attr("transform", "translate(" + TringClock.svgWidth / 2 + "," + TringClock.svgHeight / 2 + ")");


		//Everything under here could safely be placed in update if required
		//------------------------------------------------------------------
		var circles = svgGroup.selectAll("circle").data(sampleData[0].data, function(d){
			return d.readings;
		});

		//Create circles
		circles.enter().append("circle").attr("fill", "#FFFFFF").on("mouseover", function(d){
				d3.select(this).style("stroke", "black").attr("stroke-width", 3);
			}).on("mouseout", function(){
				d3.select(this).style("stroke", "none").attr("stroke-wdith", 1);
			}).append("title").text(function(d){
			 	return d.reading + "kwh";
			});

		//Transition circle position and colour according to associated data values
		circles
			.transition().duration(750).attr("fill", function(d){return TringClock.colour(d.reading);})
			.transition().duration(750).ease("quad-out").attr("r", function(d){
				return d.reading * radiusMult ;
			})
			.transition().duration(750).attr("cx", function(d,i){
				var offset = 0;
				var result;

				//Offset circle positions based on AM/PM clocks
				if(i < sampleData[0].data.length/2 ){
					offset = -TringClock.clockRadius * 1.1;
					result = Math.cos(i*2 * angleInc - Math.PI/2) * TringClock.clockRadius + offset;
				}else{
					offset = TringClock.clockRadius * 1.1;
					result = Math.cos(i*2 * angleInc - Math.PI/2) * TringClock.clockRadius + offset;
				}

				return result;
			})
			.transition().duration(750).attr("cy", function(d,i){
				return Math.sin(i*2 * angleInc - Math.PI/2) * TringClock.clockRadius;
			});
	}
}