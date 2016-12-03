'use strict'
var path = require('path');
var esconnection = require('../modules/esconnection');

var hooks = {
  afterPublish: function (result, postPath, abe) {
    if(abe.config.elasticsearch && abe.config.elasticsearch.active){
      var es = new esconnection(abe)
      const revisionPath = path.join(abe.config.root, abe.config.data.url, result.abe_meta.publish.abeUrl.replace(`.${abe.config.files.templates.extension}`, '.json'))
      const link = result.abe_meta.link
      const template = result.abe_meta.template
      const content = abe.cmsData.file.get(revisionPath)

      es.client.index({
        index: es.index,
        id: link,
        type: template,
        body: content
      });
    }

    return result;
  },
  afterUnpublish: function (path, json, abe) {
    if(abe.config.elasticsearch && abe.config.elasticsearch.active){
      var es = new esconnection(abe)
      const link = json.abe_meta.link
      const template = json.abe_meta.template

      es.client.delete({
        index: es.index,
        id: link,
        type: template
      });
    }

    return path;
  },
  afterDelete: function (path, json, abe) {
    if(abe.config.elasticsearch && abe.config.elasticsearch.active){
      var es = new esconnection(abe)
      es.client.delete({
        index: es.index,
        id: path
      });
    }

    return path;
  }
};

exports.default = hooks;
