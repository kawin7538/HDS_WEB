// function to show in 00, 04 , 56
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

//show time
var ref_timer=firebase.database().ref("timer");

ref_timer.on('value',function(snapshot){
    // console.log(snapshot.val());
    var value=snapshot.val();
    if(value['distance']-1<0 ){
        alert("timer_stop");
    }
    document.getElementById("timer").innerText=zeroPad(Math.floor(value['distance']/3600),10)+" : "+zeroPad(Math.floor((value['distance']%3600)/60),10)+" : "+zeroPad(Math.floor(value['distance']%60),10);
});

// show team table
var ref_team=firebase.database().ref('team');

ref_team.on('value',function(snapshot){
    var table=document.getElementById('score_table');
    
	//generating full table
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
        rows.insertCell(1).innerHTML=parseInt(row)+1;
        rows.insertCell(2).innerHTML=value['name'];
        for(var i=3;i<15;i++){
            rows.insertCell(i).innerHTML=value[i-2];
        }
        rows.insertCell(15).innerHTML=value['sum'];
    }
	
//	generating reduced table
	var reduced_table = document.getElementById('score_table_reduced');
	for(var i = reduced_table.rows.length - 1; i > 0; i--)
    {
        reduced_table.deleteRow(i);
    }
    reduced_table = document.getElementById('score_table_reduced').getElementsByTagName("tbody")[0];
	for(var row in dict){
		var value = dict[row][1];
		var reduced_rows = reduced_table.insertRow();
		reduced_rows.insertCell(0).innerHTML = parseInt(row)+1;
		reduced_rows.insertCell(1).innerHTML = value['name'];
		reduced_rows.insertCell(2).innerHTML = value['sum'];
	}
});

// show effect from group
ref_skill = firebase.database().ref("skill");

ref_skill.on('value',function(snapshot){
    snapshot=snapshot.val();
    var table = document.getElementById("score_table").getElementsByTagName('tbody')[0];
    var row_length = table.rows.length;
    setTimeout(function(){
        for(var i = 0; i<row_length;i++){
            var rows = table.rows[i];
            var team_name=rows.cells[2].innerHTML;
            // console.log(snapshot[team_name]['type'],parseInt(snapshot[team_name]['type']));
            if(snapshot[team_name]['type'] && parseInt(snapshot[team_name]['type'])!=0 && parseInt(snapshot[team_name]['type'])!=3){
                rows.cells[0].innerHTML=snapshot[team_name]['skill_time'];
                if(parseInt(snapshot[team_name]['type'])===1){
                    rows.className="Stun_background";
                }
                else if(parseInt(snapshot[team_name]['type'])===2){
                    rows.className="Destroy_background";
                }
            }
            else{
                rows.cells[0].innerHTML="";
                rows.className="Normal_background";
            }
            //for reduced table
            var reduce_table=document.getElementById("score_table_reduced").getElementsByTagName('tbody')[0];
            rows = reduce_table.rows[i];
            team_name=rows.cells[1].innerHTML;
            // console.log(snapshot[team_name]['type'],parseInt(snapshot[team_name]['type']));
            if(snapshot[team_name]['type'] && parseInt(snapshot[team_name]['type'])!=0 && parseInt(snapshot[team_name]['type'])!=3){
                // rows.cells[0].innerHTML=snapshot[team_name]['skill_time'];
                if(parseInt(snapshot[team_name]['type'])===1){
                    rows.className="Stun_background";
                }
                else if(parseInt(snapshot[team_name]['type'])===2){
                    rows.className="Destroy_background";
                }
            }
            else{
                // rows.cells[0].innerHTML="";
                rows.className="Normal_background";
            }
        }
    },1000);
    
});

//function that show game status
ref_game_status = firebase.database().ref("game_status");

ref_game_status.on('value',function(snapshot){
    snapshot=snapshot.val();
    //snapshot will contain one of three words, pause, running and stop
});

//function that show card remain
ref_card = firebase.database().ref("card");

ref_card.on('value',function(snapshot){
    snapshot = snapshot.val();
    //It has 8 children e.g. 1_max, 1_used, 2_max, ... ,4_used in this snapshot

});

//RGB channel function
function rgb(r,g,b){
	var red = zeroPad(Math.floor(r).toString(16),16);
	var green = zeroPad(Math.floor(g).toString(16),16);
	var blue = zeroPad(Math.floor(b).toString(16),16);
	return ["#",red,green,blue].join('');
}

//change a color of timer
$(function(){
ref_timer.on('value',function(checker){
	var value = checker.val();
	var time_remain = value['distance'];
	if (time_remain > 7200){
		$('#timer').css("color",rgb(0,255,0));
	}
	else{
		var red = (1-time_remain/7200)*255;
		var green = (time_remain/7200)*255;
		$("#timer").css("color",rgb(red,green,0));
	}
});
});