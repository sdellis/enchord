// functions for validating forms

/* check whether valid email according to RFC822 
 * Licensed under a Creative Commons Attribute-ShareAlike 2.5 License,
 * or the GPL */ 
function isRFC822ValidEmail(sEmail) {
  var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
  var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
  var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
  var sQuotedPair = '\\x5c[\\x00-\\x7f]';
  var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
  var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
  var sDomain_ref = sAtom;
  var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
  var sWord = '(' + sAtom + '|' + sQuotedString + ')';
  var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
  var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
  var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
  var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
  
  var reValidEmail = new RegExp(sValidEmail);
  
  if (reValidEmail.test(sEmail)) {
    return true;
  }
  
  return false;
}

function validateLoginForm()
{
	var isValid = true;
	var username=document.getElementById('username').value.trim();
	var password=document.getElementById('password').value.trim();
	var emptyFieldError = '<span class="help-block" id="empty_error">This field cannot be empty!</span>';

	if (username.length == 0) {
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
		if ($('#password_group .help-block#empty_error').length == 0) {
			$('#password_group').append(emptyFieldError);
		}
		isValid = false;
	} else {
		$('#password_group').removeClass('has-error');
		$('#password_group .help-block#empty_error').remove();
	}
	return isValid;
}

function validateSignupForm()
{
	var isValid = true;
	var username=document.getElementById('username').value.trim();
	var email=document.getElementById('email').value.trim();
	var password=document.getElementById('password').value.trim();
	var passwordRepeat=document.getElementById('password_repeat').value.trim();
	var emptyFieldError = '<span class="help-block" id="empty_error">This field cannot be empty!</span>';
	var invalidEmailError = '<span class="help-block" id="invalidemail_error">Please enter a valid email address.</span>';	
	var shortPassError = '<span class="help-block" id="shortpass_error">Password must be at least 8 characters long.</span>';
	var passwordMatchError = '<span class="help-block" id="passwordmatch_error">Your passwords do not match!</span>';

	if (username.length == 0) {
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
	if (email.length == 0) {
		$('#email_group').addClass('has-error');
		$('#email_group .help-block#invalidemail_error').remove();
		if ($('#email_group .help-block#empty_error').length == 0) {
			$('#email_group').append(emptyFieldError);
		}
		isValid = false;
	} else if (!isRFC822ValidEmail(email)) {
		$('#email_group').addClass('has-error');
		$('#email_group .help-block#empty_error').remove();
		if ($('#email_group .help-block#invalidemail_error').length == 0) {
			$('#email_group').append(invalidEmailError);
		}
		isValid = false;
	} else {
		$('#email_group').removeClass('has-error');
		$('#email_group .help-block#empty_error').remove();
		$('#email_group .help-block#invalidemail_error').remove();
	}
	if (passwordRepeat.length==0) {
		$('#password_repeat_group').addClass('has-error');
		$('#password_repeat_group .help-block#passwordmatch_error').remove();
		if ($('#password_repeat_group .help-block#empty_error').length == 0) {
			$('#password_repeat_group').append(emptyFieldError);
		}
		isValid = false;
	} else if (password.length >= 8 && passwordRepeat != password) {
		$('#password_repeat_group').addClass('has-error');
		$('#password_repeat_group .help-block#empty_error').remove();
		if ($('#password_repeat_group .help-block#passwordmatch_error').length == 0) {
			$('#password_repeat_group').append(passwordMatchError);
		}
		isValid = false;
	} else {
		$('#password_repeat_group').removeClass('has-error');
		$('#password_repeat_group .help-block#empty_error').remove();
		$('#password_repeat_group .help-block#passwordmatch_error').remove();
	}
	return isValid;
}