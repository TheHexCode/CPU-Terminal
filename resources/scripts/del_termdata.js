

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var timer = 100;
var timerBlink;
var pause = false;
var terminal;
var payload;

function tens(numStr)
{
	var tensFormat = new Intl.NumberFormat('en-US', { 
		minimumIntegerDigits: 2
	});
	
	return tensFormat.format(Number(numStr));
}

$(document).ready(function()
{
	$("input[type='checkbox']").prop("checked",false);

	$.ajaxSetup({ cache: false });

	let images = [
		"..\\images\\actions\\itemfilled.png",
		"..\\images\\actions\\itemopen.png",
		"..\\images\\actions\\itemrigged.png",
		"..\\images\\borders\\bracket_border_ice.png",
		"..\\images\\borders\\bracket_border.png",
		"..\\images\\borders\\thin_border.png",
		"..\\images\\playpause\\pause_root.png",
		"..\\images\\playpause\\pause.png",
		"..\\images\\playpause\\play_root.png",
		"..\\images\\playpause\\play.png",
		"..\\images\\subtabs\\active.png",
		"..\\images\\subtabs\\cameras.png",
		"..\\images\\subtabs\\darkweb.png",
		"..\\images\\subtabs\\defenses.png",
		"..\\images\\subtabs\\files.png",
		"..\\images\\subtabs\\items.png",
		"..\\images\\subtabs\\locks.png",
		"..\\images\\subtabs\\log.png",
		"..\\images\\subtabs\\passive.png",
		"..\\images\\subtabs\\puzzles.png",
		"..\\images\\subtabs\\utilties.png"
	]

	preloadImages(images);

	let suffix = new URLSearchParams(window.location.search);
	
	let iconJSON = $.getJSON("resources\\schemas\\icons.json");
	let termJSON = $.getJSON("data\\"+suffix.get("id")+"\\terminal.json");
	let accessLog = $.getJSON("resources\\scripts\\files\\checklogs.php",{ suffixID: suffix.get("id") });
	let itemJSON = $.getJSON("resources\\schemas\\items.json");

	$.when(termJSON, iconJSON, accessLog, itemJSON).done(function()
	{
		terminal = new Terminal(suffix.get("id"), iconJSON.responseJSON, termJSON.responseJSON, accessLog.responseJSON);
		payload = new Payload(itemJSON.responseJSON);

		setupAccessPage();
		setupTerminalPage();
	});
});

$(window).on("focus",function()
{
	if(payload && ($("#accessZone").css("display") != "none"))
	{
		if(payload.checkForCookie())
		{
			rewriteAccessPage();
		}
	}
});

function preloadImages(sources)
{
	if(!preloadImages.cache)
	{
		preloadImages.cache = [];
	}

	let img;

	for (let i = 0; i < sources.length; i++)
	{
		img = new Image();
		img.src = sources[i];
		preloadImages.cache.push(img);
	}
}

function autoSave({ handle=null,rigged=false })
{
	let saveData;

	if(!handle)
	{
		saveData = JSON.parse(Cookies.get(terminal.getTerminalID()));
	}
	else
	{
		saveData = { handle:handle };
	}

	saveData["tags"] = payload.getCurrentTags();
	saveData["rigged"] = rigged;
	saveData["saveState"] = terminal.getTermState();
	saveData["modifiers"] = payload.getModifier();

	var inTwoHours = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
	Cookies.set(terminal.getTerminalID(),JSON.stringify(saveData),{expires: inTwoHours,path: "",sameSite: "Strict"});
}

function startTimer(context,seconds,callback=null)
{
	$("#playPause").prop("disabled",false);
	
	var baseDate = Date.now();
	var elapse = 0;
	
	timer = setInterval(function() {		
		let newDate = Date.now();
		let dateDiff = (newDate - baseDate)/1000;
		
		baseDate = newDate;
		
		if(!pause)
		{
			elapse += dateDiff;
			
			if(elapse > seconds)
			{
				clearInterval(timer);
				timer = null;
				
				$("#playPause").prop("disabled",true);
				
				return endTimer(context,callback);
			}
			
			readTime = Math.max(seconds-elapse,0);
			
			let min = tens(parseInt(readTime/60));
			let sec = tens(parseInt(readTime%60));
			let hundsec = tens(parseInt((readTime*100)%100));
			
			let colon = " ";
			
			if (sec % 2 == 0) //hundsec < 50
			{
				colon = ":";
			}
			
			let mmss = min + colon + sec;
			
			$("#mmss > .FG").html(mmss);
			$("#hundsec > .FG").html(hundsec);
		}
	}, 10);
}

