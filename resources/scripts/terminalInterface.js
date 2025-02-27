function pauseTimer()
{

}

function extraTags(change)
{

}

function accessTerminal()
{
    $("#accessZone").hide();
	$("#hackZone").css("display","flex");
}

function openTab(evt, contentID)
{

}

function openSubTab(evt, contentID)
{
    $(".subTab.active").addClass("inactive");
	$(".subTab.active").removeClass("active");
	$(".subContent.active").removeClass("active");
	
	$($(evt.target)).removeClass("inactive");
	$($(evt.target)).addClass("active");
	$("#" + contentID).addClass("active");
}

function logAction()
{

}

function termAction(entryID, action)
{
	let suffix = new URLSearchParams(window.location.search);
	console.log($.getJSON("resources\\scripts\\db\\getTerm.php",{ id: suffix.get("id") }));
}