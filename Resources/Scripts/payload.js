$(document).ready(function()
{
	if(Cookies.get("payload"))
	{
		let cookie = JSON.parse(Cookies.get("payload"));
		
		$("#handle").val(cookie.handle);
		$("#mask").val(cookie.maskHandle);
		$("select[id='primaryRole']").val(cookie.priRole);
		$("select[id='secondaryRole']").val(cookie.secRole);
		
		cookie.checks.forEach(function(check) {
			console.log(check);
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
	$(".profContent").addClass("hidden");
	$(".profTab").removeClass("active");
	
	if($(evt.currentTarget).parent().hasClass("backRow"))
	{
		$("#profTabContainer").css("flex-direction","column");
	}
	else
	{
		$("#profTabContainer").css("flex-direction","column-reverse");
	}
	
	$("#"+tabName).removeClass("hidden");
	$(evt.currentTarget).addClass("active");
}

function roleChange()
{
	$(".shownStat").addClass("hiddenStat");
	$(".shownStat").removeClass("shownStat");
	
	let priRole = $("#primaryRole")[0].selectedOptions[0].value;
	let secRole = $("#secondaryRole")[0].selectedOptions[0].value;
	
	$("#primaryRole > option").prop("hidden",false);
	$("#secondaryRole > option").prop("hidden",false);
	
	switch (priRole)
	{
		case "other":
		case "none":
			$("#priButton").html("PRIMARY");
			break;
		default:
			$("#secondaryRole > option[value='" + priRole + "']").prop("hidden",true);
			$("#priButton").html(priRole.toUpperCase());
	}
	
	switch (secRole)
	{
		case "other":
		case "none":
			$("#secButton").html("SECONDARY");
			break;
		default:
			$("#primaryRole > option[value='" + secRole + "']").prop("hidden",true);
			$("#secButton").html(secRole.toUpperCase());
	}
	
	$("#priTab .checkGroup").addClass("hidden");
	$("#priTab .checkGroup[data-roles*='" + priRole + "']").removeClass("hidden");
	
	$("#priTab .checkGroup[data-roles*='" + priRole + "'] .check").addClass("hidden");
	$("#priTab .checkGroup[data-roles*='" + priRole + "'] .check[data-role='" + priRole + "']").removeClass("hidden");
	
	$("#secTab .checkGroup").addClass("hidden");
	$("#secTab .checkGroup[data-roles*='" + secRole+"']").removeClass("hidden");
	
	$("#secTab .checkGroup[data-roles*='" + secRole + "'] .check").addClass("hidden");
	$("#secTab .checkGroup[data-roles*='" + secRole + "'] .check[data-role='" + secRole + "']").removeClass("hidden");
	
	$("#priTab .check:not([data-role='"+priRole+"']) > input[type='checkbox']").prop("checked",false);
	$("#secTab .check:not([data-role='"+secRole+"']) > input[type='checkbox']").prop("checked",false);
	
	maskChange();
}

function maskChange()
{
	if($("input[data-skill='mask']:checked").length > 0)
	{
		$("#maskName").removeClass("dimmed");
		$("#mask").prop("disabled",false);
	}
	else
	{
		$("input[id='mask']").val("");
		$("#maskName").addClass("dimmed");
		$("#mask").prop("disabled",true);
	}
}

function toggleRadio(radio)
{
	if($(radio).prop("data-active"))
	{
		$(radio).prop("data-active",false);
		$(radio).prop("checked",false);
	}
	else
	{
		$("input[name='"+$(radio).prop("name")+"']").prop("data-active",false);
		$(radio).prop("data-active",true);
	}
}

function statSubmit(event)
{
	event.preventDefault();
	
	// DEFAULT HANDLE
	let handle = $("#handle").val();
	let maskHandle = $("#mask").val();
	
	// ROLES
	let priRole = $("#primaryRole")[0].selectedOptions[0].value;
	let secRole = $("#secondaryRole")[0].selectedOptions[0].value;
	
	// HACKING
	let hack_sum = 0;
	
	$Hacks = $("input[data-skill='hack']").filter(function() { if ($(this).prop("checked")) { return this } });
	$Hacks.each(function(){ hack_sum += parseInt($(this).attr("data-value")) });
	
	// MASK
	let mask = $("input[data-skill='mask']:checked").length > 0;
	
	// WIPE YOUR TRACKS
	let wipe = $("input[data-skill='wipe']:checked").length > 0;
	
	// REASSIGN
	let reass = $("input[data-skill='reass']:checked").length > 0;
	
	// BACKDOOR
	let bd = $("input[data-skill='bd']:checked").length > 0;
	
	// IMPROVED BACKDOOR
	let ibd = $("input[data-skill='ibd']:checked").length > 0;
	
	// ROOT EXPLOIT
	let rex = $("input[data-skill='rex']:checked").length > 0;
	
	// REPEAT
	let repeat_sum = 0;
	
	$Repeats = $("input[data-skill='repeat']").filter(function() { if ($(this).prop("checked")) { return this } });
	$Repeats.each(function(){ repeat_sum += parseInt($(this).attr("data-value")) });
	
	// BRICK
	let brick = $("input[data-skill='brick']:checked").length > 0;
	
	// RIGGED
	let rigg = $("input[data-skill='rigg']:checked").length > 0;
	
	// ROOT DEVICE
	let root = $("input[data-skill='root']:checked").length > 0;
	
	// DARK WEB ACCESS
	let dwa = $("input[data-skill='dwa']:checked").length > 0;
	
	// LIST OF ITEMS
	let items = [];
	$("#itemsTab input:checked").each(function() { items.push($(this).attr("data-item")) });

	// LIST OF CHECKED BOXES
	let checks = [];
	$Checks = ($("input[data-skill]").filter(function() { if ($(this).prop("checked")) { return this } }));
	$Checks.each(function() { checks.push($(this).attr("id")) });
	$("#itemsTab input:checked").each(function() { checks.push($(this).attr("id")) });

	let stats = {
		handle: handle,
		maskHandle: maskHandle,
		priRole: priRole,
		secRole: secRole,
		hack: hack_sum,
		mask: mask,
		wyt: wipe,
		reass: reass,
		bd: bd,
		ibd: ibd,
		rex: rex,
		repeat: repeat_sum,
		brick: brick,
		rigg: rigg,
		root: root,
		dwa: dwa,
		items: items,
		checks: checks
	}
				
	let hash = 0;

	let JSONstats = JSON.stringify(stats);

	for (i = 0; i < JSONstats.length; i++)
	{
		char = JSONstats.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
					
	stats["hash"] = hash;
	
	//console.log(stats);
	
	let itemJSON = $.getJSON("Resources\\Schemas\\items.json");

	$.when(itemJSON).done(function()
	{
		let itemCatalog = itemJSON.responseJSON;

		Cookies.set("payload",JSON.stringify(stats),{expires: 7,path: "",sameSite: "Strict"});

		if(!Cookies.get("payload_sim"))
		{
			let chargeItems = [];

			itemCatalog.forEach(function(item)
			{
				if(item.deck_charges || item.copycat_charges)
				{
					chargeItems.push({ id: item.id, used: 0 });
				}
			}, this);

			Cookies.set("payload_sim",JSON.stringify(chargeItems),{expires: 7,path: "",sameSite: "Strict"});
		}

		$("#saveText").removeClass("hidden");
		
		setTimeout(function(){$("#saveText").addClass("hidden");},5000);
	});
}