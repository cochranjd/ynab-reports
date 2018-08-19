import Component from '@ember/component';
import { classNames } from '@ember-decorators/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import dc from 'dc';

@classNames('col-12', 'mt-5')
export default class DebitCredit extends Component {
  @service dataState;

  constructor(...args) {
    super(...args);

    this.options = [{
      label: 'Debits & Credits',
      func: () => true
    }, {
      label: 'Credits',
      func: (d) => d === 'credit'
    }, {
      label: 'Debits',
      func: (d) => d === 'debit'
    }];

    this.activeOption = this.options[0];
    const cf = this.dataState.get('transactionsCrossfilter');
    this.dim = cf.dimension(d => {
      return d.amount > 0 ? 'credit' : 'debit';
    });
  }

  @action
  changeOption(val) {
    this.set('activeOption', val);
    this.dim.filter(val.func);
    dc.redrawAll();
  }
}
