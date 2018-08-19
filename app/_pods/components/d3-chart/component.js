import Component from '@ember/component';
import { bind } from '@ember/runloop';
import { classNames } from '@ember-decorators/component';
import d3 from 'd3';
import moment from 'moment';
import { next } from '@ember/runloop';
import { service } from '@ember-decorators/service';

@classNames('d3-chart', 'h-100')
export default class D3Chart extends Component {
  @service config;

  constructor(...args) {
    super(...args);
  }

  didInsertElement() {
    next(this, () => {
      this.buildArea();
      this.buildScales();
      this.buildAxes();
      this.buildAxisElements();
      this.buildGrid();
      this.buildZoom();
      this.plotData(this.xScale, this.yScale, true);
      this.plotTarget(this.xScale, this.yScale);
    });
  }

  buildArea() {
    this.targetElement = this.$();
    this.targetWidth = this.targetElement.width();
    this.targetHeight = this.targetElement.height();
    this.margins = {
      top: 0,
      right: 20,
      left: 100,
      bottom: 100
    };

    this.svg = d3.select(this.targetElement[0])
      .append('svg')
      .attr('width', this.targetWidth)
      .attr('height', this.targetHeight)
      .attr('viewBox', `0 0 ${this.targetWidth} ${this.targetHeight}`);

    this.chartWidth = this.targetWidth - this.margins.left - this.margins.right;
    this.chartHeight = this.targetHeight - this.margins.top - this.margins.bottom;

    this.plotG = this.svg
      .append('g')
      .attr('class', 'plot-area')
      .attr('transform', `translate(${this.margins.left},${this.margins.top})`);

    this.svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.chartWidth)
        .attr('height', this.chartHeight);

