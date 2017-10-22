const fs = require("fs")
const http = require('http')
const url = require("url")
const querystring = require("querystring")
const MultipartReader = require('./MultipartReader.js')

let getPrmsGetDebugHtml = () => {return new Promise
(
  (resolve, reject) => {
    fs.readFile(
      'debug.html',
      "utf-8",
      (err, data) => {
        if (err){
          reject(err)
        }
        else{
          resolve(data)
        }
      }
    )
  }
)}

http.createServer( (req, res) =>
{
  new Promise((resolve, reject)=>{
    let data = ''
    if(req.method == "GET"){
      data = url.parse(req.url).query
      resolve(data)
    }
    else{
      let data = ""
      req.addListener("data", (chunk) => {
        data += chunk
      })
      req.addListener("end", () => {
        resolve(data)
      })
    }
  })
  .then((data) => {
    //"application/x-www-form-urlencoded; charset=UTF-8"
    //"multipart/form-data; boundary=----WebKitFormBoundaryuJdCq5iwntqL9QBM"
    let params = {}
    if((req.headers['content-type'] || '').indexOf('multipart/form-data;') != -1){
      params = new MultipartReader().parse(data, req.headers['content-type'])
    }
    else{
      params = querystring.parse(data)
    }
    req.path = url.parse(req.url)
    req.data = data
    getPrmsGetDebugHtml().then((data) => {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    })
  })
  .catch(()=> res.end('catch'))
}).listen(3000);
console.log('Listening on port 3000')
