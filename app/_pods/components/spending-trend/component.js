import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';
import { classNames } from '@ember-decorators/component';
import { next } from '@ember/runloop';
import CurrencyFormat from 'reports/helpers/currency-format';
import moment from 'moment';
import d3 from 'd3';
import dc from 'dc';

@classNames('col-12', 'mt-5', 'spending-trend')
export default class SpendingTrend extends Component {
  @service dataState;

  constructor(...args) {
    super(...args);
  }

  didInsertElement() {
    next(this, () => {
      this.buildChart();
    });
  }

  buildChart() {
    const cf = this.dataState.get('transactionsCrossfilter');
    const dim = cf.dimension(d => moment(d.date).startOf('day').toDate());
    const group = dim.group().reduceSum(d => d.amount);

    const maxDate = moment();
    const minDate = maxDate.clone().startOf('month').subtract(6, 'months');

    const width = this.$().width();
    const height = this.$().height();

    const chart = dc.lineChart(this.$()[0]);

    chart.width(width)
      .height(height)
      .margins({ top: 10, right: 0, bottom: 20, left: 120 })
      .x(d3.scaleTime().domain([minDate, maxDate]))
      .renderHorizontalGridLines(true)
      .renderVerticalGridLines(true)
      .brushOn(true)
      .curve(d3.curveLinear)
      .renderDataPoints(true)
      .clipPadding(10)
      .yAxisPadding('10%')
      .elasticY(true)
      .dimension(dim)
      .group({
        all: () => {
          let cumulate = 0;
          const vals = group.all().map(d => {
            cumulate += d.value;

            return {
              key: d.key,
              value: cumulate
            }
          });
          return vals;
        }
      })
      .keyAccessor(d => d.key)
      .valueAccessor(d => d.value);

    chart.yAxis().tickFormat(v => {
      return CurrencyFormat(v);
    }).ticks(4);
    chart.render();
    this.set('chart', chart);
  }

  @action
  reset() {
    this.chart.filterAll();
    dc.redrawAll();
  }
}
