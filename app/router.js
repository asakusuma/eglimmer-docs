import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('project', { path: '/project/:project_id' }, function() {
    this.route('module', { path: 'module/:module_id' }, function() {});
  });
});

export default Router;
