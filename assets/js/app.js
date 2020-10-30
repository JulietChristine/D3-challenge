let svgWidth = 1000;
let svgHeight = 500;

let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;
//Set up scatter 
let svg = d3.select('#scatter')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

let chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

let chosenX = 'poverty';

function xScale(chartData, chosenX) {

  let xLinearScale = d3.scaleLinear()
      .domain([d3.min(chartData, d => d[chosenX]) * 0.7 ,d3.max(chartData, d=> d[chosenX]) * 1.3])
      .range([0, width]);
  
  return xLinearScale;
}

function renderAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale); 
  xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  return xAxis;
};

function renderCircles(circlesGroup, xLinearScale, chosenX) {
  circlesGroup.transition()
      .duration(1000)
      .attr('cx', d => xLinearScale(d[chosenX]))

  
  return circlesGroup;
};

function renderAbbr(text, newXScale, chosenX) {
  text.transition()
    .duration(1000)
    .attr('dx', d => newXScale(d[chosenX]))
  return text;
};


 
function updateToolTip(chosenX, circlesGroup) {
  let label;

  if (chosenX === 'poverty') {
      label = 'Poverty %'
  }
  else {
      label = 'Age (Average)'
  }

  let toolTip = d3.tip()
      .attr('class', 'tooltip')
      .offset([80, -60])
      .html(function(d) {
          return (`${d.state}<br>${label}: ${d[chosenX]}<br>Lacks Healthcare: ${d.healthcare}%`);
      });
  
  circlesGroup.call(toolTip);

  circlesGroup.on('mouseover', function(data) {
      toolTip.show(data);
  })
  .on('mouseout', function(data) {
      toolTip.hide(data);
  });
  return circlesGroup
}

d3.csv('assets/data/chartData.csv').then(function(chartData) {

    chartData.forEach(function(data) {
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.abbr = +data.abbr
    })

    let xLinearScale = xScale(chartData, chosenX);

    let yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(chartData, d=>d.healthcare)])
    .range([height, 0]);

    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0,${height})`)
      .call(bottomAxis);

    chartGroup.append('g')
      .call(leftAxis);

    let circlesGroup = chartGroup.selectAll('circle')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('cx', d => xLinearScale(d[chosenX]))
      .attr('cy', d => yLinearScale(d.healthcare))
      .attr('r', '10')
      .attr('fill', 'palevioletred')
      .attr('stroke', 'grey')
      .attr('stroke-width', '2')
      .attr('opacity', '.5')

    let labelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${width / 2}, ${height + 20})`);

    let povertyLabel = labelsGroup.append('text')
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty')
      .classed('active', true)
      .text('Poverty (%)');

    let ageLabel = labelsGroup.append('text')
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'age')
      .classed('inactive', true)
      .text('Average Age');

    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .classed('axis-text', true)
      .text('Lacks Healthcare (%)')
      .attr('font-weight', 700)
      .attr('font-size', 16)
      .attr('fill', 'palevioletred');

    let text = chartGroup.selectAll()
      .data(chartData)
      .enter()
      .append('text')
      .attr('dx', d => xLinearScale(d[chosenX]))
      .attr('dy', d => yLinearScale(d.healthcare))
      .text(d => (d.abrv))
      .attr('fill', 'white')
      .attr('font-size', 8)
      .style('text-anchor', 'middle');

    circlesGroup = updateToolTip(chosenX, circlesGroup)

    labelsGroup.selectAll('text')
      .on('click', function() {
        let value = d3.select(this).attr('value');
        if (value !== chosenX) {
            chosenX = value;

            console.log(chosenX);

            xLinearScale = xScale(chartData, chosenX);
            xAxis = renderAxes(xLinearScale, xAxis);
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenX);
            circlesGroup = updateToolTip(chosenX, circlesGroup);
            text = renderAbbr(text, xLinearScale, chosenX);

            if (chosenX === 'age') {
              ageLabel
                  .classed('active', true)
                  .classed('inactive', false);
              povertyLabel
                  .classed('active', false)
                  .classed('inactive', true);
      
          }
          else {
              ageLabel
                  .classed('active', false)
                  .classed('inactive', true);
              povertyLabel
                  .classed('active', true)
                  .classed('inactive', false);
          }
      }
  })

}).catch(function(error) {
  console.log(error);
})

