var score = 0;
var new_points = 0;
var number_correct = 0;
var logged_in = false;

//assigned timestamps when a new board is generated or submitted
//measures how fast the learner completes the board 
//used to award bonus points for faster responses
var start_time = null;
var end_time = null;

var box_occupied = [false, false, false, false, true, true, true, true];
var quizzes = {"all": -1, "flags": 0, "religions": 1, "incomes": 2, 
               "populations": 3, "names": 4};

//quiz values = log base 10 of the number of answer tiles in quiz * 100
//for example: there are 7 tiles in the religions set, so log(7) * 100 = 84
var quiz_values = {"-1": 251, "0": 211, "1": 84, "2": 143, "3": 153, "4": 211}; 

quiz_index = 4;
quiz_button_ids = ["names_quiz", "flags_quiz", "incomes_quiz", "religions_quiz",
                   "populations_quiz", "all_quiz"];

var submit_disabled = true;
var new_board_disabled = true;

for (x in quiz_button_ids) {
    $("#" + quiz_button_ids[x]).css("cursor", "pointer");
}
$("#submit").css("cursor", "pointer");
$("#new_board").css("cursor", "pointer");

function handleLoginResult(resp_body) {
    score = resp_body.score;
    clear_register();

    if (resp_body.name && resp_body.password) {
        logged_in = true;
        document.getElementById("user_name").innerHTML = resp_body.name;
        document.getElementById("anon_user_message").innerHTML = "";
        clear_login();
        document.getElementById("current_score").innerHTML = resp_body.score;
        document.getElementById("login").innerHTML = 
            '<button id="logout_button">sign out</button>';
        $("button#logout_button").on("click", function (event) {
            handleLogoutResult();
        });
    } else {
        document.getElementById("feedback").innerHTML = 
            "You entered an invalid user name or password.";
    }
};

function handleLogoutResult(resp_body) {
    score = 0;
    logged_in = false;
    document.getElementById("current_score").innerHTML = score;
    document.getElementById("user_name").innerHTML = "Anonymous User";
    document.getElementById("anon_user_message").innerHTML = 
        "Create a new account or sign into an "
        + "existing account if you want to save your score.";
    document.getElementById("login").innerHTML = 
        '<input id="old_name" type="text" ' +
        'placeholder="name">' + 
        '<input id="old_pass" type="password" placeholder="password">'
        + '<button id="login_button">sign in</button><p id="feedback"></p>';
    $("button#login_button").on("click", function (event){ 
        $.get("login.json",
            {"name": $("#old_name").val(), "password": $("#old_pass").val(), 
            "score": 
                parseInt(document.getElementById("current_score").innerHTML) },
            handleLoginResult);
    });
};

function handleRegisterResult(resp_body) {
    console.log("handleRegisterResult: resp_body.name: " + resp_body.name);
        logged_in = true;
        document.getElementById("user_name").innerHTML = resp_body.name;
        document.getElementById("anon_user_message").innerHTML = '';
        document.getElementById("login").innerHTML = 
            '<button id="logout_button">sign out</button>';
        $("button#logout_button").on("click", function (event) {
            handleLogoutResult();
        });
    clear_register();
};

