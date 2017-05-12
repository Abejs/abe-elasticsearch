'use strict'
var path = require('path')
var esconnection = require('../../modules/esconnection');

var route = function route(req, res, next, abe) {
  abe.abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var nbIndexed
  var es = new esconnection(abe)
  var manager = {}
  manager.home = {files: []}
  manager.config = JSON.stringify(abe.config)

  var isHome = true
  var jsonPath = null
  var linkPath = null
  var template = null
  var fileName = null
  var folderPath = null
  var EditorVariables = {
    nbIndexed: 0,
    user: res.user,
    slugs: abe.Manager.instance.getSlugs(),
    abeUrl: '/abe/editor/',
    Locales: abe.coreUtils.locales.instance.i18n,
    manager: manager,
    config: abe.config
  }

  const extension = '.' + abe.config.files.templates.extension
  let templates = abe.coreUtils.file.getFilesSync(abe.Manager.instance.pathTemplates, true, extension)

  // if(es.error !== null){
  //   //nbIndexed: resp.count,
  //   console.log(es.error)
  //   EditorVariables.error = "can't connect to the elasticsearch server"
  //   res.render(path.join(__dirname + '/../../partials/console.html'), EditorVariables)
  //   return
  // }

  if(req.query.reindex === "true"){
    let resetWaiting = templates.length;
    es.resetIndices(templates, extension, function(indices){
      resetWaiting--;
      if (resetWaiting==0) {
        let resetInit = templates.length;
        es.initIndices(templates, extension, function(resp){
          resetInit--;
          if (resetInit==0) {
            const files = abe.Manager.instance.getListWithStatusOnFolder('publish')
            Array.prototype.forEach.call(files, (fileObj) => {
              const revisionPath = path.join(abe.config.root, abe.config.data.url, fileObj.abe_meta.link.replace(`.${abe.config.files.templates.extension}`, '.json'))
              const link = fileObj.abe_meta.link
              const template = fileObj.abe_meta.template
              const content = abe.cmsData.file.get(revisionPath)
              const index = es.index + '_' + template
              if(es.isInIndices(template)){
                es.client.index({
                  index: index,
                  id: link,
                  type: template,
                  body: content
                })
              }
            })
          }
        })
      }
    })
  }

  let getWaiting = templates.length;
  es.getIndices(templates, extension, function(indices){
    getWaiting--;
    if (getWaiting==0) {
      try{
        es.client.count({index: indices.join()},function(err,resp,status) {
          if(resp)
            EditorVariables.nbIndexed = resp.count
          res.render(path.join(__dirname + '/../../partials/console.html'), EditorVariables)
        }.bind(this));
      } catch(e){
        console.error(e.stack)
      }
    } 
  }.bind(this))
  
}

exports.default = route
