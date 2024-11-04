var accessTimer;
var currTags = 0;
var prevSender;
var termData;
var accessLog;
var payload;
var bdtime = 30;

var tensFormat = new Intl.NumberFormat('en-US', { 
		minimumIntegerDigits: 2
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function()
{
	//var vpHeight = window.innerHeight;
	
	/*
	var dd = document.getElementsByClassName("dropdown");

	for (let i = 0; i < dd.length; i++) {
	  dd[i].addEventListener("mouseup", function() {
		/* Toggle between adding and removing the "active" class,
		to highlight the button that controls the panel */
		//this.classList.toggle("dd_show");

		/* Toggle between hiding and showing the active panel *//*
		var panel = this.nextElementSibling;
		if (panel.style.maxHeight) {
		  panel.style.maxHeight = null;
		} else {
		  panel.style.maxHeight = panel.scrollHeight + "px";
		} 
	  });
	} 
	*/

	suffix = new URLSearchParams(window.location.search);
	
	readTerminalData(suffix.get("id"));
});

$(document).on("focus",function()
{
	if($("#payload").html().indexOf("<button") >= 0)
	{
		checkCookies();
	}
});

async function readTerminalData(suffixID)
{
	terminal = await fetch("Data\\"+suffixID+"\\terminal.json", {cache:"reload"});
	termData = await terminal.json();
	
	access = await fetch("Data\\"+suffixID+"\\accessLog.csv", {cache:"reload"});
	accessLog = (await access.text()).trim().split("\r\n");
	
	activateTerminal();
}

function activateTerminal()
{
	$(document).attr("title",termData.name);
	$("#title").html(termData.name);
	
	//currTags = termData.access;
	
	$("#reqTags").html(tensFormat.format(termData.access));
	
	$("#extTags").html(tensFormat.format(0));
	
	$("#remTags").html(tensFormat.format(Math.max(0,currTags - termData.access)));
	
	if(termData.files.length > 0)
	{
		$.each(termData.files,function(index)
		{
			console.log("File "+index+": "+this.type);
			$("#hackfiles").append(fillEntry("files",this,index));
		});
	}
	
	if(termData.darkweb.length > 0)
	{
		$.each(termData.darkweb,function(index)
		{
			console.log("DW "+index+": "+this.type);
			$("#hackdw").append(fillEntry("dw",this,index));
		});
	}
	
	checkCookies();
	
	startTimer("CRACK",30);
}

function checkCookies()
{
	if(Cookies.get("payload"))
	{
		payload = JSON.parse(Cookies.get("payload"));
		
		$("#payload").html("PAYLOAD PROFILE UPLOADED: <br/>- " + payload.handle);
		
		hackTags = Math.min((payload.hack*2),10);
		rexTags = (payload.rex ? 2 : 0);
		
		currTags = hackTags + rexTags;
		
		$("#remTags").html(tensFormat.format(Math.max(0,currTags - termData.access)));
		
		$("#payTags").html(tensFormat.format(currTags));
		
		if(hackTags > 0)
		{
			$("#payHackTags").html(tensFormat.format(Math.min(payload.hack*2,10)));
			$("#payHack").show();
		}
		else
		{
			$("#payHack").html("[ No Tags from Payload ]");
		}
		
		if(rexTags > 0)
		{
			$("#payREx").show();
		}
	}
	else
	{
		console.log("No Such Cookie Exists");
		
		currTags = 0;
		
		$("#payTags").html(tensFormat.format(currTags));
	}
	
	let extraTags = parseInt($("#extTags").html());
	
	updateTagDisplay("CRACK",termData.access,currTags,currTags+extraTags);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function startTimer(context,seconds)
{
	var baseDate = Date.now();
	
	accessTimer = setInterval(function() {
		let newDate = Date.now();
		let dateDiff = Math.trunc((newDate - baseDate)/10)/100;
		
		if(dateDiff > seconds)
		{
			clearInterval(accessTimer);
			accessTimer = null;
			
			return endTimer(context);
		}
		
		let minSecFormat = new Intl.NumberFormat('en-US', { 
			minimumIntegerDigits: 2, 
			minimumFractionDigits: 2 
		});
		
		let strDate = minSecFormat.format(Math.max(seconds-dateDiff,0))
		
		$("#countdown").html('00:'+strDate);
	}, 10);
}

function endTimer(context)
{
	// "CRACK" = End of initial 30-second infiltration timer. Enables Ready button.
	
	if (context == "CRACK")
	{
		$("#readyButton").removeAttr("disabled");
		
		$("#countdown").html('00:00.00');
	}
	else
	{
		$(".gridAccessConfirm").html("&nbsp;");
		$(".gridModifyConfirm").html("&nbsp;");
		
		for (let i = 0; i <= currTags; i++)
		{
			$(".gridAccessButton[data-accessed='false'][data-cost="+i+"]").prop("disabled",false);
			$(".gridModifyButton[data-cost="+i+"]").prop("disabled",false);
		}
		
		console.log(context);
		
		$("#"+context.replace("access","unk").replace("modify","unk").replace("button","")).hide();
		$("#"+context.replace("access","name").replace("modify","name").replace("button","")).show();
		
		$("#stage").html("STANDBY");
		
		$("#countdown").html('00:'+bdtime+'.00');
		
		updateTagDisplay("STANDBY",currTags);
	}
}

function resetTimer()
{
	if(payload.idb)
	{
		$("#countdown").html('00:10.00');
	}
	else if (payload.db)
	{
		$("#countdown").html('00:20.00');
	}
	else
	{
		$("#countdown").html('00:30.00');
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setupExtraTags(changeTags)
{
	let extraTags = parseInt($("#extTags").html());
	
	extraTags = Math.min(Math.max(0,extraTags+changeTags),(99-(currTags-1)));
	
	$("#extTags").html(tensFormat.format(extraTags));
	$("#remTags").html(tensFormat.format((currTags + extraTags)-termData.access));
	
	updateTagDisplay("CRACK",termData.access,currTags,currTags+extraTags);
}

function updateTagDisplay(stage,stageOne,stageTwo=stageOne,stageTre=stageTwo) //totalTags,reqTags
{
	/*
		Stages:
			CRACK:
				- 1: Blend (Extra)   <- Tags Required to Access Terminal (non-overwritable)
				- 2: Amber (Active)  <- Tags added via Hacking
				- 3: Blue  (Standby) <- Extra Tags added on a case-by-case basis
			STANDBY:
				- 1: Blue  (Standby) <- All tags
			CONFIRM:
				- 1: Blue  (Standby) <- All tags
				- 2: Amber (Active)  <- Tags required/being used for an ability, just to confirm you want to use them
			EXECUTE:
				- 1: Blue  (Standby) <- All tags
				- 2: Blend (Extra)   <- Tags required/being used for an ability
	*/
	
	let totalTags = stageTre;
	
	let oneTens = Math.floor((stageOne-1)/10);
	let remOnes = ((stageOne-1) % 10)+1;
	
	let twoTens = Math.floor((stageTwo-1)/10);
	let remTwos = ((stageTwo-1) % 10)+1;
	
	let modTens = Math.floor((totalTags-1)/10);
	let remTags = ((totalTags-1) % 10)+1;
	
	if (modTens > 0)
	{
		$("#tagtens").html("x"+modTens);
	}
	else
	{
		$("#tagtens").html("!!");
	}
	
	let rgbOne;
	let rgbTwo;
	let rgbTre;
	
	switch (stage)
	{
		case "CRACK":
			rgbOne = "tag tagBlend";
			rgbTwo = "tag tagAmb";
			rgbTre = "tag tagBlu";
			break;
		case "STANDBY":
			rgbOne = "tag tagBlu";
			break;
		case "CONFIRM":
			rgbOne = "tag tagBlu";
			rgbTwo = "tag tagAmb";
			break;
		case "EXECUTE":
			rgbOne = "tag tagBlu";
			rgbTwo = "tag tagBlend";
			break;
	}
	
	let startTag = 1;
	
	if (oneTens == modTens)
	{
		for (let i = startTag; i <= remOnes; i++)
		{
			$("#tag"+i).removeClass().addClass(rgbOne);
		}
		
		startTag = remOnes+1;
	}
	
	if (twoTens == modTens)
	{
		for (let i = startTag; i <= remTwos; i++)
		{
			$("#tag"+i).removeClass().addClass(rgbTwo);
		}
		
		startTag = remTwos+1;
	}
	
	for (let i = startTag; i <= remTags; i++)
	{
		$("#tag"+i).removeClass().addClass(rgbTre);
	}
	
	for (let i = remTags+1; i <= 10; i++)
	{
		$("#tag"+i).removeClass().addClass("tag tagGry");
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function statSubmit(event)
{
	event.preventDefault();
	
	currTags = parseInt($("#remTags").html());
	
	updateTagDisplay("STANDBY",currTags);
	
	$("button[data-cost]").prop("disabled",true);
	
	for (let i = 0; i <= currTags; i++)
	{
		$("button[data-cost="+i+"]").prop("disabled",false);
	}
	
	$("#stage").html("ACCESS GRANTED");
	resetTimer();
	
	$("#stats").hide();
	$("#termsetup").hide();
	
	accessLog.forEach(function(handle)
	{
		$("#accessLog").append("<li class='parentCol'>"+handle+"<span class='logbutton'><button class='reassbutt'>REASSIGN</button><button class='wipebutt'>WIPE</button></span></li>");
	});
	$("#accessLog").append("<li><span class='loghandle'>"+payload.handle+"</span><span class='logbutton'><button class='reassbutt'>REASSIGN</button><button class='wipebutt'>WIPE</button></span></li>");
	
	$("#tabcontainer").show();
	
	/*
	- WIPE YOUR TRACKS - [1 Tag] Clear an entry from the "Access Log"
	- REASSIGN - [2 Tags] Fabricate an "Access Log" entry (this one or another one on the same device?). Can be used to impersonate
	*/
	/*
	if (($("#wipecheck").prop("checked"))  ||
		($("#reasscheck").prop("checked")))
	{
		$("#hackabilities").show();
		$("#userlog").show();
		$("#userloglabel").show();
		$("#userloglist").show();
		
		if($("#wipecheck").prop("checked"))
		{
			$("#userlogwipe").show();
		}
		if($("#reasscheck").prop("checked"))
		{
			$("#userlogreass").show();
		}
	}
	
	/*
	- (IMPROVED) BACKDOOR
	- ROOT EXPLOIT?
	- DARK WEB ACCESS
	- REPEAT (RANK)
	*/
	/*
	if (($("#bdcheck").prop("checked"))  ||
		($("#ibdcheck").prop("checked")) ||
		($("#rexcheck").prop("checked")) ||
		($("#dwacheck").prop("checked")) ||
		($("input[name='repeatradio']:checked").val() > 0))
	{
		$("#hackabilities").show();
		$("#userpriv").show();
		$("#userprivlabel").show();
		$("#userprivlist").show();
		
		if($("#bdcheck").prop("checked"))
		{
			$("#userprivbd").show();
			bdtime = 20;
		}
		if($("#ibdcheck").prop("checked"))
		{
			$("#userprivbd").show();
			$("#userprivibd").show();
			bdtime = 10;
		}
		if($("#rexcheck").prop("checked"))
		{
			$("#userprivrex").show();
		}
		if($("#dwacheck").prop("checked"))
		{
			$("#userprivdwa").show();
			$("#hackdw").show();
		}
		if($("input[name='repeatradio']:checked").val() > 0)
		{
			$("#userprivrepeat").show();
			
			switch($("input[name='repeatradio']:checked").val())
			{
				case "1":
					$("#userprivrepeat").append("I");
					break;
				case "2":
					$("#userprivrepeat").append("II");
					break;
				case "3":
					$("#userprivrepeat").append("III");
					break;
			/*  case 4:
					$("#userprivrepeat").append("IV");
					break;
				case 5:
					$("#userprivrepeat").append("V");
					break; *//*
			}
		}
	}
	
	/*
	- BRICK - [4 Tags] Disables the device until Repaired.
	- RIGGED - [6 Tags] Can "Bestow Resist" on any one character to Resist this effect. When triggered, call "Room Strike Lock". All files and data are deleted on the terminal at the end of the Scene.
	- ROOT DEVICE - [6 Tags] Wipes all software/data from device. New software may be installed if you have it, otherwise, it's unusable until reimaged with appropriate software.
	*/
	/*
	if (($("#brickcheck").prop("checked"))  ||
		($("#riggcheck").prop("checked")) ||
		($("#rootcheck").prop("checked")))
	{
		$("#hackabilities").show();
		$("#userabil").show();
		$("#userabillabel").show();
		$("#userabillist").show();
		
		if($("#brickcheck").prop("checked"))
		{
			$("#userabilbrick").show();
		}
		if($("#riggcheck").prop("checked"))
		{
			$("#userabilrigg").show();
		}
		if($("#rootcheck").prop("checked"))
		{
			$("#userabilroot").show();
		}
	}
	*/
	
	$("#countdown").html('00:'+bdtime+'.00');
	
	$("#hackstats").show();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function openTab(evt, tabName)
{
	var i, tabcontent, tablinks;
	
	tabcontent = document.getElementsByClassName("tabcontent");
	for(i = 0; i < tabcontent.length; i++)
	{
		tabcontent[i].style.display="none";
	}
	
	tablinks = document.getElementsByClassName("tablinks");
	for(i = 0; i < tablinks.length; i++)
	{
		tablinks[i].className = tablinks[i].className.replace(" active","");
	}
	
	document.getElementById(tabName).style.display = "block";
	evt.currentTarget.className += " active";
  
	activeIndex = 99;
	for(i = 0; i < tablinks.length; i++)
	{
		if(i < activeIndex)
		{
			if(tablinks[i].className.includes("active"))
			{
				activeIndex = i;
				$(".tab button:nth-child("+(i+1)+")").css("z-index",99);
			}
			else
			{
				$(".tab button:nth-child("+(i+1)+")").css("z-index",i+1);
			}
		}
		else
		{
			$(".tab button:nth-child("+(i+1)+")").css("z-index",99-i);
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fillEntry(category,entry,index)
{
	if(entry.type == "ice")
	{
		
	}
	else
	{
		let accS = "s";
		let modS = "s";
		
		if(entry.access == 1)
		{
			accS = "";
		}
		
		if(entry.modify == 1)
		{
			modS = "";
		}
		
		return `
			<span class="gridEntry">File&nbsp;`+index+`:&nbsp;
				<span id="`+category+entry.type+`name`+index+`" class="gridEntryName">`+entry.name+`</span>
				<span id="`+category+entry.type+`unk`+index+`">Unknown</span>
			</span>
			
			<span class="gridAccessKey">Access:&nbsp;</span>
			<button id="`+category+entry.type+`access`+index+`button" class="gridAccessButton" data-cost="`+entry.access+`" data-accessed="`+false+`" onmouseup="fileInput(this)">`+entry.access+`&nbsp;Tag`+accS+`</button>
			
			<span class="gridModifyKey">Modify:&nbsp;</span>
			<button id="`+category+entry.type+`modify`+index+`button" class="gridModifyButton" data-cost="`+entry.modify+`" onmouseup="fileInput(this)">`+entry.modify+`&nbsp;Tag`+modS+`</button>
			
			<span id="`+category+entry.type+`access`+index+`confirm" class="accessConfirm gridAccessConfirm centerAlign">&nbsp;</span>
			<span id="`+category+entry.type+`modify`+index+`confirm" class="modifyConfirm gridModifyConfirm centerAlign">&nbsp;</span>
			`
	}
}

function fileInput(sender)
{
	$(".accessConfirm").html("&nbsp;");
	$(".modifyConfirm").html("&nbsp;");
	
	let cost = $(sender).attr("data-cost");
	let type = sender.classList.value.match("grid.*Button")[0].replace("grid","").replace("Button","");
	let correspondingConfirm = sender.id.replace("button","confirm");
	let correspondingName = sender.id.replace("button","").replace("access","name");
	let isTrap = /.*trap.*/.test(sender.id);
	
	if(prevSender != sender)
	{
		prevSender = sender;
		
		updateTagDisplay("CONFIRM",(currTags-cost),currTags);
		
		$("#"+correspondingConfirm).html("Confirm "+type+"?");
	}
	else
	{
		prevSender = null;
		
		updateTagDisplay("EXECUTE",(currTags-cost),currTags);
		
		currTags = currTags-cost;
		
		$("#"+correspondingConfirm).html(type+"ing...");
		
		$("button[data-cost]").prop("disabled",true);
		
		if(type == "Access")
		{
			$(sender).attr("data-accessed",true);
			
			if(isTrap)
			{
				$("#"+correspondingName).css("text-decoration","line-through");
			}
		}
		else
		{
			$("#"+sender.id.replace("modify","access")).attr("data-accessed",true);
		}
		
		$("#stage").html("EXECUTING...");
		
		startTimer(sender.id,bdtime);
	}
}