var main = function (){
    new_board();

    $("button#login_button").on("click", function (event){ 
        if (logged_in) {
            handleLogoutResult();
        }
        $.get("login.json",
            {"name": $("#old_name").val(), "password": $("#old_pass").val(), 
            "score": 
                parseInt(document.getElementById("current_score").innerHTML) },
            handleLoginResult);
    });

    $("button#register").on("click", function (event){ 
        if ($("#new_pass").val() !== $("#new_pass_2").val()) {
            document.getElementById("register_feedback").innerHTML = 
                "Re-enter the same password.";
        } else if (document.getElementById("new_name").value === '') {
           document.getElementById("register_feedback").innerHTML = 
           "You did not enter a user name.";
        } else if (document.getElementById("new_pass").value === '') {
           document.getElementById("register_feedback").innerHTML = 
           "You did not enter a password.";
        } else if (document.getElementById("new_name").value !== '' && 
                   document.getElementById("new_pass").value !== '') {
            if (logged_in) {
                handleLogoutResult();
            }
            $.post("register.json",
                {"name": $("#new_name").val(), 
                 "password": $("#new_pass").val(), 
                 "score": 
                parseInt(document.getElementById("current_score").innerHTML)}, 
                handleRegisterResult);
        }
    });

    $("#submit").on("click", function (event) {
        if (!submit_disabled) {
            check_matches();
        }
    });

    $("#new_board").on("click", function (event) {
        if (!new_board_disabled) {
            new_board();
        }
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
        box_occupied[parseInt(document.getElementById(data).parentNode.id)] = 
            false;
        ev.target.appendChild(document.getElementById(data));
    }
    if (box_occupied[0] && box_occupied[1] && 
        box_occupied[2] && box_occupied[3] && !box_occupied[4]) {
        submit_disabled = false;
        enable("submit");
    } else {
        submit_disbaled = true;
        disable("submit");
    }
}

function check_matches() {
    end_time = new Date();
    new_board_disabled = false;
    enable("new_board");
    submit_disabled = true;
    disable("submit");
    box_occupied = [true, true, true, true, true, true, true, true];
    number_correct = 0;
    new_points = 0;
    for (var i = 0; i < 4; i++) {
        if (document.getElementById(i).childNodes[0].src !== undefined) {
            game_feedback(i, 0);
        } else {
            game_feedback(i, 1);
        }
        speed_bonus = (60 - ((end_time - start_time) / 1000));
        if (speed_bonus > 0 && number_correct === 4) {
            new_points += Math.floor(speed_bonus);
        }
    }
    var name = document.getElementById("user_name").innerHTML;
    $.post("submit.json", {"name": name, "score": new_points + score}, null);
    inc_score(new_points);
}

function inc_score(remaining) {
    if (remaining <= 0) {
        return
    }
    score += 1;
    document.getElementById("current_score").innerHTML = score;
    setTimeout(function() {inc_score(remaining - 1);}, 1);
}

function game_feedback(i, index) {
    if (maps(document.getElementById("matching_box_" + String(i)).src,
             document.getElementById(i).childNodes[index].src)) {
        new_points += quiz_values[String(quiz_index)];
        document.getElementById(i).style.border= "solid lime 5px";
        number_correct += 1;
    } else {
        document.getElementById(i).style.border= "solid red 5px";
    }
}

function build_image_path(src) {
    path_end = "";
    path_end += src.split("/")[src.split("/").length - 3] + "/";
    path_end += src.split("/")[src.split("/").length - 2] + "/";
    path_end += src.split("/")[src.split("/").length - 1];
    return path_end; 
}

function maps(key, target) {
    target_path_end = build_image_path(target);
    key_path_end = build_image_path(key);
    return $.inArray(target_path_end, countries[key_path_end]) > -1;
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
    //return obj[keys[Math.floor(Math.random() * keys.length)]];
    return keys[Math.floor(Math.random() * keys.length)];
}

function randint(n) {
    return Math.floor(Math.random() * n);
}

function new_board() {
    start_time = new Date();
    submit_disabled = true;
    disable("submit");
    new_board_disabled = true;
    disable("new_board");
    var matching_picture_order = shuffle([0, 1, 2, 3]);
    var answer_picture_order = shuffle([0, 1, 2, 3]);
    var matching_pictures = [];
    var answers = [];
    var candidate_country = null;
    for (var i = 0; i < 4; i++) {
        candidate_country = (fetch_random(countries)); 
        if ($.inArray(candidate_country, matching_pictures) > -1) {
            i--;
            continue;
        };
        matching_pictures.push(candidate_country);
        if (quiz_index === -1) {
            picture_roll = randint(countries[matching_pictures[i]].length);
        } else {
            picture_roll = quiz_index;
        }
        answers.push(countries[matching_pictures[i]][picture_roll]);
        $("#" + String(i)).css("border-bottom", "solid black 5px");
    }
    $(".matching_frame").empty();
    for (var i = 0; i < 4; i++) {
        document.getElementById("matching_frame_" + String(i)).innerHTML =
          '<img class="matching_box" id="matching_box_' + String(i) +
          '" src=' + matching_pictures[matching_picture_order[i]] + 
          '><div class="drop_box" id="' + String(i) + 
          '" ondrop="drop(event)" ondragover="allowDrop(event)"></div>';
        if (quiz_index !== 1) {
            document.getElementById(i + 4).innerHTML = 
              '<img class="drag" ' +
              'id="drag' + String(i + 4) + 
              '" src = ' + answers[answer_picture_order[i]] +
              ' draggable="true"' +
              ' ondragstart="drag(event)"' +
              ' width="192px" height="108px">';
        } else {
            //religions need a title attribute because the religion images
            //don't come with the name of the religion on them, just the symbol
            document.getElementById(i + 4).innerHTML = 
              '<img class="drag" ' +
              'id="drag' + String(i + 4) + 
              '" src=' + answers[answer_picture_order[i]] +
              ' title=' + 
              answers[answer_picture_order[i]].split("/")[2].split(".")[0] +
              ' draggable="true"' +
              ' ondragstart="drag(event)"' +
              ' width="192px" height="108px">';
        }
    }
    box_occupied = [false, false, false, false, true, true, true, true];
}

function change_quiz(quiz_type, quiz_button_id) {
    quiz_index = quizzes[quiz_type];
    new_board();
    for (x in quiz_button_ids) {
        if (quiz_button_ids[x] !== quiz_button_id) {
            $("#" + quiz_button_ids[x]).css("background", "#C6DEBD");
        }
    }
    $("#" + quiz_button_id).css("background", "#627A59");
}

function enable(id) {
    $("#" + id).css("color", "black");
}

function disable(id) {
    $("#" + id).css("color", "#A0A0A0");
}

function clear_register() {
    document.getElementById("new_name").value = '';
    document.getElementById("new_pass").value = '';
    document.getElementById("new_pass_2").value = '';
    document.getElementById("register_feedback").innerHTML = '';
}

function clear_login() {
    document.getElementById("old_name").value = '';
    document.getElementById("old_pass").value = '';
    document.getElementById("feedback").innerHTML = '';
}

$(document).ready(main);
