const http = require('http');
const fs = require('fs');

function load_album_list(callback){
    fs.readdir('albums', (err, files)=>{
        if(err){
            callback(err);
        }else{
            let only_dirs = [];
            
            // for(let i = 0; i < files.length; i++){
            //     fs.stat('albums/'+files[i], (err,stats)=>{
            //        if(stats.isDirectory()){
            //             only_dirs.push(files[i]);
            //         }
            //     })

            // }
            // callback(null, only_dirs);

            let iterator = (index) => {
                if(index === files.length){
                    callback(null, only_dirs);
                    return;
                }
                fs.stat('albums/'+files[index],(err, stats)=>{
                    if(stats.isDirectory()){
                        only_dirs.push(files[index]);
                    }
                    iterator(index + 1);
                });
            }
            iterator(0);

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

//

