function pauseTimer()
{

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

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources\\scripts\\db\\getUser.php",
		data:
		{
			userCode: $("payloadCodeInput").value()
		}
	});
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