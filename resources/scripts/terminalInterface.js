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

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources\\scripts\\db\\getUser.php",
		data:
		{
			userCode: $("#payloadCodeInput")[0].value
		}
	})
	.done(function(userData)
	{
		injectUserPayload(userData);
	});
}

function injectUserPayload(userPayload)
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
								( payload.getFunction("Mask") ? "<span>Mask: " + payload.getMask() + "</span>" : "" ) +
								""//"<span>PIN: 333333</span>"
							);
		
		//// TAG MANAGEMENT

		// Required Tags
		requiredTags = parseInt($("#reqTags").html());

		// Payload Tags
		$("#hackDetails").html(
			"<span>[HACKING: +" + tens(payload.getFunction("Hacking") * 2) + "]</span>" +
			( payload.getFunction("Root Exploit") ? "<span>[ROOT EXP:+" + tens(payload.getFunction("Root Exploit") * 2) + "]</span>" : "" )
		)
		
		payloadTags = payload.getFunction("Hacking") * 2;
		payloadTags += payload.getFunction("Root Exploit") * 2;
		payloadTags = Math.min(payloadTags,10);

		$("#payTags").html(tens(payloadTags));
		$("#payTags").html(tens(payloadTags));
		$("#payTags").html(tens(payloadTags));

		session.setCurrentTags(payloadTags, Session.PAYLOAD);

		// Extra Tags

		if($("#extTags").html() === "XX")
		{
			extraTags = 0;
			$("#extTags").html(tens("00"));
		}
		else
		{
			extraTags = parseInt($("#extTags").html());
		}

		session.setCurrentTags(extraTags, Session.EXTRA);

		// Gems/Remaining Tags

		Gems.updateTagGems(Gems.ACCESS, requiredTags, payloadTags, session.getCurrentTags());

		remainingTags = session.getCurrentTags() - requiredTags;

		if(remainingTags < 0)
		{
			$("#remTagsBG").html("~~~");
		}
		else
		{
			$("#remTagsBG").html("~~");
		}

		$("#remTags").html(tens(remainingTags));

		//role stuff
	}

	$("#load").addClass("hidden");
}

function updateExtraTags(change)
{
	let payTags = session.getCurrentTags(Session.PAYLOAD);
	let extTags = session.getCurrentTags(Session.EXTRA);
	let reqTags = parseInt($("#reqTags").html());

	extTags = Math.min(
		Math.max(extTags + change, 0),
		99 - ( payTags - reqTags )
	);

	session.setCurrentTags(extTags, Session.EXTRA);

	$("#extTags").html(tens(extTags));

	Gems.updateTagGems(Gems.ACCESS, reqTags, payTags, session.getCurrentTags());

	remTags = session.getCurrentTags() - reqTags;

	if(remTags < 0)
	{
		$("#remTagsBG").html("~~~");
	}
	else
	{
		$("#remTagsBG").html("~~");
	}

	$("#remTags").html(tens(remTags));
}

function accessTerminal()
{
	let reqTags = parseInt($("#reqTags").html());

	session.setCurrentTags(session.getCurrentTags() - reqTags);

	Gems.updateTagGems(Gems.STANDBY, session.getCurrentTags());

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
	$("#load").removeClass("hidden");

	let action = target.classList[0].split("Button")[0];
	let entryID = target.dataset["id"];

	let entryJSON = $.getJSON(
		"resources\\scripts\\db\\getEntryActions.php",
		{ id: entryID, action: action }
	)
	.done(function() {
		let upperAction = action.charAt(0).toUpperCase() + action.slice(1);
		let actionCost = target.dataset["cost"];
		let entryName = $("#" + $(target).parents(".entry")[0].id + " .entryPrefix").html().slice(9,-2);

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

		$("#popup").html(upperAction + " \"" + entryName + "\" for " + actionCost + " Tag" + (actionCost === 1 ? "" : "s") + "?");
		
		$("#load").addClass("hidden");

		$("#popup").dialog({
			title: "Confirm " + upperAction + " Action",
			height: "auto",
			width: $("#main").width(),
			modal: true,
			show: { effect: "clip", duration: 100 },
			hide: { effect: "clip", duration: 100 },
			buttons: buttonActions,
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
	});
}

function iceAction(event)
{
	console.log(event);
}