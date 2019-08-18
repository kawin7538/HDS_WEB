// variable
var hour = 2;
var min = 0;
var sec = 0;
var pressed=false;
// initial loading
$(function(){
    $("#timer_pause,#timer_stop").hide();
    $("#lvl1used,#lvl2used,#lvl3used,#lvl4used").hide();
    $("#stunUndo,#DestroyUndo,#ShieldUndo,#CompletedUndo").hide();
    firebase.database().ref("timer").set({
        hour:hour,
        min:min,
        sec:sec,
        pressed:pressed
    });
})
// function that make 00, 05, 45
function zeroPad(nr,base){
    var  len = (String(base).length - String(nr).length)+1;
    return len > 0? new Array(len).join('0')+nr : nr;
}

// function that sort dict 
function sortProperties(obj)
{
  // convert object into array
	var sortable=[];
	for(var key in obj)
		if(obj.hasOwnProperty(key))
			sortable.push([key, obj[key]]); // each item is an array in format [key, value]
	
	// sort items by value
	sortable.sort(function(a, b)
	{
	  return a[1]['sum']>b[1]['sum'] ? -1 : a[1]['sum']<b[1]['sum'] ? 1 : a[1]['last_time']>b[1]['last_time'] ? -1 : a[1]['last_time']<b[1]['last_time'] ? 1 : 0;
	});
	return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

// show time 
var ref_timer=firebase.database().ref("timer");

ref_timer.on('value',function(snapshot){
    // console.log(snapshot.val());
    var value=snapshot.val();
    document.getElementById("timer").innerText=zeroPad(value['hour'],10)+" : "+zeroPad(value['min'],10)+" : "+zeroPad(value['sec'],10);
});

// show team table
var ref_team=firebase.database().ref('team');

ref_team.on('value',function(snapshot){
    var table=document.getElementById('score_table');
    for(var i = table.rows.length - 1; i > 0; i--)
    {
        table.deleteRow(i);
    }
    var table=document.getElementsByTagName('tbody')[0];
    var dict=snapshot.val();
    for(var key in dict){
        value=dict[key];
        var temp=0;
        for(var i=0;i<12;i++){
            temp+=value[i+1];
        }
        dict[key]['sum']=temp;
    }
    dict=sortProperties(dict);
    for(var row in dict){
        var value=dict[row][1];
        // var table=document.getElementById('score_table');
        var rows=table.insertRow();
        rows.insertCell(0).innerHTML="";
        if(value['punished_time']>0 && value['effect']!=0){
            // rows.cells[0].innerHTML+='(<span class="punished_timer">'+value['punished_time']+'</span>)';
            rows.cells[0].innerHTML+='('+value['punished_time']+')';
            if(value['effect']===3){
                rows.className="Shield_background";
                console.log('shield');
            }
        }
        else if(value['effect']==0){
            rows.className="Normal_background";
        }
        rows.insertCell(1).innerHTML=parseInt(row)+1;
        rows.insertCell(2).innerHTML=value['name'];
        for(var i=3;i<15;i++){
            rows.insertCell(i).innerHTML=value[i-2];
        }
        rows.insertCell(15).innerHTML=value['sum'];
        rows.insertCell(16).innerHTML="<button id=\'delete_"+value['name']+"\' onclick=\'delete_team(\""+value['name']+"\");\'>Delete</button>";
    }
    ref_team.once('value',function(snap555){
        snap555=snap555.val();
        setTimeout(function(){
            for(var key in snap555){
                if(snap555[key]['effect']!=0){
                    if(snap555[key]['punished_time']<=0){
                        ref_team.child(snap555[key]['name']).update({
                            effect:0
                        });
                    }
                    else{
                        ref_team.child(snap555[key]['name']).update({
                            punished_time:snap555[key]['punished_time']-1
                        });
                    }
                }
            }
        },1000);
    });
});

// show all names in dropdown
ref_team_name=firebase.database().ref("team_name");

ref_team_name.on('value',function(snapshot){
    $("#Stun_group,#Destroy_group,#Shield_group,#Completed_group").empty().append("<option value = ''>Select Group</option>");
    var dict=snapshot.val();
    for(var key in dict){
        $("#Stun_group,#Destroy_group,#Shield_group,#Completed_group").append($("<option></option>").attr("value",key).text(key));
    }
});

// activate when press save button 
function save_timer(){
    hour = parseInt(document.getElementById("hour").value);
    min = parseInt(document.getElementById("min").value);
    sec = parseInt(document.getElementById("sec").value);
    firebase.database().ref("timer").set({
        hour:hour,
        min:min,
        sec:sec,
        pressed:pressed
    });
    document.getElementById("hour").value="";
    document.getElementById("min").value="";
    document.getElementById("sec").value="";
    // document.getElementById("timer").innerText = zeroPad(hour,10)+" : "+zeroPad(min,10)+" : "+zeroPad(sec,10);
}

// function that click Start , pause, stop 
function timer_start(){
    pressed=true;
    $("#timer_pause,#timer_stop").show();
    $("#timer_start").hide();
    var x = setInterval(function(){
        distance = 3600*hour+60*min+sec;
        console.log(distance);
        distance-=1;
        console.log(distance);
        firebase.database().ref("timer").update({
            hour:Math.floor(distance/3600),
            min:Math.floor((distance%3600)/60),
            sec:Math.floor(distance%60),
            pressed:pressed
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
            if(pressed){
                distance=-1;
                firebase.database().ref("timer").update({
                    hour:Math.floor(distance/3600),
                    min:Math.floor((distance%3600)/60),
                    sec:Math.floor(distance%60)
                });
                clearInterval(x);
                $("#timer_pause,#timer_stop").hide();
                $("#timer_start").show();
                document.getElementById("timer_start").innerText="Start";
                alert("timer stop");
            }
        };
        if(distance-1<0 && pressed){
            clearInterval(x);
            $("#timer_pause,#timer_stop").hide();
            $("#timer_start").show();
            document.getElementById("timer_start").innerText="Start";
            alert("timer stop");
        }
    },1000);
}
// function activate when save new team 
$(function(){
    $("#add_team_button").click(function(){
        var team_name=$("#team_name").val();
        if(team_name && team_name !== ""){
            var temp={};
            temp['effect']=0;
            temp['name']=team_name;
            for(var i=1;i<=12;i++){
                temp[i]=0;
            }
            temp['last_time']=0;
            temp['punished_time']=0;
            firebase.database().ref("team/"+team_name).set(temp);
            firebase.database().ref("team_name/"+team_name).set({
                name:team_name
            });
            document.getElementById("team_name").value="";
        }
    });
});

//function that delete team from competitions
function delete_team(team_name){
    ref_team.child(team_name).remove();
    ref_team_name.child(team_name).remove();
}

// function that send save completed mission to firebase
$(function(){
    $("#Completed").click(function(){
        var team_name=$("#Completed_group").val();
        var quest=$("#Completed_quest").val();
        //Collect old data
        var old_data={};
        ref_team.once('value',function(snap){
            old_data=snap.val()[team_name];
        });
        //Save new data to firebase
        var temp={};
        temp[quest]=1;
        ref_timer.on('value',function(snapshot){
            snapshot=snapshot.val();
            temp['last_time']=3600*snapshot['hour']+60*snapshot['min']+snapshot['sec'];
        });
        ref_team.child(team_name).update(temp);
        //Reset select and input
        $("#Completed_group")[0].selectedIndex = 0;
        $("#Completed_quest").val('');
        //Show undo button, function it and hide in 3 seconds
        $("#CompletedUndo").show();
        $("#CompletedUndo").click(function(){
            ref_team.child(team_name).update(old_data);
            //Text after undo (To Be Continued)
        });
        setTimeout(function(){
            $("#CompletedUndo").hide();
        },3000);
    });
});

// Function that save shield to group
$(function(){
    $("#Shield").click(function(){
        var team_name=$("#Shield_group").val();
        var duration=$("#Shield_effect").val();
        //Collect old data
        var old_data={};
        ref_team.once('value',function(snap){
            old_data=snap.val()[team_name];
        });
        //Push shield to group
        var temp={};
        temp['effect']=3;
        temp['punished_time']=parseInt(duration)*60;
        ref_team.child(team_name).update(temp);
        $("#Shield_group")[0].selectedIndex=0;
        $("#Shield_effect")[0].selectedIndex=0;
        //Show undo button, function it and hide in 3 seconds
        $("#ShieldUndo").show();
        $("#ShieldUndo").click(function(){
            ref_team.child(team_name).update(old_data);
            //Text after undo (To Be Continued)
        });
        setTimeout(function(){
            $("#ShieldUndo").hide();
        },3000);
    });
});