function endTimer(context,callback)
{
	if(context == "CRACK")
	{
		$("#status").html(">> ACCESS GRANTED");
		
		$("#mmss > .FG").html("00:00");
		$("#hundsec > .FG").html("00");
		
		timerBlink = setInterval(function() {
			if ($("#mmss > .FG").html() == "00:00")
			{
				$("#mmss > .FG").html("!!:!!");
				$("#hundsec > .FG").html("!!");
			}
			else
			{
				$("#mmss > .FG").html("00:00");
				$("#hundsec > .FG").html("00");
			}
		},1000);
		
		if(payload.hasPayload())
		{
			let newReq = terminal.getReqAccess() + payload.getModifier("cost");

			if((payload.getCurrentTags()-newReq) >= 0)
			{
				$("#terminalButton").prop("disabled",false);
				$("#terminalButton").html("Access Terminal");
				$("#terminalButton").css("background-color","");
				$("#terminalButton").css("border-color","");
				$("#terminalButton").css("filter","");
			}
			else
			{
				$("#terminalButton").html("Not Enough Tags To Access Terminal");
				$("#terminalButton").css("background-color","red");
				$("#terminalButton").css("border-color","red");
				$("#terminalButton").css("filter","brightness(75%)");
			}
		}
		else
		{
			$("#terminalButton").html("Please Set Up Payload Profile First");
			$("#terminalButton").css("background-color","red");
			$("#terminalButton").css("border-color","red");
			$("#terminalButton").css("filter","brightness(75%)");
			$("#terminalButton").css("box-shadow","0 0 0px");
		}
	}
	else if(context == "EXECUTE")
	{
		callback();
		
		$("#status").html(">> AWAITING COMMAND");
		
		updateTagDisplay("STANDBY",payload.getCurrentTags());
		
		$("#mmss > .FG").html("00:"+tens(payload.getTimerSecs()));
		$("#hundsec > .FG").html("00");	
	}
	else if(context == "ROOT")
	{
		callback();

		$("#status").html(">> ROOTING DEVICE");

		updateTagDisplay("ROOT",10);
	}
}

function pauseTimer(root=false)
{
	let rootSuffix = root ? "_Root" : "";
	
	if(pause === false)
	{
		$("#playPause").html('<img src="resources\\images\\playpause\\play' + rootSuffix + '.png">');
		
		var mmssText = $("#mmss > .FG").html()
		var hsecText = $("#hundsec > .FG").html()
		
		timerBlink = setInterval(function() {
			if ($("#mmss > .FG").html() != "!!:!!")
			{
				$("#mmss > .FG").html("!!:!!");
				$("#hundsec > .FG").html("!!");
			}
			else
			{
				$("#mmss > .FG").html(mmssText);
				$("#hundsec > .FG").html(hsecText);
			}
		},1000);

		if(root)
		{
			let timeUp = terminal.getTermState().termState;

			pause = new Date(timeUp) - Date.now();
		}
		else
		{
			pause = true;
		}
	}
	else
	{
		$("#playPause").html('<img src="resources\\images\\playpause\\pause' + rootSuffix + '.png">');
		
		clearInterval(timerBlink);

		if(root)
		{
			let newTimeUp = new Date(Date.now() + pause);

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\files\\updateterminaljson.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					path: "state",
					newState: newTimeUp
				}
			});

			terminal.setTerminalState(newTimeUp);
		}

		pause = false;
	}
}

function setupAccessPage()
{
	$("#termName").html(terminal.getTerminalName());

	$("#reqTags").html(tens(terminal.getReqAccess()));
	
	if(payload.hasPayload())
	{
		rewriteAccessPage();
	}
	else
	{
		$("#terminalButton").html("Please Set Up Payload Profile First");
		$("#terminalButton").css("background-color","red");
		$("#terminalButton").css("border-color","red");
		$("#terminalButton").css("filter","brightness(75%)");
		$("#terminalButton").css("box-shadow","0 0 0px");
	}
}

function rewriteAccessPage()
{
	let payloadHandle = payload.getHandle();
	
	if(payloadHandle.masked)
	{
		let payMask = (payloadHandle.mask == "") ? "Anonymous" : payloadHandle.mask;
		
		$("#payloadHeader").html("PROFILE LOADED:<br/>HANDLE: " + payloadHandle.handle + "<br/>MASK: " + payMask);
	}
	else
	{
		$("#payloadHeader").html("PROFILE LOADED: " + payloadHandle.handle);
	}
	
	$("#payloadButton").text("EDIT PAYLOAD PROFILE");

	if(payload.getPayloadFunction("items").includes("util_ciphersyncbeacon"))
	{
		payload.setModifier("hack",2);
	}

	if(payload.getPayloadFunction("items").includes("util_powerglove_uh9k"))
	{
		payload.setModifier("time",-5);
	}
	
	let payTags = payload.getInitialTags();
	
	$("#payTags").html(tens(payTags.total));
	$("#hackDetails").html("[HACKING: +" + tens(payTags.hack) + "]");
	
	if(payTags.rex)
	{
		$("#rexDetails").show();
	}

	let newReq = terminal.getReqAccess() + payload.getModifier("cost");

	$("#reqTags").html(tens(newReq));
	
	$("#remTags").html(tens(Math.max(payTags.total - newReq,0)));
	
	updateTagDisplay("CRACK",newReq,payTags.total);
	payload.setCurrentTags(payTags.total);
	
	if((payload.getPayloadFunction("priRole") === "dissimulator") || (payload.getPayloadFunction("secRole") === "dissimulator"))
	{
		$("#disItem").removeClass("hidden");
	}

	if((payload.getPayloadFunction("items").includes("arms_cmmwidow")) || (payload.getPayloadFunction("items").includes("arms_cmmcocoon")))
	{
		$("#cmmItem").removeClass("hidden");
	}

	if((payload.getPayloadFunction("items").includes("util_shimmerstick_t0")) || (payload.getPayloadFunction("items").includes("util_shimmerstick_t1")))
	{
		$("#shmItem").removeClass("hidden");
	}
	
	if((payload.getCurrentTags()-newReq) >= 0)
	{
		if(timer == null)
		{
			$("#terminalButton").prop("disabled",false);
			$("#terminalButton").html("Access Terminal");
			$("#terminalButton").css("background-color","");
			$("#terminalButton").css("border-color","");
			$("#terminalButton").css("filter","");
		}
		else
		{
			$("#terminalButton").prop("disabled",true);
			$("#terminalButton").html("Standby...");
			$("#terminalButton").css("background-color","");
			$("#terminalButton").css("border-color","");
			$("#terminalButton").css("filter","");
		}
	}
	else
	{
		$("#terminalButton").html("Not Enough Tags To Access Terminal");
		$("#terminalButton").css("background-color","red");
		$("#terminalButton").css("border-color","red");
		$("#terminalButton").css("filter","brightness(75%)");
	}
}

