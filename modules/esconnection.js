'use strict'
var path = require('path')
var elasticsearch = require('elasticsearch')

function esclient (abe) {
  var host = "localhost"
  var port = 9200
  this.index = path.basename(abe.config.root)
  this.error = null
  this._pathTemplate = abe.Manager.instance.pathTemplates
  this._extension = '.' + abe.config.files.templates.extension

  if(abe.config.elasticsearch){
    var elt = abe.config.elasticsearch
    host = (elt.hasOwnProperty("host"))?elt.host:host
    port = (elt.hasOwnProperty("port"))?elt.port:port
    this.index = (elt.hasOwnProperty("index"))?elt.index:this.index
  }

  this.client = new elasticsearch.Client({
    host: host + ':' + port,
    log: 'error'
  })

  this.indices = []
  // this.error = this.client.ping({
  //   requestTimeout: 3000,
  //   hello: "elasticsearch!"
  // }, function (error) {
  //   if (error) {
  //     console.trace('elasticsearch cluster is down!')
  //     return error
  //   }
  // })

  this.getIndices = function(templates, extension, callback){
    Array.prototype.forEach.call(templates, function(template) {
      template = path.basename(template, extension)
      const index = this.index + '_' + template
      this.client.indices.exists({ index: index, ignoreUnavailable: true }, function (err, exists) {
        if(exists === true){
          this.indices.push(index)
        }
        callback(this.indices)
      }.bind(this))
    }.bind(this))
  }
  
  this.initIndices = function(templates, extension, callback){
    Array.prototype.forEach.call(templates, (template) => {
      template = path.basename(template,extension)
      if(this.isInIndices(template)){
        this.client.indices.create({  
          index: this.index + '_' + template
        },function(err,resp,status) {
          callback(resp)
          if(err && err.statusCode !== 400) {
            console.log(err);
          } 
        })
      } else {
        callback(true)
      }
    })
  }

  this.resetIndices = function(templates, extension, callback){
    Array.prototype.forEach.call(templates, (template) => {
      template = path.basename(template,extension)
      const index = this.index + '_' + template
      this.client.indices.exists({ index : index, ignoreUnavailable: true }, function (err, exists) {
        if(exists === true){
          this.client.indices.delete({index: index});
        }
        callback(index)
      }.bind(this))
    })
  }

  this.isInIndices = function(template){
    if(abe.config.elasticsearch && abe.config.elasticsearch.active){
      if(abe.config.elasticsearch.templates){
        if(abe.config.elasticsearch.templates.indexOf(template) > -1) {
          return true
        }
      } else {
        return true
      }
    }

    return false
  }
}

module.exports = esclient;
