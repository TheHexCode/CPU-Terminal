//var session = new Session(); <- Created by classes\terminal.php
var payload = new Payload();
var taTimer = new Timer("#termAccessTimer");
var actionModal;
/////////////////////////////////////////////////////////////////
var revMM;
/////////////////////////////////////////////////////////////////

$(document).ready(function()
{
	$(".codeInput").val("");
	$(".codeSubmit").attr("disabled", true);
	$("#terminalButton").attr("disabled",true);
	$(".initItem input").prop("checked",false);

	actionModal = new Modal(Modal.ACTION);

	Listener.testConnection();
});

function tens(numStr)
{
	var tensFormat = new Intl.NumberFormat('en-US', { 
		minimumIntegerDigits: 2
	});
	
	return tensFormat.format(Number(numStr));
}

function pluralize(num)
{
	if(Math.abs(Number(num)) === 1)
	{
		return "";
	}
	else
	{
		return "s";
	}
}

function mmss(secs)
{
	let mm = tens(parseInt(secs/60));
	let ss = tens(parseInt(secs%60));

	return mm + ":" + ss
}

function romanize(num)
{
	let roman = "";

	let numeralMap = {
		 M: 1000,
		CM: 900,
		 D: 500,
		CD: 400,
		 C: 100,
		XC: 90,
		 L: 50,
		XL: 40,
		 X: 10,
		IX: 9,
		 V: 5,
		IV: 4,
		 I: 1
	}

	for (i in numeralMap)
	{
		while (num >= numeralMap[i])
		{
			roman += i;
			num -= numeralMap[i];
		}
	}

	return roman;
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

function activateCodeSubmit(event)
{
	if((event.key === "Enter") && (event.target.value.length === 6))
	{
		submitCode(event);
	}
	else
	{
		if(event.target.value.length === 6)
		{
			$("#payloadCodeSubmit").prop("disabled",false);
		}
		else
		{
			$("#payloadCodeSubmit").prop("disabled",true);
		}
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
		url: "/resources/scripts/terminal/db/getUser.php",
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

	affordableButtons = $("button[data-enabled!='false']").filter(function() {
		return $(this).attr("data-cost") <= session.getCurrentTags()
	});

	$(affordableButtons).prop("disabled",false);
}

function injectUserPayload(userPayload)
{
	if(userPayload.length === 0)
	{
		$("#payloadCodeInput").prop("readonly",false);
		alert("No Such User! Please Try Another Code");
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
									"" )
							);

		let maxTime = 30; // Functions and Items should not affect this

		if(payload.hasDeck())
		{
			$("#terminalButton").html("Cracking Terminal...");
			$("#terminalButton").removeClass("noPayload");
		}
		else
		{
			$("#terminalButton").html("No Cyberdeck!");
		}
		taTimer.startTimer(maxTime,allowAccess);
				
		//// TAG MANAGEMENT

		// Required Tags
		requiredTags = parseInt($("#reqTags").html());

		// Payload Tags
		$("#hackDetails").html(
			"<span>[HACKING:&nbsp;+" + tens(payload.getFunction("HACKING") * 2) + "]</span>"
		)

		$("#extraDetails").html(
			payload.getFunction("ROOT EXPLOIT") ? "<span>[ROOT EXP:+" + tens(payload.getFunction("ROOT EXPLOIT") * 2) + "]</span>" : ""
		)

		updateTags(payload.getFunction("HACKING") * 2, Session.HACK);
		updateTags(payload.getFunction("ROOT EXPLOIT") * 2, Session.REX);

		// Extra Tags + Gems/Remaining Tags
		updateTags(0,Session.EXTRA);

		// ROLE
		if(payload.hasRole("DISSIMULATOR"))
		{
			$("#disInit").removeClass("hidden");
		}

		if(payload.hasRole("POLYMATH"))
		{
			$("#polyInit").removeClass("hidden");
		}

		//!! Bastion!

		// FUNCTIONS / INVENTORY

		///////////// ACTIVE

		if(payload.getFunction("BRICK"))
		{
			$("#noActFuncs").addClass("hidden");
			$("#brickItem").removeClass("hidden");
		}

		if(payload.getFunction("RIGGED"))
		{
			$("#noActFuncs").addClass("hidden");
			$("#rigItem").removeClass("hidden");
			session.rigTerminal(payload.getUserID());
		}

		if(payload.getFunction("ROOT DEVICE"))
		{
			$("#noActFuncs").addClass("hidden");
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

		if(payload.getFunction("SIPHON CHARGE"))
		{
			$("#noActFuncs").addClass("hidden");
			$("#siphItem").removeClass("hidden");
		}

		if(payload.getFunction("PING"))
		{
			$("#noActFuncs").addClass("hidden");

			$("#actSeparator").removeClass("hidden");
			$("#pingItem").removeClass("hidden");
		}

		///////////// PASSIVE

		if(payload.getFunction("ALARM SENSE"))
		{
			$("#noPassFuncs").addClass("hidden");
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
			$("#bdItem").append(" " + romanize(payload.getFunction("BACKDOOR")));

			$("#noPassFuncs").addClass("hidden");
			$("#bdItem").removeClass("hidden");
		}

		if(payload.getFunction("DARK WEB MERCHANT") || payload.getFunction("DARK WEB OPERATOR"))
		{
			$("#noPassFuncs").addClass("hidden");

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
			$("#darkwebSubTab").removeClass("inactive");
			$("#darkwebSubTab").addClass("disabled");
			$("#darkwebSubTab").attr("onclick","");
		}

		if(payload.getFunction("KNOWLEDGE"))
		{
			$("#passSeparator").removeClass("hidden");
			$("#knowItem").removeClass("hidden");

			payload.getFunction("KNOWLEDGE").replace("&amp;","&").split(";").forEach(function (keyword)
			{
				$("#knowItem > ul").append("<li>" + keyword.toUpperCase().replace("&","&amp;") + "</li>");
			});
		}

		if(payload.getFunction("REPEAT"))
		{
			$("#noPassFuncs").addClass("hidden");

			$("#repeatItem").append(" " + romanize(payload.getFunction("REPEAT")));
			$("#repeatItem").removeClass("hidden");

			$(".repeatBox .subContModifierTitle").append(" " + romanize(payload.getFunction("REPEAT")));
			$(".repeatBox").removeClass("hidden");
		}

		///////////// ITEMS

		if(payload.hasDeck())
		{
			$(".hasDeck").removeClass("hidden");
		}
		else
		{
			$(".noDeck").removeClass("hidden");
		}

		payload.getInventory().forEach(function(item)
		{
			let effectString = "<hr/>";

			item.effects.forEach(function(effect)
			{
				$("#noItems").addClass("hidden");

				$(".itemCat[data-cat='" + item.category + "']").removeClass("hidden");

				switch(effect.use_loc)
				{
					case("init"):
					case("before_after"):
					{
						////////////////////
						//	CMM Widow
						//	CMM Cocoon
						//	CLEC Fingers
						//  Vigil T0
						//  Vigil T1
						////////////////////
						////////////////////
						//	Shimmerstick T0
						//  Shimmerstick T1
						//  Budget Access Remote Drive (REQ: HACKING I)
						//  Canopic Jar [Magsweep]
						////////////////////

						let disabled = false;

						let target = $(".initItem[id='" + effect.abbr + "_init']")[0];

						if(effect.termUses > 0)
						{
							//Don't need to check the box since if termUses is > 0
							//  they've already accessed the terminal and won't see the checkbox
							//But they have used it, so set the Active Effect
							payload.setActiveEffect(effect.abbr, true);

							if((effect.abbr === "shim_0") || (effect.abbr === "shim_1"))
							{
								$("#shimStatus").attr("src", "/resources/images/status/" + effect.abbr + ".png");
								$("#shimStatus").toggleClass("hidden", $(target).prop("checked"));
							}
						}
						else if((effect.req_type === "function") && (!payload.getFunction(effect.requirement)))
						{
							//Doesn't have the requisite function to use item
							//EX: CMM Arms need Slip
							//    B.R.A.D. needs Hacking I
							if($("#" + target.id + " .initReq").length === 0)
							{
								$("#" + target.id + " .initHeader").append("<span class='initReq'><br/>&nbsp;[Req Func: " + effect.requirement + "]</span>");
							}
							disabled = true;
						}
						else if((effect.req_type === "active_effect") && (!payload.getActiveEffect(effect.requirement)))
						{
							//Doesn't have the requisite active effect to use item
							//No current examples, but future proofing
							disabled = true;
						}
						else if((effect.per_type === "item") && (effect.charges > 1))
						{
							// This is for the "USES LEFT:" section for multi-use consumables
							// I.E. Shimmerstick
							$(target).find(".useSum").html(Math.max(effect.charges - effect.uses, 0));

							if(effect.uses >= effect.charges)
							{
								disabled = true;
							}
						}
						else if((effect.per_type !== null) && (effect.uses >= effect.charges))
						{
							//Ran out of charges, cannot use on this terminal
							disabled = true;
						}

						let stack = Number($("#" + target.id + " input").attr("data-stack"));

						if(!isNaN(stack))
						{
							stack++;

							$("#" + target.id + " input").attr("data-stack",stack);
						}

						$("#" + target.id + " input").prop("disabled", disabled);
						$("#" + target.id + " button").prop("disabled", disabled);
						$(target).toggleClass("dimmed", disabled);

						$(target).removeClass("hidden");
						
						break;
					}
				}

				// TWO SWITCH/CASE STATEMENTS SO THAT BEFORE_AFTER DOES BOTH init AND itemTab things

				switch(effect.use_loc)
				{
					case("itemTab"):
					case("before_after"):
					{
						////////////////////
						//	DECKS:
						//  - Budget Cyberdeck
						//  - CRD Spider Cyberdeck T1
						//  - CRD Spider Cyberdeck T2
						//  - MM Console
						//  - Pocket Hacker T0
						//  - Pocket Hacker T1
						//  DigiPet [Play]
						////////////////////
						////////////////////
						//	Shimmerstick T0
						//  Shimmerstick T1
						//  Budget Access Remote Drive (REQ: HACKING I)
						//  Canopic Jar [Magsweep]
						////////////////////

						// ABILITY TO USE EFFECT NOT DETERMINED BY CHARGES
						// EX: Budget Access Remote Drive
						if(effect.charges === null)
						{							
							//!! Add Use Button to Effect String
						}
						else // ABILITY TO USE IS LIMITED BY CHARGES
						{
							let remCharges = effect.charges - effect.uses;

							// DECKS, WHICH HAVE DEDICATED CHARGES
							if((item.radio === "deck") || (item.radio === "ph"))
							{
								let plusTags = 0;

								switch(effect.abbr)
								{
									case("deck_bud"):
									case("deck_crd_1"):
									case("deck_mm"):
									case("phack_0"):
									case("phack_1"):
									{
										plusTags = 1;
										break;
									}
									case("deck_crd_2"):
									{
										plusTags = 2;
										break;
									}
								}

								effectString += "<span class='itemActionRow'>" +
													"<span class='itemMarks'>";
								
								for(let i = 0; i < effect.uses; i++)
								{
									effectString += "<img src='/resources/images/actions/itemfilled.png' />";
								}

								for(let j = 0; j < remCharges; j++)
								{
									effectString += "<img src='/resources/images/actions/itemopen.png' />";
								}
								
								effectString += "<span>per " + (effect.per_type === "sim" ? "Sim" : "Scene") + "</span>" +
											"</span>" +
											"<button class='deckButton' data-effect='" + effect.abbr + "' data-plus='" + plusTags + "' onclick='takeAction(this)' " + (remCharges === 0 ? "disabled" : "") + ">+" + plusTags + " Tag" + (plusTags === 1 ? "" : "s") + "</button>" +
										"</span>";
							}
							else
							{
								////////////////////
								//  DigiPet [Play]
								////////////////////
								////////////////////
								//	Shimmerstick T0
								//  Shimmerstick T1
								//  Canopic Jar [Magsweep]
								////////////////////

								switch(effect.abbr)
								{
									case("pet_play"):
									{
										// STATUS BAR

										if(!payload.getActiveEffect("pet_use")) // HASN'T BEEN USED THIS SCENE
										{
											if(effect.uses >= effect.charges)
											{
												$("#petStatus").attr("src","/resources/images/status/pet_ready.png");

												effectString += "<span class='itemActionRow'>" +
																	"<span></span>" +
																	"<button class='petButton' data-effect='" + effect.abbr + "' onclick='takeAction(this)' disabled>Played With Already</button>" +
																"</span>";

												payload.setActiveEffect("pet_play", true);
											}
											else
											{
												$("#petStatus").attr("src","/resources/images/status/pet_egg.png");

												effectString += "<span class='itemActionRow'>" +
																	"<span></span>" +
																	"<button class='petButton' data-effect='" + effect.abbr + "' onclick='takeAction(this)'>Play With DigiPet!</button>" +
																"</span>";
											}
										}

										$("#petStatus").removeClass("hidden");

										break;
									}
									case("shim_0"):
									case("shim_1"):
									{
										if(effect.uses < effect.charges)
										{
											effectString += "<span class='itemActionRow'>" +
															"<span></span>" +
															"<button class='shimButton' data-effect='" + effect.abbr + "' onclick='takeAction(this)'>Use on Device</button>" +
														"</span>";
										}
										else
										{
											effectString += "<span class='itemActionRow'>" +
															"<span></span>" +
															"<button class='shimButton' data-effect='" + effect.abbr + "' disabled>No Uses Left!</button>" +
														"</span>";
										}
										
										break;
									}
									case("impl_mags"):
									{
										effectString += "<span class='itemActionRow'>" +
															"<span></span>" +
															"<button class='impl_magsButton' data-effect='" + effect.abbr + "' onclick='takeAction(this)'>Brick this Device?</button>" +
														"</span>";
										break;
									}
								}
							}
						}

						break;
					}
					case("auto_init"):
					{
						////////////////////
						//	CypherSync Beacon
						//  Power Glove [Ultra-Hacking 9000]
						////////////////////
						switch(effect.abbr)
						{
							case("beac"): // CIPHERSYNC BEACON
							{
								$("#hackDetails").append("<span>[BEACON:&nbsp;&nbsp;+02]</span>");
								updateTags(2,Session.BEACON);

								break;
							}
							case("deck_uh9k"): // POWER GLOVE [UH9K]
							{
								payload.setActiveEffect(effect.abbr, true);

								break;
							}
						}

						break;
					}
					case("confirm"):
					{
						////////////////////
						//	CopyCat
						////////////////////
						switch(effect.abbr)
						{
							case("copycat"): //COPYCAT
							{
								if(effect.uses >= effect.charges)
								{
									payload.setActiveEffect(effect.abbr, true);
								}

								break;
							}
						}

						break;
					}
					case("execute"):
					{
						////////////////////
						//	DigiPet [Use]
						////////////////////
						switch(effect.abbr)
						{
							case("pet_use"): //DIGIPET_USE
							{
								if(effect.uses >= effect.charges)
								{
									$("#petStatus").attr("src","/resources/images/status/pet_sleep.png");

									payload.setActiveEffect(effect.abbr, true);
								}

								break;
							}
						}

						break;
					}
					case("auto_action"):
					{
						////////////////////
						//	deck_jst
						////////////////////
						switch(effect.abbr)
						{
							case("deck_jst"): //JOHNNY'S SPECIAL TOUCH
							{
								$(".touchedBox").removeClass("hidden");

								if(effect.termUses > 0)
								{
									payload.setActiveEffect(effect.abbr, true);
								}

								break;
							}
						}

						break;
					}
				}
			});

			$(".itemCat[data-cat='" + item.category + "'] > .itemList").append(
				"<li id='item_" + item.abbr + "' class='itemItem'>" +
					"<span class='itemName'>" + item.name + (item.tier !== null ? " [T" + item.tier + "]" : "") + "</span>" +
					(effectString.length > 5 ? effectString : "") +
				"</li>"
			);

			if(payload.getActiveEffect("shim_0")) //SHIM [T0] ACTIVE
			{
				$(".shimButton").attr("disabled",true);
				$(".shimButton[data-effect='shim_0']").html("Already Active");
				$(".shimButton[data-effect='shim_1']").html("Other Shimmerstick Active");
			}
			else if(payload.getActiveEffect("shim_1"))  //SHIM [T1] ACTIVE
			{
				$(".shimButton").attr("disabled",true);
				$(".shimButton[data-effect='shim_0']").html("Other Shimmerstick Active");
				$(".shimButton[data-effect='shim_1']").html("Already Active");
			}
		});

		if(userPayload["hasAccessed"])
		{
			actionResults = [];

			userPayload["prevActions"].forEach(function(entry)
			{
				results = $.getJSON(
					"/resources/scripts/terminal/db/getEntryUpdate.php",
					{
						id: entry["id"],
						newState: entry["newState"],
						action: entry["action"],
						actionUser: entry["user_id"],
						userID: payload.getUserID()
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

					$(resultJSON["entryPath"] + " > .entryTitleBar > .entryMaskContainer").html(resultJSON["title"]);
					$(resultJSON["entryPath"] + " > .entryContentsBar > .entryMaskContainer").html(resultJSON["contents"]);
					$(resultJSON["entryPath"] + " > .entryIntContainer > .accessInterface").html(resultJSON["access"]);
					$(resultJSON["entryPath"] + " > .entryIntContainer > .modifyInterface").html(resultJSON["modify"]);
					$(resultJSON["entryPath"] + " > .subIce").removeClass("subIce");

					if(resultJSON["actionUser"] === payload.getUserID())
					{
						if(payload.getFunction("REPEAT"))
						{
							session.setFunctionState("REPEAT",resultJSON["entryID"],resultJSON["action"].toLowerCase(),payload.getFunction("REPEAT"));
							updateEntryCosts("REPEAT",resultJSON["entryPath"],resultJSON["action"]);
						}

						if(payload.getActiveEffect("deck_jst")) // JOHNNY'S SPECIAL TOUCH
						{
							session.setFunctionState("TOUCHED",resultJSON["entryID"],resultJSON["action"].toLowerCase(),1);
							updateEntryCosts("TOUCHED",resultJSON["entryPath"],resultJSON["action"]);
						}
					}
				});

				disableExpensiveButtons();
			});

			userPayload["puzzActions"].forEach(function(puzzle)
			{
				console.log({puzzle});
				if(puzzle["repeat"] <= puzzle["uses"])
				{

				}
			});

			if((payload.getItem("copycat")) && (!payload.getActiveEffect("copycat")))
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

			if(userPayload["masherData"] !== null)
			{
				session.setMasher(userPayload["masherData"]);

				$("#masherBox").html(	"<div id='masherHeader' class='accessHeader'>" +
											"<u>BUTTON MASHER IDENTIFIED</u>" +
										"</div>" +
										"<span>Masher: " + session.getMasher("name") + "</span>" +
										"<div>Tags: +" + tens(session.getMasher("rank")) + "</div>"
									);
			}

			accessTerminal("hasAccessed");
		}
	}

	new Listener(payload.getUserID());

	$("#load").addClass("hidden");
}

function initRadio(target)
{
	//This assumes a radio selection of only two for now
	let prevTarget = $("input[name='"+$(target).prop("name")+"'][data-active='true']");

	if($(target).attr("data-active") === "true") //CLICK OFF
	{
		$(target).attr("data-active",false);
		$(target).prop("checked",false);
	}
	else //CLICK ON, TURN OTHER OFF
	{
		prevTarget.attr("data-active",false);
		$(target).attr("data-active",true);
	}

	//Remove old effects
	if(prevTarget.length > 0)
	{
		prevTarget = prevTarget[0];

		switch(prevTarget.value)
		{
			case("plusHack"):
			{
				$("#hackDetails #disDetails").remove();
				updateTags(-2,Session.DISSIM);

				break;
			}
			case("k_HDS"):
			{
				if(payload.getExtraFunction("KNOWLEDGE"))
				{
					if(payload.getExtraFunction("KNOWLEDGE")["keywords"].includes("Hacking &amp; DigiSec"))
					{
						$("#knowItem #disKnow").remove();
						payload.minusFunction("k_HDS");
					}
				}

				break;
			}
			case("alarmSense"):
			{
				if(payload.getExtraFunction("ALARM SENSE"))
				{
					$("#polyAS").remove();
					payload.minusFunction("alarmSense");
				}
				
				break;
			}
			case("plusRepair"):
			{
				if(payload.getExtraFunction("REPAIR"))
				{
					payload.minusFunction("repair");
				}

				break;
			}
		}
	}

	//Turn on new effects only if they didn't just turn themselves off
	if(prevTarget !== target)
	{
		switch(target.value)
		{
			case("plusHack"):
			{
				$("#hackDetails").append("<span id='disDetails'>[DISSIM:&nbsp;&nbsp;+02]</span>");
				updateTags(2,Session.DISSIM);

				break;
			}
			case("k_HDS"):
			{
				if(!(payload.getFunction("KNOWLEDGE").includes("Hacking &amp; DigiSec")))
				{
					$("#knowItem > ul").append("<li id='disKnow'>DISSIM: HACKING &amp; DIGISEC</li>");
					payload.plusFunction("k_HDS");
				}

				break;
			}
			case("alarmSense"):
			{
				if(!(payload.getFunction("ALARM SENSE")))
				{
					$("#alarmItem").after("<li id='polyAS'>POLY: ALARM SENSE</li>");
					payload.plusFunction("alarmSense");
				}

				break;
			}
			case("plusRepair"):
			{
				payload.plusFunction("repair");
				
				break;
			}
		}
	}
}

function initCheck(target)
{
	let effect = payload.getEffect(target.id.split("_opt")[0]);

	switch(effect["abbr"])
	{
		////////////////////
		//	CLEC Fingers - impl_clec
		//  CMM Widow - cmm
		//	CMM Cocoon - cmm
		//  Vigil T0 - vigl0
		//  Vigil T1 - vigl1
		//  X Canopic Jar [Magsweep]
		////////////////////
		////////////////////
		//	Shimmerstick T0 - shim0
		//  Shimmerstick T1 - shim1
		//  X Budget Access Remote Drive
		////////////////////

		case("impl_clec"): // CLEC Fingers (+Hack)
		{
			if($(target).prop("checked"))
			{
				$("#hackDetails").append("<span id='clecDetails'>[FINGERS:&nbsp;+02]</span>");
				updateTags(2,Session.CLEC);
			}
			else
			{
				$("#hackDetails #clecDetails").remove();
				updateTags(-2,Session.CLEC);
			}
			break;
		}
		case("cmm"): // CMM Cocoon / CMM Widow (+1 Tag, Stacks)
		{
			let stackVal = Number($(target).attr("data-stack"));

			session.setExtraTagMin($(target).prop("checked") ? stackVal : (stackVal * -1));
			updateTags($(target).prop("checked") ? stackVal : (stackVal * -1), Session.EXTRA);
			payload.setActiveEffect(effect["abbr"], $(target).prop("checked"));

			if($(target).prop("checked"))
			{
				$("#extraDetails").append("<span id='cmmDetails'>[CMM ARMS:+" + tens(stackVal) + "]</span>");
			}
			else
			{
				$("#extraDetails #cmmDetails").remove();
			}

			break;
		}
		case("shim_0"): // Shimmerstick T0 (+1 Tag to All Costs, +30s to All Timers)
		case("shim_1"): // Shimmerstick T1 (+1 Tag to All Costs, +15s to All Timers)
		{
			let otherTarget = $("#" + (effect["abbr"] === "shim_0" ? "shim_1" : "shim_0") + "_init")[0];
			payload.setActiveEffect(effect["abbr"], $(target).prop("checked"));

			if(Number($("#" + otherTarget.id + " .useSum").html()) > 0)
			{
				$("#" + otherTarget.id + " input").prop("disabled", $(target).prop("checked"));
				$(otherTarget).toggleClass("dimmed", $(target).prop("checked"));
			}

			$("#shimStatus").attr("src", "/resources/images/status/" + effect["abbr"] + ".png");
			$("#shimStatus").toggleClass("hidden", !$(target).prop("checked"));

			if(payload.getActiveEffect("shim_0")) //SHIM [T0] ACTIVE
			{
				$(".shimButton").attr("disabled",true);
				$(".shimButton[data-effect='shim_0']").html("Already Active");
				$(".shimButton[data-effect='shim_1']").html("Other Shimmerstick Active");
			}
			else if(payload.getActiveEffect("shim_1"))  //SHIM [T1] ACTIVE
			{
				$(".shimButton").attr("disabled",true);
				$(".shimButton[data-effect='shim_0']").html("Other Shimmerstick Active");
				$(".shimButton[data-effect='shim_1']").html("Already Active");
			}
			else
			{
				if(Number($("#shim_0_init .useSum").html()) > 0)
				{
					$(".shimButton[data-effect='shim_0']").attr("disabled",false);
					$(".shimButton[data-effect='shim_0']").html("Use on Device");
				}
				else
				{
					$(".shimButton[data-effect='shim_0']").html("No Uses Left!");
				}
				
				if(Number($("#shim_1_init .useSum").html()) > 0)
				{
					$(".shimButton[data-effect='shim_1']").attr("disabled",false);
					$(".shimButton[data-effect='shim_1']").html("Use on Device");
				}
				else
				{
					$(".shimButton[data-effect='shim_1']").html("No Uses Left!");
				}
			}

			//Only need to allow access to Term if user doesn't have a cyberdeck
			if(!(payload.hasDeck()))
			{
				if($(target).prop("checked"))
				{
					//Timer is Alive when is still running, so don't allow access, but make it show as ready to go
					if(taTimer.isAlive())
					{
						$("#terminalButton").html("Cracking Terminal...");
						$("#terminalButton").removeClass("noPayload");
					}
					else
					{
						$("#terminalButton").removeClass("noPayload");
						allowAccess();
					}
				}
				else
				{
					$("#terminalButton").html("No Cyberdeck!");
					$("#terminalButton").attr("disabled", true);
					$("#terminalButton").addClass("noPayload");
				}
			}

			break;
		}
		case("vigl_0"): // Vigil T0
		case("vigl_1"): // Vigil T1
		{

			break;
		}
	}
}

function initAction(target)
{
	////////////////////
	//  Budget Access Remote Drive (REQ: HACKING I)
	//  Canopic Jar [Magsweep]
	////////////////////

	let effect = target.dataset["effect"];

	switch(effect)
	{
		case("brad"):
		{
			console.log("B.R.A.D.");

			break;
		}
		case("impl_mags"):
		{
			console.log("BRICK!");

			break;
		}
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
				$("#hackHeader").append("<span id='hackMax'>(MAX: 10)</span>");
			}

			if((session.getCurrentTags() + change) > 99+reqTags)
			{
				session.setCurrentTags((change * -1), Session.EXTRA);
				extTags = session.getCurrentTags(Session.EXTRA);
			}
	
			session.setCurrentTags(change, tagType);
			payTags = session.getCurrentTags(Session.PAYLOAD);
			break;
		case(Session.REX):
		case(Session.MASHER):
			if((session.getCurrentTags() + change) > 99+reqTags)
			{
				session.setCurrentTags((change * -1), Session.EXTRA);
				extTags = session.getCurrentTags(Session.EXTRA);
			}
	
			session.setCurrentTags(change, tagType);
			session.setExtraTagMin(change);

			extTags = session.getCurrentTags(Session.EXTRA);
			break;
		case(Session.EXTRA):
			newTags = Math.min(
				Math.max(extTags + change, session.getExtraTagMin()),
				99 - ( payTags - reqTags )
			);

			change = newTags - extTags;

			if(newTags < 0)
			{
				$("#extTagsBG").html("~~~");
			}
			else
			{
				$("#extTagsBG").html("~~");
			}

			session.setCurrentTags(change, Session.EXTRA);

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
	if(payload.hasDeck() || payload.getActiveEffect("shim0") || payload.getActiveEffect("shim1"))
	{
		$("#terminalButton").html("Access Terminal");
		$("#terminalButton").attr("disabled",false);
	}
}

function accessTerminal(event)
{
	if((event === "hasAccessed") || (!event.target.disabled))
	{
		let reqTags = parseInt($("#reqTags").html());

		session.setCurrentTags(session.getCurrentTags() - reqTags);
		Gems.updateTagGems(Gems.STANDBY, session.getCurrentTags());

		if(payload.getFunction("ALARM SENSE"))
		{
			//MOVED HERE SO THAT ADDING ALARM SENSE FROM POLYMATH STILL APPLIES

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

		// Disable Expensive Buttons
		disableExpensiveButtons();

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
				url: "/resources/scripts/terminal/db/addLogEntry.php",
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

function activateBMCodeSubmit(event)
{
	if((event.key === "Enter") && (event.target.value.length === 6))
	{
		submitBMCode(event);
	}
	else
	{
		if(event.target.value.length === 6)
		{
			$("#masherCodeSubmit").prop("disabled",false);
		}
		else
		{
			$("#masherCodeSubmit").prop("disabled",true);
		}
	}
}

function submitBMCode(event)
{
	event.preventDefault();

	$("#masherCodeInput").prop("readonly",true);

	$("#load").removeClass("hidden");

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "/resources/scripts/terminal/db/getMasher.php",
		data:
		{
			masherCode: $("#masherCodeInput")[0].value,
			mainID: payload.getUserID(),
			termID: session.getTerminalID()
		}
	})
	.done(function(masherData)
	{
		injectButtonMasher(masherData);
	});
}

function injectButtonMasher(masherData)
{
	/*
		masherData:
		 - id   -> masher's character ID
		 - name -> masher's character name
		 - rank -> masher's rank in Button Masher
		 - uses -> number of times this Scene that BM has been activated for the Masher
		           (should always be 0 or 1 since BM is 1/Scene)
	*/

	if(masherData["name"] === null)
	{
		$("#masherCodeInput").prop("readonly",false);
		alert("No Such User! Please Try Another Code");
	}
	else
	{
		console.log(masherData);
		if(masherData["id"] === payload.getUserID())
		{
			$("#masherCodeInput").prop("readonly",false);
			alert("You can't be your own Button Masher! Try again!");
		}
		else
		{
			if(masherData["rank"] < 2)
			{
				$("#masherCodeInput").prop("readonly",false);
				alert(masherData["name"] + " only has " + masherData["rank"] + " rank" + (masherData["rank"] === 1 ? "" : "s") + " in Button Masher, but requires at least two (2) to provide assistance.");
			}
			else
			{
				if(masherData["uses"] !== 0)
				{
					$("#masherCodeInput").prop("readonly",false);
					alert(masherData["name"] + " has already used Button Masher this Scene!");
				}
				else
				{
					session.setMasher(masherData);

					$.ajax({
						type: "POST",
						dataType: "json",
						url: "/resources/scripts/terminal/db/userActions.php",
						data:
						{
							userID: payload.getUserID(),
							targetID: session.getTerminalID(),
							action: "masher",
							actionType: "masher",
							newState: session.getMasher("id"),
							actionCost: session.getMasher("rank") * -1,
							global: false
						}
					});

					$("#masherBox").html(	"<div id='masherHeader' class='accessHeader'>" +
												"<u>BUTTON MASHER IDENTIFIED</u>" +
											"</div>" +
											"<span>Masher: " + masherData["name"] + "</span>" +
											"<div>Tags: +" + tens(masherData["rank"]) + "</div>"
										);

					session.setCurrentTags(session.getCurrentTags() + masherData["rank"]);
					Gems.updateTagGems(Gems.STANDBY,session.getCurrentTags());

					disableExpensiveButtons();
				}
			}
		}
	}

	$("#load").addClass("hidden");
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
	let targetID = target.dataset["id"];

	let headerText = "";
	let executeHeader = "";
	let bodyText = "";
	let copycatText = 	(payload.getItem("copycat") && (!payload.getActiveEffect("copycat")) && session.isActionCopyable(action)) ?
						"<br/><br/>" +
						"<span class='copycatBox'>" +
							"<input id='copycatActivate' type='checkbox'/>" +
							"<span class='copycatLabel'>(1/Sim) Activate Copycat for this action to complete it immedidately?</span>" +
						"</span>" : "";
	let buttonArray = [];

	/*
	> ACTIONS
		entry
	   	 - access
	   	 - modify
	  	ice
	   	 - break
	   	 - sleaze
		log
		 - reass
		 - wipe
		active actions
		 - brick
		 - rig
		 - root
		 - siph(on charge)
		refresh actions
		 - ping
		active items
		 - deck
		 - shim
		 - pet
	*/

	switch (action)
	{
		// Standard Entry
		case "access":
		case "modify":
		{
			$("#load").removeClass("hidden");

			let actionType = "entry";
			let actionVerb = action.charAt(0).toUpperCase() + action.slice(1);
			let actionCost = session.getActionCost(targetID,action);

			let entryPath = "#" + $(target).parents(".entry")[0].id;
			let entryName = $(entryPath + " .entryPrefix").text().slice(3,-2);
			let currentState = session.getEntryState(targetID);

			let entryJSON = $.getJSON(
				"/resources/scripts/terminal/db/getEntryActions.php",
				{ id: targetID, state: currentState, action: action }
			)
			.done(function() {
				Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionCost,session.getCurrentTags());

				// HEADER TEXT
				headerText = "Confirm " + actionVerb + " Action";
				executeHeader = actionVerb + " / " + entryName + " / " + actionCost + " Tag" + pluralize(actionCost);

				// BODY TEXT
				bodyText = actionVerb + " \"" + entryName + "\" for " + actionCost + " Tag" + pluralize(actionCost) + "?" + copycatText;

				// BUTTON ARRAY
				let options = entryJSON.responseJSON;

				options.forEach(function(option, index)
				{
					let buttonID = action + targetID + index;
					
					buttonArray.push({
						id: buttonID,
						text: option.button,
						data: option.state,
						global: option.global
					});
				});

				let actionMap = {
					userID: payload.getUserID(),
					targetID: targetID,
					action: action,
					actionType: actionType,
					actionCost: actionCost,
					currentState: currentState
				};

				let confirmMap = {
					headerText: headerText,
					bodyText: bodyText,
					buttonArray: buttonArray,
					executeHeader: executeHeader
				};

				actionModal.showConfirmPage(actionMap, confirmMap);
			});

			break;
		}
		// ICE Entry
		case "break":
		case "sleaze":
		{
			let actionType = "ice";
			let actionVerb = action.charAt(0).toUpperCase() + action.slice(1);
			let actionCost = session.getActionCost(targetID,(action === "break" ? "access" : "modify"));

			let entryPath = "#" + $(target).parents(".entry")[0].id;
			let entryName = $(entryPath + " .entryPrefix").html().slice(9,-2);

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionCost,session.getCurrentTags());

			// HEADER TEXT
			headerText = "Confirm " + actionVerb + " Action";
			executeHeader = actionVerb + " / " + entryName + " / " + actionCost + " Tag" + pluralize(actionCost);

			// BODY TEXT
			bodyText = 	actionVerb + " \"" + entryName + "\" for " + actionCost + " Tag" + pluralize(actionCost) + "?" + 
						(action === "break" ?
							"<div class='cautionTape'>" +
								"WARNING: Breaking ICE means tripping it and taking any negative effects it may incur. <em>Sleaze</em> the ICE instead to disable the security, in exchange for Tags." +
							"</div>" : "") +
						copycatText;

			// BUTTON ARRAY
			let buttonArray = [{
				id: action + targetID,
				text: "Confirm",
				data: action,
				global: true
			}];

			let actionMap = {
				userID: payload.getUserID(),
				targetID: targetID,
				action: action,
				actionType: actionType,
				actionCost: actionCost,
				currentState: "initial"
			};

			let confirmMap = {
				headerText: headerText,
				bodyText: bodyText,
				buttonArray: buttonArray,
				executeHeader: executeHeader
			};

			actionModal.showConfirmPage(actionMap, confirmMap);
			
			break;
		}
		// Log Entry
		case "reass":
		case "wipe":
		{
			let actionType = "log";
			let actionVerb = (action === "reass" ? "Reassign" : "Wipe Tracks");
			let actionCost = session.getActionCost("nonEntry", action);

			let entryPath = "#" + $(target).parents('.logEntry')[0].id;
			let entryName = $(entryPath + " .logName").html();

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionCost,session.getCurrentTags());

			// HEADER TEXT
			headerText = "Confirm " + actionVerb + " Action";
			executeHeader = actionVerb + " / " + entryName + " / " + actionCost + " Tag" + pluralize(actionCost);

			// BODY TEXT
			bodyText = 	actionVerb.split(" ")[0] + " Log Entry for \"" + entryName + "\" for " + actionCost + " Tag" + pluralize(actionCost) + "?" + 
						(action === "reass" ?
							"<br/><br/>" +
							"<div id='reassName' class='multiLineTextInput'>" +
								"<label for='reassInput'>New Name to Reassign Log Entry to:</label>" +
								"<span class='middleText'>(This MAY be used to imitate someone else!)</span>" +
								"<input type='text' id='reassInput' placeholder='Anonymous User' maxlength='15'></input>" +
							"</div>" : "") +
						copycatText;

			// BUTTON ARRAY
			let buttonArray = [{
				id: action + targetID,
				text: "Confirm",
				data: null,
				global: true
			}];

			let actionMap = {
				userID: payload.getUserID(),
				targetID: targetID,
				action: action,
				actionType: actionType,
				actionCost: actionCost
			};

			let confirmMap = {
				headerText: headerText,
				bodyText: bodyText,
				buttonArray: buttonArray,
				executeHeader: executeHeader
			};

			actionModal.showConfirmPage(actionMap, confirmMap);

			break;
		}
		// Active Functions
		case "brick":
		case "rig":
		case "root":
		{
			let actionType = action;
			let actionVerb = action.charAt(0).toUpperCase() + action.slice(1);
			let actionCost = session.getActionCost("nonEntry", action);

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionCost,session.getCurrentTags());

			// HEADER TEXT
			headerText = "Confirm " + actionVerb + " Action";
			executeHeader = actionVerb + " / Device / " + actionCost + " Tag" + pluralize(actionCost);

			// BODY TEXT
			let extraAfterText = "<br/><br/>";

			switch(action)
			{
				case "brick":
				{
					extraAfterText += "<span class='red'>WARNING: Bricking this Device will render it inoperable until repaired!</span>";
					break;
				}
				case "rig":
				{
					extraAfterText += "<span class='red'>WARNING: Triggering a Rigged Device (by calling \"Room Strike Lock\") will cause all data to be deleted at the end of the Scene!</span>";
					break;
				}
				case "root":
				{
					extraAfterText += "<span class='red'>WARNING: Rooting this Device will format all memory disks, deleting all software and data permanently!<br/>Furthermore, Device will be inoperable until appropriate software is re-installed!</span>";
					break;
				}
			}

			bodyText = 	actionVerb + " Device for " + actionCost + " Tag" + pluralize(actionCost) + "?" + 
						extraAfterText;
						// No Copycat

			// BUTTON ARRAY
			let buttonArray = [{
				id: action + targetID,
				text: "Confirm",
				data: payload.getUserID(),
				global: true
			}];

			let actionMap = {
				userID: payload.getUserID(),
				targetID: session.getTerminalID(),
				action: action,
				actionType: actionType,
				actionCost: actionCost
			};

			let confirmMap = {
				headerText: headerText,
				bodyText: bodyText,
				buttonArray: buttonArray,
				executeHeader: executeHeader
			};

			actionModal.showConfirmPage(actionMap, confirmMap);

			break;
		}
		case("siph"):
		{
			let actionType = action;
			let actionCost = session.getActionCost("nonEntry", action);

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionCost,session.getCurrentTags());

			// HEADER TEXT
			headerText = "Confirm Siphon Action";
			executeHeader = "Siphon Charge / Device / " + actionCost + " Tag" + pluralize(actionCost);

			// BODY TEXT
			bodyText = 	"Siphon Charge from Device to gain 2 Amps?" + 
						"<br/><br/>NOTE: \"Amps\" are an external resource not tracked by this OS. Please utilize your own tracking for this resource.";
						// No Copycat

			// BUTTON ARRAY
			let buttonArray = [{
				id: action + targetID,
				text: "Confirm",
				data: payload.getUserID(),
				global: false
			}];

			let actionMap = {
				userID: payload.getUserID(),
				targetID: session.getTerminalID(),
				action: action,
				actionType: actionType,
				actionCost: actionCost
			};

			let confirmMap = {
				headerText: headerText,
				bodyText: bodyText,
				buttonArray: buttonArray,
				executeHeader: executeHeader
			};

			actionModal.showConfirmPage(actionMap, confirmMap);

			break;
		}
		// Active Refresh Functions
		case("ping"):
		{
			let actionType = "refresh";
			let actionCost = session.getActionCost("nonEntry", action);

			let functionName = action.charAt(0).toUpperCase() + action.slice(1);

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags()-actionCost,session.getCurrentTags());

			// HEADER TEXT
			headerText = "Confirm Refresh Action";
			executeHeader = "Refresh / " + functionName + " / " + actionCost + " Tag" + pluralize(actionCost);

			// BODY TEXT
			bodyText = 	"Refresh \"" + functionName + "\" Function for " + actionCost + " Tag" + pluralize(actionCost) + "?";
						// No Copycat

			// BUTTON ARRAY
			let buttonArray = [{
				id: action + targetID,
				text: "Confirm",
				data: action,
				global: false
			}];

			let actionMap = {
				userID: payload.getUserID(),
				targetID: session.getTerminalID(),
				action: action,
				actionType: actionType,
				actionCost: actionCost
			};

			let confirmMap = {
				headerText: headerText,
				bodyText: bodyText,
				buttonArray: buttonArray,
				executeHeader: executeHeader
			};

			actionModal.showConfirmPage(actionMap, confirmMap);

			break;
		}
		// Item Activations
		case ("deck"):
		case ("shim"):
		{
			let actionType = "item";
			let effect = payload.getEffect(target.dataset["effect"]);

			let effectPlus = Number(target.dataset["plus"]);
			let actionCost = isNaN(effectPlus) ? 0 : (effectPlus * -1);

			let itemPath = "#" + $(target).parents('.itemItem')[0].id;
			let itemName = $(itemPath + " .itemName").html();

			Gems.updateTagGems(Gems.CONFIRM,session.getCurrentTags(),session.getCurrentTags()-actionCost);

			// HEADER TEXT
			headerText = "Confirm Item Activation";
			executeHeader = "Activate / Item";

			let totalCharges = null;
			let remCharges = null;

			switch(action)
			{
				case("deck"):
				{
					totalCharges = effect["charges"];
					remCharges = effect["charges"] - effect["uses"];
					let upperPerType = effect["per_type"].charAt(0).toUpperCase() + effect["per_type"].slice(1);

					// BODY TEXT
					bodyText = 	"Use " + itemName + " to gain " + (actionCost * -1) + " Tag" + pluralize(actionCost) + "?" +
								"<br/><br/>This item may be used <b>" + totalCharges + "</b> time" + pluralize(totalCharges) + " per " + upperPerType + ". You have <b>" + remCharges + "</b> use" + pluralize(remCharges) + " left.";
								// No Copycat

					break;
				}
				case("shim"):
				{
					let extraAfterText = "<br/><br/>";

					switch(effect["abbr"])
					{
						case("shim_0"):
						{
							extraAfterText += 	"NOTE:<br/>" +
												"&nbsp;&nbsp;Applying a Shimmerstick will increase the cost of future Hacking Actions on this device by 1 Tag and their times by +30s.<br/>" +
												"&nbsp;&nbsp;However, you will be able to accomplish one action remotely.";
							break;
						}
						case("shim_1"):
						{
							extraAfterText += 	"NOTE:<br/>" +
												"&nbsp;&nbsp;Applying a Shimmerstick will increase the cost of future Hacking Actions on this device by 1 Tag and their times by +15s.<br/>" +
												"&nbsp;&nbsp;However, you will be able to accomplish one action remotely.";
							break;
						}
					}

					// BODY TEXT
					bodyText = 	"Use " + itemName + " on this Device?" +
								extraAfterText;
								// No Copycat
				}
			}

			// BUTTON ARRAY
			let buttonArray = [{
				id: action + targetID,
				text: "Confirm",
				data: session.getTerminalID(),
				global: false
			}];

			let actionMap = {
				userID: payload.getUserID(),
				targetID: effect["abbr"],
				action: action,
				actionType: actionType,
				actionCost: actionCost
			};

			if((totalCharges !== null) && (remCharges !== null))
			{
				actionMap["remCharges"] = remCharges - 1;
				actionMap["usedCharges"] = totalCharges - (remCharges - 1);
			}

			let confirmMap = {
				headerText: headerText,
				bodyText: bodyText,
				buttonArray: buttonArray,
				executeHeader: executeHeader
			};

			actionModal.showConfirmPage(actionMap, confirmMap);

			break;
		}
		case("pet"):
		{
			// DIGIPET ACTIVATE IN ITEM TAB
			let actionType = "pet_play";
			let effect = target.dataset["effect"];

			// HEADER TEXT
			headerText = "Confirm DigiPet Action";
			executeHeader = "Play / DigiPet";

			// BODY TEXT
			bodyText = 	"Play with DigiPet for this Sim?";
						// No Copycat

			// BUTTON ARRAY
			let buttonArray = [{
				id: action + targetID,
				text: "Confirm",
				data: session.getTerminalID(),
				global: false
			}];

			let actionMap = {
				userID: payload.getUserID(),
				targetID: effect,
				action: action,
				actionType: actionType,
				actionCost: 0
			};

			let confirmMap = {
				headerText: headerText,
				bodyText: bodyText,
				buttonArray: buttonArray,
				executeHeader: executeHeader
			};

			actionModal.showConfirmPage(actionMap, confirmMap);

			break;
		}
	}
}

