var http = require('http');
var https = require('https');
var defer = require('node-promise').defer;
var parseURL = require('url').parse;
var querystring = require('querystring');

module.exports = {
  request: request,
  ajax: request,
  get: function(url, opt, fn, dataType){
    return reqWithMethod('GET', url, opt, fn, dataType);
  },
  post: function(url, opt, fn, dataType){
    return reqWithMethod('POST', url, opt, fn, dataType);
  },
  delete: function(url, opt, fn, dataType){
    return reqWithMethod('DELETE', url, opt,fn,dataType);
  },
  put: function(url, opt, fn, dataType){
    return reqWithMethod('PUT', url, opt, fn,dataType);
  },
  head: function(url, opt, fn){
    return reqWithMethod('HEAD', url, opt,fn);
  }
};

var defaultOpt = {
  // type: 'GET',
  // method: 'GET',
  url: '',
  dataType:null, //json or others
  //contentType: 'application/x-www-form-urlencoded',
  data: null,
  timeout: 100000,
  headers: {},
  success: function() {},
  error: function() {},
  complete: function() {}
};


function reqWithMethod(method, url, data, fn, dataType) {

  var opt= {};
  if (typeof(data) == 'function') {
    opt = {
      method: method,
      dataType: dataType,
      success: data
    }
  }
  else if (typeof(fn) == 'function') {

    opt = {
      method: method,
      data: data,
      dataType: dataType,
      success: fn
    }
  }
  else {
    opt = {
      method: method||'GET',
      url: url,
      dataType: dataType,
      data: data
    }
  }
  return request(url, opt);

}


function request(url, opt) {

  var deferred = defer();

  if (typeof(url) == 'string') {
    if(typeof(opt)=='undefined') opt = {};
    opt.url = url;
  } else if (typeof(url) == 'object' && typeof(opt) == 'undefined') {
    opt = url;
    url = null;
  } else {
    throw new Error('Please check the args');
  }


  opt = wrapDefault(opt, defaultOpt);
   
  //method
  var method = (opt.method||'GET').toUpperCase();
  opt.method = method;

  //headers, key tolowercase
  var hd = {};
  Object.keys(opt.headers).forEach(function(k) {
    hd[k] = opt.headers[k];
  });
  opt.headers = hd;

  var bodyString = null;
  if(method=='GET'||method=='HEAD'||method=='DELETE'){
    if(opt.data){
      var qstr = querystring.stringify(opt.data);

      if(opt.url.indexOf('?')!=-1){
        opt.url+='&'+qstr;
      }else{
        opt.url+='?'+qstr;
      }
    }
  }else if(method=='PUT' || method == 'POST'){

    var reqContentType = opt.contentType || opt.headers['content-type'];

    if(!reqContentType){
      reqContentType = opt.headers['content-type'] = (opt.method == "PUT" && typeof(opt.data) == 'object')
      ? 'application/json'
      : 'application/x-www-form-urlencoded';
    }

    if (reqContentType.indexOf('application/x-www-form-urlencoded') == 0 ){
      if(typeof(opt.data) == 'object'){
        bodyString = querystring.stringify(opt.data);
      }
      else{
        bodyString = opt.data + '';
      }
    }
    else{
      if(typeof(opt.data) == 'object'){
        bodyString = JSON.stringify(opt.data);
      }
      else{
        bodyString = opt.data+'';
      }

    }
    opt.headers['content-length']= Buffer.byteLength(bodyString);
  }


  var pathInfo = parseURL(opt.url);

  var client = http;
  if(pathInfo.protocol == 'https:'){
     pathInfo.rejectUnauthorized = false;
     client = https;
  }

  pathInfo.headers = opt.headers;
  pathInfo.method = opt.method;
  var aborted = false;
  var tid = null;

  var req = client.request(pathInfo, function(res) {

    var bf = new Buffer([]);
    var contentType = res.headers['content-type'];
    var status = res.statusCode;

    res.on('data', function(chunck) {
      bf = Buffer.concat([bf, chunck], bf.length + chunck.length);
    });

    res.on('end', function() {
      if(aborted)return;
      aborted = true;
      clearTimeout(tid);

      var result = decodeResult(contentType, opt.dataType, bf.toString());
      opt.complete(result, status,res.headers);
      if (status < 400) {
        //success
        opt.success(result, status,res.headers);
        deferred.resolve({data:result,status:status,headers: res.headers});

      } else {
        //error
        opt.error(result, status,res.headers);
        deferred.reject({data:result,error:result,status:status,headers: res.headers});
      }

    });

    res.on('error', function(err) { 
      if(aborted)return;
      aborted = true;

      err = decodeResult(contentType, opt.dataType, err);
      opt.complete(err, status,res.headers);

      //error
      opt.error(err, status,res.headers);
      deferred.reject({data:err,error:err,status:status,headers: res.headers});

      clearTimeout(tid);
    });

  });

  req.on('error', function(err){
     //error
     if(aborted)return;
      aborted = true;
      clearTimeout(tid);

      opt.complete(err, 500, {});

      opt.error(err, 500, {});
      deferred.reject({data:err,error:err,status:500,headers: {}});
  });

  if (opt.timeout) {
    tid = setTimeout(function() {
      aborted = true;

      var msg = 'timeout';

      opt.complete(msg, 502,{});

      //error
      opt.error(msg, 502,{});

      deferred.reject({data:msg,error:msg,status:502,headers:{}});
      req.abort();
    }, opt.timeout);
  }


  if (bodyString) {
    req.write(bodyString);
  }

  req.end();


  //extends promise,  add success,error stuff
  var keep_success=[];
  var keep_error = [];
  deferred.promise.done =
  deferred.promise.success = function(fn){
    keep_success.push(fn);
    return this;
  }
  deferred.promise.fail =
  deferred.promise.error = function(fn){
    keep_error.push(fn);
    return this;
  }

  deferred.promise.then(function success(){
    var arr = Array.prototype.slice.call(arguments,0);
    keep_success.forEach(function(n){
      n.apply(deferred.promise, arr);
    });
  }, function error(){
    var arr = Array.prototype.slice.call(arguments,0);
    keep_error.forEach(function(n){
      n.apply(deferred.promise, arr);
    });
  });


  return deferred.promise;
}

function wrapDefault(opt, defaultOpt) {
  opt = opt || {};
  for (var k in defaultOpt) {
    if (typeof(opt[k]) == 'undefined') {
      opt[k] = defaultOpt[k];
    }
  }

  opt.method = opt.method || opt.type;
  opt.content = opt.content || opt.data;

  return opt;
}

//dataType: json , others
function decodeResult(contentType, dataType, result) {
  if(dataType=='json'){
    try {
      result = JSON.parse(result);
      return result;
    } catch (e) {}
  }

  if (contentType && contentType.indexOf('application/json')==0) {
    try {
      result = JSON.parse(result);
    } catch (e) {}
  }
  //todo: xml result
  return result;
}
