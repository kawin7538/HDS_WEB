// variable
var distance = 2*3600;
var pressed=false;
// initial loading
$(function(){
    $("#timer_pause,#timer_stop").hide();
    $("#lvl1used,#lvl2used,#lvl3used,#lvl4used").hide();
    $("#stunUndo,#DestroyUndo,#ShieldUndo,#CompletedUndo").hide();
    $("#Destroy_modal").hide();
    $("#Destroy_confirm").prop('disabled',true);
    firebase.database().ref("timer").set({
        distance:distance
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
    var value=snapshot.val();
    document.getElementById("timer").innerText=zeroPad(Math.floor(value['distance']/3600),10)+" : "+zeroPad(Math.floor((value['distance']%3600)/60),10)+" : "+zeroPad(Math.floor(value['distance']%60),10);
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
        var rows=table.insertRow();
        rows.insertCell(0).innerHTML="";
        rows.insertCell(1).innerHTML=parseInt(row)+1;
        rows.insertCell(2).innerHTML=value['name'];
        for(var i=3;i<15;i++){
            rows.insertCell(i).innerHTML=value[i-2];
        }
        rows.insertCell(15).innerHTML=value['sum'];
        rows.insertCell(16).innerHTML="<button id=\'delete_"+value['name']+"\' onclick=\'delete_team(\""+value['name']+"\");\'>Delete</button>";
    }
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

// show effect from group
ref_skill = firebase.database().ref("skill");

ref_skill.on('value',function(snapshot){
    snapshot=snapshot.val();
    var table = document.getElementsByTagName('tbody')[0];
    var row_length = table.rows.length;
    setTimeout(function(){
        for(var i = 0; i<row_length;i++){
            var rows = table.rows[i];
            team_name=rows.cells[2].innerHTML;
            // console.log(table.rows[i].cells[2].innerHTML);
            // console.log(snapshot[team_name]['type'],parseInt(snapshot[team_name]['type']));
            if(snapshot[team_name]['type'] && parseInt(snapshot[team_name]['type'])!=0){
                rows.cells[0].innerHTML=snapshot[team_name]['skill_time'];
                if(snapshot[team_name]['type']===3){
                    rows.className="Shield_background";
                }
                else if(snapshot[team_name]['type']===2){
                    rows.className="Destroy_background";
                }
                else if(snapshot[team_name]['type']===1){
                    rows.className="Stun_background";
                }
                if(parseInt(snapshot[team_name]['skill_time'])<=0){
                    ref_skill.child(team_name).update({
                        type: 0,
                        skill_time: 0
                    });
                }
                else{
                    ref_skill.child(team_name).update({
                        skill_time:parseInt(snapshot[team_name]['skill_time'])-1
                    });
                }
            }
            else{
                rows.cells[0].innerHTML="";
                rows.className="Normal_background";
            }
        }
    },1000);
    
});


// activate when press save button 
function save_timer(){
    var hour = parseInt(document.getElementById("hour").value || 0);
    var min = parseInt(document.getElementById("min").value || 0);
    var sec = parseInt(document.getElementById("sec").value || 0);
    firebase.database().ref("timer").set({
        distance: hour*3600+min*60+sec
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
    var temp_distance=0;
    ref_timer.once('value',function(snapshot){
        temp_distance=snapshot.val()['distance'];
    });
    var x = setInterval(function(){
        temp_distance-=1;
        ref_timer.update({
            distance:temp_distance
        });
        // hour=Math.floor(distance/3600);
        // min=Math.floor((distance%3600)/60);
        // sec=Math.floor(distance%60);
        document.getElementById('timer_pause').onclick = function(){
            document.getElementById("timer_start").innerText="Resume";
            $("#timer_pause").hide();
            $("#timer_start").show();
            clearInterval(x);
        };
        document.getElementById("timer_stop").onclick = function(){
            if(pressed){
                temp_distance=0;
                firebase.database().ref("timer").update({
                    distance:temp_distance
                });
                clearInterval(x);
                $("#timer_pause,#timer_stop").hide();
                $("#timer_start").show();
                document.getElementById("timer_start").innerText="Start";
                alert("timer stop");
            }
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
// function activate when save new team 
$(function(){
    $("#add_team_button").click(function(){
        var team_name=$("#team_name").val();
        if(team_name && team_name !== ""){
            var temp={};
            temp['name']=team_name;
            for(var i=1;i<=12;i++){
                temp[i]=0;
            }
            temp['last_time']=0;
            ref_team.child(team_name).set(temp);
            ref_team_name.child(team_name).set({
                name:team_name
            });
            ref_skill.child(team_name).set({
                type:0,
                skill_time:0
            });
            document.getElementById("team_name").value="";
        }
    });
});

//function that delete team from competitions
function delete_team(team_name){
    ref_team.child(team_name).remove();
    ref_team_name.child(team_name).remove();
    ref_skill.child(team_name).remove();
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
        ref_timer.once('value',function(snapshot){
            snapshot=snapshot.val();
            temp['last_time']=snapshot['distance'];
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
        ref_skill.once('value',function(snap){
            old_data=snap.val()[team_name];
        });
        //Push shield to group
        var temp={};
        temp['type']=3;
        temp['skill_time']=parseInt(duration)*60;
        ref_skill.child(team_name).update(temp);
        $("#Shield_group")[0].selectedIndex=0;
        $("#Shield_effect")[0].selectedIndex=0;
        //Show undo button, function it and hide in 3 seconds
        $("#ShieldUndo").show();
        $("#ShieldUndo").click(function(){
            ref_skill.child(team_name).update(old_data);
            //Text after undo (To Be Continued)
        });
        setTimeout(function(){
            $("#ShieldUndo").hide();
        },3000);
    });
});

// function that send stun to group
$(function(){
    $("#stun").click(function(){
        var team_name=$("#Stun_group").val();
        var skill=0;
        var temp={};
        var old_data={};
        ref_skill.once('value',function(snapshot){
            snapshot=snapshot.val();
            old_data=snapshot[team_name];
            skill=parseInt(snapshot[team_name]['type']);
            temp['skill_time']=parseInt(snapshot[team_name]['skill_time']);
        });
        if(skill!==3){
            var stun_duration=$("#Stun_effect").val();
            temp['skill_time']+=parseInt(stun_duration);
            temp['type']=1;
            ref_skill.child(team_name).update(temp);
        }
        else{
            return ;
        }
        $("#Stun_group")[0].selectedIndex=0;
        $("#Stun_effect")[0].selectedIndex=0;
        $("#stunUndo").show();
        $("#stunUndo").click(function(){
            ref_skill.child(team_name).update(old_data);
            $("#stunUndo").hide();
        });
        setTimeout(function(){
            $("#stunUndo").hide();
        },3000);
    });
});

// function that send destroy to group, continue to level selection
$(function(){
    $("#Destroy").click(function(){
        var team_name = $("#Destroy_group").val();
        var count=$("#Destroy_effect").val();
        //collect old data , for undo
        var old_data={};
        ref_team.once("value",function(snapshot){
            snapshot=snapshot.val();
            old_data=snapshot[team_name];
        });
        if(team_name && team_name!=="" && count && count!==""){
            $("#Destroy_level").empty();
            $("#Destroy_confirm").prop('disabled',true);
            //check all completed mission
            var sum=0;
            for(var i = 1 ; i<=12;i++){
                if(old_data[i]==1){
                    sum+=1;
                    var inputt="<li><input type='checkbox' name='Destroy_level_checkbox' value='"+i.toString()+"'>"+i.toString()+"</li>";
                    $("#Destroy_level").append(inputt);
                }
            }
            // if must destroy all level , disable form
            if(sum<=count){
                $("input[name='Destroy_level_checkbox']").prop('checked',true).prop('disabled',true);
                $("#Destroy_confirm").prop('disabled',false);
            }
            //in the other case
            else{
                //check if you click less , equal or over from quota
                $("input[name='Destroy_level_checkbox']").on('change', function (e) {
                    if ($('input[type=checkbox]:checked').length > count) {
                        $(this).prop('checked', false);
                        alert("Over Quota Destroy");
                    }
                    else if($('input[type=checkbox]:checked').length == count){
                        $("#Destroy_confirm").prop('disabled',false);
                    }
                    else{
                        $("#Destroy_confirm").prop('disabled',true);
                    }
                });
            }
            $("#Destroy_modal").modal("show");
        }
    });
});

//function that comfirm destroy after choose level
$(function(){
    $("#Destroy_confirm").click(function(){
        var team_name = $("#Destroy_group").val();
        //collect old data , for undo
        var old_data={};
        ref_team.once("value",function(snapshot){
            snapshot=snapshot.val();
            old_data=snapshot[team_name];
        });
        var old_skill={};
        ref_skill.once("value",function(snapshot){
            snapshot=snapshot.val();
            old_skill=snapshot[team_name];
        });
        // set all value that check to 0
        var temp={};
        $("input[name='Destroy_level_checkbox']:checked").each( function () {
            // alert( $(this).val() );
            temp[$(this).val()]=0;
        });
        ref_team.child(team_name).update(temp);
        var temp={};
        temp['type']=2;
        temp['skill_time']=5;
        firebase.database().ref('skill').child(team_name).update(temp);
        $("#Destroy_group")[0].selectedIndex=0;
        $("#Destroy_effect")[0].selectedIndex=0;
        $("#Destroy_modal").modal('hide');
        $("#DestroyUndo").show();
        $("#DestroyUndo").click(function(){
            ref_team.child(team_name).update(old_data);
            ref_skill.child(team_name).update(old_skill);
            // $("#DestroyUndo").hide();
        });
        setTimeout(function(){
            $("#DestroyUndo").hide();
        },3000);
    });
});