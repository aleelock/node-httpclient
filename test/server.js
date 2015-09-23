var parseURL = require('url').parse;
var http = require('http');

http.createServer(function(req, res){
  var info = parseURL(req.url, true);
  if(info.pathname=='/users'){
     switch(req.method){
       case 'GET':
         var tout = parseInt(info.query.timeout||0);

         setTimeout(function(){
           if(info.query && info.query.name=='aleelock'){
             json(res, 200, {data:['aleelock']});
           }
           else{
             json(res, 200, {data:['aleelock','xxoo']});
           }

         }, tout);


       break;
       case 'POST':
         json(res, 201, {code:0,message:'OK'});
         break;
       case 'OPTIONS':
         plain(res, 200, "GET,POST,OPTIONS");
         break;
      default:
        json(res, 404, {code:'NotFound',message:'not found'});
        break;

     }
  }
  else if(info.pathname=='/users/1'){
    switch(req.method){
      case 'HEAD':
          plain(res, 200);
          break;
      case 'GET':
        json(res, 200, {name:'aleelock', id:1});
        break;
      case 'PUT':
        var bf = new Buffer([]);
        req.on('data', function(ch){
          bf=Buffer.concat([bf,ch],bf.length+ch.length);
        });
        req.on('end', function(){
          var obj = JSON.parse(bf.toString());
          json(res, 200, {code:0,message:'OK',name: obj.name});
        });
        break;

      case 'DELETE':
        json(res, 204);
        break;
      default:
        json(res, 404, {code:'NotFound',message:'not found'});
        break;
    }
  }
  else{
    json(res, 404, {code:'NotFound',message:'not found'});
  }
}).listen(8800);

function plain(res, status, data){
    res.writeHead(status,{'content-type': 'text/plain;charset=utf-8'});
    if(data) res.write(data);
    res.end();
}
function json(res, status, data){
  res.writeHead(status,{'content-type': 'application/json'});
  if(data) res.write(JSON.stringify(data));
  res.end();
}

console.log('server listen on 8800');
