import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class ApplicationController extends Controller {
  @service dataState;

  @action
  budgetChanged(budget) {
    this.dataState.get('changeBudgetTask').perform(budget);
  }
}
