function accessTerminal()
{
    $("#accessZone").hide();
	$("#hackZone").css("display","flex");
}

function openTab()
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