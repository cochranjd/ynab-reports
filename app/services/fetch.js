import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import fetch from 'fetch';
import { task } from 'ember-concurrency';

export default class FetchService extends Service {
  @service config;

  constructor() {
    super(...arguments);

    this.base = `https://api.youneedabudget.com/v1/budgets/${this.get('config.budgetId')}`;

    this.getTask = task(function *(url, params) {
      const urlWithParams = url + this.processParams(params);
      const response = yield fetch(`${this.base}/${urlWithParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.get('config.apiKey')}`
        }
      });
      return yield response.json();
    });
  }

  processParams(params) {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const paramString = Object.keys(params).map(paramKey => {
      return `${paramKey}=${params[paramKey]}`;
    }).join('&');

    return `?${paramString}`;
  }

  getRequest(url, params) {
    return this.get('getTask').perform(url, params);
  }
}
