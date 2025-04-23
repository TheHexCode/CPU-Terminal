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

function disableExpensiveButtons()
{
	expensiveButtons = $("button[data-enabled!='false']").filter(function() {
		return $(this).attr("data-cost") > session.getCurrentTags()
	});

	$(expensiveButtons).prop("disabled",true);
	$(expensiveButtons).attr("data-enabled","false");
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
								( payload.getFunction("Mask") ?
									"<div id='maskName' class='multiLineTextInput'>" +
										"<label for='payloadMask'>Mask:</label>" +
										"<span class='middleText'>(This MAY NOT be used to imitate someone else!)</span>" +
										"<input type='text' id='payloadMask' placeholder='Anonymous User' maxlength='15'></input>" +
									"</div>" :
									"" ) +
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
		disableExpensiveButtons();

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

		if(payload.getFunction("RIGGED"))
		{
			$("#rigItem").removeClass("hidden");
		}

		if(payload.getFunction("ROOT DEVICE"))
		{
			$("#rootItem").removeClass("hidden");
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

			$(".subContRepeatTitle").append(repeatRoman);
			$(".subContRepeatBox").removeClass("hidden");
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

		if($(".logEntry[data-user='" + payload.getUserID() + "']").length === 0)
		{
			let logMask = false;

			if(payload.getFunction("MASK"))
			{
				if($("#payloadMask").val() === "")
				{
					logMask = "Anonymous User";
				}
				else
				{
					logMask = $("#payloadMask").val();
				}
			}
			
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\db\\addLogEntry.php",
				data:
				{
					termID: session.getTerminalID(),
					userID: payload.getUserID(),
					userMask: logMask
				}
			})
			.done(function(logID)
			{
				$("#logList").append(	'<li id="log' + logID + '" class="logEntry itsYou" data-user="' + payload.getUserID() + '">' +
											'<span class="logPerson">You:&nbsp;&nbsp;</span><span class="logName">' + (logMask === false ? payload.getHandle() : logMask) + '</span>' +
											(((payload.getFunction("REASSIGN")) || (payload.getFunction("WIPE YOUR TRACKS"))) ? 
											'<div class="logActions">' +
												'<hr/>' +
												(payload.getFunction("REASSIGN") ? '<span class="reassAction buttonItem">REASSIGN: <button class="reassButton" data-enabled="true" data-cost="2" data-id="' + logID + '" onclick="takeAction(this)">2 Tags</button></span>' : "") +
												(payload.getFunction("WIPE YOUR TRACKS") ? '<span class="wipeAction buttonItem">WIPE TRACKS: <button class="wipeButton" data-enabled="true" data-cost="1" data-id="' + logID + '" onclick="takeAction(this)">1 Tag</button></span>' : "") +
											'</div>' : "") +
										'</li>');

				$("#accessZone").hide();
				$("#hackZone").css("display","flex");
			});
		}
		else
		{
			$(".logEntry[data-user='" + payload.getUserID() + "']").addClass("itsYou");
			$(".logEntry[data-user='" + payload.getUserID() + "'] .logPerson").html(
				$(".logEntry[data-user='" + payload.getUserID() + "'] .logPerson").html().replace("User:","You:&nbsp;")
			);

			$("#accessZone").hide();
			$("#hackZone").css("display","flex");
		}
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

