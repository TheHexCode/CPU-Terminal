//var session = new Session(); <- Created by classes\terminal.php
var payload = new Payload();
var taTimer = new Timer("#termAccessTimer");
var mbTimer = new Timer("#modalBodyTimer");

$(document).ready(function()
{
	$("#payloadCodeInput").val("");
	$("#terminalButton").attr("disabled",true);
	$(".initItem input").prop("checked",false);
});

function tens(numStr)
{
	var tensFormat = new Intl.NumberFormat('en-US', { 
		minimumIntegerDigits: 2
	});
	
	return tensFormat.format(Number(numStr));
}

function mmss(secs)
{
	let mm = tens(parseInt(secs/60));
	let ss = tens(parseInt(secs%60));

	return mm + ":" + ss
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
			userCode: $("#payloadCodeInput")[0].value,
			termID: session.getTerminalID()
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

		let maxTime = 30; // Functions and Items should not affect this

		$("#terminalButton").html("Cracking Terminal...");
		$("#terminalButton").removeClass("noPayload");
		taTimer.startTimer(maxTime,allowAccess);
				
		//// TAG MANAGEMENT

		// Required Tags
		requiredTags = parseInt($("#reqTags").html());

		// Payload Tags
		$("#hackDetails").html(
			"<span>[HACKING:&nbsp;+" + tens(payload.getFunction("Hacking") * 2) + "]</span>" +
			( payload.getFunction("Root Exploit") ? "<span>[ROOT EXP:+" + tens(payload.getFunction("Root Exploit") * 2) + "]</span>" : "" )
		)
		
		payloadTags = payload.getFunction("Hacking") * 2;
		payloadTags += payload.getFunction("Root Exploit") * 2;

		updateTags(payloadTags,Session.HACK);

		// Extra Tags + Gems/Remaining Tags

		updateTags(0,Session.EXTRA);

		// Disable Expensive Buttons
		disableExpensiveButtons();

		// ROLE
		if(payload.hasRole("DISSIMULATOR"))
		{
			$("#disInit").removeClass("hidden");
		}

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
			session.rigTerminal(payload.getUserID());
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

			$(".accessButton, .modifyButton").each(function(index,entryButton)
			{
				if($(entryButton).html() !== "N/A")
				{
					let action = entryButton.classList[0].split("Button")[0];
					let newCost = session.getActionCost($(entryButton).attr("data-id"), action);
					$(entryButton).attr("data-cost",newCost);
					$(entryButton).html(newCost + " Tag" + (newCost === 1 ? "" : "s"));
				};
			});
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

			$(".repeatBox .subContModifierTitle").append(repeatRoman);
			$(".repeatBox").removeClass("hidden");
		}

		///////////// ITEMS

		payload.getInventory().forEach(function(item)
		{
			let effectString = "<hr/>";

			item.effects.forEach(function(effect)
			{
				$(".itemCat[data-cat='" + item.type + "']").removeClass("hidden");

				switch(effect.use_loc)
				{
					case("item"):
					{
						let remCharges = effect.charges - effect.uses;

						effectString += "<span class='itemActionRow'>" +
											"<span class='itemMarks'>";
						
						for(let i = 0; i < effect.uses; i++)
						{
							effectString += "<img src='resources/images/actions/itemfilled.png' />";
						}

						for(let j = 0; j < remCharges; j++)
						{
							effectString += "<img src='resources/images/actions/itemopen.png' />";
						}
						
						effectString += "<span>per " + (effect.per_type === "sim" ? "Sim" : "Scene") + "</span>" +
									"</span>" +
									"<button class='itemButton' data-effect='" + effect.id + "' onclick='takeAction(this)' " + (remCharges === 0 ? "disabled" : "") + ">" + effect.effect + "</button>" +
								"</span>";
						break;
					}
					case("initial"):
					{
						let disabled = false;

						let target = $(
								".initItem > input[data-effect='" + effect.id + "'], " +
								".initItem > input[data-effect*='[" + effect.id + ",'], " + 
								".initItem > input[data-effect*='," + effect.id + ",'], " +
								".initItem > input[data-effect*='," + effect.id + "]']"
							)[0];

						if((effect.charges === null) && (effect.uses > 0))
						{
							disabled = true;

							$(target).prop("checked", true);
							initCheck(target);
						}
						else if((effect.per_type !== null) && (effect.uses >= effect.charges))
						{
							disabled = true;
						}

						if(effect.termUses > 0)
						{
							payload.setActiveEffect(effect.id, true);
						}

						$(target).prop("disabled", disabled);
						$("#" + target.id + " + label").toggleClass("dimmed", disabled);

						$(".initItem[data-id='" + item.item_id + "']").removeClass("hidden");
						
						break;
					}
					case("action"):
					{
						switch(effect.id)
						{
							case(5): //COPYCAT
								if(effect.uses > 0)
								{
									payload.setActiveEffect(effect.id, true);
								}
								break;
							case(13): //DIGIPET
								if(effect.uses > 0)
								{
									payload.setActiveEffect(effect.id, true);
								}
								break;
						}
					}
					case("autoinit"):
					{
						switch(effect.id)
						{
							case(10): //CIPHERSYNC BEACON
								$("#hackDetails").append("<span>[BEACON:&nbsp;&nbsp;+02]</span>");

								updateTags(2,Session.BEACON);
								break;
							case(18): //POWER GLOVE [UH9K]
								payload.setActiveEffect(effect.id, true);
								break;
						}
						break;
					}
					case("autoact"):
					{
						switch(effect.id)
						{
							case(15): //JOHNNY'S SPECIAL TOUCH
								$(".touchedBox").removeClass("hidden");

								if(effect.termUses > 0)
								{
									payload.setActiveEffect(effect.id, true);
								}
								break;
						}
						break;
					}
				}
			});

			$(".itemCat[data-cat='" + item.type + "'] > .itemList").append(
				"<li id='item_" + item.item_id + "' class='itemItem'>" +
					"<span class='itemName'>" + item.name + (item.tier !== null ? " [T" + item.tier + "]" : "") + "</span>" +
					(effectString.length > 5 ? effectString : "") +
				"</li>"
			);
		});

		if(userPayload["hasAccessed"])
		{
			actionResults = [];

			userPayload["prevActions"].forEach(function(entry)
			{
				results = $.getJSON(
					"resources\\scripts\\db\\getEntryUpdate.php",
					{
						id: entry["id"],
						newState: entry["newState"],
						action: entry["action"],
						userID: entry["user_id"]
					}
				);

				actionResults.push(results);
			});

			$.when(...actionResults).done(function()
			{
				let results = arguments;

				let resultsArray;

				if(actionResults.length === 1)
				{
					resultsArray = [];
					resultsArray.push(["0", results]);
				}
				else
				{
					resultsArray = Object.entries(results);
				}

				resultsArray.forEach(function(result)
				{
					let resultJSON = result[1][0];

					if(resultJSON["userID"] === payload.getUserID())
					{
						$(resultJSON["entryPath"] + " > .entryTitleBar > .entryMaskContainer").html(resultJSON["title"]);
						$(resultJSON["entryPath"] + " > .entryContentsBar > .entryMaskContainer").html(resultJSON["contents"]);
						$(resultJSON["entryPath"] + " > .entryIntContainer > .accessInterface").html(resultJSON["access"]);
						$(resultJSON["entryPath"] + " > .entryIntContainer > .modifyInterface").html(resultJSON["modify"]);
						$(resultJSON["entryPath"] + " > .subIce").removeClass("subIce");

						if(payload.getFunction("REPEAT"))
						{
							session.setFunctionState("REPEAT",resultJSON["entryID"],resultJSON["action"].toLowerCase(),payload.getFunction("REPEAT"));
							updateEntryCosts("REPEAT",resultJSON["entryPath"],resultJSON["action"]);
						}

						if(payload.getActiveEffect(15)) // JOHNNY'S SPECIAL TOUCH
						{
							session.setFunctionState("TOUCHED",resultJSON["entryID"],resultJSON["action"].toLowerCase(),1);
							updateEntryCosts("TOUCHED",resultJSON["entryPath"],resultJSON["action"]);
						}
					}
				});
			});

			if((payload.getItem(4)) && (!payload.getActiveEffect(5)))
			{
				userPayload["copyables"].forEach(function(copyableAction)
				{
					if(copyableAction !== "Item")
					{
						session.makeActionCopyable(copyableAction);
					}
				});
			}

			session.setCurrentTags(userPayload["remTags"] + requiredTags);

			accessTerminal("hasAccessed");
		}
	}

	$("#load").addClass("hidden");
}

