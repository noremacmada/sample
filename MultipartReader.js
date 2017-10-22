module.exports = class MultipartReader{
      //https://stackoverflow.com/questions/12066640/parsing-a-formdata-object-with-javascript
      /*
     * MultiPart_parse decodes a multipart/form-data encoded response into a named-part-map.
     * The response can be a string or raw bytes.
     *
     * Usage for string response:
     *      var map = MultiPart_parse(xhr.responseText, xhr.getResponseHeader('Content-Type'));
     *
     * Usage for raw bytes:
     *      xhr.open(..);
     *      xhr.responseType = "arraybuffer";
     *      ...
     *      var map = MultiPart_parse(xhr.response, xhr.getResponseHeader('Content-Type'));
     *
     * TODO: Can we use https://github.com/felixge/node-formidable
     * See http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
     * See http://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
     *
     * Copyright@ 2013-2014 Wolfgang Kuehn, released under the MIT license.
    */
    constructor(){}
    parse(body, contentType) {
        // Examples for content types:
        //      multipart/form-data; boundary="----7dd322351017c"; ...
        //      multipart/form-data; boundary=----7dd322351017c; ...
        var arrContentType = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        if ( !arrContentType) {
            throw new Error('Bad content-type header, no multipart boundary');
        }
        var boundary = arrContentType[1] || arrContentType[2];

        var strBody =typeof(body) !== 'string'
          ? String.fromCharCode.apply(null, new Uint8Array(body))
          : body
        ;

        var objParams = {};
        var arrBody = strBody.split('\r\n');

        for(var i = 0; i < arrBody.length - 2;){
          if(arrBody[i].indexOf(boundary) != 1){
            i++;
          }
          var contentDisposition = arrBody[i].replace('Content-Disposition: form-data;','')
          var arrContentDisposition = contentDisposition.split(';')
          while(arrContentDisposition.length > 1){
            var j = arrContentDisposition[0].split('=')[0].trim() != "name" ? 0 : 1;
            var arrParam = arrContentDisposition[j].split('=');
            objParams[arrParam[0].trim()] = arrParam[1];
            arrContentDisposition.splice(j, 1);
          }
          var name = arrContentDisposition[0].split('=')[1].trim();
          i++;

          var val = "";
          for(var isBreakFound = false; arrBody[i].indexOf(boundary) == -1 && i < arrBody.length; i++)
          {
            if(arrBody[i].indexOf('Content-Type') != -1){
              i++;
            }
            if(!isBreakFound && arrBody[i] == ""){
              isBreakFound = true;
              i++;
            }
            val += arrBody[i] + '\r\n'
          }
          objParams[name] = val;
        }

        return objParams;
    }
}