function closeModal(event)
{
	if(event === "interrupted")
	{
		const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
		const blinkSleep = async () => {
			await sleep(2000);
			closeModal("interruptFollowUp");
		};
		
		blinkSleep();
	}
	else if((event.type !== "keyup") || (event.key === "Escape"))
	{
		actionModal.clearModal();

		Gems.updateTagGems(Gems.STANDBY,session.getCurrentTags());
	}
}

function executeAction(actionMap, executeHeader)
{
	if((!$("#copycatActivate").prop("checked")) && (actionMap["actionType"] !== "item"))
	{
		let maxTime = payload.getActionTime();

		if(actionMap["actionCost"] < 0) // Deck Actions, currently
		{
			Gems.updateTagGems(Gems.EXECUTE,session.getCurrentTags(),session.getCurrentTags()-actionMap["actionCost"]);
		}
		else
		{
			Gems.updateTagGems(Gems.EXECUTE,session.getCurrentTags()-actionMap["actionCost"],session.getCurrentTags());
		}

		let petStage = null;

		if(payload.getItem("digi_pet"))
		{
			if(!payload.getActiveEffect("pet_play")) // Pet: Stage 1 > Unplayed
			{
				petStage = 1;
			}
			else if(!payload.getActiveEffect("pet_use")) // Pet: Stage 2 > Played This Sim
			{
				petStage = 2;
			}
			else // Pet: Stage 3 > Used This Scene
			{
				petStage = 3;
			}
		}

		let executeMap = {
			headerText: executeHeader,
			maxTime: maxTime,
			petStage: petStage
		};

		actionModal.showExecutePage(actionMap, executeMap);
	}
	else //USING COPYCAT OR AN ITEM
	{
		if(actionMap["actionType"] === "item")
		{
			actionModal.skipExecutePage(actionMap);
		}
		else //COPYCAT
		{
			payload.setActiveEffect("copycat", true);

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "/resources/scripts/terminal/db/useItems.php",
				data:
				{
					userID: payload.getUserID(),
					effects: "copycat",
					termID: session.getTerminalID()
				}
			});

			actionModal.skipExecutePage(actionMap);
		}
	}
}

