import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { classNames } from '@ember-decorators/component';

@classNames('col-3')
export default class SideNav extends Component {
  @service dataState;
}
