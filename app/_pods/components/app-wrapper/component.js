import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import CurrencyFormat from 'reports/helpers/currency-format';
import moment from 'moment';
import dc from 'dc';
import crossfilter from 'crossfilter';
import d3 from 'd3';

export default class AppWrapper extends Component {
  @service config;

  didInsertElement() {
    const tipDiv = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

    this.set('tipDiv', tipDiv);
  }
}
