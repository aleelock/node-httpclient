node-httpclient
--------------------------

An easy way to call http server.

### 1. install

```bash
npm i node-httpclient --save
```
### 2. jquery ajax style

```js
var $ = require('node-httpclient');

$.ajax({
  url: 'http://www.yourdomain.com/api',
  type: 'GET',
  success: function(data, status){
    console.log(data, status);
  }
});

//or like this
$.ajax('http://www.yourdomain.com/api', {
  type: 'GET',
  success: function(data, status){
    console.log(data, status);
  }
});
```

### 3. 快捷方法

```js
$.get('http://www.yourdomain.com/api', function(data, status){
  console.log(data);
});

$.post('http://www.yourdomain.com/api', {name:'123'}, function(data, status){
  console.log(data);
});

$.put('http://www.yourdomain.com/api',{name:'123'}, function(data, status){
  console.log(data);
});

$.delete('http://www.yourdomain.com/api', function(data, status){
  console.log(data);
});
```

### 4.promise 风格

```js
var promise = $.get('http://www.yourdomain.com/api');
promise.then(function success(result){
  console.log(result);
}, function error(result){
  console.log(result);
});


var promise = $.get('http://www.yourdomain.com/api',{name:'123'});
promise.success(function success(result){
  console.log(result);
}).error(function(result){
  console.log(result);
});

```

### 5. $.ajax参数详解

#### (1) $.ajax 参数
| 参数 | 类型 | 描述 |
| --- | --- | --- |
| url | string | 请求的URL，可选 |
| settings | object | 请求的设置, 可选 |

#### (2) settings选项(所有都可选)
| 参数 | 类型 | 描述(所有都可选) |
| --- | --- | --- |
| url | string | 请求的URL |
| method | string | 请求的http方法, 默认:"GET", 范围: "GET","POST","PUT","DELETE","HEAD"等。 |
| type | string | method的别名 |
| contentType | string | 请求的类型, POST的contentType默认为：application/x-www-form-urlencoded， 而PUT的默认为application/json, 也可以通过headers['content-type']来设置 |
| dataType | string | 预期服务器返回的数据类型。如果不指定，将自动根据content-type信息来智能判断。默认null, 范围:['json'] |
| data | string | object | 发送到服务器的数据。将自动转换为请求字符串格式。GET 请求中将附加在 URL 后。查看 processData 选项说明以禁止此自动转换。必须为 Key/Value 格式。如果为数组，将自动为不同值对应同一个名称。如 {foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"。 |
| timeout | string | 请求失效时间(毫秒),default: 100000 |
| headers | object | 请求头键值对 |
| success | function(data, status,headers) | 请求成功时调用此函数 |
| error | function(err, status,headers) | 请求失败时调用此函数 |
| complete | function(data, status,headers) | 请求完成后回调函数 (请求成功或失败之后均调用)。 |

#### (3) $.ajax 返回 promise, 见 [node-promise](https://github.com/kriszyp/node-promise)

```js
//$.get, $.post, $.put,$.delete, $.head 等都返回promise。

promise.then(function success(result){
  console.log(result);
}, function error(result){
  console.log(result);
});

//or like this
promise.success(function(result){
  console.log(result);
}).error(function(result){
  console.log(result);
});
```
promise方法中的 result 参数选项：

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| result.data | string or object | 返回的数据, 如果是json类型，自动转成json |
| result.status | int | 返回的statusCode, 如:200 |
| result.headers | object | 返回头对象 |

### 6. Todo

* 二进制的支持
