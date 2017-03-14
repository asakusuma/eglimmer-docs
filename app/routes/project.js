import Ember from 'ember';

export default Ember.Route.extend({
  docs: Ember.inject.service(),
  model({ project_id }) {
    const docs = this.get('docs');
    const project = docs.fetchProject(project_id);
    return project;
  }
});
