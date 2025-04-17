//var session = new Session(); <- Created by classes\terminal.php
var payload = new Payload();
var taTimer = new Timer("#termAccessTimer");
var mbTimer = new Timer("#modalBodyTimer");

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
								//( payload.getFunction("Mask") ? "<span>Mask: " + payload.getMask() + "</span>" : "" ) +
								""//"<span>PIN: 333333</span>"
							);

		let maxTime = 30 - (10 * payload.getFunction("BACKDOOR"));

		$("#terminalButton").html("Cracking Terminal...");
		$("#terminalButton").removeClass("noPayload");
		taTimer.startTimer(maxTime,allowAccess);
		//$("#terminalButton").prop("disabled",false);
		
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

		// Disable Expensive Buttons
		expensiveButtons = $("button[data-enabled!='false']").filter(function() {
			return $(this).attr("data-cost") > session.getCurrentTags()
		});
	
		$(expensiveButtons).prop("disabled",true);
		$(expensiveButtons).attr("data-enabled","false");

		//role stuff

		// FUNCTIONS / INVENTORY

		let romanTiers = {
			1: " I",
			2: " II",
			3: " III",
			4: " IV",
			5: " V"
		}

		///////////// ACTIVE

		if(payload.getFunction("BRICK"))
		{
			$("#brickItem").removeClass("hidden");
		}

		if(payload.getFunction("REASSIGN") || payload.getFunction("WIPE YOUR TRACKS"))
		{
			$(".logActions").removeClass("hidden");

			if(payload.getFunction("REASSIGN"))
			{
				$(".reassAction").removeClass("hidden");
			}

			if(payload.getFunction("WIPE YOUR TRACKS"))
			{
				$(".wipeAction").removeClass("hidden");
			}
		}

		if(payload.getFunction("RIGGED"))
		{
			$("#riggItem").removeClass("hidden");
		}

		if(payload.getFunction("ROOT DEVICE"))
		{
			$("#rootItem").removeClass("hidden");
		}

		///////////// PASSIVE

		if(payload.getFunction("ALARM SENSE"))
		{
			$("#alarmItem").removeClass("hidden");
		}

		if(payload.getFunction("BACKDOOR"))
		{
			let bdRoman = romanTiers[payload.getFunction("BACKDOOR")];

			$("#bdItem").append(bdRoman);

			$("#bdItem").removeClass("hidden");
		}

		if(payload.getFunction("DARK WEB MERCHANT") || payload.getFunction("DARK WEB OPERATOR"))
		{
			if(payload.getFunction("DARK WEB MERCHANT"))
			{
				$("#dwmItem").removeClass("hidden");
			}

			if(payload.getFunction("DARK WEB OPERATOR"))
			{
				$("#dwoItem").removeClass("hidden");
			}
		}
		else
		{
			$("#darkwebSubTab").addClass("hidden");
		}

		if(payload.getFunction("REPEAT"))
		{
			let repeatRoman = romanTiers[payload.getFunction("REPEAT")];

			$("#repeatItem").append(repeatRoman);

			$("#repeatItem").removeClass("hidden");
		}
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

function allowAccess()
{
	$("#terminalButton").html("Access Terminal");
	$("#terminalButton").attr("disabled",false);
}

function accessTerminal(event)
{
	if(!event.target.disabled)
	{
		let reqTags = parseInt($("#reqTags").html());

		session.setCurrentTags(session.getCurrentTags() - reqTags);

		Gems.updateTagGems(Gems.STANDBY, session.getCurrentTags());

		$("#accessZone").hide();
		$("#hackZone").css("display","flex");
	}
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
	let entryPath = "#" + $(target).parents(".entry")[0].id;
	let entryState = session.getEntryState(entryID);

	let entryJSON = $.getJSON(
		"resources\\scripts\\db\\getEntryActions.php",
		{ id: entryID, state: entryState, action: action }
	)
	.done(function() {
		let actionMap = {
			entryID: entryID,
			entryPath: entryPath,
			actionCost: session.getActionCost(entryID,action),
			upperAction: action.charAt(0).toUpperCase() + action.slice(1),
			entryName: $(entryPath + " .entryPrefix").html().slice(9,-2)
		};

		let options = entryJSON.responseJSON;

		$("#actionModal .modalButtonRow").html("");
		options.forEach(function(option, index)
		{
			let buttonID = actionMap["entryID"] + action.charAt(0) + index;
			$("#actionModal .modalButtonRow").append("<button id='" + buttonID + "' class='modalButton'>" + option.button + "</button>");

			$("#" + buttonID).bind("pointerup", function()
			{
				executeCommand(actionMap,option.state,option.global);
			});
		});

		Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionMap["actionCost"],session.getCurrentTags());
		
		$("#actionModal").width($("#main").width());
		$("#actionModal").removeClass("ice");

		$("#actionModal .modalHeaderText").html("Confirm " + actionMap["upperAction"] + " Action");

		$("#modalBodyTimer").addClass("hidden");
		$("#actionModal .modalBodyText").html(
			actionMap["upperAction"] + " \"" + actionMap["entryName"] + "\" for " + actionMap["actionCost"] + " Tag" + (actionMap["actionCost"] === 1 ? "" : "s") + "?"
		);
		$(".modalBodyText").removeClass("hidden");

		$("#actionModal .modalButtonRow").attr("data-mode","confirm");
		
		$("#load").addClass("hidden");
		$("#modalBG").css("display","flex");
	});
}

