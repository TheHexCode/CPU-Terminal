function roleChange()
{
    $(".shownStat").addClass("hiddenStat");
	$(".shownStat").removeClass("shownStat");
	
	let priRole = $("#primaryRole")[0].selectedOptions[0];
	let secRole = $("#secondaryRole")[0].selectedOptions[0];
	
	$("#primaryRole > option").prop("hidden",false);
	$("#secondaryRole > option").prop("hidden",false);
	
	switch (priRole.value)
	{
		case "none":
		case "other":
			$("#priButton").html("PRIMARY");
			break;
		default:
			$("#secondaryRole > option[value='" + priRole.value + "']").prop("hidden",true);
			$("#priButton").html(priRole.text.toUpperCase());
	}
	
	switch (secRole.value)
	{
		case "none":
		case "other":
			$("#secButton").html("SECONDARY");
			break;
		default:
			$("#primaryRole > option[value='" + secRole.value + "']").prop("hidden",true);
			$("#secButton").html(secRole.text.toUpperCase());
	}
	
	$("#priTab .checkGroup").addClass("hidden");
	$("#priTab .checkGroup[data-role='" + priRole.value + "']").removeClass("hidden");
    $("#priTab .checkGroup:not([data-role='" + priRole.value + "']) input[type='checkbox']").prop("checked",false);
	
	$("#secTab .checkGroup").addClass("hidden");
	$("#secTab .checkGroup[data-role='" + secRole.value + "']").removeClass("hidden");
    $("#secTab .checkGroup:not([data-role='" + secRole.value + "']) input[type='checkbox']").prop("checked",false);
	
	//maskChange();
}

function openTab(target,tabName)
{
    $(".profContent").addClass("hidden");
	$(".profTab").removeClass("active");
	
	if($(target).parent().hasClass("backRow"))
	{
		$("#profTabContainer").css("flex-direction","column");
	}
	else
	{
		$("#profTabContainer").css("flex-direction","column-reverse");
	}
	
	$("#"+tabName).removeClass("hidden");
	$(target).addClass("active");
}

function statSubmit(event)
{
    event.preventDefault();
}

function mlLogin(event)
{
	event.preventDefault();

	$("#load").removeClass("hidden");

	$("#mlEmail").prop("readonly",true);
	$("#mlPass").prop("readonly",true);
	mlEmail = $("#mlEmail").val();
	mlPass = $("#mlPass").val();

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources\\scripts\\mylarp\\myLarpLogin.php",
		data:
		{
			mlEmail: mlEmail,
			mlPass: mlPass
		}
	})
	.done(function(response)
	{
		processLogin(response);
	});
}

function processLogin(loginData)
{
	console.log(loginData);

	if(loginData["result"] !== "pass")
	{
		console.log(loginData);
		alert("Login Failed! Please Try Again");
	}
	else
	{
		// If loginData["charList"].count > 1
		loginData["charList"].forEach(function(character, index)
		{
			let buttonID = "char" + index;
			$("#charSelectModal .modalBodyText").append("<button id='" + buttonID + "' class='modalButton'>[ " + character["charName"] + " ]</button>");

			$("#" + buttonID).bind("pointerup", function()
			{
				selectCharacter(character["charID"]);
			});
		});
		
		$("#charSelectModal").width($("#main").width());

		$("#charSelectModal .modalHeaderText").html("SELECT CHARACTER PROFILE");
		
		$("#load").addClass("hidden");
		$("#modalBG").css("display","flex");
	}
}

function closeModal(event)
{
	if((event.type !== "keyup") || (event.key === "Escape"))
	{
		$("#modalBG").css("display","none");
		
		$("#charListModal .modalHeaderText").html("");

		$("#charListModal .modalBodyText").html("");

		if(event !== "selected")
		{
			$("#mlEmail").prop("readonly",false);
			$("#mlPass").prop("readonly",false);
		}
	}
}

function selectCharacter(charID)
{
	$("#load").removeClass("hidden");
	closeModal("selected");

	mlEmail = $("#mlEmail").val();
	mlPass = $("#mlPass").val();
	mlCharID = charID;

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources\\scripts\\mylarp\\myLarpChar.php",
		data:
		{
			mlEmail: mlEmail,
			mlPass: mlPass,
			mlCharID: mlCharID
		}
	})
	.done(function(response)
	{
		processCharInfo(response);
	});
}

function processCharInfo(charData)
{
	console.log(charData);

	$("#load").addClass("hidden");
}