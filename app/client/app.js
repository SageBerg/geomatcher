var score = 0;
var box_occupied = [false, false, false, false, true, true, true, true];
var countries = {
                 "china.jpg": ["china.jpg"], 
                 "usa.png": ["usa.png"],
                 "turkey.png": ["turkey.png"], 
                 "indonesia.jpg": ["indonesia.jpg"]
                }

function handleLoginResult(resp_body) {
    console.log(resp_body);

    if (resp_body.name && resp_body.password) {
        document.getElementById("user_name").innerHTML = resp_body.name;
        document.getElementById("anon_user_message").innerHTML = "";
        document.getElementById("feedback").innerHTML = "";
        /*
        document.getElementById("login_button").innerHTML = "sign out";
        document.getElementById("login_button").id = "logout_button";
        */ 
    } else {
        document.getElementById("feedback").innerHTML = "invalid user name or password";
    }
};

function handleRegisterResult(resp_body) {
    console.log( resp_body );
    // $("#feedback").text( JSON.stringify( resp_body) )
    if( resp_body.url ) window.location = resp_body.url;
    document.getElementById("user_name").innerHTML = resp_body.name;
    document.getElementById("anon_user_message").innerHTML = "";
};

function handleSubmitResult(resp_body) {
    console.log("sent submit request:");
    document.getElementById("new_board").disabled = false;
    document.getElementById("submit").disabled = true;
    console.log(resp_body);
    check_matches();
    for (var i = 4; i < 8; i++) {
        document.getElementById(i).ondragover = "";
    }
    //lock images, so you can't move them around to get full points
    //maybe do this by making the startring drop boxes undroppable until the next round
};

var main = function (){
    $("button#login_button").on("click", function (event){ 
        $.get("login.json",
            {"name": $("#old_name").val(), "password": $("#old_pass").val(), 
            "score": parseInt(document.getElementById("current_score").innerHTML) },
            handleLoginResult);
    });
    /*
    $("button#logout_button").on("click", function (event){ 
    $.get("logout.json",
        {"name": $("#old_name").val(), "password": $("#old_pass").val() },
        handleLoginResult);
    });
    */
    $("button#register").on("click", function (event){ 
        if ($("#new_pass").val() !== $("#new_pass_2").val()) {
            alert("Re-enter the same password. (we can change this from an alert box)");
        } else {
            $.post("register.json", 
                {"name": $("#new_name").val(), 
                "password": $("#new_pass").val(), 
                "score": parseInt(document.getElementById("current_score").innerHTML) }, 
                handleRegisterResult);
        }
    });
    $("button#submit").on("click", function (event) {
        $.post("submit.json", 
        {},
        handleSubmitResult);
    });
    $("button#new_board").on("click", function (event) {
        new_board();
    });
}

//credit stackoverflow
function isInt(n) {
    return n % 1 === 0;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    if (isInt(ev.target.id) && !box_occupied[parseInt(ev.target.id)]) {
        box_occupied[parseInt(ev.target.id)] = true;
        var data = ev.dataTransfer.getData("text");
        box_occupied[parseInt(document.getElementById(data).parentNode.id)] = false;
        ev.target.appendChild(document.getElementById(data));
    }
    if (box_occupied[0] && box_occupied[1] && 
        box_occupied[2] && box_occupied[3]) {
        document.getElementById("submit").disabled = false;
    } else {
        document.getElementById("submit").disabled = true;
    }
}

function inc_score(ev) {
    //score += 1;
    //document.getElementById("current_score").innerHTML = score;
}

function check_matches() {
    for (var i = 0; i < 4; i++) {
        if (document.getElementById(i).childNodes[0].src !== undefined) {
            game_feedback(i, 0);
        } else {
            game_feedback(i, 1);
        }
    }
    document.getElementById("current_score").innerHTML = score;
}

function game_feedback(i, index) {
    if (document.getElementById("matching_box_" + String(i)).src === 
        document.getElementById(i).childNodes[index].src) { 
        score += 100;
    } else {
        $("#matching_box_" + i).css("border-bottom", "solid red 5px");
        document.getElementById("matching_box_" + i).parentNode.style.border= "solid red 5px";
    }
}

//stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

//stackoverflow.com/questions/4428013/how-can-i-choose-an-object-key-at-random
function fetch_random(obj) {
    var temp_key, keys = [];
    for(temp_key in obj) {
        if(obj.hasOwnProperty(temp_key)) {
            keys.push(temp_key);
        }
    }
    return obj[keys[Math.floor(Math.random() * keys.length)]];
}

function new_board() {
    document.getElementById("submit").disabled = true;
    document.getElementById("new_board").disabled = true;
    matching_picture_order = shuffle([0, 1, 2, 3]);
    answer_picture_order = shuffle([0, 1, 2, 3]);
    for (var i = 0; i < 4; i++) {
        $("#matching_box_" + i).css("border-bottom", "solid black 5px");
        $("#matching_box_" + i).innerHTML == "";
        document.getElementById("matching_box_" + String(i)).parentNode.style.border = "solid black 5px";

    }
    $(".matching_frame").empty();

    for (var i = 0; i < 4; i++) {
        //$("#matching_frame_" + String(i)).innerHTML =
        document.getElementById("matching_frame_" + String(i)).innerHTML =
          '<img class="matching_box" id="matching_box_' + String(i) +
          '" src=' + fetch_random(countries) + 
          '><div class="drop_box" id="' + String(i) + 
          '" ondrop="drop(event)" ondragover="allowDrop(event)"></div>';
        //$("#matching_box_" + String(i)).empty(); 
        //$("#" + String(i)).empty(); 
        //document.getElementById(i).ondragover = "allowDrop(event)";
    }

    //choose picture pairs
    //add in picture pairs
}

$(document).ready(main);
