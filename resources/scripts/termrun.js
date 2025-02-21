$(document).ready(async function()
{
	let suffix = new URLSearchParams(window.location.search);

	const response = await fetch("resources/scripts/db/getTerm.php?id=" + suffix.get("id"),{cache: "no-store"})

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
	}
	//else if rooting/rooted/bricked
}

function setupTerminalZone(terminal)
{
	terminal.getActiveIcons().forEach(function(icon) {
		$("#" + icon + "SubTab").removeClass("disabled").addClass("inactive");
	});
}