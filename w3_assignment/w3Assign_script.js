$(document).ready(function(){
    // Toggle hamburger menu
    $(".hamburger").click(function(){
        $(".menu").slideToggle();
    });

    // Button animation demo
    $("#demo").click(function(){
        $("#msg").fadeIn().delay(2000).fadeOut();
    });
});
