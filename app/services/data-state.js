import Service from '@ember/service';
import Evented from '@ember/object/evented';
import { service } from '@ember-decorators/service';
import { set } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { bind } from '@ember/runloop';
import CurrencyFormat from 'reports/helpers/currency-format';
import crossfilter from 'crossfilter';
import dc from 'dc';

export default class DataStateService extends Service.extend(Evented) {
  @service fetch;
  @service localStore;

  constructor(...args) {
    super(...args);

    this.activeBudget = null;

    this.toggleCategory = bind(this, this.toggleCategory);
    this.saveActiveCategories = bind(this, this.saveActiveCategories);

    this.loadBudgetTask = task(function* () {
      const response = yield this.fetch.get('xhrGet').perform('/budgets');
      this.set('budgets', response.data.budgets);
     
      const activeBudgetId = this.localStore.getItem('activeBudget');
      if (activeBudgetId) {
        const activeBudget = response.data.budgets.findBy('id', activeBudgetId);
        if (activeBudget) {
          yield this.get('changeBudgetTask').perform(activeBudget);
        }
      }
    });

    this.changeBudgetTask = task(function* (budget) {
      yield timeout(1);

      this.set('activeBudget', budget);
      yield this.get('loadCategoryTask').perform(budget);
      yield this.get('loadPayeesTask').perform(budget);
      yield this.get('loadTransactionsTask').perform(budget);

      const cf = crossfilter(this.transactions);
      this.set('categoryFilter', cf.dimension(d => {
        const cat = this.categories.findBy('id', d.category_id);
        if (!cat) {
          return 'NONE';
        }

        return cat.name;
      }));
      this.set('transactionsCrossfilter', cf);
      this.get('localStore').setItem('activeBudget', budget.id);

      yield timeout(1);
      this.updateCategoryFilter();
    });

    this.loadCategoryTask = task(function* (budget) {
      const response = yield this.fetch.get('xhrGet').perform(`/budgets/${budget.id}/categories`);
      const categoryGroups = response.data.category_groups;
      const activeCats = this.localStore.getItem('activeCategories');
      this.set('categoryGroups', categoryGroups);

      if (!activeCats || activeCats.length === 0) {
        categoryGroups.forEach(cg => cg.categories.forEach(c => c.__enabled = true));
        this.saveActiveCategories();
      } else {
        categoryGroups.forEach(cg => {
          cg.categories.forEach(c => {
            c.__enabled = activeCats.includes(c.id);
          })
        });
      }

      const categories = [];
      categoryGroups.forEach(cg => {
        cg.categories.forEach(c => {
          categories.push({
            id: c.id,
            name: c.name
          });
        });
      });

      this.set('categories', categories);
    });

    this.loadPayeesTask = task(function* (budget) {
      const response = yield this.fetch.get('xhrGet').perform(`/budgets/${budget.id}/payees`);
      this.set('payees', response.data.payees);
    });

    this.loadTransactionsTask = task(function* (budget) {
      const response = yield this.fetch.get('xhrGet').perform(`/budgets/${budget.id}/transactions`);
      const ynabTransactions = response.data.transactions;
      const transactions = [];
      ynabTransactions.forEach(ynabTransaction => {
        if (/Transfer.*/.test(ynabTransaction.category_name)) {
          return;
        }

        if (ynabTransaction.subtransactions.length > 0) {
          ynabTransaction.subtransactions.forEach(t => {
            if (t.category_id) {
              transactions.push(this.mapTransaction(t));
            }
          });
        } else {
          if (ynabTransaction.category_id) {
            transactions.push(this.mapTransaction(ynabTransaction));
          }
        }
      });
      this.set('transactions', transactions);
    });
  }

  mapTransaction(t) {
    const cents = Math.floor(t.amount / 100);
    
    return {
      date: t.date,
      payee_id: t.payee_id,
      category_id: t.category_id,
      amount: cents,
      amountStr: CurrencyFormat(cents)
    };
  }

  saveActiveCategories() {
    const cats = [];

    this.categoryGroups.forEach(cg => {
      cg.categories.forEach(c => {
        cats.push(c);
      });
    });

    this.get('localStore').setItem('activeCategories', cats.filter(c => c.__enabled).map(c => c.id));
  }

  toggleCategory(category) {
    set(category, '__enabled', !category.__enabled);
    this.updateCategoryFilter();
  }

  updateCategoryFilter() {
    const cats = [];

    this.categoryGroups.forEach(cg => {
      cg.categories.forEach(c => {
        cats.push(c);
      });
    });

    this.categoryFilter.filter(d => {
      return cats.filter(c => c.__enabled).map(c => c.name).includes(d);
    });
    dc.redrawAll();
    this.saveActiveCategories();
    this.trigger('categoryChange');
  }
}