function setupTerminalPage()
{
	let termState = terminal.getTermState().termState;

	if(new Date(termState) != "Invalid Date") // Rooting
	{
		rootingTerminal(new Date(termState));
		$("#status").html(">> ROOTING DEVICE");
		updateTagDisplay("ROOT",10);
	}
	else if(Array.isArray(termState)) // Bricked
	{
		brickTerminal(termState);
	}
	// Rigged is personal
	else if(termState === "rooted")
	{
		rootTerminal();
	}
	else
	{
		$("#termSubTabs").html(terminal.getSubTabString());
		$("#termContentContainer").html(terminal.getTerminalString());

		if(!(Cookies.get(terminal.getTerminalID())))
		{
			$("#load").addClass("hidden");
			startTimer("CRACK",5);
		}
		else
		{
			accessTerminal(JSON.parse(Cookies.get(terminal.getTerminalID())));
			$("#load").addClass("hidden");
		}
	}
}

function rewriteTerminalPage(autosave)
{
	$("#deckContentContainer").html(payload.getCyberdeckString());

	let modifiers = payload.getModifier();

	if(!(autosave))
	{
		let newLogEntry = {};
		newLogEntry["handle"] = payload.getPayloadFunction("handle");
		newLogEntry["mask"] = payload.getPayloadFunction("mask") ?
								((payload.getPayloadFunction("maskHandle") == "") ? "Anonymous" : payload.getPayloadFunction("maskHandle")) :
								null;
		newLogEntry["state"] = "present"
		newLogEntry["reassignee"] = null;
		
		let newIndex = terminal.appendAccessLog(newLogEntry);
		
		let logHandle = ((newLogEntry.reassignee !== null) ? newLogEntry.reassignee :
						((newLogEntry.mask !== null) ? newLogEntry.mask : newLogEntry.handle));
		
		$("#logList").append(	'<li id="log' + newIndex + '" class="logEntry itsYou">' +
									'<span class="logPerson">You:&nbsp;&nbsp;</span><span class="logName">' + logHandle + '</span>' +
									'<div class="logActions hidden">' +
										'<hr/>' +
										'<span class="hidden">REASSIGN: <button class="reassButton" data-enabled="true" data-cost="2" onclick="logAction('+newIndex+',\'reassign\')">2 Tags</button></span>' +
										'<span class="hidden">WIPE TRACKS: <button class="wipeButton" data-enabled="true" data-cost="1" onclick="logAction('+newIndex+',\'wipe\')">1 Tag</button></span>' +
									'</div>' +
								'</li>');

		autoSave({ handle: newLogEntry.handle });
	}
	else
	{
		modifiers = autosave.modifiers;
		payload.setModifier("all",modifiers);

		let logIndex = terminal.getLogIndex(autosave.handle);

		$("#log"+logIndex).addClass("itsYou");
		$("#log"+logIndex+">.logPerson").html("You:&nbsp;&nbsp;");
		
		autosave.saveState.entries.forEach(function(entry)
		{
			if(terminal.getEntry(entry.path).state !== entry.state)
			{
				terminal.setEntryState(entry.path,entry.state,0);
			}
		});

		autosave.saveState.repeats.forEach(function(repeat)
		{
			if(repeat.repeated)
			{
				terminal.repeatIcon(repeat.type,repeat.repeated);
				$("#"+repeat.type+"Content .subContRepeat").removeClass("hidden");
			}

			if(repeat.copied)
			{
				terminal.copyIcon(repeat.type);
			}
		});

		if(autosave.saveState.johnnyAccess)
		{
			terminal.touchAccess(autosave.saveState.johnnyAccess);
			$(".subContJohnny").removeClass("hidden");
		}

		if(autosave.rigged)
		{
			$("#rigged").removeClass("hidden");
			$("#riggButton").attr("data-enabled","false");
		}

		$("button[data-enabled='false']").prop("disabled",true);
	}

								
	if(payload.getPayloadFunction("reass") || payload.getPayloadFunction("wyt"))
	{
		$(".logActions.hidden").removeClass("hidden");
		
		if(payload.getPayloadFunction("reass"))
		{
			$(".logActions > span:first-of-type().hidden").removeClass("hidden");
		}
		
		if(payload.getPayloadFunction("wyt"))
		{
			$(".logActions > span:last-of-type().hidden").removeClass("hidden");
		}
	}
	
	if(!payload.getPayloadFunction("dwa"))
	{
		$("#dwSubTab").addClass("hidden");
	}

	terminal.modifyCost(modifiers.cost);
}

