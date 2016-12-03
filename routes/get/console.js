var path = require('path')
var esconnection = require('../../modules/esconnection');

var route = function route(req, res, next, abe) {
  abe.abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var nbIndexed
  var es = new esconnection(abe)

  if(req.query.reindex === "true"){
    var files = abe.Manager.instance.getListWithStatusOnFolder('publish')
    Array.prototype.forEach.call(files, (fileObj) => {

      const revisionPath = path.join(abe.config.root, abe.config.data.url, fileObj.abe_meta.link.replace(`.${abe.config.files.templates.extension}`, '.json'))
      const link = fileObj.abe_meta.link
      const template = fileObj.abe_meta.template
      const content = abe.cmsData.file.get(revisionPath)

      es.client.index({
        index: es.index,
        id: link,
        type: template,
        body: content
      })
    })
  }

  es.client.count({index: es.index},function(err,resp,status) {
    var htmlToSend = '';

    var data = path.join(__dirname + '/../../partials/console.html')
    var html = abe.coreUtils.file.getContent(data);

    var template = abe.Handlebars.compile(html, {noEscape: true})
    var tmp = template({
      express: {
        req: req,
        res: res
      },
      nbIndexed: resp.count
    })
    
    return res.send(tmp);
  });
}

exports.default = route
