import EmberObject from '@ember/object';
import { computed } from '@ember-decorators/object';
import moment from 'moment';

export default class TransactionDay extends EmberObject {
  constructor(...args) {
    super(...args);

    this.set('transactions', []);
  }

  @computed('transactions')
  get total() {
    const val= this.transactions.map(t => -1 * t.amount).reduce((s, v) => s + v, 0);
    return val;
  }

  addTransaction(t) {
    this.transactions.pushObject(t);
  }

  getTransactions() {
    return this.transactions;
  }

  @computed('transactions')
  get transactionCount() {
    return this.transactions.length;
  }

  @computed('date')
  get dateNative() {
    return moment(this.date).toDate();
  }
}