function initCheck(target)
{
	let effectID = $(target).attr("data-effect");

	if(effectID === "dis") //Dissimulator Role Ability (+Hack)
	{
		if($(target).prop("checked"))
		{
			$("#hackDetails").append("<span id='disDetails'>[DISSIM:&nbsp;&nbsp;+02]</span>");

			updateTags(2,Session.DISSIM);
		}
		else
		{
			$("#hackDetails #disDetails").remove();

			updateTags(-2,Session.DISSIM);
		}
	}
	else
	{
		effectID = JSON.parse(effectID);

		if(typeof effectID === "number")
		{
			effectID = [effectID];
		}

		effectID.forEach(function(eID)
		{
			switch (eID)
			{
				case(1): //CMM Widow
					if(payload.getItem(1))
					{
						session.setExtraTagMin($(target).prop("checked") ? 1 : -1);
						updateTags($(target).prop("checked") ? 1 : -1, Session.EXTRA);
						payload.setActiveEffect(eID, $(target).prop("checked"));
					}
					break;
				case(2): //Winton Wit (Embolden)
					session.setExtraTagMin($(target).prop("checked") ? -1 : 1);
					updateTags($(target).prop("checked") ? -1 : 1, Session.EXTRA);
					payload.setActiveEffect(eID, $(target).prop("checked"));
					// Carries Over Through Scene
					break;
				case(3): //Winton Wit (Inspire)
					session.setExtraTagMin($(target).prop("checked") ? -1 : 1);
					updateTags($(target).prop("checked") ? -1 : 1, Session.EXTRA);
					payload.setActiveEffect(eID, $(target).prop("checked"));
					// Carries Over Through Scene
					break;
				case(4): //CMM Cocoon
					if(payload.getItem(3))
					{
						session.setExtraTagMin($(target).prop("checked") ? 1 : -1);
						updateTags($(target).prop("checked") ? 1 : -1, Session.EXTRA);
						payload.setActiveEffect(eID, $(target).prop("checked"));
					}
					break;
				case(9): //BRAD
					if($(target).prop("checked"))
					{
						
					}
					else
					{
						
					}
					break;
				case(19): //Shimmerstick T0
				case(20): //Shimmerstick T1
					payload.setActiveEffect(eID, $(target).prop("checked"));
					break;
				case(22): //CLEC Fingers (+Hack)
					if($(target).prop("checked"))
					{
						$("#hackDetails").append("<span id='clecDetails'>[CLEC FRS:+02]</span>");
						updateTags(2,Session.CLEC);
					}
					else
					{
						$("#hackDetails #clecDetails").remove();
						updateTags(-2,Session.CLEC);
					}

					payload.setActiveEffect(eID, $(target).prop("checked"));
					break;
			}
		}, this);
	}
}

