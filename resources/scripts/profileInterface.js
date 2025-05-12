function toggleRadio(radio)
{
	if($(radio).prop("data-active"))
	{
		$(radio).prop("data-active",false);
		$(radio).prop("checked",false);
	}
	else
	{
		$("input[name='"+$(radio).prop("name")+"']").prop("data-active",false);
		$(radio).prop("data-active",true);
	}
}

function mlEnter(event)
{
	event.preventDefault();

	if(event.key === "Enter")
	{
		mlLogin(event);
	}
}

function mlLogin(event)
{
	event.preventDefault();

	if(($("#mlEmail").val() === "") || ($("#mlPass").val() === ""))
	{
		alert("Please fill both fields!");
	}
	else
	{
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
}

function processLogin(loginData)
{
	if(loginData["result"] !== "pass")
	{
		console.log(loginData);
		alert("Login Failed! Please Try Again");

		$("#mlEmail").prop("readonly",false);
		$("#mlPass").prop("readonly",false);

		$("#load").addClass("hidden");
	}
	else
	{
		$("#charSelectModal .modalBodyText").html("");

		if(loginData["charList"].count > 1)
		{
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
		else
		{
			selectCharacter(loginData["charList"][0]["charID"]);
		}
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

			$("#mlPass").val("");
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

	$("#payloadCharName").html(charData.name);
	$("#payloadCharName").attr("data-id", charData.id);
	setClamp($("#payloadCharName"),"100%","200%");

	$("#payloadCodeRow .FG").html(charData.userCode);

	let funcStrings = {
		initial: "",
		active: "",
		passive: ""
	};

	charData.functions.forEach(function(func)
	{
		let romanRank = "";

		if(func.type === "ranked")
		{
			switch(func.rank)
			{
				case("1"):
					romanRank = " I";
					break;
				case("2"):
					romanRank = " II";
					break;
				case("3"):
					romanRank = " III";
					break;
				case("4"):
					romanRank = " IV";
					break;
				default: //5+
					romanRank = " V";
			}
		}

		funcStrings[func.hacking_cat] += "<li>" + func.name + romanRank +"</li>"
	});

	Object.keys(funcStrings).forEach(function(category)
	{
		$("#" + category + "List").html(funcStrings[category]);

		$("#" + category + "Header").removeClass("hidden");
		$("#" + category + "List").removeClass("hidden");
	});

	// NEW FUNCTIONS

	srRoles = [];

	charData.selfReport.forEach(function(func)
	{
		if((func["role_name"] !== "Standard") && (!srRoles.includes(func["role_name"])))
		{
			srRoles.push(func["role_name"]);
		}

		$(".checkGroup input[data-id='" + func["id"] + "']").prop("checked",true);
	});

	console.log(srRoles);

	$("#primaryRole > option[value='" + srRoles[0] + "']").prop("selected",true);
	$("#secondaryRole > option[value='" + srRoles[1] + "']").prop("selected",true);

	roleChange();

	// END NEW FUNCTIONS

	charData["items"].forEach(function(itemID)
	{
		let inputID = "#item_" + itemID;

		$(inputID).prop("checked",true);
		$("input[name='"+$(inputID).prop("name")+"']").prop("data-active",false);
		$(inputID).prop("data-active",true);
	});

	$("#load").addClass("hidden");

	$("#mlPass").val("");

	$(".postLogon").removeClass("hidden");
	$(".mlLoginBox").addClass("hidden");
}

/*
function statSubmit(event)
{
    event.preventDefault();

	$("#saveText").html("SAVING...");
	$("#saveText").removeClass("hidden");
	
	// LIST OF ITEMS
	let items = [];
	$("#itemBox input:checked").each(function() {
		items.push(Number($(this).attr("data-id")));
	});

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources\\scripts\\db\\updateInventory.php",
		data:
		{
			userID: $("#payloadCharName").attr("data-id"),
			items: items
		}
	})
	.done(function()
	{
		$("#saveText").html("SAVED!");
	
		setTimeout(function(){
			$("#saveText").addClass("hidden");
		},5000);
	});
}
*/

function openTab(event, tabName)
{
	$(".profContent").addClass("hidden");
	$(".profTab").removeClass("active");
	
	if($(event.currentTarget).parent().hasClass("backRow"))
	{
		$("#profTabContainer").css("flex-direction","column");
	}
	else
	{
		$("#profTabContainer").css("flex-direction","column-reverse");
	}
	
	$("#"+tabName).removeClass("hidden");
	$(event.currentTarget).addClass("active");
}

function roleChange()
{
	let priRole = $("#primaryRole")[0].selectedOptions[0].value;
	let secRole = $("#secondaryRole")[0].selectedOptions[0].value;
	
	$("#primaryRole > option").prop("hidden",false);
	$("#secondaryRole > option").prop("hidden",false);
	
	switch (priRole)
	{
		case "other":
		case "none":
			$("#priButton").html("PRIMARY");
			break;
		default:
			$("#secondaryRole > option[value='" + priRole + "']").prop("hidden",true);
			$("#priButton").html(priRole.toUpperCase());
	}
	
	switch (secRole)
	{
		case "other":
		case "none":
			$("#secButton").html("SECONDARY");
			break;
		default:
			$("#primaryRole > option[value='" + secRole + "']").prop("hidden",true);
			$("#secButton").html(secRole.toUpperCase());
	}
	
	$("#priTab .checkGroup").addClass("hidden");
	$("#priTab .checkGroup[data-role='" + priRole + "']").removeClass("hidden");
	
	$("#secTab .checkGroup").addClass("hidden");
	$("#secTab .checkGroup[data-role='" + secRole+"']").removeClass("hidden");
	
	$("#priTab .checkGroup:not([data-role='"+priRole+"']) input[type='checkbox']").prop("checked",false);
	$("#secTab .checkGroup:not([data-role='"+secRole+"']) input[type='checkbox']").prop("checked",false);
}

function statSubmit(event)
{
	event.preventDefault();

	$("#saveText").html("SAVING...");
	$("#saveText").removeClass("hidden");

	// LIST OF FUNCTIONS
	let funcs = [];
	$(".checkGroup input:checked").each(function() {
		funcs.push(Number($(this).attr("data-id")));
	});
	
	// LIST OF ITEMS
	let items = [];
	$(".itemSelect input:checked").each(function() {
		items.push(Number($(this).attr("data-id")));
	});

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources\\scripts\\db\\updateSelfReport.php",
		data:
		{
			userID: $("#payloadCharName").attr("data-id"),
			funcs: funcs,
			items: items
		}
	})
	.done(function()
	{
		$("#saveText").html("SAVED!");
	
		setTimeout(function(){
			$("#saveText").addClass("hidden");
		},5000);
	});
}