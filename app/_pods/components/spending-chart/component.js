import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { classNames } from '@ember-decorators/component';
import { isArray } from '@ember/array';
import TransactionDay from 'reports/models/transaction-day';
import CurrencyFormat from 'reports/helpers/currency-format';
import moment from 'moment';
import { service } from '@ember-decorators/service';

@classNames('col-6', 'mt-2', 'mb-2')
export default class SpendingChart extends Component {
  @service config;
  @service dataState;

  @computed('category')
  get isList() {
    return isArray(this.category);
  }

  @computed('category', 'totalBudget')
  get spendPerDay() {
    const dateMin = moment(this.get('config.firstDayOfPeriod'), 'YYYY-MM-DD');
    const dateMax = moment(this.get('config.lastDayOfPeriod'), 'YYYY-MM-DD');

    const days = dateMax.diff(dateMin, 'days') + 1;
    return this.totalBudget / days;
  }

  @computed('category', 'spendPerDay')
  get title() {
    return this.category.name;
  }

  @computed('category')
  get catTransactions() {
    return this.transactions.filter(t => t.category_id === this.category.id);
  }

  @computed('catTransactions')
  get transactionsByDay() {
    const dayGroups = [];

    this.catTransactions.forEach(t => {
      const date = moment(t.date).format('MM-DD-YYYY');
      let group = dayGroups.findBy('date', date);
      if (!group) {
        group = new TransactionDay({ date });
        dayGroups.push(group);
      }

      group.addTransaction(t);
    });

    const startDay = this.get('config.firstDayOfPeriod');
    const lastDay = moment(this.get('config.lastDayOfPeriod'), 'YYYY-MM-DD').format('MM-DD-YYYY');

    let currentDay = moment(startDay, 'YYYY-MM-DD').format('MM-DD-YYYY');

    while (currentDay !== lastDay) {
      if (!dayGroups.findBy('date', currentDay)) {
        dayGroups.push(new TransactionDay({ date: currentDay }));
      }

      currentDay = moment(currentDay, 'MM-DD-YYYY').add(1, 'day').format('MM-DD-YYYY');
    }

    if (!dayGroups.findBy(lastDay)) {
      dayGroups.push(new TransactionDay({ date: lastDay }));
    }

    return dayGroups.sortBy('dateNative');
  }

  @computed('aCategory')
  get totalStartingBalance() {
    return this.category.get('startingBalanceInCents');
  }

  @computed('aCategory')
  get totalBudget() {
    return this.category.get('budgetInCents') + this.totalStartingBalance;
  }
  
  @computed('transactionsByDay')
  get runningDailyTotal() {
    let sum = 0;
    return this.transactionsByDay.map(byDay => {
      sum = sum + byDay.get('total');
      return {
        dateStr: byDay.get('date'),
        date: moment(byDay.get('date'), 'MM-DD-YYYY').toDate(),
        transactionsReport: this.buildReport(byDay.getTransactions(), sum, byDay.get('total')),
        total: sum
      }
    });
  }

  buildReport(transactions, sum, totalForDay) {
    const payees = this.get('dataState.payees');
    const parts = transactions.map(t => ({
      amount: -1 * t.amount,
      payee: ((payee_id) => {
        const payee = payees.findBy('id', payee_id);
        if (!payee) {
          return '--';
        }

        return payee.name;
      })(t.payee_id)
    })).map(t => `<p class="${t.amount < 0 ? 'credit' : 'debit'}">${CurrencyFormat(t.amount)} @ ${t.payee}</p>`);
    parts.unshift(`<h5>Daily Spending: ${CurrencyFormat(totalForDay)}</h5>`);
    parts.unshift(`<h3>Total: ${CurrencyFormat(sum)}</h3>`);
    return parts.join('');
  }
}
