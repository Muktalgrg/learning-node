const http = require('http');
const fs = require('fs');
const url = require('url');


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
function load_album(album_name, page, page_size, callback){
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
                    // adding page support
                    const start = page * page_size;
                    const output = only_files.slice(start, start + page_size);
                    
                    let obj = { short_name: album_name.substr(1),
                                 photos: output};
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

// main function -->
function handle_incoming_request(req,res){
    // adding property
    req.parsed_url = url.parse(req.url, true); // true changes query string into json obj
    const core_url = req.parsed_url.pathname; // everything infront of ?
    console.log("INCOMING REQUEST : "+req.method+"\nURL"+core_url);

    if( core_url === '/albums.json'){
        handle_load_album_list(req, res);
        
    }else if(core_url.substr(0,7) == '/albums'
            && core_url.substr(core_url.length - 5) == '.json'){
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
    let getp = req.parsed_url.query;
    let page_num = getp.page ? parseInt(getp.page) -1 : 0;
    let page_size = getp.page_size? parseInt(getp.page_size): 1000;

    if( isNaN(page_num)){
        page_num = 0;
    }
    if(isNaN(page_size)) page_size = 1000;

    const core_url = req.parsed_url.pathname;
    load_album(core_url.substr(7,(core_url.length - 12) ),page_num,page_size,(err, photos)=>{
                if(err){
                    send_failure(res, 500, err);
                    
                }else{
                    send_success(res, photos);
                }
         });
}