function updateTagDisplay(stage,stageOne,stageTwo=stageOne,totalTags=stageTwo)
{
	/*
		Stages:
			CRACK:
				- 1: Blend <- Tags Required to Access Terminal (non-overwritable)
				- 2: Amber <- Tags added via Hacking
				- 3: Blue  <- Extra Tags added on a case-by-case basis
			STANDBY:
				- 1: Blue  <- All tags
			CONFIRM:
				- 1: Blue  <- All tags
				- 2: Amber <- Tags required/being used for an ability, just to confirm you want to use them
			EXECUTE:
				- 1: Blue  <- All tags
				- 2: Blend <- Tags required/being used for an ability
			ROOT:
				- 1: Root <- All tag slots
	*/
	
	let stageColors = {};
	stageColors["CRACK"] = [
		"gem blend",
		"gem amber",
		"gem blue"
	];
	stageColors["STANDBY"] = [
		"gem blue",
		"gem blue",
		"gem blue"
	];
	stageColors["CONFIRM"] = [
		"gem blue",
		"gem amber",
		"gem amber"
	];
	stageColors["EXECUTE"] = [
		"gem blue",
		"gem blend",
		"gem blend"
	];
	stageColors["ROOT"] = [
		"gem root",
		"gem root",
		"gem root"
	];
	
	let tenOnes = Math.floor((stageOne-1)/10);
	let remOnes = ((stageOne-1) % 10)+1;
	
	let tenTwos = Math.floor((stageTwo-1)/10);
	let remTwos = ((stageTwo-1) % 10)+1;
	
	let tenTotal = Math.floor((totalTags-1)/10);
	let remTotal = ((totalTags-1) % 10)+1;
	
	if (tenTotal > 0)
	{
		$("#gemTens").removeClass("dimmed");
		$("#gemTenTags").html("x"+tens(tenTotal));
	}
	else
	{
		$("#gemTens").addClass("dimmed");
		$("#gemTenTags").html("");
	}
	
	let startTag = 1;
	
	if (tenOnes == tenTotal)
	{
		for (let i = startTag; i <= remOnes; i++)
		{
			$("#gem"+i).removeClass().addClass(stageColors[stage][0]);
		}
		
		startTag = remOnes+1;
	}
	
	if (tenTwos == tenTotal)
	{
		for (let i = startTag; i <= remTwos; i++)
		{
			$("#gem"+i).removeClass().addClass(stageColors[stage][1]);
		}
		
		startTag = remTwos+1;
	}
	
	for (let i = startTag; i <= remTotal; i++)
	{
		$("#gem"+i).removeClass().addClass(stageColors[stage][2]);
	}
	
	for (let i = remTotal+1; i <= 10; i++)
	{
		$("#gem"+i).removeClass().addClass("gem clear");
	}
}

function extraTags(change,type)
{
	let initTags;
	
	if(payload.hasPayload())
	{
		initTags = payload.getInitialTags();
	}
	else
	{
		initTags = 0;
	}

	let newReq = terminal.getReqAccess() + payload.getModifier("cost");

	$("#reqTags").html(tens(newReq));

	let newTags = payload.getCurrentTags();

	if((type === "extra") || (type === "slip"))
	{
		if(type === "slip")
		{
			payload.setModifier("extra",change);
		}

		newTags = Math.min(Math.max((initTags.total + payload.getModifier("extra")),payload.getCurrentTags() + change),(99 + newReq));
		
		$("#extTags").html(tens(newTags-initTags.total));
	}
	else if(type === "hack")
	{
		payload.setModifier("hack",change);
		initTags = payload.getInitialTags();
	
		$("#payTags").html(tens(initTags.total));
		$("#hackDetails").html("[HACKING: +" + tens(initTags.hack) + "]");

		newTags = Math.max((initTags.total + payload.getModifier("extra")),(payload.getCurrentTags() + change));
		//console.log(newTags);
	}

	$("#remTags").html(tens(newTags-newReq));
	
	if(payload.hasPayload())
	{
		if(parseInt($("#remTags").html()) < 0)
		{
			$("#remTagBG").html("~~~");
			if(timer == null)
			{
				$("#terminalButton").html("Not Enough Tags To Access Terminal");
				$("#terminalButton").css("background-color","red");
				$("#terminalButton").css("border-color","red");
				$("#terminalButton").css("filter","brightness(75%)");
				$("#terminalButton").css("box-shadow","0 0 0px");
			}
		}
		else
		{
			$("#remTagBG").html("~~");
			if(timer == null)
			{
				$("#terminalButton").prop("disabled",false);
				$("#terminalButton").html("Access Terminal");
				$("#terminalButton").css("background-color","");
				$("#terminalButton").css("border-color","");
				$("#terminalButton").css("filter","");
			}
		}
	}
	else
	{
		$("#terminalButton").html("Please Set Up Payload Profile First");
		$("#terminalButton").css("background-color","red");
		$("#terminalButton").css("border-color","red");
		$("#terminalButton").css("filter","brightness(75%)");
		$("#terminalButton").css("box-shadow","0 0 0px");
		
		if(parseInt($("#remTags").html()) < 0)
		{
			$("#remTagBG").html("~~~");
		}
		else
		{
			$("#remTagBG").html("~~");
		}
	}
	
	updateTagDisplay("CRACK",newReq,initTags.total,newTags);
	payload.setCurrentTags(newTags);
}

