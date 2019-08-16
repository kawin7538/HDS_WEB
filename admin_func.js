$("#timer_pause").hide();
$("#timer_stop").hide();
function zeroPad(nr,base){
    var  len = (String(base).length - String(nr).length)+1;
    return len > 0? new Array(len).join('0')+nr : nr;
}

function save_timer(){
    var hour = parseInt(document.getElementById("hour").value);
    var min = parseInt(document.getElementById("min").value);
    var sec = parseInt(document.getElementById("sec").value);
    document.getElementById("timer").innerText = zeroPad(hour,10)+" : "+zeroPad(min,10)+" : "+zeroPad(sec,10);
}

function timer_start(){
    $("#timer_start").hide();
    $("#timer_pause").show();
    $("#timer_stop").show();
}
