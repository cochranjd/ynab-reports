import Component from '@ember/component';
import { bind } from '@ember/runloop';

export default class OverviewWrapper extends Component {
  constructor(...args) {
    super(...args);

    this.resizeListener = bind(this, this.resizeListener);
  }

  didInsertElement() {
    window.addEventListener('resize', this.resizeListener);
  }

  willDestroyElement() {
    window.removeEventListener('resize', this.resizeListener);
  }

  resizeListener() {
    const handler = this.get('onResize');
    if (typeof handler === 'function') {
      handler();
    }
  }
}
