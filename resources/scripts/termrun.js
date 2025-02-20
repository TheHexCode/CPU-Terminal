$(document).ready(async function()
{
	let suffix = new URLSearchParams(window.location.search);

	const response = await fetch("resources/scripts/db/getTerm.php?id=" + suffix.get("id"),{cache: "no-store"})

	let terminal = new Terminal(await response.json());
	
	modifyAccessZone(terminal);
});


function modifyAccessZone(terminal)
{
	console.log(terminal.getTerminalID());
	console.log(terminal.getTerminalDisplayName());
	console.log(terminal.getTerminalAccessCost());
	console.log(terminal.getTerminalState());
}