function handleLoginResult(resp_body) {
    console.log( resp_body );
    $("#feedback").text( JSON.stringify( resp_body) );
    if( resp_body.url ) window.location = resp_body.url;
};

function handleRegisterResult(resp_body) {
    console.log( resp_body );
    $("#feedback").text( JSON.stringify( resp_body) )
    if( resp_body.url ) window.location = resp_body.url;
};

var main = function (){
    $("button#login").on("click", function (event){ 
    $.get("login.json",
        {"name": $("#old_name").val(), "password": $("#old_pass").val() },
        handleLoginResult);
    });
    $("button#register").on("click", function (event){ 
    $.post("register.json", 
        {"name": $("#new_name").val(), "password": $("#new_pass").val() }, 
        handleRegisterResult);
    });
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

var score = 0;

function inc_score(ev) {
    score += 1;
    document.getElementById("current_score").innerHTML = score;
}

$(document).ready(main);
