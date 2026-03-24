import Modal from "/resources/scripts/utility/modal.js"

export default class Login
{
    static checkForm()
    {
        if(($("#lmEmail").val() === "") || ($("#lmPass").val() === ""))
        {
            alert("Please fill both fields!");
        }
        else
        {
            $("#load").removeClass("hidden");

            $("#lmEmail").prop("readonly",true);
            $("#lmPass").prop("readonly",true);
            lmEmail = $("#lmEmail").val();
            lmPass = $("#lmPass").val();

            Login.logIntoLM(lmEmail, lmPass);
        }
    }

    static logIntoLM(userEmail, userPass)
    {
        $.ajax({
			type: "POST",
			dataType: "json",
			url: "resources/scripts/profile/larpmanager/lmLogin.php",
			data:
			{
				lmEmail: lmEmail,
				lmPass: lmPass
			}
		})
		.done(function(response)
		{
			Login.processLogin(response);
		})
		.fail(function(response)
		{
			console.log(response);
			alert("Login Failed! Please Try Again");

			$("#lmEmail").prop("readonly",false);
			$("#lmPass").prop("readonly",false);

			$("#load").addClass("hidden");
		});
    }

    static processLogin(loginResponse)
    {
        let modal = new Modal("charSelectModal");
        $("#charSelectModal .modalBodyText").html("");

        if(loginResponse.length > 1)
        {
            loginResponse.forEach(function(character, index)
            {
                let buttonID = "char" + index;
                $("#charSelectModal .modalBodyText").append("<button id='" + buttonID + "' class='modalButton'>[ " + character["name"] + " ]</button>");

                $("#" + buttonID).bind("pointerup", function()
                {
                    selectCharacter(character);
                });
            });

            $("#charSelectModal").width($("#main").width());

            $("#charSelectModal .modalHeaderText").html("SELECT CHARACTER PROFILE");

            $("#load").addClass("hidden");
            $("#modalBG").css("display","flex");
        }
        else
        {
            selectCharacter(loginResponse[0]);
        }
    }
}