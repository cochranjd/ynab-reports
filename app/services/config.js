import Service from '@ember/service';
import { computed } from '@ember-decorators/object';
import ENV from 'reports/config/environment';
import moment from 'moment';

export default class FetchService extends Service {
  constructor(...args) {
    super(...args);

    this.set('budgetMonth', ENV.YNAB_BUDGET_MONTH || moment().startOf('month').format('YYYY-MM-DD'));
  }

  @computed('budgetMonth')
  get firstDayOfPeriod() {
    return this.budgetMonth;
  }

  @computed('budgetMonth')
  get lastDayOfPeriod() {
    return moment(this.budgetMonth, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
  }

  @computed('budgetMonth')
  get budgetMonthName() {
    return moment(this.budgetMonth, 'YYYY-MM-DD').format('MMMM, YYYY');
  }

  @computed('budgetMonth')
  get previousBudgetMonthName() {
    return moment(this.budgetMonth, 'YYYY-MM-DD').subtract(1, 'month').format('MMMM, YYYY');
  }

  @computed('budgetMonth')
  get nextBudgetMonthName() {
    return moment(this.budgetMonth, 'YYYY-MM-DD').add(1, 'month').format('MMMM, YYYY');
  }

  @computed('budgetMonth')
  get previousBudgetMonth() {
    return moment(this.budgetMonth, 'YYYY-MM-DD').subtract(1, 'month').format('YYYY-MM-DD');
  }

  @computed('budgetMonth')
  get nextBudgetMonth() {
    return moment(this.budgetMonth, 'YYYY-MM-DD').add(1, 'month').format('YYYY-MM-DD');
  }

  @computed('')
  get categoryTag() {
    return ENV.YNAB_CATEGORY_TAG || '.*';
  }

  @computed('')
  get apiKey() {
    return ENV.YNAB_API_KEY;
  }

  @computed('')
  get budgetId() {
    return ENV.YNAB_BUDGET_ID;
  }

  @computed('categoryTag')
  get categoryTagRegex() {
    return new RegExp(this.categoryTag);
  }
}