function updateTags(change, tagType)
{
	let payTags = session.getCurrentTags(Session.PAYLOAD);
	let extTags = session.getCurrentTags(Session.EXTRA);
	let reqTags = parseInt($("#reqTags").html());
	let newTags = 0;

	switch(tagType)
	{
		case(Session.HACK):
		case(Session.BEACON):
		case(Session.DISSIM):
		case(Session.CLEC):
			newTags = payTags + change;

			if((newTags >= 10) && ($("#hackMax").length === 0))
			{
				$("#hackDetails").after("<span id='hackMax'>(MAX: 10)</span>");
			}
	
			session.setCurrentTags(change, tagType);

			payTags = session.getCurrentTags(Session.PAYLOAD);
			break;
		case(Session.EXTRA):
			newTags = Math.min(
				Math.max(extTags + change, session.getExtraTagMin()),
				99 - ( payTags - reqTags )
			);

			if(newTags < 0)
			{
				$("#extTagsBG").html("~~~");
			}
			else
			{
				$("#extTagsBG").html("~~");
			}

			session.setCurrentTags(newTags, Session.EXTRA);

			extTags = session.getCurrentTags(Session.EXTRA);
			break;
	}

	$("#extTags").html(tens(extTags));

	$("#payTags").html(tens(session.getCurrentTags(Session.PAYLOAD)));

	Gems.updateTagGems(Gems.ACCESS, reqTags, (extTags < 0 ? payTags + extTags : payTags), session.getCurrentTags());

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
	if((event === "hasAccessed") || (!event.target.disabled))
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
				url: "resources\\scripts\\db\\useItems.php",
				data:
				{
					userID: payload.getUserID(),
					effectIDs: payload.getAllActiveEffects(),
					termID: session.getTerminalID()
				}
			});
			
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\db\\addLogEntry.php",
				data:
				{
					termID: session.getTerminalID(),
					userID: payload.getUserID(),
					userMask: logMask,
					userTags: session.getCurrentTags()
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

				$("#accessZone").addClass("hidden");
				$("#hackZone").removeClass("hidden");
			});
		}
		else
		{
			$(".logEntry[data-user='" + payload.getUserID() + "']").addClass("itsYou");
			$(".logEntry[data-user='" + payload.getUserID() + "'] .logPerson").html(
				$(".logEntry[data-user='" + payload.getUserID() + "'] .logPerson").html().replace("User:","You:&nbsp;")
			);

			$("#accessZone").addClass("hidden");
			$("#hackZone").removeClass("hidden");
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
					userID: payload.getUserID(),
					actionType: "entry",
					entryID: entryID,
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
		case "break":
		case "sleaze":
		{
			let entryPath = "#" + $(target).parents(".entry")[0].id;

			let actionMap = {
				userID: payload.getUserID(),
				actionType: "ice",
				entryID: entryID,
				actionCost: session.getActionCost(entryID,(action === "break" ? "access" : "modify")),
				upperAction: upperAction,
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
				userID: payload.getUserID(),
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
				userID: payload.getUserID(),
				actionType: action,
				entryID: session.getTerminalID(),
				actionCost: session.getActionCost("nonEntry",action),
				upperAction: upperAction,
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
		case ("item"):
			let effect = payload.getEffect(Number(target.dataset["effect"]));
			let effectCost = effect["effect"].substring(effect["effect"].indexOf("+"), effect["effect"].indexOf(" "));

			let entryPath = "#" + $(target).parents('.itemItem')[0].id;

			let actionMap = {
				userID: payload.getUserID(),
				actionType: action,
				entryID: Number(target.dataset["effect"]),
				actionCost: Number(effectCost) * -1,
				upperAction: "Activate",
				entryName: $(entryPath + " .itemName").html()
			};

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags(),session.getCurrentTags()-actionMap["actionCost"]);

			let buttons = [{
				id: actionMap["actionType"] + actionMap["entryID"],
				text: "Confirm",
				data: session.getTerminalID(),
				global: false
			}];

			setupConfirmModal(actionMap,buttons);

			break;
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
	let costText = " for " + actionMap["actionCost"] + " Tag" + (actionMap["actionCost"] === 1 ? "" : "s");

	let copycatText = 	((payload.getItem(4)) && (!payload.getActiveEffect(5)) && (session.isActionCopyable(actionMap["upperAction"])) ?
						"<br/><br/>" +
						"<span class='copycatBox'>" +
							"<input id='copycatActivate' type='checkbox'/>" +
							"<span class='copycatLabel'>(1/Sim) Activate Copycat for this action to complete it immedidately?</span>" +
						"</span>" : "");

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
		case("Activate"):
		{
			let effect = payload.getEffect(actionMap["entryID"]);

			let totCharges = effect["charges"];
			let totCharge_S = (totCharges === 1 ? "" : "s");
			let remCharges = effect["charges"] - effect["uses"];
			let remCharge_S = (remCharges === 1 ? "" : "s");
			let upperPerType = effect["per_type"].charAt(0).toUpperCase() + effect["per_type"].slice(1);

			actionMap["remCharges"] = remCharges - 1;
			actionMap["usedCharges"] = totCharges - (remCharges - 1);

			costText = " to gain " + effect["effect"];

			extraAfterText = "<br/><br/>This item may be used <b>" + totCharges + "</b> time" + totCharge_S + " per " + upperPerType + ". You have <b>" + remCharges + "</b> use" + remCharge_S + " left.";
			break;
		}
	}

	$("#modalBodyTimer").addClass("hidden");
	$("#actionModal .modalBodyText").html(
		actionMap["upperAction"] + extraBeforeText + " " + quote + actionMap["entryName"] + quote + costText + "?" +
		extraAfterText + copycatText
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
	if(!$("#copycatActivate").prop("checked"))
	{
		let maxTime = payload.getActionTime();

		if(actionMap["actionType"] === "item")
		{
			Gems.updateTagGems(Gems.EXECUTE,session.getCurrentTags(),session.getCurrentTags()-actionMap["actionCost"]);
		}
		else
		{
			Gems.updateTagGems(Gems.EXECUTE,session.getCurrentTags()-actionMap["actionCost"],session.getCurrentTags());
		}

		$("#actionModal").width($("#main").width());

		$("#actionModal .modalButtonRow").html("");
		$("#actionModal .modalButtonRow").append("<button id='executeButton' class='modalButton'>HOLD TO EXECUTE</button>");

		if((payload.getItem(12)) && (!payload.getActiveEffect(13)))
		{
			$("#actionModal .modalButtonRow").append("<button id='digiPetButton' class='modalButton'>ACTIVATE DIGIPET?<br/>(1/SCENE)</button>");
		}

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

		$("#digiPetButton").bind("mouseup", function()
		{
			$("#digiPetButton").remove();
			$("#executeButton").prop("disabled", true);

			actionMap["newData"] = newData;
			actionMap["global"] = globalAction;
			actionMap["digipet"] = true;

			mbTimer.startTimer(maxTime,completeAction,actionMap);
		});

		$("#actionModal .modalHeaderText").html(actionMap["upperAction"] + " / " + actionMap["entryName"] + " / " + (actionMap["actionCost"] < 0 ? "+" + (actionMap["actionCost"] * -1) : actionMap["actionCost"]) + " Tag" + (Math.abs(actionMap["actionCost"]) === 1 ? "" : "s"));

		$(".modalBodyText").addClass("hidden");
		$("#modalBodyTimer .mmss .FG").html(mmss(maxTime));
		$("#modalBodyTimer .hundsec .FG").html("00");
		$("#modalBodyTimer").removeClass("hidden");

		$("#actionModal .modalButtonRow").attr("data-mode","execute");
		
		$("#load").addClass("hidden");
		$("#modalBG").css("display","flex");
	}
	else //USING COPYCAT
	{
		payload.setActiveEffect(5, true);

		$.ajax({
			type: "POST",
			dataType: "json",
			url: "resources\\scripts\\db\\useItems.php",
			data:
			{
				userID: payload.getUserID(),
				effectIDs: 5,
				termID: session.getTerminalID()
			}
		});

		actionMap["newData"] = newData;
		actionMap["global"] = globalAction;

		mbTimer.skipTimer(completeAction,actionMap);

		$("#load").removeClass("hidden");
	}
}

function activateDigiPet(actionMap, newData, globalAction)
{
	
}

function completeAction(actionMap)
{
	$("#load").addClass("hidden");

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
			$(actionMap["results"]["entryPath"] + " > .entryTitleBar > .entryMaskContainer").html(actionMap["results"]["title"]);
			$(actionMap["results"]["entryPath"] + " > .entryContentsBar > .entryMaskContainer").html(actionMap["results"]["contents"]);
			$(actionMap["results"]["entryPath"] + " > .entryIntContainer > .accessInterface").html(actionMap["results"]["access"]);
			$(actionMap["results"]["entryPath"] + " > .entryIntContainer > .modifyInterface").html(actionMap["results"]["modify"]);
			$(actionMap["results"]["entryPath"] + " > .subIce").removeClass("subIce");

			if(payload.getFunction("REPEAT"))
			{
				session.setFunctionState("REPEAT",actionMap["entryID"],actionMap["upperAction"].toLowerCase(),payload.getFunction("REPEAT"));
				updateEntryCosts("REPEAT",actionMap["results"]["entryPath"],actionMap["upperAction"]);
			}

			if(payload.getItem(14)) //JOHNNY'S SPECIAL TOUCH
			{
				session.setFunctionState("TOUCHED",actionMap["entryID"],actionMap["upperAction"].toLowerCase(),1);
				updateEntryCosts("TOUCHED",actionMap["results"]["entryPath"],actionMap["upperAction"]);
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
			session.brickTerminal(payload.getHandle());
			break;
		case("rig"):
			session.rigTerminal();
			break;
		case("root"):
			session.rootTerminal(new Date());
			break;
		case("item"):
			console.log(actionMap);

			$(".itemButton[data-effect='" + actionMap["entryID"] + "']").parent().find(".itemMarks img:nth-child(-n + " + actionMap["usedCharges"] + ")").attr("src","resources/images/actions/itemfilled.png");

			if(actionMap["remCharges"] <= 0)
			{
				$(".itemButton[data-effect='" + actionMap["entryID"] + "']").prop("disabled", true);
			}

			payload.useItemEffect(actionMap["entryID"])
			break;
	}

	session.setCurrentTags(session.getCurrentTags() - actionMap["actionCost"]);
	Gems.updateTagGems(Gems.STANDBY,session.getCurrentTags());
	disableExpensiveButtons();

	if((payload.getItem(4)) && (!payload.getActiveEffect(5)))
	{
		if((actionMap["upperAction"] !== "Activate") && (!session.isActionCopyable(actionMap["upperAction"])))
		{
			session.makeActionCopyable(actionMap["upperAction"]);
		}
	}

	if(Object.keys(actionMap).includes("digipet"))
	{
		if(actionMap["digipet"])
		{
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\db\\useItems.php",
				data:
				{
					userID: payload.getUserID(),
					effectIDs: 13,
					termID: session.getTerminalID()
				}
			})

			payload.setActiveEffect(13,true);
		}
	}
}

function updateEntryCosts(reducer, entryPath, entryAction)
{
	if((reducer === "REPEAT") && ((entryAction === "Access") || (entryAction === "Modify")))
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
	else if((reducer === "TOUCHED") && (entryAction === "Access"))
	{
		$("." + entryAction.toLowerCase() + "Button").each(function(index,entryButton){
			if($(entryButton).html() !== "N/A")
			{
				let newCost = session.getActionCost($(entryButton).attr("data-id"), entryAction.toLowerCase());
				$(entryButton).attr("data-cost",newCost);
				$(entryButton).html(newCost + " Tag" + (newCost === 1 ? "" : "s"));
			};
		});

		$(".touchedIndicator").removeClass("dimmed");

		if(!payload.getActiveEffect(15))
		{
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\db\\useItems.php",
				data:
				{
					userID: payload.getUserID(),
					effectIDs: 15,
					termID: session.getTerminalID()
				}
			})

			payload.setActiveEffect(15,true);
		}
	}
}