var express = require("express"),
    http = require("http"),
    mongoose = require('mongoose'),
    port = 3000,
    app;

app = express();
var server = http.createServer(app);
server.listen(port);

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
app.use(express.static(__dirname + "/client"));

var UserSchema = mongoose.Schema({ user: String,
                                   password: String,
                                   score: Number});
var User = mongoose.model("User", UserSchema);

app.get("/login.json", loginHandler);
app.post("/register.json", registerHandler);
app.post("/submit.json", submitHandler);
app.get("/update_leaderboard.json", updateLeaderboardHandler);

function updateLeaderboardHandler(req, res) {
    User.find().sort({score: -1}).exec(function(err, players) {
        if (err) {
            console.log("update leader-board database error.");
            res.json([]);
        } else {
            res.json(players);
        }
    });
}

function submitHandler(req, res) {
    var the_body = req.body;
    var score = the_body.score;
    if (the_body.name !== "Anonymous User") {
        User.update({"user": the_body.name}, 
                    {"score": the_body.score}, function(err) {
            if (err) {
                console.log("database update error.");
            }
        });
        User.findOne({"user": the_body.name}, function(err, result) {
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
    var the_body = req.query;
    mongoCheckExistence(the_body, function(answer) {
        //name and answer are boolean values
        if (!answer.name || !answer.password) {
            res.json(answer); 
        } else {
            var score = parseInt(the_body.score) + parseInt(answer.score);
            User.update({"user": answer.name}, 
                        {$set: {"score": score}}, function(err) {
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
    mongoCheckExistence(the_body, function(answer) {
        if (!answer.name) {
            new_user = new User({"user": the_body.name, 
                                 "password": the_body.password, 
                                 "score": the_body.score});
            new_user.save(function(err, data) {
                if (err != null) {
                    console.log("save error: ", err);
                } else {
                    res.json({"body": the_body, "valid": true});
                }
            });
        } else {
            res.json({"body": null, "valid": false});
        }
    });
}

function mongoCheckExistence(login, callback) {
    var name = login.name;
    var password = login.password;
    User.findOne({"user": name}, function(err, result) {
        if (err) {
           console.log("existence error"); 
           callback({"err": err});
           return;
        } 
        if (result) {
            if (result.password === password) {
                callback({"name": name, 
                          "password": true, 
                          "score": result.score});
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
