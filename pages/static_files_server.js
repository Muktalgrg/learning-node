const http = require('http');
const fs = require('fs');

function handle_incoming_request(req, res){
    console.log(req.method+"--"+req.url);

    if(req.method.toLowerCase() === 'get' &&
         req.url.substring(0,9) === '/content/'){
         server_static_file(req.url.substring(9), res);//   
    }else{
        res.writeHead(404, {'Content-Type':'application/json'});
        let out = {error:'not_found',
                   message: "'"+req.url+"'not found."};
        res.end(JSON.stringify(out));
    }
}
function server_static_file(filename, res){
    console.log(filename);

    let rs = fs.createReadStream(filename);
    let ct = content_type_path(filename);

    res.writeHead(200, {'Content-Type':ct});
    rs.on('readable', ()=>{
        let d = rs.read();
        if(d){
            if(typeof d === 'string'){
                res.write(d);
            }else if(typeof d === 'object' && d instanceof Buffer){
                res.write(d.toString('utf8', 0, d.length));
            }
        }
    });

    rs.on('end', ()=>{
        res.end(); // we are done !!
    });

}
function content_type_path(path){
    return 'text/html';
}


const server = http.createServer(handle_incoming_request).listen(8080);