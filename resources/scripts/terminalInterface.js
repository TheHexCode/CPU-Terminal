var session = new Session();
var payload = new Payload();

function tens(numStr)
{
	var tensFormat = new Intl.NumberFormat('en-US', { 
		minimumIntegerDigits: 2
	});
	
	return tensFormat.format(Number(numStr));
}

function codeLimit(event)
{
	if(event.target.value.length === 6)
	{
		if(event.key.match(/^.{1}$/))
		{
			event.preventDefault();
		}
	}
	else
	{
		if(event.key.match(/^.{1}$/) && event.key.match(/^[^0-9]$/))
		{
			event.preventDefault();
		}
	}
}

function activateCodeSubmit(target)
{
	if(target.value.length === 6)
	{
		$("#payloadCodeSubmit").prop("disabled",false);
	}
	else
	{
		$("#payloadCodeSubmit").prop("disabled",true);
	}
}

function submitCode(event)
{
	event.preventDefault();

	$("#payloadCodeInput").prop("readonly",true);

	$("#load").removeClass("hidden");

	ajaxCall = $.ajax({
		type: "POST",
		dataType: "json",
		url: "resources\\scripts\\db\\getUser.php",
		data:
		{
			userCode: $("#payloadCodeInput")[0].value
		}
	});
	
	ajaxCall.done(function(userData)
	{
		editTerminal(userData);
	});
}

function editTerminal(userPayload)
{
	if(userPayload.length === 0)
	{
		$("#payloadCodeInput").prop("readonly",false);
		alert("No Such User!");
	}
	else
	{
		console.log(userPayload);

		payload.setPayload(userPayload);

		$("#payloadBox").removeClass("noPayload");

		$("#payloadBox").html(	"<div id='payloadHeader' class='accessHeader'>" +
									"<u>CONNECTING USER IDENTIFIED</u>" +
								"</div>" +
								"<span>User: " + payload.getHandle() + "</span>" +
								( payload.getFunction("Mask") ? "<span>Mask: Spooky</span>" : "" ) +
								""//"<span>PIN: 333333</span>"
							);
		
		//tag management

		$("#hackDetails").html(
			"<span>[HACKING: +" + tens(payload.getFunction("Hacking") * 2) + "]</span>" +
			( payload.getFunction("Root Exploit") ? "<span>[ROOT EXP:+" + tens(payload.getFunction("Root Exploit") * 2) + "]</span>" : "" )
		)
		
		currentTags = payload.getFunction("Hacking") * 2;
		currentTags += payload.getFunction("Root Exploit") * 2;
		currentTags = Math.min(currentTags,10);

		$("#payTags").html(tens(currentTags));

		Gems.updateTagGems(Gems.ACCESS, 2, currentTags);
		//role stuff
	}

	$("#load").addClass("hidden");
}

function extraTags(change)
{

}

function accessTerminal()
{
    $("#accessZone").hide();
	$("#hackZone").css("display","flex");
}

function openTab(target, contentID)
{
	$(".hackTab.active").removeClass("active");
	$(".hackBody.active").removeClass("active");
	
	$($(target)).addClass("active");
	$("#" + contentID).addClass("active");
}

function openSubTab(target, contentID)
{
	$bodyID = $(target).parents(".hackBody")[0].id

    $("#" + $bodyID + " .subTab.active").addClass("inactive");
	$("#" + $bodyID + " .subTab.active").removeClass("active");
	$("#" + $bodyID + " .subContent.active").removeClass("active");
	
	$($(target)).removeClass("inactive");
	$($(target)).addClass("active");
	$("#" + contentID).addClass("active");
}

function logAction()
{

}

function entryAction(target)
{
	let action = target.classList[0].split("Button")[0];
	let entryID = target.dataset["id"];

	let entryJSON = $.getJSON("resources\\scripts\\db\\getEntryActions.php",{ id: entryID, action: action });

	let upperAction = action.charAt(0).toUpperCase() + action.slice(1);
	let actionCost = target.dataset["cost"];
	let entryName = $("#" + $(target).parents(".entry")[0].id + " .entryPrefix").html().slice(9,-2);

	$("#popup").html(upperAction + " \"" + entryName + "\" for " + actionCost + " Tag" + (actionCost === 1 ? "" : "s") + "?");
	
	$("#popup").dialog({
		title: "Confirm " + upperAction + " Action",
		height: "auto",
		width: $("#main").width(),
		modal: true,
		show: { effect: "clip", duration: 100 },
		hide: { effect: "clip", duration: 100 },
		/*buttons: {
			label: "<img src='https://miro.medium.com/v2/resize:fit:900/1*W-jrsYQmcsm7ls1KXRYIdQ.gif'>"
		},*/
		open: function(event,ui)
		{
			//let actionCost = entry[action] ? Math.max((entry[action]-icon.repeated-johnnyAccess)+payload.getModifier("cost"),0) : 0;
			//updateTagDisplay("CONFIRM",payload.getCurrentTags()-actionCost,payload.getCurrentTags());

		},
		close: function(event,ui)
		{
			//updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});

	$.when(entryJSON).done(function()
	{
		let options = entryJSON.responseJSON;

		let buttonActions = [];

		options.forEach(function(option)
		{
			buttonActions.push({
				text: option.button,
				click: function()
				{
					$(this).dialog("close");
					//executeCommand(path,(entry.special == "trap" ? action : button.state),actionCost,$("#copycat_check").prop("checked"));
				}
			});
		});

		$("#popup").dialog("option","buttons",buttonActions);
	});
}

function iceAction(event)
{
	console.log(event);
}