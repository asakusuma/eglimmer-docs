import Ember from 'ember';

export default Ember.Route.extend({
  docs: Ember.inject.service(),
  model() {
    const docs = this.get('docs');
    return docs.fetchRoot();
  }
});
