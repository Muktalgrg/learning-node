const http = require('http');
const fs = require('fs');


function load_album_list(callback){
    fs.readdir('albums', (err, files)=>{
        if(err){
            callback(err);
        }else{
            let only_dirs = [];
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

// for example inside albums find that one of australia--> albums/australia
function load_album(album_name, callback){
    fs.readdir('albums/'+album_name,(err, files)=>{
        if(err){
            //console.log(err);
            if(err.code == 'ENOENT'){
                callback(make_error('no_such_album', 'That album does not exist'));
            }else{
                callback(make_error('cant_load_photos', 'The server is broken'));
            }
        }else{
            let only_files = [];
            let path = `albums/${album_name}/`;

            let iterator = (index) => {
                if(index === files.length){
                    console.log(only_files);
                    let obj = { short_name: album_name.substr(1),
                                 photos: only_files};
                    callback(null, obj);
                    return;
                }
                fs.stat(path+files[index],(err,stats)=>{
                    if(!err && stats.isFile()){
                        only_files.push(files[index]);
                    }
                iterator(index + 1);
                });
            }
            iterator(0);
        }
    });
}

function handle_incoming_request(req,res){
    console.log("INCOMING REQUEST : "+req.method+"\nURL"+req.url);

    if(req.url === '/albums.json'){
        handle_load_album_list(req, res);
        
    }else if(req.url.substr(0,7) == '/albums'
            && req.url.substr(req.url.length - 5) == '.json'){
        handle_load_album(req, res);
         
    }else{
        send_failure(res, 404, {code: 'no_such_page', message: 'yoy'});
    }
}

const s = http.createServer(handle_incoming_request).listen(8080);

function make_error(code, msg){
    let e = new Error(msg);
    e.code = code;
    return e;
}

function make_resp_err(err){
    return JSON.stringify({
        code : (err.code)? err.code : err.name,
        message : err.message
    });
}

function send_success(res, data){
    res.writeHead(200, {'Content-Type':'application/json'});
    let output = {error: null, data: data};
    res.end(JSON.stringify(output));
}

function send_failure(res, server_code, err){
    let code = (err.code)? err.code : err.name;
    res.writeHead(server_code, {'Content-Type': 'application/json'}); 
    res.end(make_resp_err(err));   
}


function handle_load_album_list(req, res){
    load_album_list((err, albums)=>{
            if(err){
                send_failure(res,500, {code: 'cant_load_albums', message: err.message});
                
            }else{
                send_success(res, {albums: albums});
            }
         });
}

function handle_load_album(req, res){
    load_album(req.url.substr(7,(req.url.length - 12)/* /albums/australia.json whole - (.json+/albums) */ ),(err, photos)=>{
                if(err){
                    send_failure(res, 500, err);
                    
                }else{
                    send_success(res, photos);
                }
         });
}



