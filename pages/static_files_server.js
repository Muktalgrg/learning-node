const http = require('http');
const fs = require('fs');
const path = require('path');//module that gives extension

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
    rs.pipe(res);

    /*
    rs.on('readable', ()=>{
        let d = rs.read();
        if(d){
            let str_to_write;
            if(typeof d === 'string'){
               // res.write(d);
               // sometimes read process overcomes write as modern sys are super fast
               // to co-ordinate the balance.
               str_to_write = d;
            }else if(typeof d === 'object' && d instanceof Buffer){
               // res.write(d.toString('utf8', 0, d.length));
               str_to_write = d.toString('utf8');
            }
            // yet not ready for write
            if(!res.write(str_to_write)){
                rs.pause();
            }
        }
    });

    rs.on('drain', ()=>{
        ()=> {
            rs.resume();
        }
    });

    rs.on('end', ()=>{
        res.end(); // we are done !!
    });
*/
    rs.on('error', (err)=>{
        res.writeHead(404, {'Content-Type':'application/json'});
        let output = {error: 'not_found', message: "'"+filename+"'was not found"};
        res.end(JSON.stringify(output));

    })

}
function content_type_path(filename){
    let ext = path.extname(filename); //gives extension
    switch(ext.toLowerCase()){
        case '.html': return 'text/html';
        case '.txt': return 'text/plain';
        case '.css': return 'text/css';
        case '.jpg': return 'image/jpeg';
        default: return 'text/plain';
    }
    
}


const server = http.createServer(handle_incoming_request).listen(8080);