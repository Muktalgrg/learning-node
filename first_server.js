const http = require('http');

function process_request(req,res){
    console.log("server is running at port 8080");
    console.log("METHOD : "+req.method+"\nReqeust URL : "+req.url);
    
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: null, data:{}}));
    
}

const s = http.createServer(process_request).listen(8080);