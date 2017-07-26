const http = require('http');
const fs = require('fs');

function load_album_list(callback){
    fs.readdir('albums', (err, files)=>{
        if(err){
            callback(err);
        }else{
            callback(null, files);
        }
    });
}

function process_request(req,res){
    console.log("server is running at port 8080");

    load_album_list((err, albums)=>{
        if(err){
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({code: 'cant_load_albums', message: err.message}));
        }else{
            let output = {error: null, data: {albums: albums}};
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(output)+'\n');
        }
    });

    console.log("METHOD : "+req.method+"\nReqeust URL : "+req.url);
    
    // res.writeHead(200, {'Content-Type': 'application/json'});
    // res.end(JSON.stringify({error: null, data:''}));
    
}

const s = http.createServer(process_request).listen(8080);

