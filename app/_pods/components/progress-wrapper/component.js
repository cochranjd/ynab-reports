import Component from '@ember/component';
import { classNames } from '@ember-decorators/component';
import { bind } from '@ember/runloop';
import d3 from 'd3';

@classNames('progress-wrapper')
export default class ProgressWrapper extends Component {
  constructor(...args) {
    super(...args);

    this.resizeListener = bind(this, this.resizeListener);
  }

  didInsertElement() {
    const tipDiv = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

    this.set('tipDiv', tipDiv);

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
