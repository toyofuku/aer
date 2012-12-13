var data;

d3.json('http://ec2-175-41-206-164.ap-northeast-1.compute.amazonaws.com:3000/temperature', function(d){
  data = d;
  visualize();
});

function visualize() {
  
	var margin = {top: 20, right: 20, bottom: 30, left: 70},
	    width = 640 - margin.left - margin.right,
	    height = 400 - margin.top - margin.bottom;

	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height,0]);
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left");

	var line = d3.svg.line()
	    .x(function(d) { return x(d.datetime); })
	    .y(function(d) { return y(d.celsius); });

	var svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	{
	  data.forEach(function(d) {
		d.datetime = new Date(d.datetime);
	    d.celsius = d.celsius;
	  });

	  x.domain(d3.extent(data, function(d) { return d.datetime; }));
	  y.domain(d3.extent(data, function(d) { return d.celsius; }));

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	      .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Celsius");

	  svg.append("path")
	      .datum(data)
	      .attr("class", "line")
	      .attr("d", line);
	}

}