function completeAction(actionMap)
{
	closeModal("executed");

	$("#load").addClass("hidden");

	//actionMap:
		// actionType
		// actionCost
		// dialog (id)
		// targetID
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
			session.setEntry(actionMap["targetID"]);

			$(actionMap["results"]["entryPath"] + " > .entryTitleBar > .entryMaskContainer").html(actionMap["results"]["title"]);
			$(actionMap["results"]["entryPath"] + " > .entryContentsBar > .entryMaskContainer").html(actionMap["results"]["contents"]);
			$(actionMap["results"]["entryPath"] + " > .entryIntContainer > .accessInterface").html(actionMap["results"]["access"]);
			$(actionMap["results"]["entryPath"] + " > .entryIntContainer > .modifyInterface").html(actionMap["results"]["modify"]);
			$(actionMap["results"]["entryPath"] + " > .subIce").removeClass("subIce");

			if(payload.getFunction("REPEAT"))
			{
				session.setFunctionState("REPEAT",actionMap["targetID"],actionMap["action"].toLowerCase(),payload.getFunction("REPEAT"));
				updateEntryCosts("REPEAT",actionMap["results"]["entryPath"],actionMap["action"]);
			}

			if(payload.getItem("deck_jst")) //JOHNNY'S SPECIAL TOUCH
			{
				session.setFunctionState("TOUCHED",actionMap["targetID"],actionMap["action"].toLowerCase(),1);
				updateEntryCosts("TOUCHED",actionMap["results"]["entryPath"],actionMap["action"]);
			}
			break;
		}
		case("log"):
		{
			if(actionMap["action"] === "reass")
			{
				$("#log" + actionMap["targetID"] + " > .logName").html(actionMap["buttonData"]);
			}
			else //WIPE TRACKS
			{
				$("#log" + actionMap["targetID"] + " > .logPerson").html("[ERROR:&nbsp;");
				$("#log" + actionMap["targetID"] + " > .logName").html("LOG NOT FOUND]");
				$("#log" + actionMap["targetID"] + " > .logActions").html("");
			}
			break;
		}
		case("brick"):
			//session.brickTerminal(payload.getHandle());

			const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
			const freezeSleep = async () => {
				await sleep(1000);
				location.reload();
			};
			
			freezeSleep();

			break;
		case("rig"):
			session.rigTerminal();
			break;
		case("root"):
			session.rootTerminal(new Date());
			break;
		case("siph"):
		{
			setupAlertModal("You gain +2 Amps!<br/><br/>NOTE: \"Amps\" are an external resource not tracked by this OS. Please utilize your own tracking for this resource.");
			break;
		}
		case("refresh"):
		{
			setupAlertModal("Your " + actionMap["newData"] + " Function has been Refreshed!<br/><br/>NOTE: The usage of the " + actionMap["newData"] + " Function is not tracked by this OS. Do not run this action again unless you've used " + actionMap["newData"] + " again this Scene and require another Refresh.");
			break;
		}
		case("item"):
		{
			switch(actionMap["targetID"].split("_")[0])
			{
				case("deck"):
				case("phack"):
				{
					$(".deckButton[data-effect='" + actionMap["targetID"] + "']").parent().find(".itemMarks img:nth-child(-n + " + actionMap["usedCharges"] + ")").attr("src","/resources/images/actions/itemfilled.png");

					if(actionMap["remCharges"] <= 0)
					{
						$(".deckButton[data-effect='" + actionMap["targetID"] + "']").prop("disabled", true);
					}

					payload.useItemEffect(actionMap["targetID"]);

					break;
				}
				case("shim"):
				{
					let otherEffect = (actionMap["targetID"] === "shim_0" ? "shim_1" : "shim_0");
					payload.setActiveEffect(actionMap["targetID"],true);

					$("#shimStatus").attr("src", "/resources/images/status/" + actionMap["targetID"] + ".png");
					$("#shimStatus").removeClass("hidden");

					$(".shimButton").attr("disabled",true);
					$(".shimButton[data-effect='" + actionMap["targetID"] + "']").html("Already Active");
					$(".shimButton[data-effect='" + otherEffect + "']").html("Other Shimmerstick Active");

					break;
				}
			}

			break;
		}
		case("pet_play"):
		{
			payload.setActiveEffect("pet_play", true);
			$("#petStatus").attr("src","/resources/images/status/pet_ready.png");

			$(".petButton").attr("disabled",true);
			$(".petButton").html("Played With Already");

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "/resources/scripts/terminal/db/useItems.php",
				data:
				{
					userID: payload.getUserID(),
					effects: "pet_play",
					termID: session.getTerminalID()
				}
			});

			break;
		}
	}

	session.setCurrentTags(session.getCurrentTags() - actionMap["actionCost"]);
	Gems.updateTagGems(Gems.STANDBY,session.getCurrentTags());
	disableExpensiveButtons();

	if((payload.getItem("copycat")) && (!payload.getActiveEffect("copycat")))
	{
		if((actionMap["action"] !== "item") && (!session.isActionCopyable(actionMap["action"])))
		{
			session.makeActionCopyable(actionMap["action"]);
		}
	}

	if(Object.keys(actionMap).includes("digipet"))
	{
		if(actionMap["digipet"])
		{
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "/resources/scripts/terminal/db/useItems.php",
				data:
				{
					userID: payload.getUserID(),
					effects: "pet_use",
					termID: session.getTerminalID()
				}
			})

			payload.setActiveEffect("pet_use",true);
			$("#petStatus").attr("src","/resources/images/status/pet_sleep.png");
		}
	}
}

