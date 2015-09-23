
var should = require('should');
var httpclient = require('../index');
var path = require('path');

var PORT = '8800';
var HOST = 'http://localhost:'+PORT;


describe('httpclient', function(){
  this.timeout(5000);

  before(function(done){
    //start server
    var exec = require('child_process').exec;
    var f = path.join(__dirname,'server.js');
    exec('PORT='+PORT+' node '+ f,function(err, stout, sterr){
      done();
    });
  });

  describe('request()', function(){

    it('should request success with args:(url,opt)', function(done){
      httpclient.request(HOST+'/users', {
        success: function(result, status){
           result.should.have.property('data');
           status.should.be.exactly(200);
           done();
        }
      });
    });

    it('should request success with args:(opt)', function(done){
      httpclient.request({
        url: HOST+'/users',
        method: 'POST',
        success: function(result, status){
           result.should.have.properties({
             code: 0, message: 'OK'
           });
           status.should.be.exactly(201);
           done();
        }
      });
    });

    it('should request success with parameters', function(done){
      httpclient.request(HOST+'/users?name=aleelock', {
        success: function(result, status){
          result.should.have.property('data');
          result.data.length.should.be.exactly(1);
          result.data[0].should.equal('aleelock');
          status.should.be.exactly(200);
          done();
        }
      });
    });

    it('should request success with data', function(done){
      httpclient.request(HOST+'/users', {
        data: {name:'aleelock'},
        success: function(result, status){
           result.should.have.property('data');
           result.data.length.should.be.exactly(1);
           result.data[0].should.equal('aleelock');
           status.should.be.exactly(200);
           done();
        }
      });
    });

    it('should request failed with timeout option', function(done){
      httpclient.request({
        url: HOST+'/users?timeout=2000',
        method: 'GET',
        timeout: 500,

        error: function(err, status){
           err.indexOf('timeout').should.be.above(-1);
           status.should.be.exactly(502);
           done();
        }
      });
    });


    it('should call complete function no matter request succeed or failed', function(done){
      httpclient.request({
        url: HOST+'/not_found',
        method: 'GET',
        complete: function(result, status){
           result.should.have.property('code','NotFound');
           status.should.be.exactly(404);
           done();
        }
      });
    });


    it('should put data success', function(done){
      httpclient.request(HOST+'/users/1',{
        data: {
          name: 'abc'
        },
        headers: {
          'content-type':'application/json'
        },
        method: 'PUT',
        complete: function(result, status){

           result.should.have.properties({code:0,message:'OK',name:'abc'});
           status.should.be.exactly(200);
           done();
        }
      });
    });


    it('should delete data success', function(done){
      httpclient.request(HOST+'/users/1',{
        method: 'DELETE',
        success: function(result, status){
           status.should.be.exactly(204);
           done();
        }
      });
    });

  });


  describe('get()', function(){

    it('should get data success', function(done){
      httpclient.get(HOST+'/users', function(result, status, headers){
         result.should.have.property('data');
         status.should.be.exactly(200);
         headers.should.have.property('content-type');
         done();
      });
    });

    it('should get data success with parameter: {name:"aleelock"}', function(done){
      httpclient.get(HOST+'/users', {name:'aleelock'}, function(result, status){
        result.should.have.property('data');
        result.data.length.should.be.exactly(1);
        result.data[0].should.equal('aleelock');
        status.should.be.exactly(200);
         done();
      });
    });


    it('should get data success with parameter: "?name=aleelock"', function(done){
      httpclient.get(HOST+'/users?name=aleelock', null, function(result, status){
        result.should.have.property('data');
        result.data.length.should.be.exactly(1);
        result.data[0].should.equal('aleelock');
        status.should.be.exactly(200);
         done();
      });
    });

    it('should get data error with promise.error when api not found', function(done){
      var p = httpclient.get(HOST+'/not_found');

      p.error(function(result){
         result.status.should.be.exactly(404);
         result.data.should.have.properties({
           code:"NotFound", message:'not found'
         })
         done();
      });
    });
    it('should get data error with promise.fail when api not found', function(done){
      var p = httpclient.get(HOST+'/not_found');

      p.fail(function(result){
         result.status.should.be.exactly(404);
         result.data.should.have.properties({
           code:"NotFound", message:'not found'
         })
         done();
      });
    });


    it('should get data success with promise.success', function(done){
      var p = httpclient.get(HOST+'/users');

      p.success(function(result){
        result.data.should.have.property('data');
        result.status.should.be.exactly(200);
         done();
      });
    });


    it('should get data success with promise.done', function(done){
      var p = httpclient.get(HOST+'/users');

      p.done(function(result){
        result.data.should.have.property('data');
        result.status.should.be.exactly(200);
         done();
      });
    });


  });


  describe('post()', function(){

    it('should post data success', function(done){
      httpclient.post(HOST+'/users', {}, function(result, status){
        result.should.have.properties({
          code: 0, message: 'OK'
        });
        status.should.be.exactly(201);
        done();
      },'json');
    });

    it('should post data success with promise.success', function(done){
      var p = httpclient.post(HOST+'/users',{});

      p.success(function(result){
        result.data.should.have.properties({
          code: 0, message: 'OK'
        });
        result.status.should.be.exactly(201);
        done();
      });
    });

  });



  describe('put()', function(){

    it('should put data success', function(done){

      httpclient.put(HOST+'/users/1', {name:'xx1'}, function(result, status){

        result.should.have.properties({
          code: 0, message: 'OK',name:'xx1'
        });
        status.should.be.exactly(200);
        done();
      });
    });

    it('should put data success with promise.then', function(done){

      var p = httpclient.put(HOST+'/users/1',{name:'xx2'});

      p.then(function(result){
        result.data.should.have.properties({
          code: 0, message: 'OK',name:'xx2'
        });
        result.status.should.be.exactly(200);
        done();
      });

    });

  });




  describe('delete()', function(){

    it('should delete data success', function(done){

      httpclient.delete(HOST+'/users/1', {}, function(result, status){
        status.should.be.exactly(204);
        done();
      });
    });

    it('should post data success with promise.success', function(done){

      var p = httpclient.delete(HOST+'/users/1');
      p.success(function(result){
        result.status.should.be.exactly(204);
        done();
      });
    });

  });

  describe('head & options', function(){

    it('should head success', function(done){
      httpclient.ajax({
          url:HOST+'/users/1',
          success: function(result, status, headers){
            status.should.be.exactly(200);
            done();
          }
      });
    });

    it('should get options methods success with in promise style', function(done){

      var p = httpclient.ajax({url:HOST+'/users',type:'OPTIONS'});
      p.success(function(result){
        result.status.should.be.exactly(200);
        console.log(result)
        result.data.should.equal('GET,POST,OPTIONS');
        done();
      });
    });

  });


});
