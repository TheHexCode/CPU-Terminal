import Utility from "/resources/scripts/utility/utility.js"
import Login from "/resources/scripts/profile/login/login.js"

console.log(Utility.romanize(15))

//////////////////////////////////////////////////////////////////
/// LOGIN PROMPT
//////////////////////////////////////////////////////////////////

function lmEnter(event)
{
	event.preventDefault();

	if(event.key === "Enter")
	{
		lmLogin(event);
	}
}

function lmLogin(event)
{
	event.preventDefault();

    Login.checkForm();
}