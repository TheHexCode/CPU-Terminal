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
	$(".tabContent").addClass("hidden");
	$(".tab").removeClass("active");
	
	$("#"+tabName).removeClass("hidden");
	$(evt.currentTarget).addClass("active");
  
	activeIndex = 50;
	for(let i = 0; i < $(".tab").length; i++)
	{
		if(i < activeIndex)
		{
			if($(".tab")[i].className.includes("active"))
			{
				activeIndex = i;
				$(".tabContainer button:nth-child("+(i+1)+")").css("z-index",50);
			}
			else
			{
				$(".tabContainer button:nth-child("+(i+1)+")").css("z-index",i+1);
			}
		}
		else
		{
			$(".tabContainer button:nth-child("+(i+1)+")").css("z-index",50-i);
		}
	}
}

function roleChange()
{
	$("#priTab .info, #priTab .options, #priTab .select").addClass("hidden");
	$("#secTab .info, #secTab .options, #secTab .select").addClass("hidden");
	
	let priRole = $("select[id='primaryRole']")[0].selectedOptions[0].value;
	let secRole = $("select[id='secondaryRole']")[0].selectedOptions[0].value;
	
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

	console.log($("#p_bast_hack_check_2").parent())
	
	$("#priTab section[data-roles*='"+priRole+"']").removeClass("hidden");
	$("#secTab section[data-roles*='"+secRole+"']").removeClass("hidden");

	console.log($("#p_bast_hack_check_2").parent())

	$("#priTab div[data-role='"+priRole+"']").removeClass("hidden");
	$("#secTab div[data-role='"+secRole+"']").removeClass("hidden");

	console.log($("#p_bast_hack_check_2").parent())
	
	$("input[type='checkbox']").each(function() {
		if(!($(this).parent().hasClass(priRole) || $(this).hasClass(secRole) || $(this).hasClass("standard")))
		{
			$(this).prop("checked",false);
		}
	});
}

function statSubmit(event)
{
	event.preventDefault();
	
	// DEFAULT HANDLE
	let handle = $("#statsHandle").val();
	
	// ROLES
	let priRole = $("select[id='primaryRole']")[0].selectedOptions[0].value;
	let secRole = $("select[id='secondaryRole']")[0].selectedOptions[0].value;
	
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