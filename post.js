var http = require("http"),
    qs = require('querystring');
// { <form action='/resource/url' method='post'>
// </form> }
// its not a json data actually

function handle_incoming_request (req, res) {
  console.log("Incoming request: (" + req.method + ") " + req.url);
  
let form_data = '';
  req.on('readable', ()=>{
    let d = req.read();
    if(typeof d == 'string'){
        form_data += d;
    }else if(typeof d == 'object' && d instanceof Buffer){
        form_data += d.toString('utf-8');
    }
  });

  req.on('end', ()=>{
    let output = '';
    if(!form_data || form_data.length === 0){
        output += 'no data available';
    }else{
       let obj = qs.parse(form_data);
       if(!obj){
           output = 'Aww, no valid form data';
       }
        
        res.end(output);
    }
  });
}

var s = http.createServer(handle_incoming_request);
s.listen(8080);

