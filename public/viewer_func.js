var ref_timer=firebase.database().ref("timer");

function zeroPad(nr,base){
    var  len = (String(base).length - String(nr).length)+1;
    return len > 0? new Array(len).join('0')+nr : nr;
}

ref_timer.on('value',function(snapshot){
    // console.log(snapshot.val());
    var value=snapshot.val();
    if(3600*value['hour']+60*value['min']+value['sec']-1<0){
        alert("timer_stop");
    }
    document.getElementById("timer").innerText=zeroPad(value['hour'],10)+" : "+zeroPad(value['min'],10)+" : "+zeroPad(value['sec'],10);
});