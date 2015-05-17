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

$(document).ready(main);