function takeAction(target)
{
	let action = target.classList[0].split("Button")[0];
	let upperAction = action.charAt(0).toUpperCase() + action.slice(1);
	let entryID = target.dataset["id"];

	switch (action)
	{
		// Standard Entry
		case "access":
		case "modify":
		{
			$("#load").removeClass("hidden");

			let entryPath = "#" + $(target).parents(".entry")[0].id;
			let entryState = session.getEntryState(entryID);

			let entryJSON = $.getJSON(
				"resources\\scripts\\db\\getEntryActions.php",
				{ id: entryID, state: entryState, action: action }
			)
			.done(function() {
				let actionMap = {
					actionType: "entry",
					entryID: entryID,
					entryPath: entryPath,
					actionCost: session.getActionCost(entryID,action),
					upperAction: upperAction,
					entryName: $(entryPath + " .entryPrefix").html().slice(9,-2)
				};

				Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionMap["actionCost"],session.getCurrentTags());
				
				// MODAL BUTTONS
				let options = entryJSON.responseJSON;
				let buttons = [];
		
				$("#actionModal .modalButtonRow").html("");
				options.forEach(function(option, index)
				{
					let buttonID = actionMap["actionType"] + actionMap["entryID"] + action.charAt(0) + index;
					
					buttons.push({
						id: buttonID,
						text: option.button,
						data: option.state,
						global: option.global
					});
				});

				setupConfirmModal(actionMap,buttons);
				
				$("#load").addClass("hidden");
			});

			break;
		}
		// ICE Entry
		case "unwrap":
		case "break":
		{
			let entryPath = "#" + $(target).parents(".entry")[0].id;

			let actionMap = {
				actionType: "ice",
				entryID: entryID,
				entryPath: entryPath,
				actionCost: session.getActionCost(entryID,(action === "break" ? "access" : "modify")),
				upperAction: action.charAt(0).toUpperCase() + action.slice(1),
				entryName: $(entryPath + " .entryPrefix").html().slice(9,-2)
			};

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionMap["actionCost"],session.getCurrentTags());

			let buttons = [{
				id: actionMap["actionType"] + actionMap["entryID"] + action.charAt(0),
				text: "Confirm",
				data: action,
				global: true
			}];

			setupConfirmModal(actionMap,buttons);
			
			break;
		}
		// Log Entry
		case "reass":
		case "wipe":
		{
			let entryPath = "#" + $(target).parents('.logEntry')[0].id;

			let actionMap = {
				actionType: "log",
				entryID: entryID,
				actionCost: session.getActionCost("nonEntry",action),
				upperAction: (action === "reass" ? "Reassign" : "Wipe Tracks"),
				entryName: $(entryPath + " .logName").html()
			};

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionMap["actionCost"],session.getCurrentTags());

			let buttons = [{
				id: actionMap["actionType"] + actionMap["entryID"] + action.charAt(0),
				text: "Confirm",
				data: null,
				global: true
			}];

			setupConfirmModal(actionMap,buttons);

			break;
		}
		// Active Functions
		case "brick":
		case "rig":
		case "root":
		{
			let actionMap = {
				actionType: action,
				entryID: session.getTerminalID(),
				actionCost: session.getActionCost("nonEntry",action),
				upperAction: action.charAt(0).toUpperCase() + action.slice(1),
				entryName: "Device"
			};

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionMap["actionCost"],session.getCurrentTags());

			let buttons = [{
				id: actionMap["actionType"] + actionMap["entryID"] + action.charAt(0),
				text: "Confirm",
				data: payload.getUserID(),
				global: true
			}];

			setupConfirmModal(actionMap,buttons);

			break;
		}
		// Item Activation
	}
}

