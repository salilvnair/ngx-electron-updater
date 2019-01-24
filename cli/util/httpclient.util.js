let https = require('follow-redirects').https;
let http = require("follow-redirects").http;

function post(url,){
    var request = httpClient.get(url, (response) => {
        // if (encoding){
        //     response.setEncoding(encoding);
        // }
        var len = parseInt(response.headers['content-length'], 10);
        var cur = 0;
        var total = len / 1048576; //1048576 - bytes in  1Megabyte
    
        response.on("data", function(chunk) {
            cur += chunk.length;
            console.log("Downloading " + (100.0 * cur / len).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb " + "/" + total.toFixed(2) + " mb");
        });
    
        response.on("end", function() {
            //callback(body);
            console.log("Downloading complete");
        });
    
        request.on("error", function(e){
            console.log("Error: " + e.message);
        });
        response.pipe(outStream);
        });
}