function updateEntryCosts(reducer, entryPath, entryAction)
{
	if((reducer === "REPEAT") && ((entryAction === "access") || (entryAction === "modify")))
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

		$(iconID + " .repeatIndicator" + entryAction.charAt(0).toUpperCase() + entryAction.slice(1)).removeClass("dimmed");
	}
	else if((reducer === "TOUCHED") && (entryAction === "access"))
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

		if(!payload.getActiveEffect("deck_jst"))
		{
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "/resources/scripts/terminal/db/useItems.php",
				data:
				{
					userID: payload.getUserID(),
					effects: "deck_jst",
					termID: session.getTerminalID()
				}
			})

			payload.setActiveEffect("deck_jst",true);
		}
	}
}

function setupAlertModal(bodyText)
{
	$("#actionModal").attr("data-type", "");
	$("#actionModal").attr("data-id", "");

	$("#actionModal .modalOverlay").removeClass("blink");
	$("#actionModal .modalOverlay").addClass("hidden");

	$("#actionModal .modalButtonRow").html("<button id='okButton' class='modalButton'>OK</button>");
			
	$("#okButton").bind("pointerup", function()
	{
		closeModal("okayed");
	});

	$("#actionModal").width($("#main").width());
	$("#actionModal").removeClass("ice");

	$("#actionModal .modalHeaderRow").removeClass("dimmed");
	$("#actionModal .modalHeaderText").html("Action Success");

	$("#actionModal .modalBody").removeClass("dimmed");
	$("#modalBodyTimer").addClass("hidden");
	$("#actionModal .modalBodyText").html(bodyText);

	$(".modalBodyText").removeClass("hidden");

	$("#actionModal .modalButtonRow").removeClass("dimmed");
	$("#actionModal .modalButtonRow").attr("data-mode","confirm");
	
	$("#modalBG").css("display","flex");
}

