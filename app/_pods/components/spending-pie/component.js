import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';
import { classNames } from '@ember-decorators/component';
import { next } from '@ember/runloop';
import dc from 'dc';

@classNames('col-12', 'mt-5', 'spending-pie')
export default class SpendingPie extends Component {
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
    const categories = this.dataState.get('categories');

    const dim = cf.dimension(d => {
      const category = categories.findBy('id', d.category_id);
      if (!category) {
        return 'NONE';
      }

      return category.name;
    });

    // const group = dim.group().reduceCount();
    const group = dim.group().reduceSum(d => Math.abs(d.amount));//.order(p => Math.abs(p));

    const width = this.$().width();
    const height = this.$().height();

    const chart = dc.pieChart(this.$()[0]);

    chart.width(width)
      .height(height)
      .innerRadius(10)
      .dimension(dim)
      .group(group)
      .label(() => '')
      .legend(dc.legend())
      .turnOnControls(true);

    dc.override(chart, 'legendables', function () {
      const legendables = this._legendables();
      return legendables.filter(l => l.data > 0);
    });
    chart.render();
    this.set('chart', chart);
  }

  @action
  reset() {
    this.chart.filterAll();
    dc.redrawAll();
  }
}
