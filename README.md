# abe-elasticsearch
Add search feature on your Abe frontend with Elasticsearch

##Introduction
This plugin will index all you published content to Elasticsearch so that you can add a search feature to your static frontend !

## Configuration
You'll have to install Elasticsearch and configure its parameters in your abe.json file.

Note: If you want to request Elasticsearch from the client, configure your config/elasticsearch.yml configuration file with:

```
http.cors.enabled : true
 
http.cors.allow-origin : "*"
http.cors.allow-methods : OPTIONS, HEAD, GET, POST, PUT, DELETE
http.cors.allow-headers : X-Requested-With,X-Auth-Token,Content-Type, Content-Length

```

## How it works

### On your Abe CMS
Every time you publish a content, abe-elasticsearch will publish the whole document to Elasticsearch.
Every time you unpublish a content, abe-elasticsearch will delete this content from Elasticsearch.

### On your client
We provide 3 templates as examples:
- One auto-complete template based on jquery
- One auto-complete template based on react
- One auto-complete template based on angular
