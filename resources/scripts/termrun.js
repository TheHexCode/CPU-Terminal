$(document).ready(async function()
{
	let suffix = new URLSearchParams(window.location.search);
	const response = await fetch("resources/scripts/db/getTerm.php?id=" + suffix.get("id"),{cache: "no-store"});
	let terminal = new Terminal(await response.json());
	await terminal.initSchemas();
	
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
	terminal.getLogEntries().forEach(function(logEntry) {
		if(logEntry.state === "wiped")
		{
			$("#logList").append(	'<li id="log' + logEntry.id + '" class="logEntry">' +
										'ERROR: LOG ENTRY NOT FOUND' +
									'</li>');
		}
		else if(logEntry.state === "initial")
		{
			let logHandle = (logEntry.reassignee !== null) ? logEntry.reassignee :
							(logEntry.mask !== null) ? logEntry.mask :
							logEntry.true_name;

			$("#logList").append(	'<li id="log' + logEntry.id + '" class="logEntry">' +
										'<span class="logPerson">User:&nbsp;</span><span class="logName">' + logHandle + '</span>' +
										'<div class="logActions hidden">' +
											'<hr/>' +
											'<span class="hidden">REASSIGN: <button class="reassButton" data-enabled="true" data-cost="2" onclick="logAction(' + logEntry.id + ',\'reassign\')">2 Tags</button></span>' +
											'<span class="hidden">WIPE TRACKS: <button class="wipeButton" data-enabled="true" data-cost="1" onclick="logAction(' + logEntry.id + ',\'wipe\')">1 Tag</button></span>' +
										'</div>' +
									'</li>');
		}
	});

	let inIce = new Array();
	let outIce = 0;

	terminal.getActiveIcons().forEach(function(icon) {
		$("#" + icon + "SubTab").removeClass("disabled").addClass("inactive");

		let iconContentString = new Array();

		terminal.getIconEntries(icon).forEach(function(entry) {
			let subClass = 	((entry.ice) ? " ice" : "") + 
							((entry.subIce) ? " subIce" : "");

			let titleMask = (entry.title === null) ?
								'<span class="entryMasking">&nbsp;</span>' :
								'<span class="entrySecret">' + entry.title + '</span>';
			let contentMask = (entry.contents === null) ?
							  	'<span class="entryMasking">&nbsp;</span>' :
							  	'<span class="entrySecret">' + entry.contents + '</span>';

			let accessInt;
			let modifyInt;

			console.log(inIce);

			if (entry.ice === true)
			{
				inIce.push(entry.path);

				accessInt = {
					prefix: "Unwrap:",
					button: (entry.access === null) ?
								'<button class="accessButton" data-enabled="false" disabled="" ">N/A</button>' :
								'<button class="accessButton" data-enabled="true" onclick="termAction(\'' + icon + '-' + entry.path + '\',\'unwrap\')">Free!</button>'
				}

				modifyInt = {
					prefix: "Break:",
					button: (entry.modify === null) ?
					'<button class="modifyButton" data-enabled="false" disabled="" ">N/A</button>' :
					'<button class="modifyButton" data-enabled="true" onclick="termAction(\'' + icon + '-' + entry.path + '\',\'break\')">' + entry.modify + ' Tag' + ((entry.modify === 1) ? '' : 's') + '</button>'
				}
			}
			else
			{
				inIce.every(element => {
					if(!entry.path.match(element))
					{
						outIce++;
					}
				});

				accessInt = {
					prefix: "Access:",
					button: (entry.access === null) ?
								'<button class="accessButton" data-enabled="false" disabled="" ">N/A</button>' :
								'<button class="accessButton" data-enabled="true" onclick="termAction(\'' + icon + '-' + entry.path + '\',\'access\')">' + entry.access + ' Tag' + ((entry.access === 1) ? '' : 's') + '</button>'
				}

				modifyInt = {
					prefix: "Modify:",
					button: (entry.modify === null) ?
								'<button class="modifyButton" data-enabled="false" disabled="" ">N/A</button>' :
								'<button class="modifyButton" data-enabled="true" onclick="termAction(\'' + icon + '-' + entry.path + '\',\'modify\')">' + entry.modify + ' Tag' + ((entry.modify === 1) ? '' : 's') + '</button>'
				}
			}
			
			let entryString = "";

			for(let i = 0; i < outIce; i++)
			{
				entryString += '</div>';
				inIce.pop();
			}
			outIce = 0;

			entryString += 	'<div id="' + icon + '-' + entry.path + '" class="entry' + subClass + '">' +
								'<div class="entryTitleBar">' +
									'<span class="entryPrefix">>> ' + entry.unit + ':\\</span>' +
									'<span class="entryMaskContainer">' +
										titleMask +
									'</span>' +
								'</div>' +
								'<div class="entryContentsBar">' +
									'<span class="entryMaskContainer">' +
										contentMask +
									'</span>' +
								'</div>' +
								'<div class="entryIntContainer">' +
									'<div class="entryInterface">' + accessInt.prefix +
										accessInt.button +
									'</div>' +
									'<div class="entryInterface">' + modifyInt.prefix +
										modifyInt.button +
									'</div>' +
								'</div>' +
							(entry.ice) ? '' : '</div>';

			iconContentString.push(entryString);
		});

		$("#" + icon + "Content > .subContBody").append(iconContentString.join("<hr/>"));
	});
}

function accessTerminal()
{
	$("#accessZone").hide();
	$("#hackZone").css("display","flex");
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