function preCheck(check)
{
	if(check.id === "disCheck")
	{
		if($(check).prop("checked"))
		{
			if(payload.getInitialTags().hack < 10)
			{
				extraTags(2,"hack");
			}
		}
		else
		{
			if(payload.getInitialTags().hack < 10)
			{
				extraTags(-2,"hack");
			}
		}
	}
	else if(check.id === "cmmCheck")
	{
		let totalCMM = payload.getPayloadFunction("items").includes("arms_cmmwidow") + payload.getPayloadFunction("items").includes("arms_cmmcocoon");

		if($(check).prop("checked"))
		{
			extraTags(totalCMM,"slip");
		}
		else
		{
			extraTags((totalCMM * -1),"slip");
		}
	}
	else if(check.id === "shmCheck")
	{
		if($(check).prop("checked"))
		{
			payload.setModifier("cost",1);

			if(payload.getPayloadFunction("items").includes("util_shimmerstick_t0"))
			{
				payload.setModifier("time",30);
			}
			else if(payload.getPayloadFunction("items").includes("util_shimmerstick_t1"))
			{
				payload.setModifier("time",15);
			}

			extraTags("extra",0);
			
			//synchronize animations
		}
		else
		{
			payload.setModifier("cost",-1);
			
			if(payload.getPayloadFunction("items").includes("util_shimmerstick_t0"))
			{
				payload.setModifier("time",-30);
			}
			else if(payload.getPayloadFunction("items").includes("util_shimmerstick_t1"))
			{
				payload.setModifier("time",-15);
			}

			extraTags("extra",0);
		}
	}
}

function accessTerminal(autosave)
{
	if(autosave)
	{
		payload.setCurrentTags(autosave.tags);
		rewriteTerminalPage(autosave);
		$("#status").html(">> RECONNECT SUCCESS");
		$("#playPause").prop("disabled",true);
	}
	else
	{
		let newReq = terminal.getReqAccess() + payload.getModifier("cost");

		payload.setCurrentTags(payload.getCurrentTags()-newReq);
		rewriteTerminalPage(null);
		$("#status").html(">> AWAITING COMMAND");
	}
	
	
	updateTagDisplay("STANDBY",payload.getCurrentTags());
	
	$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") > payload.getCurrentTags()}).prop("disabled",true);
	
	clearInterval(timer);
	clearInterval(timerBlink);
	$("#mmss > .FG").html("00:"+tens(payload.getTimerSecs()));
	$("#hundsec > .FG").html("00");	
	
	$("#accessZone").css("display","none");
	$("#hackZone").css("display","flex");

	let initialTags = payload.getInitialTags();
	let newReq = terminal.getReqAccess() + payload.getModifier("cost");
	initialTags["extra"] = (payload.getCurrentTags() + newReq) - initialTags["total"];

	let actionJSON = {
		timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
		handle: payload.getHandle().handle,
		action: "Terminal Accessed",
		details: { "Tags": initialTags, "AccessCost": newReq }
	};

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources\\scripts\\files\\ooclogupdate.php",
		data:
		{
			suffixID: terminal.getTerminalID(),
			actionJSON: JSON.stringify(actionJSON)
		}
	});
}

function executeCommand(path,newState,cost,copycat=false)
{
	updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());
	startTimer("EXECUTE",(copycat ? 0 : payload.getTimerSecs()),function() {
		terminal.setEntryState(path,newState,payload.getModifier("cost"),"change");
		
		if(payload.getPayloadFunction("repeat"))
		{
			terminal.repeatIcon(path,payload.getPayloadFunction("repeat"));
			$("#"+path.split(">")[0]+"Content .subContRepeat").removeClass("hidden");

			repeatAddition = "; Repeat " + payload.getPayloadFunction("repeat");
		}

		if(payload.getPayloadFunction("items").includes("cust_copycat"))
		{
			terminal.copyIcon(path);
		}

		if(payload.getPayloadFunction("items").includes("deck_johnnyspecialtouch"))
		{
			terminal.touchAccess(1);
			$(".subContJohnny").removeClass("hidden");
		}
	
		payload.setCurrentTags(payload.getCurrentTags()-cost);
		$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);

		if(copycat)
		{
			let payload_sim = JSON.parse(Cookies.get("payload_sim"));

			let deckIndex = payload_sim.findIndex(function(payDeck)
			{
				return payDeck.id === "cust_copycat";
			});

			payload_sim[deckIndex].used++;
		
			Cookies.set("payload_sim",JSON.stringify(payload_sim),{expires: 7,path: "",sameSite: "Strict"});
		};

		autoSave({});

		let actionJSON = {
			timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
			handle: payload.getHandle().handle,
			action: path + " changed to " + newState,
			details: { "Cost": cost, "Repeat": payload.getPayloadFunction("repeat") }
		};
	
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "resources\\scripts\\files\\ooclogupdate.php",
			data:
			{
				suffixID: terminal.getTerminalID(),
				actionJSON: JSON.stringify(actionJSON)
			}
		});
	});
	
	$("button[data-cost]").prop("disabled",true);
	$("#status").html(">> EXECUTING COMMAND...");
}