function iceAction(target)
{
	$("#load").removeClass("hidden");

	let action = target.classList[0].split("Button")[0];
	let entryID = target.dataset["id"];
	let entryPath = "#" + $(target).parents(".entry")[0].id;

	let actionMap = {
		entryID: entryID,
		entryPath: entryPath,
		actionCost: session.getActionCost(entryID,(action === "break" ? "access" : "modify")),
		upperAction: action.charAt(0).toUpperCase() + action.slice(1),
		entryName: $(entryPath + " .entryPrefix").html().slice(9,-2)
	};

	$("#actionModal .modalButtonRow").html("");
	
	let buttonID = actionMap["entryID"] + action.charAt(0);

	$("#actionModal .modalButtonRow").append("<button id='" + buttonID + "' class='modalButton'>" + actionMap["upperAction"] + "</button>");
	$("#" + buttonID).bind("pointerup", function()
	{
		executeCommand(actionMap,action,true);
	});

	Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionMap["actionCost"],session.getCurrentTags());
	
	$("#actionModal").width($("#main").width());
	$("#actionModal").addClass("ice");

	$("#actionModal .modalHeaderText").html("Confirm " + actionMap["upperAction"] + " Action");

	$("#modalBodyTimer").addClass("hidden");
	$("#actionModal .modalBodyText").html(
		actionMap["upperAction"] + " \"" + actionMap["entryName"] + "\" for " + actionMap["actionCost"] + " Tag" + (actionMap["actionCost"] === 1 ? "" : "s") + "?" +
		(action === "break" ?
			"<div class='cautionTape'>" +
				"WARNING: Breaking ICE means tripping it and taking any negative effects it may incur. <em>Sleaze</em> the ICE instead to disable the security, in exchange for Tags." +
			"</div>" :
			""
		)
	);
	$(".modalBodyText").removeClass("hidden");

	$("#actionModal .modalButtonRow").attr("data-mode","confirm");
		
	$("#load").addClass("hidden");
	$("#modalBG").css("display","flex");
}

function closeModal(event)
{
	if((event.type !== "keyup") || (event.key === "Escape"))
	{
		mbTimer.killTimer();

		$("#modalBG").css("display","none");
		
		$("#actionModal .modalHeaderText").html("");

		$("#modalBodyTimer").addClass("hidden");
		$("#actionModal .modalBodyText").html("");
		$(".modalBodyText").addClass("hidden");

		$("#actionModal .modalButtonRow").attr("data-mode","none");
		$("#actionModal .modalButtonRow").html("");

		Gems.updateTagGems(Gems.STANDBY,session.getCurrentTags());
	}
}

function executeCommand(actionMap,newState,globalAction)
{
	let maxTime = 30 - (10 * payload.getFunction("BACKDOOR"));

	Gems.updateTagGems(Gems.EXECUTE,session.getCurrentTags()-actionMap["actionCost"],session.getCurrentTags());

	$("#actionModal").width($("#main").width());

	$("#actionModal .modalButtonRow").html("");
	$("#actionModal .modalButtonRow").append("<button id='executeButton' class='modalButton'>HOLD TO EXECUTE</button>");

	$("#executeButton").bind("mousedown touchstart", function(event)
	{
		event.preventDefault();

		$("#executeButton").addClass("active");

		actionMap["newState"] = newState;
		actionMap["global"] = globalAction;

		mbTimer.startTimer(maxTime,completeCommand,actionMap);
	});
	$("#executeButton").bind("mouseleave mouseup touchleave touchend", function()
	{
		$("#executeButton").removeClass("active");

		mbTimer.pauseTimer();
	});
	$("#executeButton").bind("contextmenu", function(event)
	{
		if(event.originalEvent.pointerType === "touch")
		{
			event.preventDefault();
			$("#executeButton").trigger("touchstart");
		}
	})

	$("#actionModal .modalHeaderText").html(actionMap["upperAction"] + " / " + actionMap["entryName"] + " / " + actionMap["actionCost"] + " Tag" + (actionMap["actionCost"] === 1 ? "" : "s"));

	$("#actionModal .modalBodyText").html(
		actionMap["upperAction"] + " \"" + actionMap["entryName"] + "\" for " + actionMap["actionCost"] + " Tag" + (actionMap["actionCost"] === 1 ? "" : "s") + "?"
	);
	$(".modalBodyText").addClass("hidden");
	$("#modalBodyTimer .mmss .FG").html("00:" + tens(maxTime));
	$("#modalBodyTimer").removeClass("hidden");

	$("#actionModal .modalButtonRow").attr("data-mode","execute");
	
	$("#load").addClass("hidden");
	$("#modalBG").css("display","flex");
}

function completeCommand(actionMap)
{
	closeModal("executed");

	//get Title/Contents/available buttons
	//get Trap/Ice Formatting
	//Update Gems/Tags
	//Disable unaffordable buttons

	//actionMap:
		// actionCost
		// dialog (id)
		// entryID
		// entryName
		// entryPath
		// global
		// newState
		// results
			// title
			// contents
			// access
			// modify
		// upperAction

	$(actionMap["entryPath"] + " > .entryTitleBar > .entryMaskContainer").html(actionMap["results"]["title"]);
	$(actionMap["entryPath"] + " > .entryContentsBar > .entryMaskContainer").html(actionMap["results"]["contents"]);
	$(actionMap["entryPath"] + " > .entryIntContainer > .accessInterface").html(actionMap["results"]["access"]);
	$(actionMap["entryPath"] + " > .entryIntContainer > .modifyInterface").html(actionMap["results"]["modify"]);
	$(actionMap["entryPath"] + " > .subIce").removeClass("subIce");

	session.setCurrentTags(session.getCurrentTags() - actionMap["actionCost"]);
	Gems.updateTagGems(Gems.STANDBY,session.getCurrentTags());

	expensiveButtons = $("button[data-enabled!='false']").filter(function() {
		return $(this).attr("data-cost") > session.getCurrentTags()
	});

	$(expensiveButtons).prop("disabled",true);
	$(expensiveButtons).attr("data-enabled","false");
}