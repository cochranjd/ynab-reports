import Controller from '@ember/controller';
import { reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';
import { hash } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import Account from 'reports/models/account';
import Transaction from 'reports/models/transaction';
import Category from 'reports/models/category';

export default class ApplicationController extends Controller {
  @service config;
  @service fetch;

  @reads('model.accounts') accounts;
  @reads('model.transactions') transactions;
  @reads('model.categories') categories;

  constructor(...args) {
    super(...args);

    this.nextMonthTask = task(function* () {
      this.set('loading', true);
      const config = this.get('config');
      config.set('budgetMonth', config.get('nextBudgetMonth'));

      yield this.get('loadMonthTask').perform();
      this.set('loading', false);
    });

    this.previousMonthTask = task(function* () {
      this.set('loading', true);
      const config = this.get('config');
      config.set('budgetMonth', config.get('previousBudgetMonth'));

      yield this.get('loadMonthTask').perform();
      this.set('loading', false);
    });

    this.loadMonthTask = task(function* () {
      const response = yield hash({
        categories: this.fetch.getRequest('').then((response) => {
          const prevMonthData = response.data.budget.months.findBy('month', this.get('config.previousBudgetMonth'));
          const monthData = response.data.budget.months.findBy('month', this.get('config.budgetMonth'));
         
          return monthData.categories.map(c => {
            if (c.deleted || !this.get('config.categoryTagRegex').test(c.name)) {
              return null;
            }

            c.starting_balance = prevMonthData.categories.findBy('name', c.name).balance;
            return new Category(c);
          }).filter(c => c !== null);
        }),
        accounts: this.fetch.getRequest('accounts').then((response) => {
          return response.data.accounts.map(a => new Account(a));
        }),
        transactions: this.fetch.getRequest('transactions', { since_date: this.get('config.firstDayOfPeriod') }).then((response) => {
          return response.data.transactions.map(t => {
            if (!this.get('config.categoryTagRegex').test(t.category_name)) {
              return null;
            }

            return new Transaction(t);
          }).filter(t => t !== null);
        }),
      });
     
      this.set('model', response);
    });

    this.set('loading', true);
    this.get('loadMonthTask').perform().then(() => this.set('loading', false));
  }

  @action
  nextMonth() {
    this.get('nextMonthTask').perform();
  }

  @action
  previousMonth() {
    this.get('previousMonthTask').perform();
  }
}
