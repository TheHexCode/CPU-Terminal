$(document).ready(async function()
{
	let suffix = new URLSearchParams(window.location.search);
	const response = await fetch("resources/scripts/db/getTerm.php?id=" + suffix.get("id"),{cache: "no-store"});
	let terminal = new Terminal(await response.json());
	
	setupAccessZone(terminal);
	setupTerminalZone(terminal);

	$("#load").hide();
});

function tens(numStr)
{
	var tensFormat = new Intl.NumberFormat('en-US', { 
		minimumIntegerDigits: 2
	});
	
	return tensFormat.format(Number(numStr));
}

function setupAccessZone(terminal)
{
	$termAccess = terminal.getTerminalAccessCost();
	$termName = terminal.getTerminalDisplayName();
	$termState = terminal.getTerminalState();

	if($termState === "active")
	{
		$("#termName").html($termName);
		$("#reqTags").html(tens($termAccess));
		$("#extTags").html(tens(0));

		$("#terminalButton").prop("disabled",false);
	}
	//else if rooting/rooted/bricked
}

function setupTerminalZone(terminal)
{
	terminal.getActiveIcons().forEach(function(icon) {
		$("#" + icon + "SubTab").removeClass("disabled").addClass("inactive");

		terminal.getIconEntries(icon).forEach(function(entry) {
			if(entry.type === "entry")
			{
				
			}
		})
	});
}

function accessTerminal()
{
	$("#accessZone").hide();
	$("#hackZone").css("display","flex");
}

function openSubTab(evt, contentID)
{
	let parentBody = $(evt.target).parent().parent().parent();
	let pBodyID = "[id='" + parentBody.attr("id") + "'] "

	$(".subTab.active").addClass("inactive");
	$(".subTab.active").removeClass("active");
	$(".subContent.active").removeClass("active");
	
	$($(evt.target)).removeClass("inactive");
	$($(evt.target)).addClass("active");
	$("#" + contentID).addClass("active");
}