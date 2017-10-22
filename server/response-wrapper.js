let fs = require("fs")

const supportedMimeTypes = {
  //http://www.iana.org/assignments/media-types/media-types.xhtml
  "html":"text/html",
  "js":"application/javascript",
  "css":"text/css",
  "json":"application/json",
  "png":"image/png",
  "ico":"image/x-icon",
  "xml":"application/xml",
  "zip":"application/zip",
  "bin":"application/octet-stream",
  "txt":"text/plain"
}

module.exports = class ResponseWrapper{
  constructor(response){
    this.response = response
    this.response.code = 200
    this.response.setHeader("Cache-Control","no-cache")
  }

  getExtension(path){
    return path.split('.').pop()
  }

  setContentType(extension){
    let mimeType = supportedMimeTypes[extension.split(".").pop()]
    if(mimeType == null){
      mimeType = supportedMimeTypes["txt"]
    }

    this.response.setHeader("Content-Type", mimeType)
  }

  setFileAttachmentHeaders(path){
    let fileName = path.split("/").pop();
    let thisResponse = this.response
    thisResponse.setHeader("Content-Length", "Content-Disposition: attachment; filename=" + fileName)
    let prmsGetSize = new Promise(
      (resolve, reject) => {
        fs.stat(
          file_path,
          (error, stat) => {
            if (error) { reject(error) }
            resolve(stat.size)
          }
        )
      }
    )

    prmsGetSize.then(
      size =>
        thisResponse.setHeader("Content-Length", size)
    )
  }

  streamBody(path){
    let readStream = fs.createReadStream(path)
    let thisResponse = this.response
    readStream.on("data", (chunk) => thisResponse.write(chunk))
    readStream.on("end", () => thisResponse.end())
  }

  error(code, body){
    this.response.statusCode = code
    if(body != null){
      this.response.write(body)
    }
    this.response.end()
  }

  redirect(url){
    this.response.statusCode = 302 //found
    this.response.setHeader("Location",url)
    this.response.end()
  }

  javascriptRedirect(url){
    this.dynamic(
      `{"location":"${url}"}`,
      ".json"
    )
  }

  file(path){
    this.setContentType(path)
    this.setFileAttachmentHeaders(path)
    this.streamBody(path)
  }

  static(path){
    this.setContentType(path)
    this.streamBody(path)
  }

  dynamic(body, extension){
    this.setContentType(extension != null ? extension : ".json")
    let typeOfBody = typeof(body)
    let content = typeOfBody == "string" ? body
      : typeOfBody == "object" ? JSON.stringify(body)
      : body.toString()

    this.response.write(content)
    this.response.end()
  }
}
