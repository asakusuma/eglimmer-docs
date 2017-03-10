import Ember from 'ember';

const DATA = window.docs;

function materialize(obj) {
  if (Object.keys(obj).length !== 2 || !obj.id || !obj.type) {
    return obj;
  }
  const found = DATA.included.find((item) => item.id === obj.id && item.type === obj.type);
  return found;
}

function inflateRelationship({ relationships }, key, recurse = false) {
  const v = relationships[key].data.map(materialize);
  return v;
}

function toViewObject(obj) {
  return _toViewObject(obj, false);
}

function toInflatedViewObject(obj) {
  return _toViewObject(obj, true);
}

function _toViewObject({ type, id, attributes, relationships }, recurse = false) {
  const identifier = {
    type,
    id
  };
  let viewObject = identifier;
  if (!attributes) {
    attributes = materialize(identifier).attributes;
  }

  for (let key in attributes) {
    viewObject[key] = attributes[key];
  }
  
  for (let key in relationships) {
    let relationship = relationships[key];
    viewObject[key] = recurse ? relationship.data.map(toInflatedViewObject) : relationship.data;
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
        .filter((obj) => {
          return obj.flags && obj.flags.isNormalized;
        })
        .map(toInflatedViewObject)
      children = children.concat(set);
    }
  }
  menu.children = children.sort((a, b) => a.name > b.name ? 1 : -1);
  return menu;
}

function generateMenu(root) {
  return inflateRelationship(root.data, 'docmodules').map(toInflatedViewObject).map(toMenuProject);
}

export default Ember.Service.extend({
  main: DATA,
  fetchRoot() {
    return {
      raw: this.main,
      menu: generateMenu(this.main)
    };
  },
  fetchModule(moduleId, projectId) {
    let record = this.main.included.find(({ id }) => id === moduleId);

    if (!record) {
      const realId = this.main.data.attributes.idMap[projectId][moduleId];
      record = this.main.included.find(({ id }) => id === realId);
    }
    const inflated = toInflatedViewObject(record);
    return inflated;
  },
  fetchProject(projectId) {
    return toViewObject(this.main.included.find(({ type, id }) => type === 'projectdoc' && id === projectId));
  }
});
