var data;

d3.json('/temperature', function(d){
  data = d;
  visualize();
});

$(document).on('click','a',function(){
  var cmd = '';
  switch($(this).text()){
  case 'Heater':
    cmd = 'heater on';
    break;
  case 'Cooler':
    cmd = 'cooler on';
    break;
  case 'Poweroff':
    cmd = 'power off';
  }
  alert(cmd);
  $.post('/command',{'command': cmd});
});

function visualize() {
  var _w = $(window).width(),
      _h = $(window).height();

  var margin = {top: 20, right: 30, bottom: 130, left: 30},
      width = parseInt(_w,10) - margin.left - margin.right,
      height = parseInt(_h,10) - margin.top - margin.bottom;

  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height,0]);

  var xAxis = d3.svg.axis().scale(x)
      .tickFormat(d3.time.format("%d"))
      .orient("bottom");
  var yAxis = d3.svg.axis().scale(y)
      .orient("left");

  var line = d3.svg.line()
      .x(function(d) { return x(d.datetime); })
      .y(function(d) { return y(d.celsius); });

  var svg = d3.select("svg")
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
    y.domain([0,50]);

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

var sse = new EventSource('/monitor');
sse.onmessage = function(event){
  $('#celsius').text(event.data + ' ℃');
};