    this.plotG.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight);

    this.drawingCanvas = this.plotG.append('g')
      .attr('class', 'drawing-canvas')
      .attr('clip-path', 'url(#clip)');
  }

  buildScales() {
    this.xScale = d3.scaleTime();
    this.yScale = d3.scaleLinear();

    let countMax = d3.max(this.data, d => Math.max(this.totalBudget, d.total));
    if (countMax === 0) {
      countMax = 30000;
    }

    const dateMin = moment(this.get('config.firstDayOfPeriod'), 'YYYY-MM-DD').toDate();
    const dateMax = moment(this.get('config.lastDayOfPeriod'), 'YYYY-MM-DD').toDate();

    this.xScale.range([0, this.chartWidth]).domain([dateMin, dateMax]);
    this.yScale.range([this.chartHeight, 0]).domain([0, countMax + Math.floor(countMax * 0.25)]);
  }

  buildAxes() {
    this.xAxis = d3.axisBottom(this.xScale)
      .tickPadding(10)
      .tickSizeOuter(0)
      .ticks(d3.timeDay.every(1));

    this.yAxis = d3.axisLeft(this.yScale)
      .tickPadding(10)
      .tickSizeOuter(0)
      .tickFormat(d => {
        return `$${Math.floor(d / 100).toLocaleString()}`;
      });
  }

  buildAxisElements() {
    this.xAxisEl = this.plotG
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${this.chartHeight})`)
      .call(this.xAxis);

    this.yAxisEl = this.plotG
      .append('g')
      .attr('class', 'y axis')
      .call(this.yAxis);

    this.svg
      .append('text')
      .attr('class', 'label-text')
      .attr('transform', `translate(${this.chartWidth / 2 + this.margins.left},${this.chartHeight + this.margins.top + 80})`)
      .style('text-anchor', 'middle')
      .text('Date');

    this.svg
      .append('text')
      .attr('class', 'label-text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 5)
      .attr('x', 0 - (this.chartHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Spent');

    this.xAxisEl.selectAll('text')
    .attr('y', 0)
    .attr('x', 9)
    .attr('dy', '.35em')
    .attr('transform', 'rotate(90)')
    .style('text-anchor', 'start');
  }

  buildGrid() {
    this.xGridAxis = d3.axisBottom(this.xScale)
      .tickPadding(10)
      .tickSize(this.chartHeight)
      .tickFormat('');

    this.xGrid = this.plotG
      .append('g')
      .attr('class', 'x grid')
      .call(this.xGridAxis);

    this.yGridAxis = d3.axisLeft(this.yScale)
      .tickPadding(10)
      .tickSize(-this.chartWidth)
      .tickFormat('');

    this.yGrid = this.plotG
      .append('g')
      .attr('class', 'y grid')
      .call(this.yGridAxis);
  }

  buildZoom() {
    this.zoom = d3.zoom()
      .extent([[0,0], [this.chartWidth, this.chartHeight]])
      .translateExtent([[0, 0], [this.chartWidth, this.chartHeight]])
      .scaleExtent([1, Infinity])
      .on('zoom', bind(this, this.zoomFunc));
    this.plotG.call(this.zoom);
  }

  zoomFunc() {
    const x = d3.event.transform.rescaleX(this.xScale);
    const y = d3.event.transform.rescaleY(this.yScale);

    this.xAxisEl.call(this.xAxis.scale(x));
    this.yAxisEl.call(this.yAxis.scale(y));

    this.xGrid.call(this.xGridAxis.scale(x));
    this.yGrid.call(this.yGridAxis.scale(y));

    this.xAxisEl.selectAll('text')
      .attr('y', 0)
      .attr('x', 9)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(90)')
      .style('text-anchor', 'start');

    this.clearData();
    this.plotData(x, y, false);
    this.plotTarget(x, y);
  }

  clearData() {
    this.drawingCanvas.selectAll('*').remove();
  }

  plotTarget(xScale, yScale) {
    const dateMin = moment(this.get('config.firstDayOfPeriod'), 'YYYY-MM-DD').toDate();
    const dateMax = moment(this.get('config.lastDayOfPeriod'), 'YYYY-MM-DD').toDate();

    this.drawingCanvas.append('line')
      .attr('class', 'today-line data')
      .attr('x1', xScale(moment().startOf('day').toDate()))
      .attr('x2', xScale(moment().startOf('day').toDate()))
      .attr('y1', this.chartHeight)
      .attr('y2', 0)

    this.drawingCanvas.append('line')
      .attr('class', 'target-line data')
      .attr('x1', xScale(dateMin))
      .attr('x2', xScale(dateMax))
      .attr('y1', yScale(this.totalStartingBalance))
      .attr('y2', yScale(this.totalBudget));
  }

  plotData(xScale, yScale, firstDraw) {
    const area = d3.area()
      .x(d => xScale(d.date))
      .y0(yScale(0))
      .y1(d => yScale(d.total));

    const areaData = area(this.data);

    const areaPath = this.drawingCanvas.append('path')
      .attr('class', 'data-area data')
      .attr('d', areaData)
      .style('fill-opacity', 0);

    const circles = this.drawingCanvas.selectAll('circle');
    const tipDiv = this.tipDiv;

    circles
      .data(this.data)
      .enter()
      .append('circle')
      .attr('class', 'data-circles data')
      .attr('class', d => {
        const arr = ['data-circles', 'data'];
        
        if (d.dateStr === moment().format('MM-DD-YYYY')) {
          arr.push('today');
        }

        return arr.join(' ');
      })
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.total))
      .on('mouseenter', function (d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 10);

        tipDiv
          .style('display', 'block')
          .transition()
          .duration(200)
            .style('opacity', 0.9);
        tipDiv.html(d.transactionsReport)
          .style('left', `${d3.event.pageX + 15}px`)
          .style('top', `${d3.event.pageY}px`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 3);
        tipDiv.transition()
          .duration(500)
            .style('opacity', 0);
      });

    if (firstDraw) {
      areaPath.style('fill-opacity', 0)
        .transition()
          .duration(800)
            .style('fill-opacity', 0.5)
            .transition()
            .duration(400)
              .style('fill-opacity', 0.3);

      this.drawingCanvas.selectAll('circle')
        .attr('r', 0)
        .style('fill-opacity', 0.5)
          .transition()
            .duration(200)
              .attr('r', 3)
              .style('fill-opacity', 0.5)
              .transition()
                .duration(100)
                  .attr('r', 3)
                  .style('fill-opacity', 0.3);
    } else {
      areaPath.style('fill-opacity', 0.3);
      this.drawingCanvas.selectAll('circle').attr('r', 3).style('fill-opacity', 0.3);
    }
  }
}
