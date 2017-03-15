var querystring = require("querystring");
var fs          = require('fs');
var util        = require("util");
var formidable  = require("formidable");
var exec        = require('child_process').exec;

// var MongoClient = require('mongodb').MongoClient;
var assert   = require('assert');
 // var ObjectId = require('mongodb').ObjectID;
// var url      = 'mongodb://localhost:27017/node';

/**
 * ejs框架 封装 页面数据展示
 * @param response
 * @param data    数据
 * @param action  页面
 */
function render(response,data,action){
        action ?action:'index';
    var ejs = require('ejs');
        path = __dirname + '/views/'+action+'.ejs',
        str = fs.readFileSync(path, 'utf8'),
        ret = ejs.render(str, {
            data: data,
            filename: path
        });
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(ret);
    response.end();
}

function index(response,postData)
{
    var users = [];

    users.push({ name: 'Tobi', age: 2, species: 'ferret' });
    users.push({ name: 'Loki', age: 2, species: 'ferret' });
    users.push({ name: 'Jane', age: 6, species: 'ferret' });
    render(response,users,'index');
}

function doIndex(response,request){
    var form = new formidable.IncomingForm();
    form.parse(request,function(error,fields,files){
        console.log(fields);
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("You've sent: " +  fields.title+"##"+fields.text);
        response.end();
    });
}

function start(res, postData) {
    var content = "empty";
    //exec('ls -lah',
    // exec('find / ',
    //   function(error,stdout,stderr){
    //        content = stdout;
    //    }
    // );
    // return content;
    exec("ls -lah", function (error, stdout, stderr) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write(stdout);
        res.end();
    });
}

function find(response, postData)
{
    exec("find /", {timeout: 10000, maxBuffer: 20000 * 1024}, function (error, stdout, stderr) {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(stdout);
        response.end();
    });
}

function home(response){

    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="Content-Type" '+
        'content="text/html; charset=UTF-8" />'+
        '</head>'+
        '<body>'+
        '<form action="/upload" enctype="multipart/form-data" '+
        'method="post">'+
        '<input type="file" name="upload">'+
        '<input type="submit" value="Upload file" />'+
        '</form>'+
        '</body>'+
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();

}

function upload(res, req) {
    console.log("request handler ' upload' was called");

    var form = new formidable.IncomingForm();
         form.uploadDir = './tmp';
    form.parse(req,function(err,fields,files){
        // console.log('parsing done');
         console.log(files);
        fs.renameSync(files.upload.path,"./tmp/test.png");
        // var readStream = fs.createReadStream(files.upload.path);
        // var writeStream = fs.createWriteStream("/tmp/test.png");
        // util.pump(readStream,writeStream,function(){
            // fs.unlinkSync(files.upload.path);
        // });
        var content = 'received image:'+' <br/>'+'<img src="/show" />';
        res.writeHead(200,{"Content-Type": "text/html"});
        res.write(content);
        res.end();
    });
}

function show(response){
    console.log("Request handler 'show' was called.");
    fs.readFile("./tmp/test.png", "binary", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "image/png"});
            // fs.createReadStream("/tmp/test.png").pipe(response);
            response.write(file, "binary");
            response.end();
        }
    });
}
/**
 * mongo 连接测试
 * @param res
 */
function mongo(res){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server.");
        db.close();
    });
    res.end();
}

/**
 * mongo 插入数据
 * @param res
 */
function mongoinsert(res)
{
    var insertDocument = function(db,callback){
        db.collection('restaurants').insertOne({
            "address" : {
                "street" : "2 Avenue",
                "zipcode" : "10075",
                "building" : "1480",
                "coord" : [ -73.9557413, 40.7720266 ]
            },
            "borough" : "Manhattan",
            "cuisine" : "Italian",
            "grades" : [
                {
                    "date" : new Date("2014-10-01T00:00:00Z"),
                    "grade" : "A",
                    "score" : 11
                },
                {
                    "date" : new Date("2014-01-16T00:00:00Z"),
                    "grade" : "B",
                    "score" : 17
                }
            ],
            "name" : "Vella",
            "restaurant_id" : "41704620"
        },function(err,result){
            assert.equal(err,null);
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.write("Inserted a document into the restaurants collection.");
            res.end();
            callback();
        });
    };

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        insertDocument(db, function() {
            db.close();
        });
    });
    res.end();
}

/**
 * mongo 查找数据
 * @param res
 */
function mongofind(res)
{
    console.log("request handler ' mongofind' was called");
    var findRestaurants = function (db, callback) {
        var cursor = db.collection('restaurants').find();
        cursor.each(function (err, doc) {
            console.log(typeof doc);
            assert.equal(err, null);
            if (doc != null) {
                //res.writeHead(200, {"Content-Type": "text/plain"});
                console.log("mongofind: " + JSON.stringify(doc));
                //res.write("mongofind: " + JSON.stringify(doc));
                //res.end();
            } else {
                callback();
            }
        });
    };
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        findRestaurants(db, function () {
            db.close();
        });
    });
    res.end();
}

/**
 * mongo 删除数据
 * @param res
 */
function mongodel(res)
{
    var removeRestaurants = function (db, callback) {
        db.collection('restaurants').deleteMany(
            {"borough": "Manhattan"},
            function (err, results) {
                console.log(results);
                callback();
            }
        );
    };

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        removeRestaurants(db, function () {
            db.close();
        });
    });
    res.end();
}

exports.index   = index;
exports.doIndex = doIndex;
exports.start   = start;
exports.find    = find;
exports.home    = home;
exports.upload  = upload;
exports.show    = show;
exports.mongo   = mongo;
exports.mongoinsert  = mongoinsert;
exports.mongofind = mongofind;
exports.mongodel  = mongodel;
