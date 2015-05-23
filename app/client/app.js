var score = 0;
var images_dropped = 0;
var box_occupied = [false, false, false, false, true, true, true, true];

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
    $("#feedback").text( JSON.stringify( resp_body) )
    if( resp_body.url ) window.location = resp_body.url;
};

function handleSubmitResult(resp_body) {
    console.log("sent submit request:");
    //highlight correct and incorrect answers
    //increase score
    document.getElementById("new_board").disabled = false;
    document.getElementById("submit").disabled = true;
    console.log(resp_body);
};

var main = function (){
    $("button#login_button").on("click", function (event){ 
    $.get("login.json",
        {"name": $("#old_name").val(), "password": $("#old_pass").val() },
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
    $.post("register.json", 
        {"name": $("#new_name").val(), "password": $("#new_pass").val() }, 
        handleRegisterResult);
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

function allowDrop(ev) {
    ev.preventDefault();
}

function isInt(n) {
    return n % 1 === 0;
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    box_occupied[parseInt(ev.target.parentNode.id)] = false;
}

function drop(ev) {
    ev.preventDefault();
    if (isInt(ev.target.id) && !box_occupied[parseInt(ev.target.id)]) {
        box_occupied[parseInt(ev.target.id)] = true;
        var data = ev.dataTransfer.getData("text");
        ev.target.appendChild(document.getElementById(data));
    }
    //unoccupy();
    console.log(box_occupied);
    images_dropped++;
    console.log("images dropped: " + images_dropped);
    if (images_dropped == 2) {
        document.getElementById("submit").disabled = false;
    }

}

function unoccupy() {
    for (var i = 0; i < 8; i++) {
        //console.log(i + ": " + {"0": document.getElementById(String(i)).innerHTML});
        //if ($("#" + String(i)).is(":empty")) {
        //if (document.getElementById(String(i)).innerHTML == null) {
        console.log(document.getElementById(String(i)).childNodes.length);
        if (document.getElementById(String(i)).childNodes.length === 1) {
            console.log("found empty box");
            box_occupied[i] = false;
        }
    }
}

function inc_score(ev) {
    score += 1;
    document.getElementById("current_score").innerHTML = score;
}

//used to see if a picture matches with the picture below it
function is_correct_match() {

}

$(document).ready(main);
