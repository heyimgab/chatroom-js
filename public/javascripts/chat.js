$(document).ready(function(e) {
	$(window).keydown(function(e){
		if(e.keyCode == 116)
		{
			if(!confirm("Toutes les données sur cette pages seront perdues, êtes vous sûr de continuer ?"))
			{
				e.preventDefault();
			}
		}
  });
	var from = $.cookie('user');
	var to = 'all';
	$("#input_content").html("");
	if (/Firefox\/\s/.test(navigator.userAgent)){
	    var socket = io.connect({transports:['xhr-polling']}); 
	} 
	else if (/MSIE (\d+.\d+);/.test(navigator.userAgent)){
	    var socket = io.connect({transports:['jsonp-polling']}); 
	} 
	else { 
	    var socket = io.connect(); 
	}
	socket.emit('online',JSON.stringify({user:from}));
	socket.on('disconnect',function(){
		var msg = '<div style="color:#f00"> ! Déconnecté du serveur.</div>';
		addMsg(msg);
		$("#list").empty();
	});
	socket.on('reconnect',function(){
		socket.emit('online',JSON.stringify({user:from}));
		var msg = '<div style="color:#f00"> ! Reconnexion en cours...</div>';
		addMsg(msg);
	});
	socket.on('system',function(data){
		var data = JSON.parse(data);
		var time = getTimeShow(data.time);
		var msg = '';
		if(data.type =='online')
		{
			msg += data.msg +' est connecté！';
		} else if(data.type =='offline')
		{
			msg += data.msg +' est hors ligne！';
		} else if(data.type == 'in')
		{
			msg += 'Vous êtes connecté！';
		} else
		{
			msg += 'Refresh page please.';
		}
		var msg = '<div style="color:#f00">Il est '+time+': '+msg+'</div>';
		addMsg(msg);
		play_ring("/ring/online.mp3");
	});
	socket.on('userflush',function(data){
		var data = JSON.parse(data);
		var users = data.users;
		flushUsers(users);
	});
	socket.on('say',function(msgData){
		var time = msgData.time;
		time = getTimeShow(time);
		var data = msgData.data;
		if (data.to=='all') {
			addMsg('<div>'+data.from+' à ('+time+') ：<br/>'+data.msg+'</div>');
		} else if(data.from == from) {
			addMsg('<div>('+time+')'+data.to+' ：<br/>'+data.msg+'</div>');
		} else if(data.to == from)
		{
			addMsg('<div>'+data.from+' à ('+time+') ：<br/>'+data.msg+'</div>');
			play_ring("/ring/msg.mp3");
		}
	});

	function addMsg(msg){
	  $("#contents").append(msg);
	  $("#contents").append("<br/>");
	  $("#contents").scrollTop($("#contents")[0].scrollHeight);
	}
	function flushUsers(users)
	{
		var ulEle = $("#list");
		ulEle.empty();
		ulEle.append('<li title="Double clique pour commencer à discuter" alt="all" onselectstart="return false">à Tous</li>');
		for(var i = 0; i < users.length; i ++)
		{
			ulEle.append('<li alt="'+users[i]+'" title="Double clique pour commencer à discuter" onselectstart="return false">'+users[i]+'</li>')
		}
			// Double-clic pour parler en MP
		$("#list > li").dblclick(function(e){
			if($(this).attr('alt') != from)
			{
				to = $(this).attr('alt');
				show_say_to();
			}
		});
		show_say_to();
	}
	$("#input_content").keydown(function(e) {
	  if(e.shiftKey && e.which==13){
		$("#input_content").append("<br/>");
	  } else if(e.which == 13)
	  {
		e.preventDefault();
			say();
	  }
	});
	$("#say").click(function(e){
		say();
	});
	function say()
	{
		if ($("#input_content").html() == "") {
			return;
		}
		socket.emit('say',JSON.stringify({to:to,from:from,msg:$("#input_content").html()}));
	  $("#input_content").html("");
	  $("#input_content").focus();
	}
	function show_say_to()
	{
		$("#from").html(from);
		$("#to").html(to=="all" ? "" : to);
		var users = $("#list > li");
		for(var i = 0; i < users.length; i ++)
		{
			if($(users[i]).attr('alt')==to)
			{
				$(users[i]).addClass('sayingto');
			}
			else
			{
				$(users[i]).removeClass('sayingto');
			}
		}
	}
	function play_ring(url){
		var embed = '<embed id="ring" src="'+url+'" loop="0" autostart="true" hidden="true" style="height:0px; width:0px;0px;"></embed>';
		$("#ring").html(embed);
	}
	function getTimeShow(time)
	{
		var dt = new Date(time);
		time = dt.getFullYear() + '-' + (dt.getMonth()+1) + '-' + dt.getDate() + ' '+dt.getHours() + ':' + (dt.getMinutes()<10?('0'+ dt.getMinutes()):dt.getMinutes()) + ":" + (dt.getSeconds()<10 ? ('0' + dt.getSeconds()) : dt.getSeconds());
		return time;
	}
	$.cookie('isLogin',true);
});
