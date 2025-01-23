class Terminal
{
	#suffix;
	#termData;
	#accessLog;
	
	#iconCatalog;
	
	#subTabsString = "";
	#termContentString = "";
	
	constructor(suffix,iconCatalog,termData,accessLog)
	{
		this.#suffix = suffix;
		this.#termData = termData;
		this.#accessLog = accessLog;
		
		this.#iconCatalog = iconCatalog;
		
		this.#buildDataEntries();
		this.#writeTerminal();
	}

	getTerminalID()
	{
		return this.#suffix;
	}

	getTerminalName()
	{
		return this.#termData.name;
	}
	
	getReqAccess()
	{
		return this.#termData.access;
	}
	
	getSubTabString()
	{
		return this.#subTabsString;
	}
	
	getTerminalString()
	{
		return this.#termContentString;
	}
	
	getIcon(path)
	{
		let iconIndex = this.#termData.data.findIndex(function(icon)
		{
			return icon.type == path.split(">")[0];
		});
		
		return this.#termData.data[iconIndex];
	}

	getLogHandle(index)
	{
		let entry = this.#accessLog[index];

		if(entry.reassignee)
		{
			return entry.reassignee;
		}
		else if(entry.mask)
		{
			return entry.mask;
		}
		else
		{
			return entry.handle;
		}
	}

	getLogIndex(handle)
	{
		return this.#accessLog.findIndex(entry => entry.handle === handle)
	}
	
	getEntry(path)
	{
		path = path.split(">");
		let searchResults;
		
		for(let i = 0; i < path.length; i++)
		{
			if(i === 0)
			{
				searchResults = this.#termData.data.find(icon => icon.type === path[i]);
			}
			else if(i === 1)
			{
				searchResults = searchResults.entries[path[i]];
			}
			else
			{
				searchResults = searchResults.subEntries[path[i]];
			}
		}
		
		return searchResults;
	}
	
	getDataType(type)
	{
		return this.#iconCatalog[type];
	}

	getTermState()
	{
		let entries = [];
		let repeats = [];

		this.#termData.data.forEach(function(icon)
		{
			let repeat = {
				type: icon.type,
				repeated: icon.repeated,
				copied: icon.copied
			};
			
			repeats.push(repeat);
		}, this);

		$(".entry").each(function(index,entry)
		{
			let entryData = terminal.getEntry(entry.id);
			let entryState = {
				path: entryData.path,
				state: entryData.state
			}

			entries.push(entryState);
		});

		return { "termState": this.#termData.state, "johnnyAccess": this.#termData.johnnyAccess, "repeats": repeats, "entries": entries };
	}

	setTerminalState(newState)
	{
		this.#termData.state = newState;
	}
	
	setEntryState(path,state,extraCost)
	{
		let catalogEntry = this.getEntry(path);
		let terminalEntry = "[id='"+path+"'] "
		
		let icon = this.getIcon(path);
		
		let newState = state;
		if(state === "previous")
		{
			newState = catalogEntry.previous;
		}
		
		let catalogState = this.#iconCatalog[icon.type].states[newState];
		
		if(catalogEntry.special)
		{
			if(catalogEntry.special == "trap")
			{
				if(newState == "access" || newState == "disarmed")
				{
					$(terminalEntry + "> .entryTitleBar > .entryMaskContainer > .entrySecret").addClass("disarmed");
					$(terminalEntry + "> .entryTitleBar > .entryMaskContainer > .entryMasking").addClass("invisible");
					
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entrySecret").addClass("disarmed");
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entryMasking").addClass("invisible");
					
					$(terminalEntry + ".accessButton").attr("data-enabled","false");
					$(terminalEntry + ".accessButton").html("N/A");
				
					$(terminalEntry + ".modifyButton").attr("data-enabled","false");
					$(terminalEntry + ".modifyButton").html("N/A");
					
					catalogEntry.state = "disarmed";
					//console.log(catalogEntry);
				}
				else if(newState == "modify" || newState == "sprung")
				{
					$(terminalEntry + "> .entryTitleBar > .entryMaskContainer > .entrySecret").addClass("sprung");
					$(terminalEntry + "> .entryTitleBar > .entryMaskContainer > .entryMasking").addClass("invisible");
					
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entrySecret").addClass("sprung");
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entryMasking").addClass("invisible");
					
					$(terminalEntry + ".accessButton").attr("data-enabled","false");
					$(terminalEntry + ".accessButton").html("N/A");
				
					$(terminalEntry + ".modifyButton").attr("data-enabled","false");
					$(terminalEntry + ".modifyButton").html("N/A");
					
					catalogEntry.state = "sprung";
					//console.log(catalogEntry);
				}
			}
			else if(catalogEntry.special == "ice")
			{
				if(newState == "unwrap" || newState == "sprung")
				{
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entrySecret").addClass("sprung");
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entryMasking").addClass("invisible");
				
					$(terminalEntry + "> .entryIntContainer button").attr("data-enabled","false");
					$(terminalEntry + "> .entryIntContainer button").html("N/A");
					
					$(terminalEntry + "> .subIce").removeClass("subIce");
					
					catalogEntry.state = "sprung";
					//console.log(catalogEntry);
				}
				else if(newState == "break" || newState == "broken")
				{
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entrySecret").addClass("broken");
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entryMasking").addClass("invisible");
				
					$(terminalEntry + "> .entryIntContainer button").attr("data-enabled","false");
					$(terminalEntry + "> .entryIntContainer button").html("N/A");
					
					$(terminalEntry + "> .subIce").removeClass("subIce");
					
					catalogEntry.state = "broken";
					//console.log(catalogEntry);
				}
			}
		}
		else
		{
			if(catalogState.title)
			{
				let newTitle = (catalogState.title === true) ? catalogEntry.title : catalogState.title;
				
				$(terminalEntry + "> .entryTitleBar > .entryMaskContainer > .entrySecret").html(newTitle);
				
				$(terminalEntry + "> .entryTitleBar > .entryMaskContainer > .entryMasking").addClass("invisible");
			}
			else
			{
				$(terminalEntry + "> .entryTitleBar > .entryMaskContainer > .entryMasking").removeClass("invisible");
			}
			
			if(catalogState.contents)
			{
				let newContents = (catalogState.contents === true) ? catalogEntry.contents : catalogState.contents;
				
				$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entrySecret").html(newContents);
				
				$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entryMasking").addClass("invisible");
			}
			else
			{
				$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entryMasking").removeClass("invisible");
			}
			
			if(catalogState.access.enabled)
			{
				let accCost = Math.max(catalogEntry.access - icon.repeated + extraCost,0);
				
				let accS = (accCost === 1) ? "" : "s"
				
				$(terminalEntry + ".accessButton").attr("data-enabled","true");
				$(terminalEntry + ".accessButton").attr("data-cost",accCost);
				$(terminalEntry + ".accessButton").html(accCost + " Tag" + accS);
			}
			else
			{
				$(terminalEntry + ".accessButton").attr("data-enabled","false");
				$(terminalEntry + ".accessButton").html("N/A");
			}
			
			if(catalogState.modify.enabled)
			{				
				let modCost = Math.max(catalogEntry.modify - icon.repeated + extraCost,0)
				
				let modS = (modCost === 1) ? "" : "s"
				
				$(terminalEntry + ".modifyButton").attr("data-enabled","true");
				$(terminalEntry + ".modifyButton").attr("data-cost",modCost);
				$(terminalEntry + ".modifyButton").html(modCost + " Tag" + modS);
			}
			else
			{
				$(terminalEntry + ".modifyButton").attr("data-enabled","false");
				$(terminalEntry + ".modifyButton").html("N/A");
			}
			
			catalogEntry["previous"] = catalogEntry.state;
			catalogEntry.state = newState;
			//console.log(catalogEntry);

			if(catalogState.globalState || (state === "previous"))
			{
				$.ajax({
					type: "POST",
					dataType: "json",
					url: "Resources\\Scripts\\Files\\updateTerminalJSON.php",
					data:
					{
						suffixID: this.#suffix,
						path: path,
						newState: catalogEntry.state,
						newPrev: catalogEntry.previous
					}
				});
			}
		}
	}
	
	repeatIcon(path, rank)
	{
		let icon = this.getIcon(path)
		
		if(!icon.repeated)
		{
			$('.entry[id*="' + icon.type + '"]').each(function(index,entry)
			{
				if($('[id="'+entry.id+'"]').hasClass("ice"))
				{
					let newBrkCost = Math.max($('[id="'+entry.id+'"] .breakButton').attr("data-cost")-rank,0);
					
					let brkS = (newBrkCost === 1) ? "" : "s";
					
					$('[id="'+entry.id+'"] .breakButton').attr("data-cost",newBrkCost);
					$('[id="'+entry.id+'"] .breakButton').text(newBrkCost + " Tag" + brkS);
				}
				else
				{
					let newAccCost = Math.max($('[id="'+entry.id+'"] .accessButton').attr("data-cost")-rank,0);
					let newModCost = Math.max($('[id="'+entry.id+'"] .modifyButton').attr("data-cost")-rank,0);
					
					let accS = (newAccCost === 1) ? "" : "s"
					let modS = (newModCost === 1) ? "" : "s"

					$('[id="'+entry.id+'"] .accessButton').attr("data-cost",newAccCost);
					$('[id="'+entry.id+'"] .modifyButton').attr("data-cost",newModCost);
					
					$('[id="'+entry.id+'"] .accessButton[data-enabled="true"]').text(newAccCost + " Tag" + accS);
					$('[id="'+entry.id+'"] .modifyButton[data-enabled="true"]').text(newModCost + " Tag" + modS);
				}
			});
			
			icon.repeated = rank;
		}
	}

	copyIcon(path)
	{
		let icon = this.getIcon(path);

		if(!icon.copied)
		{
			icon.copied = true;
		}
	}

	touchAccess(rank)
	{
		if(!this.#termData.johnnyAccess)
		{
			this.#termData.data.forEach(function(icon)
			{
				$('.entry[id*="' + icon.type + '"]').each(function(index,entry)
				{
					let newAccCost = Math.max($('[id="'+entry.id+'"] .accessButton').attr("data-cost")-rank,0);
					let accS = (newAccCost === 1) ? "" : "s"

					$('[id="'+entry.id+'"] .accessButton').attr("data-cost",newAccCost);
					$('[id="'+entry.id+'"] .accessButton[data-enabled="true"]').text(newAccCost + " Tag" + accS);
				});
			}, this);

			this.#termData.johnnyAccess = rank;
		}
	}

	modifyCost(change)
	{
		$('.logEntry').each(function(index,logEntry)
		{
			let newReassCost = Math.max(Number($('[id="'+logEntry.id+'"] .reassButton').attr("data-cost"))+change,0);
			let newWipeCost = Math.max(Number($('[id="'+logEntry.id+'"] .wipeButton').attr("data-cost"))+change,0);
			
			let reassS = (newReassCost === 1) ? "" : "s"
			let wipeS = (newWipeCost === 1) ? "" : "s"

			$('[id="'+logEntry.id+'"] .reassButton').attr("data-cost",newReassCost);
			$('[id="'+logEntry.id+'"] .wipeButton').attr("data-cost",newWipeCost);
			
			$('[id="'+logEntry.id+'"] .reassButton').text(newReassCost + " Tag" + reassS);
			$('[id="'+logEntry.id+'"] .wipeButton').text(newWipeCost + " Tag" + wipeS);
		});

		$('.entry').each(function(index,entry)
		{
			if($('[id="'+entry.id+'"]').hasClass("ice"))
			{
				let newBrkCost = Math.max(Number($('[id="'+entry.id+'"] .breakButton').attr("data-cost"))+change,0);
				
				let brkS = (newBrkCost === 1) ? "" : "s";
				
				$('[id="'+entry.id+'"] .breakButton').attr("data-cost",newBrkCost);
				$('[id="'+entry.id+'"] .breakButton').text(newBrkCost + " Tag" + brkS);
			}
			else
			{
				let newAccCost = Math.max(Number($('[id="'+entry.id+'"] .accessButton').attr("data-cost"))+change,0);
				let newModCost = Math.max(Number($('[id="'+entry.id+'"] .modifyButton').attr("data-cost"))+change,0);
				
				let accS = (newAccCost === 1) ? "" : "s"
				let modS = (newModCost === 1) ? "" : "s"

				$('[id="'+entry.id+'"] .accessButton').attr("data-cost",newAccCost);
				$('[id="'+entry.id+'"] .modifyButton').attr("data-cost",newModCost);
				
				$('[id="'+entry.id+'"] .accessButton[data-enabled="true"]').text(newAccCost + " Tag" + accS);
				$('[id="'+entry.id+'"] .modifyButton[data-enabled="true"]').text(newModCost + " Tag" + modS);
			}
		});

		let newBrickCost = Math.max(Number($("#brickButton").attr("data-cost"))+change,0);
		let newRiggCost = Math.max(Number($("#riggButton").attr("data-cost"))+change,0);
		
		let brickS = (newBrickCost === 1) ? "" : "s"
		let riggS = (newRiggCost === 1) ? "" : "s"

		$("#brickButton").attr("data-cost",newBrickCost);
		$("#riggButton").attr("data-cost",newRiggCost);
		
		$("#brickButton").text(newBrickCost + " Tag" + brickS);
		$("#riggButton").text(newRiggCost + " Tag" + riggS);
	}
	
	appendAccessLog(newAccess)
	{
		let $newIndex = this.#accessLog.push(newAccess)-1;

		$.ajax({
			type: "POST",
			dataType: "json",
			url: "Resources\\Scripts\\Files\\updateAccessLog.php",
			data:
			{
				suffixID: this.#suffix,
				newLog: JSON.stringify(this.#accessLog)
			}
		});

		return $newIndex;
	}

	updateAccessLog(index,type,newReass)
	{
		if(type === "wipe")
		{
			this.#accessLog[index].state = "wiped";
		}
		else if (type === "reassign")
		{
			this.#accessLog[index].reassignee = newReass;
		}

		$.ajax({
			type: "POST",
			dataType: "json",
			url: "Resources\\Scripts\\Files\\updateAccessLog.php",
			data:
			{
				suffixID: this.#suffix,
				newLog: JSON.stringify(this.#accessLog)
			}
		});
	}
	
	#buildEntry(iconType, index, entry, parentEntry=false)
	{
		let path = iconType + ">" + index;
		let displayIndex = index;
		
		if(parentEntry)
		{
			path = parentEntry.path + ">" + index;
			displayIndex = parentEntry.index + String.fromCharCode(index + 65);
		}
		
		if(entry.special)
		{
			if(entry.special == "trap")
			{
				entry["path"] = path;
				entry["displayName"] = this.#iconCatalog[iconType].unit + " " + displayIndex;
				entry["title"] = "Trap!"
				entry["contents"] = entry.effects.join("<br/>");
				entry["state"] = "initial";
			}
			else if(entry.special == "ice")
			{
				entry["path"] = path;
				entry["displayName"] = "ICE " + " " + displayIndex;
				entry["contents"] = entry.effects.join("<br/>");
				entry["state"] = "closed";
				
				entry.subEntries.forEach((subEntry,subIndex) => this.#buildEntry(iconType,subIndex,subEntry,{path:path,index:index}));
			}
		}
		else
		{
			entry["path"] = path;
			entry["displayName"] = this.#iconCatalog[iconType].unit + " " + displayIndex;

			entry["state"] = entry["state"] ? entry["state"] : "initial";
			entry["previous"] = entry["previous"] ? entry["previous"] : null;
			
			entry["access"] = this.#iconCatalog[iconType].states[entry["state"]].access.enabled ? entry.access : false;
			entry["modify"] = this.#iconCatalog[iconType].states[entry["state"]].modify.enabled ? entry.modify : false;
		}
	}
	
	#buildDataEntries()
	{
		this.#termData.johnnyAccess = 0;

		this.#termData.data.forEach(function(icon)
		{
			icon["repeated"] = 0;
			icon["copied"] = false;
			
			if(Object.keys(this.#iconCatalog).includes(icon.type))
			{
				icon.entries.forEach((entry,index) => this.#buildEntry(icon.type,index,entry));
			}
			else
			{
				throw new Error("Terminal.json data icon type \"" + icon.type + "\" not found in Icon Schema. Expecting one of: [" + Object.keys(iconCatalog).join(", ") + "]");
			}
		}, this);
		
		//console.log(this.#termData.data);
	}
	
	#writeTerminal()
	{
		let subTabs = {};
		subTabs["enabled"] = "";
		subTabs["disabled"] = "";
		
		subTabs["enabled"] += 	'<button class="subTab active" onclick="openSubTab(event,\'logContent\')">' +
									'<img src="resources/images/subtabs/log.png" onerror="this.onerror=null;this.src=\'https://placehold.co/30\'"/>' +
								'</button> ';
		
		let allContent = 	'<div id="logContent" class="subContent active">' +
								'<div class="subContTitleRow">' +
									'<span class="subContTitle">ACCESS LOG</span>' +
								'</div>' +
								'<div class="subContBody">' +
									'<ul id="logList">';
		
		this.#accessLog.forEach(function(logEntry,index)
		{
			let logHandle = ((logEntry.reassignee !== null) ? logEntry.reassignee :
							((logEntry.mask !== null) ? logEntry.mask : logEntry.handle));
			
			if(logEntry.state !== "wiped")
			{
				allContent += 	'<li id="log' + index + '" class="logEntry">' +
									'<span class="logPerson">User:&nbsp;</span><span class="logName">' + logHandle + '</span>' +
									'<div class="logActions hidden">' +
										'<hr/>' +
										'<span class="hidden">REASSIGN: <button class="reassButton" data-enabled="true" data-cost="2" onclick="logAction('+index+',\'reassign\')">2 Tags</button></span>' +
										'<span class="hidden">WIPE TRACKS: <button class="wipeButton" data-enabled="true" data-cost="1" onclick="logAction('+index+',\'wipe\')">1 Tag</button></span>' +
									'</div>' +
								'</li>';
			}
			else
			{
				allContent += 	'<li id="log' + index + '" class="logEntry">' +
									'ERROR: LOG ENTRY NOT FOUND' +
								'</li>';
			}
		});
		
		allContent += 	'</ul>' +
					'</div>' +
				'</div>';
		
		this.#termData.data.forEach(function(icon)
		{
			function writeEntry(entry, scheme, subClass="")
			{
				let accS = (entry.access===1) ? "" : "s";
				let modS = (entry.modify===1) ? "" : "s";
				let brkS = (entry.break===1) ? "" : "s";
				
				let entryString = 	'<div id="' + entry.path + '" class="entry ' + subClass + '">' +
										'<div class="entryTitleBar">';
										
				if (entry.special == "ice")
				{
					entryString += 			'<span class="entryPrefix">>> ' + entry.displayName + ':\\</span>' +
											'<span>&nbsp;' + entry.title + '</span>' +
										'</div>' +
										'<div class="entryContentsBar">' + 
											'<span class="entryMaskContainer">' +
												'<span class="entryMasking"></span>' +
												'<span class="entrySecret">' + entry.contents + '</span>' +
											'</span>' +
										'</div>' +
										'<div class="entryIntContainer">' +
											'<div class="entryInterface">' +
												'Unwrap:<button class="unwrapButton" data-enabled="true" data-cost="0" onclick="termAction(\'' + entry.path + '\',\'unwrap\')">Free!</button>' +
											'</div>' +
											'<div class="entryInterface">' +
												'Break:<button class="breakButton" data-enabled="true" data-cost="' + entry.break + '" onclick="termAction(\'' + entry.path + '\',\'break\')">' + entry.break +' Tag' + brkS + '</button>' +
											'</div>' +
										'</div>';
				}
				else
				{
					let titleMask;
					if(scheme.states[entry.state].title === true)
					{
						titleMask = 		'<span class="entryMaskContainer">' +
												'<span class="entrySecret">' + entry.title + '</span>' +
											'</span>';
					}
					else if(scheme.states[entry.state].title === false)
					{
						titleMask = 		'<span class="entryMaskContainer">' +
												'<span class="entryMasking"></span>' +
												'<span class="entrySecret">' + entry.title + '</span>' +
											'</span>';
					}
					else
					{
						titleMask = 		'<span class="entryMaskContainer">' +
												'<span class="entrySecret">' + scheme.states[entry.state].title + '</span>' +
											'</span>';
					}

					let contentMask;
					if(scheme.states[entry.state].contents === true)
					{
						contentMask = 		'<span class="entryMaskContainer">' +
												'<span class="entrySecret">' + entry.contents + '</span>' +
											'</span>';
					}
					else if(scheme.states[entry.state].contents === false)
					{
						contentMask = 		'<span class="entryMaskContainer">' +
												'<span class="entryMasking"></span>' +
												'<span class="entrySecret">' + entry.contents + '</span>' +
											'</span>';
					}
					else
					{
						contentMask = 		'<span class="entryMaskContainer">' +
												'<span class="entrySecret">' + scheme.states[entry.state].contents + '</span>' +
											'</span>';
					}
					
					let aVisible = (entry.access !== false) ? {
							disAttr: 'data-enabled="true" data-cost="' + entry.access + '"',
							buttonText: entry.access + " Tag" + accS
						} : {
							disAttr: 'data-enabled="false" disabled',
							buttonText: "N/A"
						};
					let mVisible = (entry.modify !== false) ? {
							disAttr: 'data-enabled="true" data-cost="' + entry.modify + '"',
							buttonText: entry.modify + " Tag" + modS
						} : {
							disAttr: 'data-enabled="false" disabled',
							buttonText: "N/A"
						};
					
					entryString += 			'<span class="entryPrefix">>> ' + entry.displayName + ':\\</span>' +
											titleMask +
										'</div>' +
										'<div class="entryContentsBar">' +
											contentMask +
										'</div>' +
										'<div class="entryIntContainer">' +
											'<div class="entryInterface">' +
												'Access:<button class="accessButton" ' + aVisible.disAttr + ' onclick="termAction(\'' + entry.path + '\',\'access\')">' + aVisible.buttonText + '</button>' +
											'</div>' +
											'<div class="entryInterface">' +
												'Modify:<button class="modifyButton" ' + mVisible.disAttr + ' onclick="termAction(\'' + entry.path + '\',\'modify\')">' + mVisible.buttonText + '</button>' +
											'</div>' +
										'</div>';
				}
										
				if(entry.special == "ice")
				{
					entryString += '<hr/>';
					
					entry.subEntries.forEach(function(subEntry)
					{
						entryString += writeEntry(subEntry,scheme,"subIce");
					});
				}
				
				return 	entryString +
					'</div>';
			}
			
			let subTabID = ' ';
			
			if(icon.type == "darkweb")
			{
				subTabID = ' id="dwSubTab" ';
			}
			
			if(icon.entries.length)
			{
				let iconScheme = this.#iconCatalog[icon.type];

				subTabs["enabled"] += 	'<button' + subTabID + 'class="subTab inactive" onclick="openSubTab(event,\'' + icon.type + 'Content\')">' +
											'<img src="resources/images/subtabs/' + icon.type + '.png" onerror="this.onerror=null;this.src=\'https://placehold.co/30\'"/>' +
										'</button> ';
				
				allContent += 	'<div id="'+ icon.type + 'Content" class="subContent">' +
									'<div class="subContTitleRow">' +
										'<span class="subContRepeat red hidden">REPEAT</span>' +
										'<span class="subContJohnny red hidden">TOUCHED</span>' +
										'<span class="subContTitle">' + iconScheme.title + '</span>' +
									'</div>' +
									'<div class="subContBody">';

				let entryArray = [];
				
				icon.entries.forEach(function(entry,index)
				{
					if (entry.special != "ice")
					{
						entryArray[index] = writeEntry(entry,iconScheme);
					}
					else
					{
						entryArray[index] = writeEntry(entry,iconScheme,"ice");
					}
				},this);
				
				allContent += entryArray.join("<hr/>");
				
				allContent += '</div></div>';
			}
			else
			{
				subTabs["disabled"] += '<button class="subTab disabled"><img src="resources/images/subtabs/' + icon.type + '.png" onerror="this.onerror=null;this.src=\'https://placehold.co/30\'"/></button> ';
			}
		},this);
		
		this.#subTabsString = subTabs["enabled"] + subTabs["disabled"];
		this.#termContentString = allContent;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Payload
{
	// TEST VALUES //
	/*#payload = '{ "handle"  : "Test",' + //Access Log
			   '  "priRole" : "Dissimulator",' +
			   '  "secRole" : "Slipstream",' +
			   '  "hack"    : "3",' +  //Passive
			   '  "mask"    : "true",' + //Access Log + Profile
			   '  "wyt"     : "true",' + //Access Log + Active
			   '  "reass"   : "true",' + //Access Log + Active
			   '  "bd"      : "true",' + //Passive
			   '  "ibd"     : "true",' + //Passive
			   '  "rex"     : "true",' + //Passive
			   '  "repeat"  : "2",' + //Passive
			   '  "brick"   : "true",' + //Active
			   '  "rigg"    : "true",' + //Active
			   '  "root"    : "true",' + //Active
			   '  "dwa"     : "true" }; //Passive */
			   
	#payload;
	#itemCatalog;
	
	#payloadHash = 0;
	#currTags = 0;

	#modifiers = {
		hack: 0,
		extra: 0,
		time: 0,
		cost: 0
	}

	#cyberdeckString = "";
				  
	constructor(itemCatalog)
	{
		this.#itemCatalog = itemCatalog;

		if(Cookies.get("payload"))
		{
			this.#initPayload();
		}
		this.#writeCyberdeck();
	}

	#initPayload()
	{
		let cookie = JSON.parse(Cookies.get("payload"));
		let sim_cookie = JSON.parse(Cookies.get("payload_sim"));
		
		this.#payload = cookie;
		this.#payloadHash = cookie.hash;
			
		this.#currTags = this.getInitialTags()["total"];
	}
	
	checkForCookie()
	{
		if(Cookies.get("payload"))
		{
			let cookie = JSON.parse(Cookies.get("payload"));
			
			if(cookie.hash != this.#payloadHash)
			{
				this.#initPayload();
				
				this.#writeCyberdeck();
				
				return true;
			}
		}

		return false;
	}
	
	hasPayload()
	{
		return (this.#payload != null);
	}

	getPayload()
	{
		return this.#payload;
	}
	
	getPayloadFunction(func)
	{
		return this.#payload[func];
	}
	
	getInitialTags()
	{
		let initTags = {};
		initTags["hack"] = Math.min((this.#payload.hack*2) + this.#modifiers["hack"],10);
		initTags["rex"] = (this.#payload.rex ? 2 : 0);
		initTags["total"] = initTags["hack"] + initTags["rex"];
		
		return initTags;
	}

	getModifier(type=null)
	{
		if(type)
		{
			return this.#modifiers[type];
		}
		else
		{
			return this.#modifiers;
		}
	}

	setModifier(type, change)
	{
		if(type === "all")
		{
			this.#modifiers = change;
		}
		else
		{
			this.#modifiers[type] += change;
		}
	}
	
	getCurrentTags()
	{
		return this.#currTags;
	}
	
	setCurrentTags(newTags)
	{
		this.#currTags = newTags;
	}
	
	getTimerSecs()
	{
		if(this.hasPayload())
		{
			if(this.#payload.ibd)
			{
				return Math.max(10,(10 + this.#modifiers["time"]));
			}
			else if(this.#payload.bd)
			{
				return Math.max(10,(20 + this.#modifiers["time"]));
			}
			else
			{
				return Math.max(10,(30 + this.#modifiers["time"]));
			}
		}
		else
		{
			return Math.max(10,(30 + this.#modifiers["time"]));
		}
	}
	
	getHandle()
	{		
		let handle = {};
		handle["masked"] = this.#payload.mask;
		handle["handle"] = this.#payload.handle;
		handle["mask"] = this.#payload.maskHandle
		
		return handle;
	}
	
	getCyberdeckString()
	{
		return this.#cyberdeckString;
	}

	rewriteItemMarks(cataItem)
	{
		let maxCharges = this.#itemCatalog.find(item => item.id === cataItem).deck_charges;
		let usedCharges = JSON.parse(Cookies.get("payload_sim")).find(item => item.id === cataItem).used;

		let itemString = ""

		for(let i = maxCharges; i > usedCharges; i--)
		{
			itemString += '<img src="Resources/Images/Actions/itemOpen.png"/>';
		}

		for(let i = usedCharges; i > 0; i--)
		{
			itemString += '<img src="Resources/Images/Actions/itemFilled.png"/>';
		}

		$("#" + cataItem + "_marks").html(itemString);

		if(usedCharges >= maxCharges)
		{
			$("#" + cataItem + "_button").attr("data-enabled","false");
			$("#" + cataItem + "_button").attr("disabled",true);
		}
	}

	#writeItemButtonEntry(cataItem)
	{
		let itemString = 	'<li>' +
								'<div class="buttonLI">' +
									'<div class="itemName">' + cataItem.displayName + '</div>' +
									'<div class="itemInterface">' +
										'<span id="'+ cataItem.id +'_marks" class="itemMarks">';

		let payItem = JSON.parse(Cookies.get("payload_sim")).find(item => item.id === cataItem.id);
						
		for(let i = cataItem.deck_charges; i > payItem.used; i--)
		{
			itemString += 					'<img src="Resources/Images/Actions/itemOpen.png"/>';
		}

		for(let i = payItem.used; i > 0; i--)
		{
			itemString += 					'<img src="Resources/Images/Actions/itemFilled.png"/>';
		}

		itemString += 					'</span>' +
										'<button id="'+ cataItem.id +'_button" data-cost="0" data-enabled="' + ( cataItem.deck_charges > payItem.used ? 'true' : 'false' ) + '" onclick="deckAction(\''+cataItem.id+'\','+cataItem.deck_charges+')">+1 TAG</button>' +
									'</div>' +
								'</div>' +
							'</li>';

		return itemString;
	}
	
	#writeCyberdeck()
	{
		//ACTIVE
		//PASSIVE
		//ITEMS
		
		let contents = {};
		
		//ACTIVE
		
		let contentString = '<div id="actContent" class="subContent active">' +
								'<div class="subContTitleRow">' +
									'<span class="subContTitle">ACTIVE FUNCTIONS</span>' +
								'</div>' +
								'<div class="subContBody">' +
									'<ul id="actList">';
									
		let activeCount = 0;
		
		if(this.hasPayload())
		{
			if(this.#payload.brick)
			{
				contentString += 	'<li>' +
										'<div>' +
											'<span>BRICK:</span>' +
											'<button id="brickButton" data-enabled="true" data-cost="4" onclick="payAction(\'brick\')">4 Tags</span>' +
										'</div>' +
									'</li>'
				activeCount++;
			}
			
			if(this.#payload.rigg)
			{
				contentString += 	'<li>' +
										'<div>' +
											'<span>RIGGED:</span>' +
											'<button id="riggButton" data-enabled="true" data-cost="6" onclick="payAction(\'rig\')">6 Tags</span>' +
										'</div>' +
									'</li>'
				activeCount++;
			}
			
			if(this.#payload.root)
			{
				contentString += 	'<li>' +
										'<div>' +
											'<span>ROOT DEVICE:</span>' +
											'<button id="rootButton" data-enabled="true" data-cost="6" onclick="payAction(\'root\')">6 Tags</span>' +
										'</div>' +
									'</li>'
				activeCount++;
			}
			
			if(this.#payload.reass)
			{
				contentString += 	'<li>' +
										'<div>' +
											'<span>REASSIGN:</span><br/>' +
											'<span>&nbsp;--&nbsp;CHECK ACCESS LOG</span>' +
										'</div>' +
									'</li>'
				activeCount++;
			}
			
			if(this.#payload.wyt)
			{
				contentString += 	'<li>' +
										'<div>' +
											'<span>WIPE YOUR TRACKS:</span><br/>' +
											'<span>&nbsp;--&nbsp;CHECK ACCESS LOG</span>' +
										'</div>' +
									'</li>'
				activeCount++;
			}
		}
		
		if(activeCount == 0)
		{
			contentString += 	'<li>' +
									'<span>NO ACTIVE FUNCTIONS IN PAYLOAD</span>' +
								'</li>'
		}
								
								
		contentString +=			'</ul>' +
								'</div>' +
							'</div>';			
		
		contents["active"] = contentString;
		
		//PASSIVE
		
		contentString = '<div id="passContent" class="subContent">' +
							'<div class="subContTitleRow">' +
									'<span class="subContTitle">PASSIVE FUNCTIONS</span>' +
								'</div>' +
							'<div class="subContBody">' +
								'<ul>';
		
		let passiveCount = 0;
		
		if(this.hasPayload())
		{
			if(this.#payload.ibd)
			{
				contentString += '<li>IMPROVED BACKDOOR</li>'
				passiveCount++;
			}
			else if(this.#payload.bd)
			{
				contentString += '<li>BACKDOOR</li>'
				passiveCount++;
			}
			
			if(this.#payload.repeat > 0)
			{
				contentString += '<li>REPEAT ' + this.#payload.repeat + '</li>'
				passiveCount++;
			}
			
			if(this.#payload.dwa)
			{
				contentString += '<li>DARK WEB ACCESS</li>'
				passiveCount++;
			}
		}
		
		if(passiveCount == 0)
		{
			contentString += 	'<li>' +
									'<span>NO PASSIVE FUNCTIONS IN PAYLOAD</span>' +
								'</li>'
		}
								
		contentString +=		'</ul>' +
							'</div>' +
						'</div>'
		
		contents["passive"] = contentString;
		
		//ITEMS
		
		contentString = '<div id="itemContent" class="subContent">' +
							'<div class="subContTitleRow">' +
									'<span class="subContTitle">ITEM ACTIVATIONS</span>' +
								'</div>' +
							'<div class="subContBody">';

		if(this.hasPayload())
		{
			// DECKS
			// ARMS
			// CUST
			// UTIL

			// DECKS
			let payDecks = this.#payload.items.filter(function(item)
			{
				return item.startsWith("deck");
			});

			if(payDecks.length > 0)
			{
				contentString += 	'<div class="itemTitle">CYBERDECKS</div>' +
									'<ul>';
				
				payDecks.forEach(function(payItem,index)
				{
					let cataItem = this.#itemCatalog.find(item => item.id === payItem);

					if(cataItem.deck_charges)
					{
						contentString += this.#writeItemButtonEntry(cataItem);
					}
					else
					{
						contentString += 	'<li>' + cataItem.displayName + '</li>';
					}
				},this);

				contentString +=	'</ul><br/>';
			}

			// ARMS
			let payArms = this.#payload.items.filter(function(item)
			{
				return item.startsWith("arms");
			});

			if(payArms.length > 0)
			{
				contentString += 	'<div class="itemTitle">WEAPONS/ARMOR</div>' +
									'<ul>';
				
				payArms.forEach(function(payItem,index)
				{
					let cataItem = this.#itemCatalog.find(item => item.id === payItem);

					if(cataItem.deck_charges)
					{
						contentString += this.#writeItemButtonEntry(cataItem);
					}
					else
					{
						contentString += 	'<li>' + cataItem.displayName + '</li>';
					}
				},this);

				contentString +=	'</ul><br/>';
			}

			// CUST
			let payCust = this.#payload.items.filter(function(item)
			{
				return item.startsWith("cust");
			});

			if(payCust.length > 0)
			{
				contentString += 	'<div class="itemTitle">CUSTOMIZATIONS</div>' +
									'<ul>';
				
				payCust.forEach(function(payItem,index)
				{
					let cataItem = this.#itemCatalog.find(item => item.id === payItem);

					if(cataItem.deck_charges)
					{
						contentString += this.#writeItemButtonEntry(cataItem);
					}
					else
					{
						contentString += 	'<li>' + cataItem.displayName + '</li>';
					}
				},this);

				contentString +=	'</ul><br/>';
			}

			// UTIL
			let payUtil = this.#payload.items.filter(function(item)
			{
				return item.startsWith("util");
			});

			if(payUtil.length > 0)
			{
				contentString += 	'<div class="itemTitle">UTILITY</div>' +
									'<ul>';
				
				payUtil.forEach(function(payItem,index)
				{
					let cataItem = this.#itemCatalog.find(item => item.id === payItem);

					if(cataItem.deck_charges)
					{
						contentString += this.#writeItemButtonEntry(cataItem);
					}
					else
					{
						contentString += 	'<li>' + cataItem.displayName + '</li>';
					}
				},this);

				contentString +=	'</ul><br/>';
			}
		}

		contentString +=	'</div>' +
						'</div>';
		
		contents["items"] = contentString;
		
		this.#cyberdeckString = contents["active"] + contents["passive"] + contents["items"];
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var timer = 100;
var timerBlink;
var pause = false;
var terminal;
var payload;

function tens(numStr)
{
	var tensFormat = new Intl.NumberFormat('en-US', { 
		minimumIntegerDigits: 2
	});
	
	return tensFormat.format(Number(numStr));
}

$(document).ready(function()
{
	$("input[type='checkbox']").prop("checked",false);

	$.ajaxSetup({ cache: false });

	let images = [
		"..\\Images\\Actions\\itemFilled.png",
		"..\\Images\\Actions\\itemOpen.png",
		"..\\Images\\Actions\\itemRigged.png",
		"..\\Images\\Borders\\Bracket_Border_Ice.png",
		"..\\Images\\Borders\\Bracket_Border.png",
		"..\\Images\\Borders\\Thin_Border.png",
		"..\\Images\\PlayPause\\Pause_Root.png",
		"..\\Images\\PlayPause\\Pause.png",
		"..\\Images\\PlayPause\\Play_Root.png",
		"..\\Images\\PlayPause\\Play_Root.png",
		"..\\Images\\SubTabs\\Active.png",
		"..\\Images\\SubTabs\\cameras.png",
		"..\\Images\\SubTabs\\darkweb.png",
		"..\\Images\\SubTabs\\defenses.png",
		"..\\Images\\SubTabs\\files.png",
		"..\\Images\\SubTabs\\Items.png",
		"..\\Images\\SubTabs\\locks.png",
		"..\\Images\\SubTabs\\log.png",
		"..\\Images\\SubTabs\\Passive.png",
		"..\\Images\\SubTabs\\puzzles.png",
		"..\\Images\\SubTabs\\utilties.png"
	]

	preloadImages(images);

	let suffix = new URLSearchParams(window.location.search);
	
	let iconJSON = $.getJSON("Resources\\Schemas\\icons.json");
	let termJSON = $.getJSON("Data\\"+suffix.get("id")+"\\terminal.json");
	let accessLog = $.getJSON("Resources\\Scripts\\Files\\checkLogs.php",{ suffixID: suffix.get("id") });
	let itemJSON = $.getJSON("Resources\\Schemas\\items.json");

	$.when(termJSON, iconJSON, accessLog, itemJSON).done(function()
	{
		terminal = new Terminal(suffix.get("id"), iconJSON.responseJSON, termJSON.responseJSON, accessLog.responseJSON);
		payload = new Payload(itemJSON.responseJSON);

		setupAccessPage();
		setupTerminalPage();
	});
});

$(window).on("focus",function()
{
	if(payload && ($("#accessZone").css("display") != "none"))
	{
		if(payload.checkForCookie())
		{
			rewriteAccessPage();
		}
	}
});

function preloadImages(sources)
{
	if(!preloadImages.cache)
	{
		preloadImages.cache = [];
	}

	let img;

	for (let i = 0; i < sources.length; i++)
	{
		img = new Image();
		img.src = sources[i];
		preloadImages.cache.push(img);
	}
}

function autoSave({ handle=null,rigged=false })
{
	let saveData;

	if(!handle)
	{
		saveData = JSON.parse(Cookies.get(terminal.getTerminalID()));
	}
	else
	{
		saveData = { handle:handle };
	}

	saveData["tags"] = payload.getCurrentTags();
	saveData["rigged"] = rigged;
	saveData["saveState"] = terminal.getTermState();
	saveData["modifiers"] = payload.getModifier();

	var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
	Cookies.set(terminal.getTerminalID(),JSON.stringify(saveData),{expires: inFifteenMinutes,path: "",sameSite: "Strict"});
}

function startTimer(context,seconds,callback=null)
{
	$("#playPause").prop("disabled",false);
	
	var baseDate = Date.now();
	var elapse = 0;
	
	timer = setInterval(function() {		
		let newDate = Date.now();
		let dateDiff = (newDate - baseDate)/1000;
		
		baseDate = newDate;
		
		if(!pause)
		{
			elapse += dateDiff;
			
			if(elapse > seconds)
			{
				clearInterval(timer);
				timer = null;
				
				$("#playPause").prop("disabled",true);
				
				return endTimer(context,callback);
			}
			
			readTime = Math.max(seconds-elapse,0);
			
			let min = tens(parseInt(readTime/60));
			let sec = tens(parseInt(readTime%60));
			let hundsec = tens(parseInt((readTime*100)%100));
			
			let colon = " ";
			
			if (sec % 2 == 0) //hundsec < 50
			{
				colon = ":";
			}
			
			let mmss = min + colon + sec;
			
			$("#mmss > .FG").html(mmss);
			$("#hundsec > .FG").html(hundsec);
		}
	}, 10);
}

function endTimer(context,callback)
{
	if(context == "CRACK")
	{
		$("#status").html(">> ACCESS GRANTED");
		
		$("#mmss > .FG").html("00:00");
		$("#hundsec > .FG").html("00");
		
		timerBlink = setInterval(function() {
			if ($("#mmss > .FG").html() == "00:00")
			{
				$("#mmss > .FG").html("!!:!!");
				$("#hundsec > .FG").html("!!");
			}
			else
			{
				$("#mmss > .FG").html("00:00");
				$("#hundsec > .FG").html("00");
			}
		},1000);
		
		if(payload.hasPayload())
		{
			let newReq = terminal.getReqAccess() + payload.getModifier("cost");

			if((payload.getCurrentTags()-newReq) >= 0)
			{
				$("#terminalButton").prop("disabled",false);
				$("#terminalButton").html("Access Terminal");
				$("#terminalButton").css("background-color","");
				$("#terminalButton").css("border-color","");
				$("#terminalButton").css("filter","");
			}
			else
			{
				$("#terminalButton").html("Not Enough Tags To Access Terminal");
				$("#terminalButton").css("background-color","red");
				$("#terminalButton").css("border-color","red");
				$("#terminalButton").css("filter","brightness(75%)");
			}
		}
		else
		{
			$("#terminalButton").html("Please Set Up Payload Profile First");
			$("#terminalButton").css("background-color","red");
			$("#terminalButton").css("border-color","red");
			$("#terminalButton").css("filter","brightness(75%)");
			$("#terminalButton").css("box-shadow","0 0 0px");
		}
	}
	else if(context == "EXECUTE")
	{
		callback();
		
		$("#status").html(">> AWAITING COMMAND");
		
		updateTagDisplay("STANDBY",payload.getCurrentTags());
		
		$("#mmss > .FG").html("00:"+tens(payload.getTimerSecs()));
		$("#hundsec > .FG").html("00");	
	}
	else if(context == "ROOT")
	{
		callback();

		$("#status").html(">> ROOTING DEVICE");

		updateTagDisplay("ROOT",10);
	}
}

function pauseTimer(root=false)
{
	let rootSuffix = root ? "_Root" : "";
	
	if(pause === false)
	{
		$("#playPause").html('<img src="Resources\\Images\\PlayPause\\Play' + rootSuffix + '.png">');
		
		var mmssText = $("#mmss > .FG").html()
		var hsecText = $("#hundsec > .FG").html()
		
		timerBlink = setInterval(function() {
			if ($("#mmss > .FG").html() != "!!:!!")
			{
				$("#mmss > .FG").html("!!:!!");
				$("#hundsec > .FG").html("!!");
			}
			else
			{
				$("#mmss > .FG").html(mmssText);
				$("#hundsec > .FG").html(hsecText);
			}
		},1000);

		if(root)
		{
			let timeUp = terminal.getTermState().termState;

			pause = new Date(timeUp) - Date.now();
		}
		else
		{
			pause = true;
		}
	}
	else
	{
		$("#playPause").html('<img src="Resources\\Images\\PlayPause\\Pause' + rootSuffix + '.png">');
		
		clearInterval(timerBlink);

		if(root)
		{
			let newTimeUp = new Date(Date.now() + pause);

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "Resources\\Scripts\\Files\\updateTerminalJSON.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					path: "state",
					newState: newTimeUp
				}
			});

			terminal.setTerminalState(newTimeUp);
		}

		pause = false;
	}
}

function setupAccessPage()
{
	$("#termName").html(terminal.getTerminalName());

	$("#reqTags").html(tens(terminal.getReqAccess()));
	
	if(payload.hasPayload())
	{
		rewriteAccessPage();
	}
	else
	{
		$("#terminalButton").html("Please Set Up Payload Profile First");
		$("#terminalButton").css("background-color","red");
		$("#terminalButton").css("border-color","red");
		$("#terminalButton").css("filter","brightness(75%)");
		$("#terminalButton").css("box-shadow","0 0 0px");
	}
}

function rewriteAccessPage()
{
	let payloadHandle = payload.getHandle();
	
	if(payloadHandle.masked)
	{
		let payMask = (payloadHandle.mask == "") ? "Anonymous" : payloadHandle.mask;
		
		$("#payloadHeader").html("PROFILE LOADED:<br/>HANDLE: " + payloadHandle.handle + "<br/>MASK: " + payMask);
	}
	else
	{
		$("#payloadHeader").html("PROFILE LOADED: " + payloadHandle.handle);
	}
	
	$("#payloadButton").text("EDIT PAYLOAD PROFILE");

	if(payload.getPayloadFunction("items").includes("util_ciphersyncbeacon"))
	{
		payload.setModifier("hack",2);
	}

	if(payload.getPayloadFunction("items").includes("util_powerglove_uh9k"))
	{
		payload.setModifier("time",-5);
	}
	
	let payTags = payload.getInitialTags();
	
	$("#payTags").html(tens(payTags.total));
	$("#hackDetails").html("[HACKING: +" + tens(payTags.hack) + "]");
	
	if(payTags.rex)
	{
		$("#rexDetails").show();
	}

	let newReq = terminal.getReqAccess() + payload.getModifier("cost");

	$("#reqTags").html(tens(newReq));
	
	$("#remTags").html(tens(Math.max(payTags.total - newReq,0)));
	
	updateTagDisplay("CRACK",newReq,payTags.total);
	payload.setCurrentTags(payTags.total);
	
	if((payload.getPayloadFunction("priRole") === "dissimulator") || (payload.getPayloadFunction("secRole") === "dissimulator"))
	{
		$("#disItem").removeClass("hidden");
	}

	if((payload.getPayloadFunction("items").includes("arms_cmmwidow")) || (payload.getPayloadFunction("items").includes("arms_cmmcocoon")))
	{
		$("#cmmItem").removeClass("hidden");
	}

	if((payload.getPayloadFunction("items").includes("util_shimmerstick_t0")) || (payload.getPayloadFunction("items").includes("util_shimmerstick_t1")))
	{
		$("#shmItem").removeClass("hidden");
	}
	
	if((payload.getCurrentTags()-newReq) >= 0)
	{
		if(timer == null)
		{
			$("#terminalButton").prop("disabled",false);
			$("#terminalButton").html("Access Terminal");
			$("#terminalButton").css("background-color","");
			$("#terminalButton").css("border-color","");
			$("#terminalButton").css("filter","");
		}
		else
		{
			$("#terminalButton").prop("disabled",true);
			$("#terminalButton").html("Standby...");
			$("#terminalButton").css("background-color","");
			$("#terminalButton").css("border-color","");
			$("#terminalButton").css("filter","");
		}
	}
	else
	{
		$("#terminalButton").html("Not Enough Tags To Access Terminal");
		$("#terminalButton").css("background-color","red");
		$("#terminalButton").css("border-color","red");
		$("#terminalButton").css("filter","brightness(75%)");
	}
}

function setupTerminalPage()
{
	let termState = terminal.getTermState().termState;

	if(new Date(termState) != "Invalid Date") // Rooting
	{
		rootingTerminal(new Date(termState));
		$("#status").html(">> ROOTING DEVICE");
		updateTagDisplay("ROOT",10);
	}
	else if(Array.isArray(termState)) // Bricked
	{
		brickTerminal(termState);
	}
	// Rigged is personal
	else if(termState === "rooted")
	{
		rootTerminal();
	}
	else
	{
		$("#termSubTabs").html(terminal.getSubTabString());
		$("#termContentContainer").html(terminal.getTerminalString());

		if(!(Cookies.get(terminal.getTerminalID())))
		{
			$("#load").addClass("hidden");
			startTimer("CRACK",5);
		}
		else
		{
			accessTerminal(JSON.parse(Cookies.get(terminal.getTerminalID())));
			$("#load").addClass("hidden");
		}
	}
}

function rewriteTerminalPage(autosave)
{
	$("#deckContentContainer").html(payload.getCyberdeckString());

	let modifiers = payload.getModifier();

	if(!(autosave))
	{
		let newLogEntry = {};
		newLogEntry["handle"] = payload.getPayloadFunction("handle");
		newLogEntry["mask"] = payload.getPayloadFunction("mask") ?
								((payload.getPayloadFunction("maskHandle") == "") ? "Anonymous" : payload.getPayloadFunction("maskHandle")) :
								null;
		newLogEntry["state"] = "present"
		newLogEntry["reassignee"] = null;
		
		let newIndex = terminal.appendAccessLog(newLogEntry);
		
		let logHandle = ((newLogEntry.reassignee !== null) ? newLogEntry.reassignee :
						((newLogEntry.mask !== null) ? newLogEntry.mask : newLogEntry.handle));
		
		$("#logList").append(	'<li id="log' + newIndex + '" class="logEntry itsYou">' +
									'<span class="logPerson">You:&nbsp;&nbsp;</span><span class="logName">' + logHandle + '</span>' +
									'<div class="logActions hidden">' +
										'<hr/>' +
										'<span class="hidden">REASSIGN: <button class="reassButton" data-enabled="true" data-cost="2" onclick="logAction('+newIndex+',\'reassign\')">2 Tags</button></span>' +
										'<span class="hidden">WIPE TRACKS: <button class="wipeButton" data-enabled="true" data-cost="1" onclick="logAction('+newIndex+',\'wipe\')">1 Tag</button></span>' +
									'</div>' +
								'</li>');

		autoSave({ handle: newLogEntry.handle });
	}
	else
	{
		modifiers = autosave.modifiers;
		payload.setModifier("all",modifiers);

		let logIndex = terminal.getLogIndex(autosave.handle);

		$("#log"+logIndex).addClass("itsYou");
		$("#log"+logIndex+">.logPerson").html("You:&nbsp;&nbsp;");
		
		autosave.saveState.entries.forEach(function(entry)
		{
			if(terminal.getEntry(entry.path).state !== entry.state)
			{
				terminal.setEntryState(entry.path,entry.state,0);
			}
		});

		autosave.saveState.repeats.forEach(function(repeat)
		{
			if(repeat.repeated)
			{
				terminal.repeatIcon(repeat.type,repeat.repeated);
				$("#"+repeat.type+"Content .subContRepeat").removeClass("hidden");
			}

			if(repeat.copied)
			{
				terminal.copyIcon(repeat.type);
			}
		});

		if(autosave.saveState.johnnyAccess)
		{
			terminal.touchAccess(autosave.saveState.johnnyAccess);
			$(".subContJohnny").removeClass("hidden");
		}

		if(autosave.rigged)
		{
			$("#rigged").removeClass("hidden");
			$("#riggButton").attr("data-enabled","false");
		}

		$("button[data-enabled='false']").prop("disabled",true);
	}

								
	if(payload.getPayloadFunction("reass") || payload.getPayloadFunction("wyt"))
	{
		$(".logActions.hidden").removeClass("hidden");
		
		if(payload.getPayloadFunction("reass"))
		{
			$(".logActions > span:first-of-type().hidden").removeClass("hidden");
		}
		
		if(payload.getPayloadFunction("wyt"))
		{
			$(".logActions > span:last-of-type().hidden").removeClass("hidden");
		}
	}
	
	if(!payload.getPayloadFunction("dwa"))
	{
		$("#dwSubTab").addClass("hidden");
	}

	terminal.modifyCost(modifiers.cost);
}

function updateTagDisplay(stage,stageOne,stageTwo=stageOne,totalTags=stageTwo)
{
	/*
		Stages:
			CRACK:
				- 1: Blend <- Tags Required to Access Terminal (non-overwritable)
				- 2: Amber <- Tags added via Hacking
				- 3: Blue  <- Extra Tags added on a case-by-case basis
			STANDBY:
				- 1: Blue  <- All tags
			CONFIRM:
				- 1: Blue  <- All tags
				- 2: Amber <- Tags required/being used for an ability, just to confirm you want to use them
			EXECUTE:
				- 1: Blue  <- All tags
				- 2: Blend <- Tags required/being used for an ability
			ROOT:
				- 1: Root <- All tag slots
	*/
	
	let stageColors = {};
	stageColors["CRACK"] = [
		"gem blend",
		"gem amber",
		"gem blue"
	];
	stageColors["STANDBY"] = [
		"gem blue",
		"gem blue",
		"gem blue"
	];
	stageColors["CONFIRM"] = [
		"gem blue",
		"gem amber",
		"gem amber"
	];
	stageColors["EXECUTE"] = [
		"gem blue",
		"gem blend",
		"gem blend"
	];
	stageColors["ROOT"] = [
		"gem root",
		"gem root",
		"gem root"
	];
	
	let tenOnes = Math.floor((stageOne-1)/10);
	let remOnes = ((stageOne-1) % 10)+1;
	
	let tenTwos = Math.floor((stageTwo-1)/10);
	let remTwos = ((stageTwo-1) % 10)+1;
	
	let tenTotal = Math.floor((totalTags-1)/10);
	let remTotal = ((totalTags-1) % 10)+1;
	
	if (tenTotal > 0)
	{
		$("#gemTens").removeClass("dimmed");
		$("#gemTenTags").html("x"+tens(tenTotal));
	}
	else
	{
		$("#gemTens").addClass("dimmed");
		$("#gemTenTags").html("");
	}
	
	let startTag = 1;
	
	if (tenOnes == tenTotal)
	{
		for (let i = startTag; i <= remOnes; i++)
		{
			$("#gem"+i).removeClass().addClass(stageColors[stage][0]);
		}
		
		startTag = remOnes+1;
	}
	
	if (tenTwos == tenTotal)
	{
		for (let i = startTag; i <= remTwos; i++)
		{
			$("#gem"+i).removeClass().addClass(stageColors[stage][1]);
		}
		
		startTag = remTwos+1;
	}
	
	for (let i = startTag; i <= remTotal; i++)
	{
		$("#gem"+i).removeClass().addClass(stageColors[stage][2]);
	}
	
	for (let i = remTotal+1; i <= 10; i++)
	{
		$("#gem"+i).removeClass().addClass("gem clear");
	}
}

function extraTags(change,type)
{
	let initTags;
	
	if(payload.hasPayload())
	{
		initTags = payload.getInitialTags();
	}
	else
	{
		initTags = 0;
	}

	let newReq = terminal.getReqAccess() + payload.getModifier("cost");

	$("#reqTags").html(tens(newReq));

	let newTags = payload.getCurrentTags();

	if((type === "extra") || (type === "slip"))
	{
		if(type === "slip")
		{
			payload.setModifier("extra",change);
		}

		newTags = Math.min(Math.max((initTags.total + payload.getModifier("extra")),payload.getCurrentTags() + change),(99 + newReq));
		
		$("#extTags").html(tens(newTags-initTags.total));
	}
	else if(type === "hack")
	{
		payload.setModifier("hack",change);
		initTags = payload.getInitialTags();
	
		$("#payTags").html(tens(initTags.total));
		$("#hackDetails").html("[HACKING: +" + tens(initTags.hack) + "]");

		newTags = Math.max((initTags.total + payload.getModifier("extra")),(payload.getCurrentTags() + change));
		//console.log(newTags);
	}

	$("#remTags").html(tens(newTags-newReq));
	
	if(payload.hasPayload())
	{
		if(parseInt($("#remTags").html()) < 0)
		{
			$("#remTagBG").html("~~~");
			if(timer == null)
			{
				$("#terminalButton").html("Not Enough Tags To Access Terminal");
				$("#terminalButton").css("background-color","red");
				$("#terminalButton").css("border-color","red");
				$("#terminalButton").css("filter","brightness(75%)");
				$("#terminalButton").css("box-shadow","0 0 0px");
			}
		}
		else
		{
			$("#remTagBG").html("~~");
			if(timer == null)
			{
				$("#terminalButton").prop("disabled",false);
				$("#terminalButton").html("Access Terminal");
				$("#terminalButton").css("background-color","");
				$("#terminalButton").css("border-color","");
				$("#terminalButton").css("filter","");
			}
		}
	}
	else
	{
		$("#terminalButton").html("Please Set Up Payload Profile First");
		$("#terminalButton").css("background-color","red");
		$("#terminalButton").css("border-color","red");
		$("#terminalButton").css("filter","brightness(75%)");
		$("#terminalButton").css("box-shadow","0 0 0px");
		
		if(parseInt($("#remTags").html()) < 0)
		{
			$("#remTagBG").html("~~~");
		}
		else
		{
			$("#remTagBG").html("~~");
		}
	}
	
	updateTagDisplay("CRACK",newReq,initTags.total,newTags);
	payload.setCurrentTags(newTags);
}

function preCheck(check)
{
	if(check.id === "disCheck")
	{
		if($(check).prop("checked"))
		{
			extraTags(2,"hack");
		}
		else
		{
			extraTags(-2,"hack");
		}
	}
	else if(check.id === "cmmCheck")
	{
		let totalCMM = payload.getPayloadFunction("items").includes("arms_cmmwidow") + payload.getPayloadFunction("items").includes("arms_cmmcocoon");

		if($(check).prop("checked"))
		{
			extraTags(totalCMM,"slip");
		}
		else
		{
			extraTags((totalCMM * -1),"slip");
		}
	}
	else if(check.id === "shmCheck")
	{
		if($(check).prop("checked"))
		{
			payload.setModifier("cost",1);

			if(payload.getPayloadFunction("items").includes("util_shimmerstick_t0"))
			{
				payload.setModifier("time",30);
			}
			else if(payload.getPayloadFunction("items").includes("util_shimmerstick_t1"))
			{
				payload.setModifier("time",15);
			}

			extraTags("extra",0);
			
			//synchronize animations
		}
		else
		{
			payload.setModifier("cost",-1);
			
			if(payload.getPayloadFunction("items").includes("util_shimmerstick_t0"))
			{
				payload.setModifier("time",-30);
			}
			else if(payload.getPayloadFunction("items").includes("util_shimmerstick_t1"))
			{
				payload.setModifier("time",-15);
			}

			extraTags("extra",0);
		}
	}
}

function accessTerminal(autosave)
{
	if(autosave)
	{
		payload.setCurrentTags(autosave.tags);
		rewriteTerminalPage(autosave);
		$("#status").html(">> RECONNECT SUCCESS");
		$("#playPause").prop("disabled",true);
	}
	else
	{
		let newReq = terminal.getReqAccess() + payload.getModifier("cost");

		payload.setCurrentTags(payload.getCurrentTags()-newReq);
		rewriteTerminalPage(null);
		$("#status").html(">> AWAITING COMMAND");
	}
	
	
	updateTagDisplay("STANDBY",payload.getCurrentTags());
	
	$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") > payload.getCurrentTags()}).prop("disabled",true);
	
	clearInterval(timer);
	clearInterval(timerBlink);
	$("#mmss > .FG").html("00:"+tens(payload.getTimerSecs()));
	$("#hundsec > .FG").html("00");	
	
	$("#accessZone").css("display","none");
	$("#hackZone").css("display","flex");

	let initialTags = payload.getInitialTags();
	let newReq = terminal.getReqAccess() + payload.getModifier("cost");
	initialTags["extra"] = (payload.getCurrentTags() + newReq) - initialTags["total"];

	let actionJSON = {
		timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
		handle: payload.getHandle().handle,
		action: "Terminal Accessed",
		details: { "Tags": initialTags, "AccessCost": newReq }
	};

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "Resources\\Scripts\\Files\\oocLogUpdate.php",
		data:
		{
			suffixID: terminal.getTerminalID(),
			actionJSON: JSON.stringify(actionJSON)
		}
	});
}

function executeCommand(path,newState,cost,copycat=false)
{
	updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());
	startTimer("EXECUTE",(copycat ? 0 : payload.getTimerSecs()),function() {
		terminal.setEntryState(path,newState,payload.getModifier("cost"));
		
		if(payload.getPayloadFunction("repeat"))
		{
			terminal.repeatIcon(path,payload.getPayloadFunction("repeat"));
			$("#"+path.split(">")[0]+"Content .subContRepeat").removeClass("hidden");

			repeatAddition = "; Repeat " + payload.getPayloadFunction("repeat");
		}

		if(payload.getPayloadFunction("items").includes("cust_copycat"))
		{
			terminal.copyIcon(path);
		}

		if(payload.getPayloadFunction("items").includes("deck_johnnyspecialtouch"))
		{
			terminal.touchAccess(1);
			$(".subContJohnny").removeClass("hidden");
		}
	
		payload.setCurrentTags(payload.getCurrentTags()-cost);
		$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);

		if(copycat)
		{
			let payload_sim = JSON.parse(Cookies.get("payload_sim"));

			let deckIndex = payload_sim.findIndex(function(payDeck)
			{
				return payDeck.id === "cust_copycat";
			});

			payload_sim[deckIndex].used++;
		
			Cookies.set("payload_sim",JSON.stringify(payload_sim),{expires: 7,path: "",sameSite: "Strict"});
		};

		autoSave({});

		let actionJSON = {
			timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
			handle: payload.getHandle().handle,
			action: path + " changed to " + newState,
			details: { "Cost": cost, "Repeat": payload.getPayloadFunction("repeat") }
		};
	
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "Resources\\Scripts\\Files\\oocLogUpdate.php",
			data:
			{
				suffixID: terminal.getTerminalID(),
				actionJSON: JSON.stringify(actionJSON)
			}
		});
	});
	
	$("button[data-cost]").prop("disabled",true);
	$("#status").html(">> EXECUTING COMMAND...");
}

function updateAccessLog(logIndex,action,reass)
{
	let cost;
	let callback;
	
	let oldHandle = $("#log"+logIndex+" .logName").html();

	if(action === "reassign")
	{
		cost = Math.max(2 + payload.getModifier("cost"),0);;
		callback = function() {
			terminal.updateAccessLog(logIndex,"reassign",reass);
			$("#log"+logIndex+" .logName").html(reass);

			payload.setCurrentTags(payload.getCurrentTags()-cost);
			$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);
			autoSave({});

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Log Entry for " + oldHandle + " reassigned to " + reass,
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "Resources\\Scripts\\Files\\oocLogUpdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};
	}
	else if (action === "wipe")
	{
		cost = Math.max(1 + payload.getModifier("cost"),0);;
		callback = function() {
			terminal.updateAccessLog(logIndex,"wipe");
			$("#log"+logIndex).html('ERROR: LOG ENTRY NOT FOUND');
			
			payload.setCurrentTags(payload.getCurrentTags()-cost);
			$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);
			autoSave({});

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Log Entry for " + oldHandle + " wiped",
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "Resources\\Scripts\\Files\\oocLogUpdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};
	}
	
	updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());

	startTimer("EXECUTE",payload.getTimerSecs(),callback);
		
	$("button[data-cost]").prop("disabled",true);
	$("#status").html(">> EXECUTING COMMAND...");
}

function brickTerminal(hexHandle)
{
	$("body").addClass("bricked");

	let stopCode =  "0x000000" + hexHandle[0] + "<br/>" +
					"(0x" + hexHandle[1] + hexHandle[2] + hexHandle[3] + hexHandle[4] + "," +
					"0x" + hexHandle[5] + hexHandle[6] + hexHandle[7] + hexHandle[8] + ",<br/>" +
					"&nbsp;0x" + hexHandle[9] + hexHandle[10] + hexHandle[11] + hexHandle[12] + "," +
					"0x" + hexHandle[13] + hexHandle[14] + "0000)"

	$("#main").html("<p>A problem has been detected and HexOS has been shut down to prevent damage to your device.</p>" +
					"<p>UNMOUNTABLE_BOOT_VOLUME</p>" +
					"<p>If this is the first time you've seen this error screen, restart your computer. If this screen appears again, follow these steps:" +
					"<p>Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or software manufacturer for any HexOS updates you might need.</p>" +
					"<p>If problems continue, disable or remove any newly installed hardware or software. Disable BIOS memory options such as caching or shadowing. If you need to use Safe Mode to remove or disable components, restart your computer, press F8 to select Advanced Startup Options, and then select Safe Mode.</p>" +
					"<p>Technical Information:</p>" +
					"<p>*** STOP: " + stopCode + "</p>" +
					"<p><br/>Beginning dump of physical memory...<br/>" +
					"Physical memory dump complete.<br/>" +
					"Contact your system administrator or technical support group for further<br/>" +
					"assistance.</p>" +
					"<!--<footer>CPU DISCLAIMER</footer>-->"
	);
}

function rootingTerminal(timeUp)
{
	terminal.setTerminalState(timeUp);

	$("#load").addClass("hidden");
	$("body").addClass("rooting");
	$("#timerLCD").removeClass("amber");
	$("#timerLCD").addClass("red");
	$(".zoneBox").css("display","none");

	$("#playPause").html('<img src="Resources\\Images\\PlayPause\\Pause_Root.png">');
	$("#playPause").attr("onmouseup","pauseTimer(true)");

	let secs = ((timeUp - new Date()) / 1000);

	startTimer("EXECUTE",Math.ceil(secs),function () {
		$("body").removeClass("rooting");

		rootTerminal();

		$.ajax({
			type: "POST",
			dataType: "json",
			url: "Resources\\Scripts\\Files\\updateTerminalJSON.php",
			data:
			{
				suffixID: terminal.getTerminalID(),
				path: "state",
				newState: "rooted"
			}
		});

		let actionJSON = {
			timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
			handle: payload.getHandle().handle,
			action: "Terminal Root Completed",
			details: null
		};
	
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "Resources\\Scripts\\Files\\oocLogUpdate.php",
			data:
			{
				suffixID: terminal.getTerminalID(),
				actionJSON: JSON.stringify(actionJSON)
			}
		});
	});
}

function rootTerminal()
{
	$("#main").html("<p>No boot device avaiable<br/>" +
					"Current boot mode is set to BIOS.<br/>" +
					"Please ensure compatible bootable media is available.<br/>" +
					"Use the system setup program to change the boot mode as needed.</p>" +
					"<p>Restart device to retry boot.</p>" +
					"<!--<footer>CPU DISCLAIMER</footer>-->"
	);
}

function executeAction(action)
{
	let cost;
	let timerSecs = payload.getTimerSecs();
	let callback;

	if(action === "brick")
	{
		cost = Math.max(4 + payload.getModifier("cost"),0);
		callback = function() {
			let handle = payload.getHandle();
			handle = (handle.masked) ? handle.mask : handle.handle;
			handleLength = handle.length;

			let hexHandle = [];

			for(let i = 0; i < handleLength; i++)
			{
				hexHandle.push(handle.charCodeAt(i).toString(16));
			}

			for(let j = handleLength; j < 15; j++)
			{
				hexHandle.push("00");
			}

			brickTerminal(hexHandle);

			payload.setCurrentTags(payload.getCurrentTags()-cost);
			autoSave({});

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "Resources\\Scripts\\Files\\updateTerminalJSON.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					path: "state",
					newState: hexHandle
				}
			});

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Terminal Bricked",
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "Resources\\Scripts\\Files\\oocLogUpdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};

		updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());
		startTimer("EXECUTE",timerSecs,callback);
	}
	else if (action === "rig")
	{
		cost = Math.max(6 + payload.getModifier("cost"),0);
		callback = function() {
			$("#rigged").removeClass("hidden");
			$("#riggButton").attr("data-enabled","false");

			payload.setCurrentTags(payload.getCurrentTags()-cost);
			$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);
			autoSave({ rigged: true });

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Terminal Rigged",
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "Resources\\Scripts\\Files\\oocLogUpdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};

		updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());
		startTimer("EXECUTE",timerSecs,callback);
	}
	else if(action === "root")
	{
		cost = Math.max(6 + payload.getModifier("cost"),0);
		callback = function() {
			let timeUp = new Date(new Date().getTime() + 5 * 60 * 1000)

			rootingTerminal(timeUp);
			autoSave({});

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "Resources\\Scripts\\Files\\updateTerminalJSON.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					path: "state",
					newState: timeUp
				}
			});

			let actionJSON = {
				timestamp: "\"" + new Date().toLocaleString("en-US",{"hourCycle":"h24","year":"numeric","month":"short","day":"2-digit","hour":"2-digit","minute":"2-digit","second":"2-digit"}) + "\"",
				handle: payload.getHandle().handle,
				action: "Terminal Root Started",
				details: { "Cost": cost }
			};
		
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "Resources\\Scripts\\Files\\oocLogUpdate.php",
				data:
				{
					suffixID: terminal.getTerminalID(),
					actionJSON: JSON.stringify(actionJSON)
				}
			});
		};

		updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());
		startTimer("ROOT",timerSecs,callback);
	}
		
	$("button[data-cost]").prop("disabled",true);
	$("#status").html(">> EXECUTING COMMAND...");
}

function activateDeck(deck)
{
	payload.setCurrentTags(payload.getCurrentTags()+1);
	updateTagDisplay("STANDBY",payload.getCurrentTags());

	let payload_sim = JSON.parse(Cookies.get("payload_sim"));

	let deckIndex = payload_sim.findIndex(function(payDeck)
	{
		return payDeck.id === deck;
	});

	payload_sim[deckIndex].used++;

	Cookies.set("payload_sim",JSON.stringify(payload_sim),{expires: 7,path: "",sameSite: "Strict"});

	payload.rewriteItemMarks(deck);

	autoSave({});
}

function openTab(evt, bodyID)
{
	$(".hackTab.active").removeClass("active");
	$(".hackBody").removeClass("active");
	
	$($(evt.target)).addClass("active");
	$("#" + bodyID).addClass("active");
}

function openSubTab(evt, contentID)
{
	let parentBody = $(evt.target).parent().parent().parent();
	let pBodyID = "[id='"+parentBody.attr("id")+"'] "
	
	$(pBodyID + ".subTab.active").addClass("inactive");
	$(pBodyID + ".subTab.active").removeClass("active");
	$(pBodyID + ".subContent").removeClass("active");
	
	$($(evt.target)).removeClass("inactive");
	$($(evt.target)).addClass("active");
	$("#" + contentID).addClass("active");
}

function helpPopup()
{
	$("#popup").html("[helpText]");
	$("#popup").dialog();
}

function logAction(logIndex,action)
{
	let logHandle = terminal.getLogHandle(logIndex);
	let actionCost;
	
	if(action === "reassign")
	{
		actionCost = Math.max(2 + payload.getModifier("cost"),0);
		$("#popup").html("Reassign Log Entry of User " + logHandle + " to the below username for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?<br/><br/>" +
						 "<input id='newReass' placeholder='Enter New Log Entry Name Here' style='width:100%'></input><br/><br/>" +
						 "NOTE: This Reassignment MAY be used to imitate someone else!");
	}
	else if (action === "wipe")
	{
		actionCost = Math.max(1 + payload.getModifier("cost"),0);

		$("#popup").html("Wipe Log Entry of User " + logHandle + " for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?");
	}
	
	$("#popup").dialog({
		title: "Confirm " + (action.charAt(0).toUpperCase() + action.slice(1)) + " Action",
		height: "auto",
		width:$("#main").width(),
		buttons: [{
			text: "Confirm",
			click: function()
			{
				$(this).dialog("close");
				updateAccessLog(logIndex,action,$("#newReass").val());
			}
		}],
		open: function(event,ui)
		{
			updateTagDisplay("CONFIRM",payload.getCurrentTags()-actionCost,payload.getCurrentTags());
		},
		close: function(event,ui)
		{
			updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});
}

function payAction(action)
{
	//brick -> 4 Tags, Action Seconds -> Blue Screen | [permanently disable device (until repair?)]
	//rig -> 6 Tags, Action Seconds -> Rigged Stamp | [all files/data on terminal deleted at end of scene]
	//root -> 6 Tags, Hard 30s, 5min hands-off timer -> BIOS | wipe all software/data from device (can install new software if in possession)

	let actionCost;

	if(action === "brick")
	{
		actionCost = Math.max(4 + payload.getModifier("cost"),0);

		$("#popup").html("Brick Device for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?<br/><br/>" +
			"<span class='red'>WARNING: Bricking this Device will render it inoperable until repaired!</span>");
	}
	else if(action === "rig")
	{
		actionCost = Math.max(6 + payload.getModifier("cost"),0);

		$("#popup").html("Rig Device for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?<br/><br/>" +
			"<span class='red'>WARNING: Triggering a Rigged Device (by calling \"Room Strike Lock\") will cause all data to be deleted at the end of the Scene!</span>");
	}
	else if(action === "root")
	{
		actionCost = Math.max(6 + payload.getModifier("cost"),0);

		$("#popup").html("Root Device for " + actionCost + " Tag" + ((actionCost === 1) ? "" : "s") + "?<br/><br/>" +
			"<span class='red'>WARNING: Rooting this Device will format all memory disks, deleting all software and data permanently!<br/>Furthermore, Device will be inoperable until appropriate software is re-installed!</span>");
	}

	$("#popup").dialog({
		title: "Confirm " + (action.charAt(0).toUpperCase() + action.slice(1)) + " Action",
		height: "auto",
		width:$("#main").width(),
		buttons: [{
			text: "Confirm",
			click: function()
			{
				$(this).dialog("close");
				executeAction(action);
			}
		}],
		open: function(event,ui)
		{
			updateTagDisplay("CONFIRM",payload.getCurrentTags()-actionCost,payload.getCurrentTags());
		},
		close: function(event,ui)
		{
			updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});
}

function termAction(path,action)
{
	let entry = terminal.getEntry(path);
	let icon = terminal.getIcon(path);
	let dataType = terminal.getDataType(path.split(">")[0]);

	let johnnyAccess = ((action === "access") && (payload.getPayloadFunction("items").includes("deck_johnnyspecialtouch")));

	let copyPossible = payload.getPayloadFunction("items").includes("cust_copycat") && (JSON.parse(Cookies.get("payload_sim")).find(item => item.id === "cust_copycat").used === 0);
	let copyHTML = (copyPossible && icon.copied) ?
					'<br/><br/><input id="copycat_check" type="checkbox"/><label for="copycat_check">&nbsp;Use Copycat to bypass timer?<br/>NOTE: This item can only be used once per Simulation.</label>' :
					"";

	console.log(copyPossible);
	console.log(icon);
	
	let buttonActions = [];
	
	if(entry.special == "ice")
	{
		if(action == "unwrap")
		{
			buttonActions.push({
				text: "Confirm",
				click: function()
				{
					$(this).dialog("close");
					executeCommand(path,"unwrap",0,$("#copycat_check").prop("checked"));
				}
			});
		
			$("#popup").html((action.charAt(0).toUpperCase() + action.slice(1)) + " \"" + entry.displayName + ": " + entry.title + "\" for no Tags?<br/><br/>WARNING: Unwrapping will trip the ICE, incurring negative effects! Break the ICE instead to avoid these effects." + copyHTML);
		}
		else if(action == "break")
		{
			let actionCost = Math.max((entry[action]-icon.repeated-johnnyAccess)+payload.getModifier("cost"),0);
			
			buttonActions.push({
				text: "Confirm",
				click: function()
				{
					$(this).dialog("close");
					executeCommand(path,"break",actionCost,$("#copycat_check").prop("checked"));
				}
			});
			
			$("#popup").html((action.charAt(0).toUpperCase() + action.slice(1)) + " \"" + entry.displayName + ": " + entry.title + "\" for " + actionCost + " Tag" + (actionCost == 1 ? "" : "s") + "?" + copyHTML);
		}
	}
	else
	{		
		let actionCost = Math.max((entry[action]-icon.repeated-johnnyAccess)+payload.getModifier("cost"),0);
		
		dataType.states[entry.state][action].actions.forEach(function(button)
		{
			buttonActions.push({
				text: button.title,
				click: function()
				{
					$(this).dialog("close");
					executeCommand(path,(entry.special == "trap" ? action : button.state),actionCost,$("#copycat_check").prop("checked"));
				}
			});
		});

		$("#popup").html((action.charAt(0).toUpperCase() + action.slice(1)) + " \"" + entry.displayName + "\" for " + actionCost + " Tag" + (actionCost == 1 ? "" : "s") + "?" + copyHTML);
	}
	
	//https://jqueryui.com/dialog/#modal-confirmation
	$("#popup").dialog({
		title: "Confirm " + (action.charAt(0).toUpperCase() + action.slice(1)) + " Action",
		height: "auto",
		width:$("#main").width(),
		buttons: buttonActions,
		open: function(event,ui)
		{
			let actionCost = entry[action] ? Math.max((entry[action]-icon.repeated-johnnyAccess)+payload.getModifier("cost"),0) : 0;
			updateTagDisplay("CONFIRM",payload.getCurrentTags()-actionCost,payload.getCurrentTags());
		},
		close: function(event,ui)
		{
			updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});
}

function deckAction(deck,max)
{
	let deckType = "cyberdeck";

	if(deck.startsWith("cust_"))
	{
		deckType = "customization"
	}

	$("#popup").html("Activate Deck for +1 Tag?<br/><br/>NOTE: You only have " + max + " activation" + ( max === 1 ? "" : "s" ) + " of this " + deckType + " per Simulation.");

	$("#popup").dialog({
		title: "Confirm Deck Activation",
		height: "auto",
		width:$("#main").width(),
		buttons: [{
			text: "Confirm",
			click: function()
			{
				$(this).dialog("close");
				activateDeck(deck);
			}
		}],
		open: function(event,ui)
		{
			updateTagDisplay("CONFIRM",payload.getCurrentTags(),payload.getCurrentTags()+1);
		},
		close: function(event,ui)
		{
			updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});
}