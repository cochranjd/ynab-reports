import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';
import { classNames } from '@ember-decorators/component';
import { next } from '@ember/runloop';
import moment from 'moment';
import d3 from 'd3';
import dc from 'dc';

@classNames('col-12', 'mt-5', 'spending-table')
export default class SpendingTable extends Component {
  @service dataState;

  didInsertElement() {
    next(this, () => {
      this.buildChart();
    });
  }

  buildChart() {
    const cf = this.dataState.get('transactionsCrossfilter');

    const dim = cf.dimension(d => d.id);

    const width = this.$().width();
    const height = this.$().height();

    const chart = dc.dataTable(this.$('.table')[0]);
    const payees = this.dataState.get('payees');

    chart.width(width)
      .height(height)
      .dimension(dim)
      .size(Infinity)
      .group(g => g.id)
      .columns([
        { label: 'Date', format: d => moment(d.date).format('MM/DD/YYYY') },
        { label: 'Payee', format: d => {
          const payee = payees.findBy('id', d.payee_id);
          if (!payee) {
            return '';
          }

          return payee.name;
        }},
        { label: 'Amount', format: d => d.amountStr }
      ])
      .order(d3.descending)
      .sortBy(d => d.date)
      .on('renderlet', function (table) {
        table.selectAll('.dc-table-label').style('display', 'none');
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
