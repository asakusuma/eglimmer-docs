import Ember from 'ember';

const DATA = window.docs;

function materialize(obj) {
  return DATA.included.find((item) => item.id === obj.id && item.type === obj.type);
}

function inflateRelationship({ relationships }, key, recurse = false) {
  return relationships[key].data.map(materialize);
}

function toViewObject({ type, id, attributes, relationships }) {
  let viewObject = {
    type,
    id
  };

  for (let key in attributes) {
    viewObject[key] = attributes[key];
  }
  for (let key in relationships) {
    viewObject[key] = relationships[key].data;
  }

  return viewObject;
}

function inflate({id, type, attributes, relationships }, recurse = false) {
  let inflated = {};
  for (let key in relationships) {
    inflated[key] = {
      data: inflateRelationship(relationships, key)
    };
  }
  return {
    id,
    type,
    attributes,
    relationships: inflated
  };
}

function toMenuProject(menu) {
  let children = [];
  for (let key in menu) {
    if (Array.isArray(menu[key])) {
      const set = menu[key]
        .filter((obj) => !obj.attributes)
        .map(materialize)
        .map(toViewObject);
      children = children.concat(set);
    }
  }
  menu.children = children;
  return menu;
}

function generateMenu(root) {
  return inflateRelationship(root.data, 'docmodules').map(toViewObject).map(toMenuProject);
}

export default Ember.Service.extend({
  main: DATA,
  fetchRoot() {
    return {
      raw: this.main,
      menu: generateMenu(this.main)
    };
  },
  fetchModule(moduleId) {
    const record = this.main.included.find(({ id }) => id === moduleId);
    return toViewObject(record);
  },
  fetchProject(projectId) {
    return toViewObject(this.main.included.find(({ type, id }) => type === 'projectdoc' && id === projectId));
  }
});
