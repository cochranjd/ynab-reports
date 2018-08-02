import Helper from '@ember/component/helper';
import CurrencyFormat from 'reports/helpers/currency-format';

export default Helper.extend({

  compute(params) {
    return CurrencyFormat(params);
  }
});