function generatePuzzle(target)
{
	let puzzle = session.getPuzzle(target.dataset["id"]);

	$("#actionModal").attr("data-type", "puzzle");
	$("#actionModal").attr("data-id", puzzle["id"]);

	$("#actionModal").width($("#main").width());

	actionModal.clearModal();

	switch(puzzle["puzzle_type"])
	{
		case("free_rp"):
		{
			/*
			$("#actionModal .modalHeaderText").html("Hacking Action RP");

			$("#actionModal .modalBody").removeClass("dimmed");
			$("#modalBodyText").addClass("hidden");
			$("#actionModal .modalBodyText").html("<div id='rmmGuessArray' class='rmmBox'></div>");
			$("#actionModal .modalButtonRow").html("<div id='rmmAnswerBox' class='rmmBox'></div>");
			$(".modalBodyTimer").removeClass("hidden");

			$("#actionModal .modalButtonRow").removeClass("dimmed");
			*/
			resolvePuzzle(puzzle["id"]);

			break;
		}
		case("rev_mm"):
		{
			$("#actionModal .modalHeaderText").html("Reverse Mastermind");

			$("#actionModal .modalBodyText").html("<div id='rmmGuessArray' class='rmmBox'></div>");
			$("#actionModal .modalButtonRow").html("<div id='rmmAnswerBox' class='rmmBox'></div>");

			$("#actionModal .modalBodyText").removeClass("hidden");

			revMM = new ReverseMasterMind(4, puzzle["id"]);

			$("#modalBG").css("display","flex");

			break;
		}
	}
}

