import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';
import { reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';
import { task} from 'ember-concurrency';
import Account from 'reports/models/account';
import Category from 'reports/models/category';

export default class ProgressController extends Controller {
  @service config;
  @service fetch;
  @service dataState;

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
      const budget = this.get('dataState.activeBudget');
      const activeCategories = [];
      this.get('dataState.categoryGroups').forEach(cg => {
        cg.categories.filter(c => c.__enabled).forEach(c => {
          activeCategories.push(c);
        });
      });

      const categories = yield this.fetch.get('xhrGet').perform(`/budgets/${budget.id}`).then((response) => {
        const prevMonthData = response.data.budget.months.findBy('month', this.get('config.previousBudgetMonth'));
        const monthData = response.data.budget.months.findBy('month', this.get('config.budgetMonth'));
      
        const activeCategoryIds = activeCategories.map(ac => ac.id);
        return monthData.categories.map(c => {
          if (!activeCategoryIds.includes(c.id)) {
            return null;
          }

          c.starting_balance = prevMonthData.categories.findBy('name', c.name).balance;
          return new Category(c);
        }).filter(c => c !== null);
      });

      const accounts = yield this.fetch.get('xhrGet').perform(`/budgets/${budget.id}/accounts`).then((response) => {
        return response.data.accounts.map(a => new Account(a));
      });

      const transactions = this.get('dataState.transactions');

      this.set('model', {
        categories,
        accounts,
        transactions
      });
    });

    this.get('dataState').on('categoryChange', () => {
      this.loadData();
    });
  }

  loadData() {
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

  @action
  onResize() {
    debounce(this, this.loadData, 200);
  }
}
