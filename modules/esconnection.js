var path = require('path')
var elasticsearch = require('elasticsearch')

function esclient (abe) {
  let host = "localhost"
  let port = 9200
  this.index = path.basename(abe.config.root)

  if(abe.config.elasticsearch){
    var elt = abe.config.elasticsearch
    host = (elt.hasOwnProperty("host"))?elt.host:host
    port = (elt.hasOwnProperty("port"))?elt.port:port
    this.index = (elt.hasOwnProperty("index"))?elt.index:this.index
  }

  this.client = new elasticsearch.Client({
    host: host+':'+port,
    log: 'error'
  })

  this.client.indices.create({  
    index: this.index
  },function(err,resp,status) {
    if(err && err.statusCode !== 400) {
      console.log(err);
    } 
  });
}

module.exports = esclient;