function updateAccessLog(logIndex,action,reass)
{
	let cost;
	let callback;
	
	let oldHandle = $("#log"+logIndex+" .logName").html();

	if(action === "reassign")
	{
		cost = Math.max(2 + payload.getModifier("cost"),0);;
		callback = function() {
			terminal.updateAccessLog(logIndex,"reassign",reass);
			$("#log"+logIndex+" .logName").html(reass);

			payload.setCurrentTags(payload.getCurrentTags()-cost);
			$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);
			autoSave({});

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Log Entry for " + oldHandle + " reassigned to " + reass,
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\files\\ooclogupdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};
	}
	else if (action === "wipe")
	{
		cost = Math.max(1 + payload.getModifier("cost"),0);;
		callback = function() {
			terminal.updateAccessLog(logIndex,"wipe");
			$("#log"+logIndex).html('ERROR: LOG ENTRY NOT FOUND');
			
			payload.setCurrentTags(payload.getCurrentTags()-cost);
			$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);
			autoSave({});

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Log Entry for " + oldHandle + " wiped",
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\files\\ooclogupdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};
	}
	
	updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());

	startTimer("EXECUTE",payload.getTimerSecs(),callback);
		
	$("button[data-cost]").prop("disabled",true);
	$("#status").html(">> EXECUTING COMMAND...");
}

function brickTerminal(hexHandle)
{
	$("body").addClass("bricked");

	let stopCode =  "0x000000" + hexHandle[0] + "<br/>" +
					"(0x" + hexHandle[1] + hexHandle[2] + hexHandle[3] + hexHandle[4] + "," +
					"0x" + hexHandle[5] + hexHandle[6] + hexHandle[7] + hexHandle[8] + ",<br/>" +
					"&nbsp;0x" + hexHandle[9] + hexHandle[10] + hexHandle[11] + hexHandle[12] + "," +
					"0x" + hexHandle[13] + hexHandle[14] + "0000)"

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
					"<!--<footer>CPU DISCLAIMER</footer>-->"
	);
}

function rootingTerminal(timeUp)
{
	terminal.setTerminalState(timeUp);

	$("#load").addClass("hidden");
	$("body").addClass("rooting");
	$("#timerLCD").removeClass("amber");
	$("#timerLCD").addClass("red");
	$(".zoneBox").css("display","none");

	$("#playPause").html('<img src="resources\\images\\playpause\\pause_root.png">');
	$("#playPause").attr("onmouseup","pauseTimer(true)");

	let secs = ((timeUp - new Date()) / 1000);

	startTimer("EXECUTE",Math.ceil(secs),function () {
		$("body").removeClass("rooting");

		rootTerminal();

		$.ajax({
			type: "POST",
			dataType: "json",
			url: "resources\\scripts\\files\\updateterminaljson.php",
			data:
			{
				suffixID: terminal.getTerminalID(),
				path: "state",
				newState: "rooted"
			}
		});

		let actionJSON = {
			timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
			handle: payload.getHandle().handle,
			action: "Terminal Root Completed",
			details: null
		};
	
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "resources\\scripts\\files\\ooclogupdate.php",
			data:
			{
				suffixID: terminal.getTerminalID(),
				actionJSON: JSON.stringify(actionJSON)
			}
		});
	});
}

function rootTerminal()
{
	$("#main").html("<p>No boot device avaiable<br/>" +
					"Current boot mode is set to BIOS.<br/>" +
					"Please ensure compatible bootable media is available.<br/>" +
					"Use the system setup program to change the boot mode as needed.</p>" +
					"<p>Restart device to retry boot.</p>" +
					"<!--<footer>CPU DISCLAIMER</footer>-->"
	);
}

