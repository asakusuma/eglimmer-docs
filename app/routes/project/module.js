import Ember from 'ember';

export default Ember.Route.extend({
  docs: Ember.inject.service(),
  model({ module_id }) {
    const hio = this.router.targetState.routerJs.activeTransition.handlerInfos;
    const project_id = hio[1].params.project_id;
    const docs = this.get('docs');
    return {
      project: docs.fetchProject(project_id),
      module: docs.fetchModule(module_id, project_id)
    };
  }
});
