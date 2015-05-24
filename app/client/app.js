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
    score = resp_body.score;

    if (resp_body.name && resp_body.password) {
        document.getElementById("user_name").innerHTML = resp_body.name;
        document.getElementById("anon_user_message").innerHTML = "";
        document.getElementById("feedback").innerHTML = "";
        document.getElementById("current_score").innerHTML = resp_body.score;
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
    document.getElementById("current_score").innerHTML = resp_body.score;
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
                "score": parseInt(document.getElementById("current_score").innerHTML)}, 
                handleRegisterResult);
        }
    });
    $("button#submit").on("click", function (event) {
        $.post("submit.json", 
        {"name": document.getElementById("user_name").innerHTML, 
        "score": parseInt(document.getElementById("current_score").innerHTML)},
        handleSubmitResult);
    });
    $("button#new_board").on("click", function (event) {
        new_board();
    });
}

//stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
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
    var matching_picture_order = shuffle([0, 1, 2, 3]);
    var answer_picture_order = shuffle([0, 1, 2, 3]);
    var matching_pictures = [];
    var answers = [];
    for (var i = 0; i < 4; i++) {
        matching_pictures.push(fetch_random(countries));
        answers.push(countries[matching_pictures[i]]);
        $("#matching_box_" + i).css("border-bottom", "solid black 5px");
        document.getElementById("matching_box_" + String(i)).parentNode.style.border = "solid black 5px";

    }
    $(".matching_frame").empty();
    for (var i = 0; i < 4; i++) {
        document.getElementById("matching_frame_" + String(i)).innerHTML =
          '<img class="matching_box" id="matching_box_' + String(i) +
          '" src=' + matching_pictures[matching_picture_order[i]] + 
          '><div class="drop_box" id="' + String(i) + 
          '" ondrop="drop(event)" ondragover="allowDrop(event)"></div>';
        document.getElementById(i + 4).innerHTML = 
          '<img class="drag" ' +
          'id="drag' + String(i + 4) + 
          '" src = ' + answers[answer_picture_order[i]] +
          ' draggable="true"' +
          ' ondragstart="drag(event)"' +
          ' width="192px" height="108px">';
    }
    box_occupied = [false, false, false, false, true, true, true, true];
}

$(document).ready(main);
