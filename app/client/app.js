var score = 0;
var images_dropped = 0;
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
    //highlight correct and incorrect answers
    //increase score
    document.getElementById("new_board").disabled = false;
    document.getElementById("submit").disabled = true;
    console.log(resp_body);
    check_matches();
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
        images_dropped = 0;
        console.log("images dropped in new board: " + images_dropped);
        document.getElementById("submit").disabled = false;
    });
}

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

//used to see if a picture matches with the picture below it
function check_matches() {
    for (var i = 0; i < 4; i++) {
        if (document.getElementById(String(i)).childNodes[0].src !== undefined) { 
            if (document.getElementById("matching_box_" + String(i)).src === 
                document.getElementById(String(i)).childNodes[0].src) {
                score += 100;
            }
        } else {
            if (document.getElementById("matching_box_" + String(i)).src === 
                document.getElementById(String(i)).childNodes[1].src) {
                score += 100;
            }
        }
    }
    document.getElementById("current_score").innerHTML = score;
}

$(document).ready(main);
