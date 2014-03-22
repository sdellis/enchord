// functions for validating forms
function validateLoginForm()
{
	var isValid = true;
	var username=document.getElementById('username').value.trim();
	var password=document.getElementById('password').value.trim();
	var emptyFieldError = '<span class="help-block" id="empty_error">This field cannot be empty!</span>';

	$('#username_group .help-block#room_exist_error').remove();
		
	if (username.length == 0) {
		var cssclass = $('#username_group').attr('class');
		cssclass = cssclass + ' has-error'
		$('#username_group').addClass('has-error has-feedback');
		if ($('#username_group .help-block#empty_error').length == 0) { 
			$('#username_group').append(emptyFieldError);
		}
		isValid = false;
	} else {
		$('#username_group').removeClass('has-error');
		$('#username_group .help-block#empty_error').remove();
	}
	if (password.length == 0) {
		$('#password_group').addClass('has-error');
		$('#password_group .help-block#shortpass_error').remove();
		if ($('#password_group .help-block#empty_error').length == 0) {
			$('#password_group').append(emptyFieldError);
		}
		isValid = false;
	} else {
		$('#password_group').removeClass('has-error');
		$('#password_group .help-block#empty_error').remove();
		$('#password_group .help-block#shortpass_error').remove();
	}
	return isValid;
}
function validateSignupForm()
{
	var isValid = true;
	var username=document.getElementById('username').value.trim();
	var password=document.getElementById('password').value.trim();
	var emptyFieldError = '<span class="help-block" id="empty_error">This field cannot be empty!</span>';
	var shortPassError = '<span class="help-block" id="shortpass_error">Password must be at least 8 characters long.</span>';

	$('#username_group .help-block#room_exist_error').remove();
		
	if (username.length == 0) {
		var cssclass = $('#username_group').attr('class');
		cssclass = cssclass + ' has-error'
		$('#username_group').addClass('has-error has-feedback');
		if ($('#username_group .help-block#empty_error').length == 0) { 
			$('#username_group').append(emptyFieldError);
		}
		isValid = false;
	} else {
		$('#username_group').removeClass('has-error');
		$('#username_group .help-block#empty_error').remove();
	}
	if (password.length == 0) {
		$('#password_group').addClass('has-error');
		$('#password_group .help-block#shortpass_error').remove();
		if ($('#password_group .help-block#empty_error').length == 0) {
			$('#password_group').append(emptyFieldError);
		}
		isValid = false;
	} else if (password.length < 8) {
		$('#password_group').addClass('has-error');
		$('#password_group .help-block#empty_error').remove();
		if ($('#password_group .help-block#shortpass_error').length == 0) {
			$('#password_group').append(shortPassError);
		}
		isValid = false;
	} else {
		$('#password_group').removeClass('has-error');
		$('#password_group .help-block#empty_error').remove();
		$('#password_group .help-block#shortpass_error').remove();
	}
	return isValid;
}