function executeAction(action)
{
	let cost;
	let timerSecs = payload.getTimerSecs();
	let callback;

	if(action === "brick")
	{
		cost = Math.max(4 + payload.getModifier("cost"),0);
		callback = function() {
			let handle = payload.getHandle();
			handle = (handle.masked) ? handle.mask : handle.handle;
			handleLength = handle.length;

			let hexHandle = [];

			for(let i = 0; i < handleLength; i++)
			{
				hexHandle.push(handle.charCodeAt(i).toString(16));
			}

			for(let j = handleLength; j < 15; j++)
			{
				hexHandle.push("00");
			}

			brickTerminal(hexHandle);

			payload.setCurrentTags(payload.getCurrentTags()-cost);
			autoSave({});

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\files\\updateterminaljson.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					path: "state",
					newState: hexHandle
				}
			});

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Terminal Bricked",
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\files\\ooclogupdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};

		updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());
		startTimer("EXECUTE",timerSecs,callback);
	}
	else if (action === "rig")
	{
		cost = Math.max(6 + payload.getModifier("cost"),0);
		callback = function() {
			$("#rigged").removeClass("hidden");
			$("#riggButton").attr("data-enabled","false");

			payload.setCurrentTags(payload.getCurrentTags()-cost);
			$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);
			autoSave({ rigged: true });

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Terminal Rigged",
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\files\\ooclogupdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};

		updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());
		startTimer("EXECUTE",timerSecs,callback);
	}
	else if(action === "root")
	{
		cost = Math.max(6 + payload.getModifier("cost"),0);
		callback = function() {
			let timeUp = new Date(new Date().getTime() + 5 * 60 * 1000)

			rootingTerminal(timeUp);
			autoSave({});

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\files\\updateterminaljson.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					path: "state",
					newState: timeUp
				}
			});

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Terminal Root Started",
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "resources\\scripts\\files\\ooclogupdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};

		updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());
		startTimer("ROOT",timerSecs,callback);
	}
		
	$("button[data-cost]").prop("disabled",true);
	$("#status").html(">> EXECUTING COMMAND...");
}

function activateDeck(deck)
{
	payload.setCurrentTags(payload.getCurrentTags()+1);
	updateTagDisplay("STANDBY",payload.getCurrentTags());

	let payload_sim = JSON.parse(Cookies.get("payload_sim"));

	let deckIndex = payload_sim.findIndex(function(payDeck)
	{
		return payDeck.id === deck;
	});

	payload_sim[deckIndex].used++;

	Cookies.set("payload_sim",JSON.stringify(payload_sim),{expires: 7,path: "",sameSite: "Strict"});

	payload.rewriteItemMarks(deck);

	autoSave({});
}

function openTab(evt, bodyID)
{
	$(".hackTab.active").removeClass("active");
	$(".hackBody").removeClass("active");
	
	$($(evt.target)).addClass("active");
	$("#" + bodyID).addClass("active");
}

function openSubTab(evt, contentID)
{
	let parentBody = $(evt.target).parent().parent().parent();
	let pBodyID = "[id='"+parentBody.attr("id")+"'] "
	
	$(pBodyID + ".subTab.active").addClass("inactive");
	$(pBodyID + ".subTab.active").removeClass("active");
	$(pBodyID + ".subContent").removeClass("active");
	
	$($(evt.target)).removeClass("inactive");
	$($(evt.target)).addClass("active");
	$("#" + contentID).addClass("active");
}

function helpPopup()
{
	$("#popup").html("[helpText]");
	$("#popup").dialog();
}

