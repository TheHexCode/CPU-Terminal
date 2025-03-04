function roleChange()
{
    $(".shownStat").addClass("hiddenStat");
	$(".shownStat").removeClass("shownStat");
	
	let priRole = $("#primaryRole")[0].selectedOptions[0];
	let secRole = $("#secondaryRole")[0].selectedOptions[0];
	
	$("#primaryRole > option").prop("hidden",false);
	$("#secondaryRole > option").prop("hidden",false);
	
	switch (priRole.value)
	{
		case "none":
		case "other":
			$("#priButton").html("PRIMARY");
			break;
		default:
			$("#secondaryRole > option[value='" + priRole.value + "']").prop("hidden",true);
			$("#priButton").html(priRole.text.toUpperCase());
	}
	
	switch (secRole.value)
	{
		case "none":
		case "other":
			$("#secButton").html("SECONDARY");
			break;
		default:
			$("#primaryRole > option[value='" + secRole.value + "']").prop("hidden",true);
			$("#secButton").html(secRole.text.toUpperCase());
	}
	
	$("#priTab .checkGroup").addClass("hidden");
	$("#priTab .checkGroup[data-role='" + priRole.value + "']").removeClass("hidden");
    $("#priTab .checkGroup:not([data-role='" + priRole.value + "']) input[type='checkbox']").prop("checked",false);
	
	$("#secTab .checkGroup").addClass("hidden");
	$("#secTab .checkGroup[data-role='" + secRole.value + "']").removeClass("hidden");
    $("#secTab .checkGroup:not([data-role='" + secRole.value + "']) input[type='checkbox']").prop("checked",false);
	
	//maskChange();
}

function openTab(target,tabName)
{
    $(".profContent").addClass("hidden");
	$(".profTab").removeClass("active");
	
	if($(target).parent().hasClass("backRow"))
	{
		$("#profTabContainer").css("flex-direction","column");
	}
	else
	{
		$("#profTabContainer").css("flex-direction","column-reverse");
	}
	
	$("#"+tabName).removeClass("hidden");
	$(target).addClass("active");
}

function statSubmit(event)
{
    event.preventDefault();
}