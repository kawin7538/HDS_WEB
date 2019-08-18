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
    if(3600*value['hour']+60*value['min']+value['sec']-1<0 && value['pressed']){
        alert("timer_stop");
    }
    document.getElementById("timer").innerText=zeroPad(value['hour'],10)+" : "+zeroPad(value['min'],10)+" : "+zeroPad(value['sec'],10);
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
        var table=document.getElementById('score_table');
        var rows=table.insertRow();
//        rows.insertCell(0).innerHTML=value['effect'];
//        if(value['punished_time']>0 && value['effect']!=0){
//            // rows.cells[0].innerHTML+='(<span class="punished_timer">'+value['punished_time']+'</span>)';
//            rows.cells[0].innerHTML+='('+value['punished_time']+')';
//        }
        rows.insertCell(0).innerHTML=parseInt(row)+1;
        rows.insertCell(1).innerHTML=value['name'];
        for(var i=2;i<14;i++){
            rows.insertCell(i).innerHTML=value[i-1];
        }
        rows.insertCell(14).innerHTML=value['sum'];
    }
	
	//generating reduced table
	for(var row in dict){
		var value = dict[row][1];
		var reduced_table = document.getElementById('score_table_reduced');
		var reduced_rows = reduced_table.insertRow();
		reduced_rows.insertCell(0).innerHTML = parseInt(row)+1;
		reduced_rows.insertCell(1).innerHTML = value['name'];
		reduced_rows.insertCell(2).innerHTML = value['sum'];
	}
});
