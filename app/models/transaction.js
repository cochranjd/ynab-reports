import EmberObject, { get } from '@ember/object';
import { computed } from '@ember-decorators/object';
import moment from 'moment';

export default class Transaction extends EmberObject {
  @computed('amount')
  get debitValue() {
    return this.amount * -1;
  }

  @computed('debitValue')
  get amountInCents() {
    return Math.floor(this.debitValue / 10);
  }

  @computed('date')
  get dateNative() {
    if (!this.date) {
      return null;
    }

    return moment(this.date).toDate();
  }
}