function resolvePuzzle(puzzID)
{
	let puzzle = session.getPuzzle(puzzID);

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "/resources/scripts/terminal/db/userActions.php",
		data:
		{
			userID: payload.getUserID(),
			targetID: puzzle["id"],
			action: "puzzle",
			actionType: "puzzle",
			newState: 1,
			actionCost: puzzle["cost"],
			global: puzzle["global"]
		}
	});

	//!! INTERRUPT
	//!! DISABLE ON RELOAD

	//cost
	//repeat
	//reward_type
	//reward

	switch(puzzle["reward_type"])
	{
		case("tags"):
		{
			session.setCurrentTags(session.getCurrentTags() + Number(puzzle["reward"]));
			Gems.updateTagGems(Gems.STANDBY,session.getCurrentTags());
			disableExpensiveButtons();
			break;
		}
		case("item"):
		{
			JSON.parse(puzzle["reward"]).forEach(function (item, index)
			{
				$(".puzzleReward")[index].html(item);
			});
			break;
		}
	}

	dimPuzzle(puzzle);

	closeModal("Success");
}

function dimPuzzle(puzzle, uses = 1)
{
	if(puzzle["repeat"] === null)
	{
		//No Repeat

		$(".puzzleEntry[data-id='" + puzzle["id"] + "']").find(".puzzleBoxPrefix, .puzzleTitleRow, .puzzleReqBox").addClass("dimmed");
		$(".puzzleSolveButton[data-id='" + puzzle["id"]+ "']").html("Solved!");
		$(".puzzleSolveButton[data-id='" + puzzle["id"] + "']").attr("disabled", true);
	}
	else if(puzzle["repeat"] > 0)
	{
		//Mark X Charge(s) Off

		for(let i = 0; i < uses; i++)
		{
			$(".puzzleRepeatBox img[src='/resources/images/actions/itemopen.png']")[0].setAttribute("src","/resources/images/actions/itemfilled.png");

			if($(".puzzleRepeatBox img[src='/resources/images/actions/itemopen.png']").length === 0)
			{
				$(".puzzleEntry[data-id='" + puzzle["id"] + "']").find(".puzzleBoxPrefix, .puzzleTitleRow, .puzzleReqBox, .puzzleRepeatBox").addClass("dimmed");
				$(".puzzleSolveButton[data-id='" + puzzle["id"]+ "']").html("Solved!");
				$(".puzzleSolveButton[data-id='" + puzzle["id"] + "']").attr("disabled", true);
			}
		}
	}
	//else Repeat Indefinitely (no change)
}