function logAction(logIndex,action)
{
	let logHandle = terminal.getLogHandle(logIndex);
	let actionCost;
	
	if(action === "reassign")
	{
		actionCost = Math.max(2 + payload.getModifier("cost"),0);
		$("#popup").html("Reassign Log Entry of User " + logHandle + " to the below username for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?<br/><br/>" +
						 "<input id='newReass' placeholder='Enter New Log Entry Name Here' style='width:100%'></input><br/><br/>" +
						 "NOTE: This Reassignment MAY be used to imitate someone else!");
	}
	else if (action === "wipe")
	{
		actionCost = Math.max(1 + payload.getModifier("cost"),0);

		$("#popup").html("Wipe Log Entry of User " + logHandle + " for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?");
	}
	
	$("#popup").dialog({
		title: "Confirm " + (action.charAt(0).toUpperCase() + action.slice(1)) + " Action",
		height: "auto",
		width:$("#main").width(),
		buttons: [{
			text: "Confirm",
			click: function()
			{
				$(this).dialog("close");
				updateAccessLog(logIndex,action,$("#newReass").val());
			}
		}],
		open: function(event,ui)
		{
			updateTagDisplay("CONFIRM",payload.getCurrentTags()-actionCost,payload.getCurrentTags());
		},
		close: function(event,ui)
		{
			updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});
}

function payAction(action)
{
	//brick -> 4 Tags, Action Seconds -> Blue Screen | [permanently disable device (until repair?)]
	//rig -> 6 Tags, Action Seconds -> Rigged Stamp | [all files/data on terminal deleted at end of scene]
	//root -> 6 Tags, Hard 30s, 5min hands-off timer -> BIOS | wipe all software/data from device (can install new software if in possession)

	let actionCost;

	if(action === "brick")
	{
		actionCost = Math.max(4 + payload.getModifier("cost"),0);

		$("#popup").html("Brick Device for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?<br/><br/>" +
			"<span class='red'>WARNING: Bricking this Device will render it inoperable until repaired!</span>");
	}
	else if(action === "rig")
	{
		actionCost = Math.max(6 + payload.getModifier("cost"),0);

		$("#popup").html("Rig Device for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?<br/><br/>" +
			"<span class='red'>WARNING: Triggering a Rigged Device (by calling \"Room Strike Lock\") will cause all data to be deleted at the end of the Scene!</span>");
	}
	else if(action === "root")
	{
		actionCost = Math.max(6 + payload.getModifier("cost"),0);

		$("#popup").html("Root Device for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?<br/><br/>" +
			"<span class='red'>WARNING: Rooting this Device will format all memory disks, deleting all software and data permanently!<br/>Furthermore, Device will be inoperable until appropriate software is re-installed!</span>");
	}

	$("#popup").dialog({
		title: "Confirm " + (action.charAt(0).toUpperCase() + action.slice(1)) + " Action",
		height: "auto",
		width:$("#main").width(),
		buttons: [{
			text: "Confirm",
			click: function()
			{
				$(this).dialog("close");
				executeAction(action);
			}
		}],
		open: function(event,ui)
		{
			updateTagDisplay("CONFIRM",payload.getCurrentTags()-actionCost,payload.getCurrentTags());
		},
		close: function(event,ui)
		{
			updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});
}

function termAction(path,action)
{
	let entry = terminal.getEntry(path);
	let icon = terminal.getIcon(path);
	let dataType = terminal.getDataType(path.split(">")[0]);

	let johnnyAccess = ((action === "access") && (payload.getPayloadFunction("items").includes("deck_johnnyspecialtouch")));

	let copyPossible = payload.getPayloadFunction("items").includes("cust_copycat") && (JSON.parse(Cookies.get("payload_sim")).find(item => item.id === "cust_copycat").used === 0);
	let copyHTML = (copyPossible && icon.copied) ?
					'<br/><br/><input id="copycat_check" type="checkbox"/><label for="copycat_check">&nbsp;Use Copycat to bypass timer?<br/>NOTE: This item can only be used once per Simulation.</label>' :
					"";
	
	let buttonActions = [];
	
	if(entry.special == "ice")
	{
		if(action == "unwrap")
		{
			buttonActions.push({
				text: "Confirm",
				click: function()
				{
					$(this).dialog("close");
					executeCommand(path,"unwrap",0,$("#copycat_check").prop("checked"));
				}
			});
		
			$("#popup").html((action.charAt(0).toUpperCase() + action.slice(1)) + " \"" + entry.displayName + ": " + entry.title + "\" for no Tags?<br/><br/>WARNING: Unwrapping will trip the ICE, incurring negative effects! Break the ICE instead to avoid these effects." + copyHTML);
		}
		else if(action == "break")
		{
			let actionCost = Math.max((entry[action]-icon.repeated-johnnyAccess)+payload.getModifier("cost"),0);
			
			buttonActions.push({
				text: "Confirm",
				click: function()
				{
					$(this).dialog("close");
					executeCommand(path,"break",actionCost,$("#copycat_check").prop("checked"));
				}
			});
			
			$("#popup").html((action.charAt(0).toUpperCase() + action.slice(1)) + " \"" + entry.displayName + ": " + entry.title + "\" for " + actionCost + " Tag" + (actionCost == 1 ? "" : "s") + "?" + copyHTML);
		}
	}
	else
	{		
		let actionCost = Math.max((entry[action]-icon.repeated-johnnyAccess)+payload.getModifier("cost"),0);
		
		dataType.states[entry.state][action].actions.forEach(function(button)
		{
			buttonActions.push({
				text: button.title,
				click: function()
				{
					$(this).dialog("close");
					executeCommand(path,(entry.special == "trap" ? action : button.state),actionCost,$("#copycat_check").prop("checked"));
				}
			});
		});

		$("#popup").html((action.charAt(0).toUpperCase() + action.slice(1)) + " \"" + entry.displayName + "\" for " + actionCost + " Tag" + (actionCost == 1 ? "" : "s") + "?" + copyHTML);
	}
	
	//https://jqueryui.com/dialog/#modal-confirmation
	$("#popup").dialog({
		title: "Confirm " + (action.charAt(0).toUpperCase() + action.slice(1)) + " Action",
		height: "auto",
		width:$("#main").width(),
		buttons: buttonActions,
		open: function(event,ui)
		{
			let actionCost = entry[action] ? Math.max((entry[action]-icon.repeated-johnnyAccess)+payload.getModifier("cost"),0) : 0;
			updateTagDisplay("CONFIRM",payload.getCurrentTags()-actionCost,payload.getCurrentTags());
		},
		close: function(event,ui)
		{
			updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});
}

function deckAction(deck,max)
{
	let deckType = "cyberdeck";

	if(deck.startsWith("cust_"))
	{
		deckType = "customization"
	}

	$("#popup").html("Activate Deck for +1 Tag?<br/><br/>NOTE: You only have " + max + " activation" + ( max === 1 ? "" : "s" ) + " of this " + deckType + " per Simulation.");

	$("#popup").dialog({
		title: "Confirm Deck Activation",
		height: "auto",
		width:$("#main").width(),
		buttons: [{
			text: "Confirm",
			click: function()
			{
				$(this).dialog("close");
				activateDeck(deck);
			}
		}],
		open: function(event,ui)
		{
			updateTagDisplay("CONFIRM",payload.getCurrentTags(),payload.getCurrentTags()+1);
		},
		close: function(event,ui)
		{
			updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});
}