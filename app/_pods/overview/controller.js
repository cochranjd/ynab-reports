import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { debounce } from '@ember/runloop';
import { timeout, task } from 'ember-concurrency';

export default class OverviewController extends Controller {
  @service dataState;

  constructor(...args) {
    super(...args);

    // Hack to cause the component to reload and rebuild for proper size
    this.rebuildingTask = task(function* () {
      yield timeout(1);
    });
  }

  @action
  onResize() {
    debounce(this, this.rebuild, 200);
  }

  rebuild() {
    this.get('rebuildingTask').perform();
  }
}
