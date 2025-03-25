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
	
	setEntryState(path,state,extraCost,context="")
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

			if(context === "change")
			{
				$.ajax({
					type: "POST",
					dataType: "json",
					url: "resources\\scripts\\files\\updateterminaljson.php",
					data:
					{
						suffixID: this.#suffix,
						path: path,
						newState: catalogEntry.state,
						newPrev: null
					}
				});
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
					url: "resources\\scripts\\files\\updateterminaljson.php",
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
					if(!($('[id="'+entry.id+'"] > .entryContentsBar > .entryMaskContainer > .entrySecret').hasClass("sprung")) &&
					   !($('[id="'+entry.id+'"] > .entryContentsBar > .entryMaskContainer > .entrySecret').hasClass("broken")))
					{
						let newBrkCost = Math.max($('[id="'+entry.id+'"] .breakButton').attr("data-cost")-rank,0);
					
						let brkS = (newBrkCost === 1) ? "" : "s";
						
						$('[id="'+entry.id+'"] .breakButton').attr("data-cost",newBrkCost);
						$('[id="'+entry.id+'"] .breakButton').text(newBrkCost + " Tag" + brkS);
					}
				}
				else if (!($('[id="'+entry.id+'"] > .entryContentsBar > .entryMaskContainer > .entrySecret').hasClass("disarmed")) &&
						 !($('[id="'+entry.id+'"] > .entryContentsBar > .entryMaskContainer > .entrySecret').hasClass("sprung")))
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
				if(!($('[id="'+entry.id+'"] > .entryContentsBar > .entryMaskContainer > .entrySecret').hasClass("sprung")) &&
				   !($('[id="'+entry.id+'"] > .entryContentsBar > .entryMaskContainer > .entrySecret').hasClass("broken")))
				{
					let newBrkCost = Math.max(Number($('[id="'+entry.id+'"] .breakButton').attr("data-cost"))+change,0);
					
					let brkS = (newBrkCost === 1) ? "" : "s";
					
					$('[id="'+entry.id+'"] .breakButton').attr("data-cost",newBrkCost);
					$('[id="'+entry.id+'"] .breakButton').text(newBrkCost + " Tag" + brkS);
				}
			}
			else if (!($('[id="'+entry.id+'"] > .entryContentsBar > .entryMaskContainer > .entrySecret').hasClass("disarmed")) &&
					 !($('[id="'+entry.id+'"] > .entryContentsBar > .entryMaskContainer > .entrySecret').hasClass("sprung")))
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
			url: "resources\\scripts\\files\\updateaccesslog.php",
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
			url: "resources\\scripts\\files\\updateaccesslog.php",
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
				entry["state"] = (entry.state ? entry.state : "initial");
			}
			else if(entry.special == "ice")
			{
				entry["path"] = path;
				entry["displayName"] = "ICE " + " " + displayIndex;
				entry["contents"] = entry.effects.join("<br/>");
				entry["state"] = (entry.state ? entry.state : "closed");
				
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
				
				let entryString = "";
										
				if (entry.special === "ice")
				{
					let stateMasked = true;
					let stateClass = "";
					let stateUnwrap = '<button class="unwrapButton" data-enabled="true" data-cost="0" onclick="termAction(\'' + entry.path + '\',\'unwrap\')">Free!</button>';
					let stateBreak = '<button class="breakButton" data-enabled="true" data-cost="' + entry.break + '" onclick="termAction(\'' + entry.path + '\',\'break\')">' + entry.break +' Tag' + brkS + '</button>';

					if((entry.state === "broken") || (entry.state === "sprung"))
					{
						stateMasked = false;
						stateClass = entry.state;
						stateUnwrap = '<button class="unwrapButton" data-enabled="false" data-cost="0" onclick="termAction(\'files>3\',\'unwrap\')" disabled>N/A</button>';
						stateBreak = '<button class="breakButton" data-enabled="false" data-cost="' + entry.break + '" onclick="termAction(\'files>3\',\'break\')" disabled>N/A</button>';
					}

					entryString += 	'<div id="' + entry.path + '" class="entry ice ' + subClass + '">' +
										'<div class="entryTitleBar">' +
											'<span class="entryPrefix">>> ' + entry.displayName + ':\\</span>' +
											'<span>&nbsp;' + entry.title + '</span>' +
										'</div>' +
										'<div class="entryContentsBar">' + 
											'<span class="entryMaskContainer">' +
												'<span class="entryMasking' + (stateMasked ? '' : ' invisible') + '"></span>' +
												'<span class="entrySecret ' + stateClass + '">' + entry.contents + '</span>' +
											'</span>' +
										'</div>' +
										'<div class="entryIntContainer">' +
											'<div class="entryInterface">' +
												'Unwrap:' + stateUnwrap +
											'</div>' +
											'<div class="entryInterface">' +
												'Break:' + stateBreak +
											'</div>' +
										'</div>';
				}
				else if (entry.special === "trap")
				{
					entryString += '<div id="' + entry.path + '" class="entry ' + subClass + '">' +
										'<div class="entryTitleBar">';

					let titleMask;
					let contentMask;
					let aVisible;
					let mVisible;

					if((entry.state === "sprung") || (entry.state === "disarmed"))
					{
						titleMask = 		'<span class="entryMaskContainer">' +
												'<span class="entrySecret ' + entry.state + '">' + entry.title + '</span>' +
											'</span>';
						contentMask = 		'<span class="entryMaskContainer">' +
												'<span class="entrySecret ' + entry.state + '">' + entry.contents + '</span>' +
											'</span>';
						aVisible = {
							disAttr: 'data-enabled="false" disabled',
							buttonText: "N/A"
						}
						mVisible = {
							disAttr: 'data-enabled="false" disabled',
							buttonText: "N/A"
						}
					}
					else
					{
						titleMask = 		'<span class="entryMaskContainer">' +
												'<span class="entryMasking"></span>' +
												'<span class="entrySecret">' + entry.title + '</span>' +
											'</span>';
						contentMask = 		'<span class="entryMaskContainer">' +
												'<span class="entryMasking"></span>' +
												'<span class="entrySecret">' + entry.contents + '</span>' +
											'</span>';
						aVisible = {
							disAttr: 'data-enabled="true" data-cost="' + entry.access + '"',
							buttonText: entry.access + " Tag" + accS
						}
						mVisible = {
							disAttr: 'data-enabled="true" data-cost="' + entry.modify + '"',
							buttonText: entry.modify + " Tag" + modS
						}
					}
					
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
				else
				{
					entryString += '<div id="' + entry.path + '" class="entry ' + subClass + '">' +
										'<div class="entryTitleBar">';

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
					
					if(entry.state != "sprung" && (entry.state != "broken"))
					{
						entry.subEntries.forEach(function(subEntry)
						{
							entryString += writeEntry(subEntry,scheme,"subIce");
						});
					}
					else
					{
						entry.subEntries.forEach(function(subEntry)
						{
							entryString += writeEntry(subEntry,scheme);
						});
					}
					
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
					entryArray[index] = writeEntry(entry,iconScheme);
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