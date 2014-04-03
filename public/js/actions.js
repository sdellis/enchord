$(document).ready(function() {
	resized();
	$(window).resize(function() {
		resized();
	});
	$('.fancybox-media').fancybox({
		openEffect  : 'fade',
		closeEffect : 'fade',
		openSpeed	: 'fast',
		closeSpeed	: 'fast',
		helpers : {
			media : {}
		}
	});
	$('form').bind("keyup keypress", function(e) {
		var code = e.keyCode || e.which; 
		if (code  == 13) {
			$("input[type=email]").blur();
			mailchimp();		  
			e.preventDefault();
			return false;
		}
	});
	$('#submit').live('click',function() {
		mailchimp();
	});
});
function mailchimp() {
	$("#top #form #submit").html('<br><img src="images/loading.gif">');
	$("#top #form #submit img").show();
				
	var serializeme = $("form").serialize();
	var serializemetwo = serializeme.replace(/\n/g, "<br>");
	$.ajax({
		type: "POST",
		url: "#",
		data: serializemetwo,
		success: function(p) {
			var output = JSON.parse(p);
			var timeout = 3000;
			if (output.code == 200) {
				timeout = 7000;
				$("input[type=email]").blur().val('Email Address');
			}
			$("#message").html(output.message).fadeIn();
			setTimeout(function() { $("#message").fadeOut(); }, timeout);
			$("#top #form #submit").html('<br>&rarr;');
		}
	});
}
function resized() {
	$("#top").css('min-height',$("#top #content").height()+200);
	$("#top #content").css('margin-top',-$("#top #content").height()/2);
	$("#bottom").css('min-height',$("#bottom #content").height()+$("#bottom #iphone").height()+60);
	$("#bottom #iphone").css('margin-left',-$("#bottom #iphone").width()/2);
	$("#bottom #content").css('margin-top',(-$("#bottom #content").height()/2)-(($("#bottom #iphone").height())/2)+10);
}
function clearText(field){
	if (field.defaultValue == field.value) {
		field.value = '';
	} else if (field.value == '') {
		field.value = field.defaultValue;
	}
}