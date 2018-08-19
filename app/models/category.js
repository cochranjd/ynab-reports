import EmberObject from '@ember/object';
import { computed } from '@ember-decorators/object';

export default class Category extends EmberObject {
  @computed('starting_balance')
  get startingBalanceInCents() {
    return Math.floor(this.starting_balance / 10);
  }

  @computed('budgeted')
  get budgetInCents() {
    return Math.floor(this.budgeted / 10);
  }

  @computed('balance')
  get balanceInCents() {
    return Math.floor(this.balance / 10);
  }

  @computed('budgetedInCents', 'balanceInCents')
  get spentInCents() {
    return this.budgetInCents - this.balanceInCents;
  }
}