function setupConfirmModal(actionMap,buttons)
{
	// ACTIONMAP REQUIRES:
	//	- upperAction
	//	- entryName
	//	- actionCost

	// BUTTON ARRAY ITEMS REQUIRE:
	//	- id
	//	- text
	//	- data
	//	- global

	buttons.forEach(function(button)
	{
		$("#actionModal .modalButtonRow").append("<button id='" + button.id + "' class='modalButton'>" + button.text + "</button>");
			
		$("#" + button.id).bind("pointerup", function()
		{
			let buttonData = button.data;

			if(actionMap["upperAction"] === "Reassign")
			{
				buttonData = ($("#reassInput").val() === "" ? "Anonymous User" : $("#reassInput").val());
			};

			executeAction(actionMap,buttonData,button.global);
		});
	});

	$("#actionModal").width($("#main").width());
	if(actionMap["actionType"] === "ice")
	{
		$("#actionModal").addClass("ice");
	}
	else
	{
		$("#actionModal").removeClass("ice");
	}

	$("#actionModal .modalHeaderText").html("Confirm " + actionMap["upperAction"] + " Action");

	let extraBeforeText = "";
	let extraAfterText = "";
	let quote = "\"";

	switch(actionMap["upperAction"])
	{
		case("Break"):
		{
			extraAfterText = 	"<div class='cautionTape'>" +
									"WARNING: Breaking ICE means tripping it and taking any negative effects it may incur. <em>Sleaze</em> the ICE instead to disable the security, in exchange for Tags." +
								"</div>"
			break;
		}
		case("Reassign"):
		{
			extraBeforeText = " Log Entry for";
			extraAfterText =	"<br/><br/>" +
								"<div id='reassName' class='multiLineTextInput'>" +
									"<label for='reassInput'>New Name to Reassign Log Entry to:</label>" +
									"<span class='middleText'>(This MAY be used to imitate someone else!)</span>" +
									"<input type='text' id='reassInput' placeholder='Anonymous User' maxlength='15'></input>" +
								"</div>";
			break;
		}
		case("Wipe Tracks"):
		{
			extraBeforeText = " for";
			break;
		}
		case("Brick"):
		{
			quote = "";
			extraAfterText = "<br/><br/><span class='red'>WARNING: Bricking this Device will render it inoperable until repaired!</span>";
			break;
		}
		case("Rig"):
		{
			quote = "";
			extraAfterText = "<br/><br/><span class='red'>WARNING: Triggering a Rigged Device (by calling \"Room Strike Lock\") will cause all data to be deleted at the end of the Scene!</span>";
			break;
		}
		case("Root"):
		{
			quote = "";
			extraAfterText = "<br/><br/><span class='red'>WARNING: Rooting this Device will format all memory disks, deleting all software and data permanently!<br/>Furthermore, Device will be inoperable until appropriate software is re-installed!</span>"
			break;
		}
	}

	$("#modalBodyTimer").addClass("hidden");
	$("#actionModal .modalBodyText").html(
		actionMap["upperAction"] + extraBeforeText + " " + quote + actionMap["entryName"] + quote + " for " + actionMap["actionCost"] + " Tag" + (actionMap["actionCost"] === 1 ? "" : "s") + "?" +
		extraAfterText
	);

	$(".modalBodyText").removeClass("hidden");

	$("#actionModal .modalButtonRow").attr("data-mode","confirm");
	
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

function executeAction(actionMap,newData,globalAction)
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

		actionMap["newData"] = newData;
		actionMap["global"] = globalAction;

		mbTimer.startTimer(maxTime,completeAction,actionMap);
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

function completeAction(actionMap)
{
	closeModal("executed");

	//actionMap:
		// actionType
		// actionCost
		// dialog (id)
		// entryID
		// entryName
		// entryPath (entry/ice)
		// global
		// newData
		// results (entry/ice)
			// title
			// contents
			// access
			// modify
		// upperAction
	
	switch(actionMap["actionType"])
	{
		case("entry"):
		case("ice"):
		{
			$(actionMap["entryPath"] + " > .entryTitleBar > .entryMaskContainer").html(actionMap["results"]["title"]);
			$(actionMap["entryPath"] + " > .entryContentsBar > .entryMaskContainer").html(actionMap["results"]["contents"]);
			$(actionMap["entryPath"] + " > .entryIntContainer > .accessInterface").html(actionMap["results"]["access"]);
			$(actionMap["entryPath"] + " > .entryIntContainer > .modifyInterface").html(actionMap["results"]["modify"]);
			$(actionMap["entryPath"] + " > .subIce").removeClass("subIce");

			if(payload.getFunction("REPEAT"))
			{
				session.setFunctionState("REPEAT",actionMap["entryID"],actionMap["upperAction"].toLowerCase(),payload.getFunction("REPEAT"));
				updateEntryCosts(actionMap["entryPath"],actionMap["upperAction"]);
			}
			break;
		}
		case("log"):
		{
			if(actionMap["upperAction"] === "Reassign")
			{
				$("#log" + actionMap["entryID"] + " > .logName").html(actionMap["newData"]);
			}
			else //WIPE TRACKS
			{
				$("#log" + actionMap["entryID"] + " > .logPerson").html("[ERROR:&nbsp;");
				$("#log" + actionMap["entryID"] + " > .logName").html("ENTRY NOT FOUND]");
				$("#log" + actionMap["entryID"] + " > .logActions").html("");
			}
			break;
		}
		case("brick"):
			let handle = payload.getHandle();

			let hexHandle = [];

			for(let i = 0; i < handle.length; i++)
			{
				hexHandle.push(handle.charCodeAt(i).toString(16).padStart(2,0));
			}

			for(let j = handle.length; j < 15; j++)
			{
				hexHandle.push("00");
			}

			$("body").addClass("bricked");

			let stopCode =  "0x000000" + hexHandle[0] + "<br/>" +
							"(0x" + hexHandle[1] + hexHandle[2] + hexHandle[3] + hexHandle[4] + "," +
							"0x" + hexHandle[5] + hexHandle[6] + hexHandle[7] + hexHandle[8] + ",<br/>" +
							"&nbsp;0x" + hexHandle[9] + hexHandle[10] + hexHandle[11] + hexHandle[12] + "," +
							"0x" + hexHandle[13] + hexHandle[14] + "0000)"

			/*
			<svg id="hexLogo" width="209" height="229" xmlns="http://www.w3.org/2000/svg">
				<mask id="logoMask">
					<polygon points="105,10 195,62 195,167 105,219 15,167 15,62" fill="black" stroke="white" stroke-width="15" /> 
				</mask>
			
				<foreignObject x="0" y="0" width="209" height="229" mask="url(#logoMask)">
					<div id="logoBG"></div>
				</foreignObject>
			</svg>
			*/

			$("#main").html("<p>A problem has been detected and HexOS has been shut down to prevent damage to your device.</p>" +
							"<p>UNMOUNTABLE_BOOT_VOLUME</p>" +
							"<p>If this is the first time you've seen this error screen, restart your computer. If this screen appears again, follow these steps:" +
							"<p>Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or software manufacturer for any HexOS updates you might need.</p>" +
							"<p>If problems continue, disable or remove any newly installed hardware or software. Disable BIOS memory options such as caching or shadowing. If you need to use Safe Mode to remove or disable components, restart your computer, press F8 to select Advanced Startup Options, and then select Safe Mode.</p>" +
							"<p>Technical Information:</p>" +
							"<p>*** STOP: " + stopCode + "</p>" +
							"<p><br/>Beginning dump of physical memory...<br/>" +
							"Physical memory dump complete.<br/>" +
							"Contact your system administrator or technical support group for further<br/>" +
							"assistance.</p>" +
							"<!--<footer>CPU DISCLAIMER</footer>-->")

			break;
		case("rig"):
			break;
		case("root"):
			break;
	}

	session.setCurrentTags(session.getCurrentTags() - actionMap["actionCost"]);
	Gems.updateTagGems(Gems.STANDBY,session.getCurrentTags());
	disableExpensiveButtons();
}

function updateEntryCosts(entryPath, entryAction)
{
	if((entryAction === "Access") || (entryAction === "Modify"))
	{
		let iconID = entryPath.split("-")[0] + "Content";

		$(iconID + " ." + entryAction.toLowerCase() + "Button").each(function(index,entryButton){
			if($(entryButton).html() !== "N/A")
			{
				let newCost = session.getActionCost($(entryButton).attr("data-id"), entryAction.toLowerCase());
				$(entryButton).attr("data-cost",newCost);
				$(entryButton).html(newCost + " Tag" + (newCost === 1 ? "" : "s"));
			};
		});

		$(iconID + " .repeatIndicator" + entryAction).removeClass("dimmed");
	}
}