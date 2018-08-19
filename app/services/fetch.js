import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import fetch from 'fetch';
import { task } from 'ember-concurrency';

export default class FetchService extends Service {
  @service config;

  constructor() {
    super(...arguments);

    this.baseUrl = 'https://api.youneedabudget.com/v1';

    this.xhrGet = task(function *(url) {
      const response = yield fetch(`${this.baseUrl}/${url}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.get('config.apiKey')}`
        }
      });

      return yield response.json();
    });
  }
}
