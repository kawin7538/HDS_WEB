var hour = 0;
var min = 0;
var sec = 0;

$(function(){
    $("#timer_pause,#timer_stop").hide();
    firebase.database().ref("timer").set({
        hour:hour,
        min:min,
        sec:sec
    });
})

function zeroPad(nr,base){
    var  len = (String(base).length - String(nr).length)+1;
    return len > 0? new Array(len).join('0')+nr : nr;
}

var ref_timer=firebase.database().ref("timer");

ref_timer.on('value',function(snapshot){
    // console.log(snapshot.val());
    var value=snapshot.val();
    document.getElementById("timer").innerText=zeroPad(value['hour'],10)+" : "+zeroPad(value['min'],10)+" : "+zeroPad(value['sec'],10);
});

function save_timer(){
    hour = parseInt(document.getElementById("hour").value);
    min = parseInt(document.getElementById("min").value);
    sec = parseInt(document.getElementById("sec").value);
    firebase.database().ref("timer").set({
        hour:hour,
        min:min,
        sec:sec
    });
    document.getElementById("hour").value="";
    document.getElementById("min").value="";
    document.getElementById("sec").value="";
    // document.getElementById("timer").innerText = zeroPad(hour,10)+" : "+zeroPad(min,10)+" : "+zeroPad(sec,10);
}

function timer_start(){
    $("#timer_pause,#timer_stop").show();
    $("#timer_start").hide();
    var x = setInterval(function(){
        distance = 3600*hour+60*min+sec;
        console.log(distance);
        distance-=1;
        console.log(distance);
        firebase.database().ref("timer").set({
            hour:Math.floor(distance/3600),
            min:Math.floor((distance%3600)/60),
            sec:Math.floor(distance%60)
        });
        console.log(distance);
        hour=Math.floor(distance/3600);
        min=Math.floor((distance%3600)/60);
        sec=Math.floor(distance%60);
        document.getElementById('timer_pause').onclick = function(){
            document.getElementById("timer_start").innerText="Resume";
            $("#timer_pause").hide();
            $("#timer_start").show();
            clearInterval(x);
        };
        document.getElementById("timer_stop").onclick = function(){
            distance=-1;
            firebase.database().ref("timer").set({
                hour:Math.floor(distance/3600),
                min:Math.floor((distance%3600)/60),
                sec:Math.floor(distance%60)
            });
            clearInterval(x);
            $("#timer_pause,#timer_stop").hide();
            $("#timer_start").show();
            document.getElementById("timer_start").innerText="Start";
            alert("timer stop");
        };
        if(distance-1<0){
            clearInterval(x);
            $("#timer_pause,#timer_stop").hide();
            $("#timer_start").show();
            document.getElementById("timer_start").innerText="Start";
            alert("timer stop");
        }
    },1000);
}