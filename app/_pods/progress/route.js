import Route from '@ember/routing/route';

export default class ProgressRoute extends Route {
  activate() {
    const controller = this.controllerFor('progress');
    controller.loadData();
  }
}
