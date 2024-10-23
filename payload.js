$(document).ready(function()
{
	if(Cookies.get("payload"))
	{
		let cookie = JSON.parse(Cookies.get("payload"));
		
		$("#statsHandle").val(cookie.handle);
		$("select[name='primaryRole']").val(cookie.priRole);
		$("select[name='secondaryRole']").val(cookie.secRole);
		
		cookie.checks.forEach(function(check) {
			$("#"+check).prop("checked",true);
		});
	}
	else
	{
		console.log("No Such Cookie Exists");
	}
	
	roleChange();
});

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

function roleChange()
{
	$(".shownStat").addClass("hiddenStat");
	$(".shownStat").removeClass("shownStat");
	
	let priRole = $("select[name='primaryRole']")[0].selectedOptions[0].value;
	let secRole = $("select[name='secondaryRole']")[0].selectedOptions[0].value;
	
	switch (priRole)
	{
		case "other":
		case "none":
			$("#priButton").html("PRIMARY");
			break;
		default:
			$("#priButton").html(priRole.toUpperCase());
	}
	
	switch (secRole)
	{
		case "other":
		case "none":
			$("#secButton").html("SECONDARY");
			break;
		default:
			$("#secButton").html(secRole.toUpperCase());
	}
	
	$(".priStat."+priRole).addClass("shownStat");
	$(".priStat."+priRole).removeClass("hiddenStat");
	$(".secStat."+secRole).addClass("shownStat");
	$(".secStat."+secRole).removeClass("hiddenStat");
	
	$("input[type='checkbox']").each(function() {
		if(!($(this).hasClass(priRole) || $(this).hasClass(secRole) || $(this).hasClass("standard")))
		{
			$(this).prop("checked",false);
		}
	});
	
	/*
	if((priRole == "dissimulator" && secRole == "slipstream") || (priRole == "slipstream" && secRole == "dissimulator"))
	{
		$("label[for='diss_wipe_check']").html("T3 - WYT");
		$("label[for='slip_wipe_check']").html("T1 - WYT");
	}
	else
	{
		$("label[for='diss_wipe_check']").html("T3 - Wipe Your Tracks");
		$("label[for='slip_wipe_check']").html("T1 - Wipe Your Tracks");
	}
	*/
}

function statSubmit(event)
{
	event.preventDefault();
	
	// DEFAULT HANDLE
	let handle = $("#statsHandle").val();
	
	// ROLES
	let priRole = $("select[name='primaryRole']")[0].selectedOptions[0].value;
	let secRole = $("select[name='secondaryRole']")[0].selectedOptions[0].value;
	
	// HACKING
	let hack_sum = 0;
	
	$Hacks = $("input[data-skill='hack']").filter(function() { if ($(this).prop("checked")) { return this } });
	$Hacks.each(function(){ hack_sum += parseInt($(this).attr("data-value")) });
	
	// MASK
	let mask = ($("input[data-skill='mask']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// WIPE YOUR TRACKS
	let wipe = ($("input[data-skill='wipe']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// REASSIGN
	let reass = ($("input[data-skill='reass']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// BACKDOOR
	let bd = ($("input[data-skill='bd']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// IMPROVED BACKDOOR
	let ibd = ($("input[data-skill='ibd']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// ROOT EXPLOIT
	let rex = ($("input[data-skill='rex']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// REPEAT
	let repeat_sum = 0;
	
	$Repeats = $("input[data-skill='repeat']").filter(function() { if ($(this).prop("checked")) { return this } });
	$Repeats.each(function(){ repeat_sum += parseInt($(this).attr("data-value")) });
	
	// BRICK
	let brick = ($("input[data-skill='brick']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// RIGGED
	let rigg = ($("input[data-skill='rigg']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// ROOT DEVICE
	let root = ($("input[data-skill='root']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// DARK WEB ACCESS
	let dwa = ($("input[data-skill='dwa']").filter(function() { if ($(this).prop("checked")) { return this } }).length > 0);
	
	// LIST OF CHECKED BOXES
	
	let checks = [];
	$Checks = ($("input[data-skill]").filter(function() { if ($(this).prop("checked")) { return this } }));
	$Checks.each(function() { checks.push("\"" + $(this).attr("id") + "\"") });
	
	let stats = '{ "handle"  : "' + handle     + '",' +
				'  "priRole" : "' + priRole    + '",' +
				'  "secRole" : "' + secRole    + '",' +
				'  "hack"    : "' + hack_sum   + '",' +
				'  "mask"    : "' + mask       + '",' +
				'  "wyt"     : "' + wipe       + '",' +
				'  "reass"   : "' + reass      + '",' +
				'  "bd"      : "' + bd         + '",' +
				'  "ibd"     : "' + ibd        + '",' +
				'  "rex"     : "' + rex        + '",' +
				'  "repeat"  : "' + repeat_sum + '",' +
				'  "brick"   : "' + brick      + '",' +
				'  "rigg"    : "' + rigg       + '",' +
				'  "root"    : "' + root       + '",' +
				'  "dwa"     : "' + dwa        + '",' +
				'  "checks"  : [' + checks     + '] }';
				
	console.log(JSON.parse(stats));
	
	Cookies.set("payload",stats,{expires: 30,path: "",sameSite: "Strict"});
}