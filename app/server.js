var express = require("express"),
    http = require("http"),
    mongoose = require('mongoose'),
    //port = process.env.PORT || 3000,  //for cloud later //was causing error
    port = 3000,
    app;

app = express();
var server = http.createServer(app);
server.listen(port); //3000 for now

mongoose.connect('mongodb://localhost/geomatcher');

mongoose.connection.on('connected', function () {
     console.log('Mongoose connected');
});

mongoose.connection.on('error',function (err) {
     console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
     console.log('Mongoose disconnected');
});

app.use(express.urlencoded());  //this allows req.body

// set up a static file directory to use for default routing
app.use(express.static(__dirname + "/client"));

//schemas (see http://mongoosejs.com/docs/3.6.x/docs/schematypes.html)
var UserSchema = mongoose.Schema({ user: String,
                                   password: String,
                                   score: Number});
                                   // history: [String],
                                   // compromised: [String]});

var User = mongoose.model("User", UserSchema);

//routes for login page

app.get("/login.json", loginHandler);

app.post("/register.json", registerHandler);

app.post("/submit.json", submitHandler);

function submitHandler(req, res) {
    var the_body = req.body;
    var score = the_body.score;
    console.log("SCORE: " + the_body.score);
    console.log("SUBMIT NAME: " + the_body.name);
    if (the_body.name !== "Anonymous User") {
        User.update({"user": the_body.name}, {"score": the_body.score}, function(err) {
            if (err) {
                console.log("database update error.");
            }
        });
        User.findOne({"user": the_body.name}, function(err, result) {
            console.log("existence result ", result); 
            if (err) {
                console.log("existence error"); 
                callback({"err": err});
                return;
            } else {
                score = result.score;
            }
        });
    }
    res.json({"score": score});
}

function loginHandler(req, res) {
    var the_body = req.query; //req.body goes with post
    console.log("login request", the_body);
    middleLogin(the_body, function(answer) {
        console.log("answer: ", answer); 
        //needs to return answer.name, answer.password
        //name and answer are boolean values
        if (!answer.name || !answer.password) {
            res.json(answer); 
        } else {
            //console.log("the_body.score: " + the_body.score);
            //console.log("answer.score: " + answer.score);
            var score = parseInt(the_body.score) + parseInt(answer.score);
            //console.log("answer.name: " + answer.name);
            //console.log("score: " + score);
            User.update({"user": answer.name}, {$set: {"score": score}}, function(err) {
                if (err) {
                    console.log("database update error.");
                }
            });
            answer.score = score;
            res.json(answer); 
        }
    });
}

function registerHandler(req, res) {
    var the_body = req.body;
    console.log("register request", the_body);
    middleLogin(the_body, function(answer) {
        if (the_body.name === '' || the_body.password === '') {
            console.log('Enter a username and password.');
            res.json(answer);
        } else if (!answer.name) {
            new_user = new User({"user": the_body.name, 
                                 "password": the_body.password, 
                                 "score": the_body.score});
            new_user.save(function(err, data) {
                if (err != null) {
                    console.log("save error: ", err);
                } else {
                    console.log("entered new user in database");
                    res.json(the_body);
                }
            });
        } else {
            console.log("user with this name is already in the database");
            res.json(answer);
        }
    });
}

function middleLogin(login, callback) { 
    mongoCheckExistence(login, function(result) {
        if (result.err) {
            callback({"err": result.err});
        } else {
            callback(result);
        }
    });
}

function mongoCheckExistence(login, callback) {
    var name = login.name;
    var password = login.password;
    User.findOne({"user": name}, function(err, result) {
        console.log("existence result ", result); 
        if (err) {
           console.log("existence error"); 
           callback({"err": err});
           return;
        } 
        if (result) {
            if (result.password === password) {
                callback({"name": name, "password": true, "score": result.score});
            } else {
                callback({"name": true, "password": false});
            }
        } else {
            callback({"name": false, "password": false});
        }
    });
}

process.on('SIGINT', function() {
   mongoose.connection.close();
   server.close();
   process.exit(0);
});
