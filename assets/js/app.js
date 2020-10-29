let svgWidth = 960;
let svgHeight = 500;

let margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;
//Set up scatter 
let svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

let chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("assets/data/data.csv").then(function(Data) {
  console.log(Data)

    Data.forEach(function(data) {
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.abbr = data.abbr;
    });

    let xLinearScale = d3.scaleLinear()
      .domain([0, d3.max(Data, d => d.healthcare)])
      .range([0, width]);

    let yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(Data, d => d.poverty)])
      .range([height, 0]);

    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

//circle
    let circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.healthcare))
    .attr("cy", d => yLinearScale(d.poverty))
    .attr("r", "10")
    .attr("fill", "palevioletred")
    .attr("stroke", "grey")
    .attr("stroke-width", "3")
    .attr("opacity", ".5");

    //circle text
    let text = chartGroup.selectAll()
    .data(Data)
    .enter()
    .append("text")
    .attr("dx", d => xLinearScale(d.healthcare))
    .attr("dy", d => yLinearScale(d.poverty))
    .text(d => (d.abbr))
    .attr("fill", "white")
    .attr("font-size", 8)
    .style("text-anchor", "middle");

    // y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Healthcare (%)")
      .attr("font-weight", 800)
      .attr("font-size", 18)
      .attr("fill", "white");

      // x axis 
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Poverty (%)")
      .attr("font-weight", 800)
      .attr("font-size", 18)
      .attr("fill", "white");
  }).catch(function(error) {
    console.log(error);
  });

  //tooltip
  let toolTip = d3.select("body").append("div")
  .attr("class", "tooltip");

  circlesGroup.on("mouseover", function(d, i) {
    toolTip.style("display", "block");
    toolTip.html(`${d.state}<br>Healthcare (%): ${d.healthcare[i]}<br>Poverty(%): ${d.poverty[i]}`)
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY +"px")
  })

    .on("mouseout", function() {
      toolTip.style("display", "none");
    });

