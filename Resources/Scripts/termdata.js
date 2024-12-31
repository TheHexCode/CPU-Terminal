class Terminal
{
	#suffix;
	#termData;
	#accessLog;
	
	#dataCatalog;
	
	#subTabsString = "";
	#contentString = "";
	
	constructor(suffix, dataCatalog,termData,accessLog)
	{
		this.#suffix = suffix;
		this.#termData = termData;
		this.#accessLog = accessLog;
		
		this.#dataCatalog = dataCatalog;
		
		this.#buildDataEntries();
		this.#writeTerminal();
	}
	
	getReqAccess()
	{
		return this.#termData.access;
	}
	
	getSubTabString()
	{
		return this.#subTabsString;
	}
	
	getContentString()
	{
		return this.#contentString;
	}
	
	getCategory(path)
	{
		let catIndex = this.#termData.data.findIndex(function(cat)
		{
			return cat.type == path.split(">")[0];
		});
		
		return this.#termData.data[catIndex];
	}

	getLogEntry(index)
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
	
	getEntry(path)
	{
		path = path.split(">");
		let searchResults;
		
		for(let i = 0; i < path.length; i++)
		{
			if(i == 0)
			{
				searchResults = this.#termData.data.find(category => category.type === path[i]);
			}
			else if(i == 1)
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
		return this.#dataCatalog[type];
	}
	
	setEntryState(path,state)
	{
		let catalogEntry = this.getEntry(path);
		let terminalEntry = "[id='"+path+"'] "
		
		let category = this.getCategory(path);
		let catalogState = this.#dataCatalog[path.split(">")[0]].states[state];
		
		if(catalogEntry.special)
		{
			if(catalogEntry.special == "trap")
			{
				if(state == "access")
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
					console.log(catalogEntry);
				}
				else if(state == "modify")
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
					console.log(catalogEntry);
				}
			}
			else if(catalogEntry.special == "ice")
			{
				if(state == "unwrap")
				{
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entrySecret").addClass("sprung");
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entryMasking").addClass("invisible");
				
					$(terminalEntry + "> .entryIntContainer button").attr("data-enabled","false");
					$(terminalEntry + "> .entryIntContainer button").html("N/A");
					
					$(terminalEntry + "> .subIce").removeClass("subIce");
					
					catalogEntry.state = "open";
					console.log(catalogEntry);
				}
				else if(state == "break")
				{
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entrySecret").addClass("broken");
					$(terminalEntry + "> .entryContentsBar > .entryMaskContainer > .entryMasking").addClass("invisible");
				
					$(terminalEntry + "> .entryIntContainer button").attr("data-enabled","false");
					$(terminalEntry + "> .entryIntContainer button").html("N/A");
					
					$(terminalEntry + "> .subIce").removeClass("subIce");
					
					catalogEntry.state = "open";
					console.log(catalogEntry);
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
				let accCost = Math.max(catalogEntry.access - category.repeated,0)
				
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
				let modCost = Math.max(catalogEntry.modify - category.repeated,0)
				
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
			
			catalogEntry.state = state;
			console.log(catalogEntry);
		}
	}
	
	repeatCategory(path, rank)
	{
		let category = this.getCategory(path)
		
		if(!category.repeated)
		{
			$('.entry[id*="' + category.type + '"]').each(function(index,entry)
			{
				if($('[id="'+entry.id+'"]').hasClass("ice"))
				{
					let newDisCost = Math.max($('[id="'+entry.id+'"] .breakButton').attr("data-cost")-rank,0);
					
					let disS = (newDisCost === 1) ? "" : "s";
					
					$('[id="'+entry.id+'"] .breakButton').attr("data-cost",newDisCost);
					$('[id="'+entry.id+'"] .breakButton').text(newDisCost + " Tag" + disS);
				}
				else
				{
					let newAccCost = Math.max($('[id="'+entry.id+'"] .accessButton').attr("data-cost")-rank,0);
					let newModCost = Math.max($('[id="'+entry.id+'"] .modifyButton').attr("data-cost")-rank,0);
					
					let accS = (newAccCost === 1) ? "" : "s"
					let modS = (newModCost === 1) ? "" : "s"
					
					$('[id="'+entry.id+'"] .accessButton').attr("data-cost",newAccCost);
					$('[id="'+entry.id+'"] .modifyButton').attr("data-cost",newModCost);
					
					$('[id="'+entry.id+'"] .accessButton').text(newAccCost + " Tag" + accS);
					$('[id="'+entry.id+'"] .modifyButton').text(newModCost + " Tag" + modS);
				}
			});
			
			category.repeated = rank;			
		}
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
	
	#buildEntry(catType, index, entry, parentEntry=false)
	{
		let path = catType + ">" + index;
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
				entry["displayName"] = this.#dataCatalog[catType].unit + " " + displayIndex;
				entry["title"] = "Trap!"
				entry["contents"] = entry.effects.join("<br/>");
				entry["initalVis"] = false;
				entry["state"] = "initial";
			}
			else if(entry.special == "ice")
			{
				entry["path"] = path;
				entry["displayName"] = "ICE " + " " + displayIndex;
				entry["contents"] = entry.effects.join("<br/>");
				entry["initalVis"] = false;
				entry["state"] = "closed";
				
				entry.subEntries.forEach((subEntry,subIndex) => this.#buildEntry(catType,subIndex,subEntry,{path:path,index:index}));
			}
		}
		else
		{
			entry["path"] = path;
			entry["displayName"] = this.#dataCatalog[catType].unit + " " + displayIndex;
			entry["state"] = "initial";
			
			entry["initalVis"] = this.#dataCatalog[catType].states["initial"].contents;
			entry["access"] = this.#dataCatalog[catType].states["initial"].access.enabled ? entry.access : false;
			entry["modify"] = this.#dataCatalog[catType].states["initial"].modify.enabled ? entry.modify : false;
		}
	}
	
	#buildDataEntries()
	{
		this.#termData.data.forEach(function(category)
		{
			category["repeated"] = 0;
			
			if(Object.keys(this.#dataCatalog).includes(category.type))
			{
				category.entries.forEach((entry,index) => this.#buildEntry(category.type,index,entry));
			}
			else
			{
				throw new Error("Terminal.json data category type \"" + category.type + "\" not found in dataCatalog.json. Expecting one of: [" + Object.keys(dataCatalog).join(", ") + "]");
			}
		}, this);
		
		console.log(this.#termData.data);
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
								'<div class="subContTitle">' +
									'<u>ACCESS LOG</u>' +
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
									'User: <span class="logName">' + logHandle + '</span>' +
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
		
		this.#termData.data.forEach(function(category)
		{
			function writeEntry(entry, index, subClass="")
			{
				let accS = (entry.access==1) ? "" : "s";
				let modS = (entry.modify==1) ? "" : "s";
				let disS = (entry.break==1) ? "" : "s";
				
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
												'Break:<button class="breakButton" data-enabled="true" data-cost="' + entry.break + '" onclick="termAction(\'' + entry.path + '\',\'break\')">' + entry.break +' Tag' + disS + '</button>' +
											'</div>' +
										'</div>';
				}
				else
				{
					let contentMask = entry.initalVis ? 
											'<span>' + entry.contents + '</span>'
											:
											'<span class="entryMaskContainer">' +
												'<span class="entryMasking"></span>' +
												'<span class="entrySecret">' + entry.contents + '</span>' +
											'</span>';
					
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
											'<span class="entryMaskContainer">' +
												'<span class="entryMasking"></span>' +
												'<span class="entrySecret">&nbsp;' + entry.title + '</span>' +
											'</span>' +
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
					
					entry.subEntries.forEach(function(subEntry,index)
					{
						entryString += writeEntry(subEntry,index,"subIce");
					});
				}
				
				return 	entryString +
					'</div>';
			}
			
			let subTabID = ' ';
			
			if(category.type == "darkweb")
			{
				subTabID = ' id="dwSubTab" ';
			}
			
			if(category.entries.length)
			{
				subTabs["enabled"] += 	'<button' + subTabID + 'class="subTab inactive" onclick="openSubTab(event,\'' + category.type + 'Content\')">' +
											'<img src="resources/images/subtabs/' + category.type + '.png" onerror="this.onerror=null;this.src=\'https://placehold.co/30\'"/>' +
										'</button> ';
				
				allContent += 	'<div id="'+ category.type + 'Content" class="subContent">' +
									'<div class="subContTitle">' +
										'<u>' + this.#dataCatalog[category.type].title + '</u>' +
									'</div>' +
									'<div class="subContBody">';
				
				let entryArray = [];
				
				category.entries.forEach(function(entry,index)
				{
					if (entry.special != "ice")
					{
						entryArray[index] = writeEntry(entry,index);
					}
					else
					{
						entryArray[index] = writeEntry(entry,index,"ice");
					}
				},this);
				
				allContent += entryArray.join("<hr/>");
				
				allContent += '</div></div>';
			}
			else
			{
				subTabs["disabled"] += '<button class="subTab disabled"><img src="resources/images/subtabs/' + category.type + '.png" onerror="this.onerror=null;this.src=\'https://placehold.co/30\'"/></button> ';
			}
		},this);
		
		this.#subTabsString = subTabs["enabled"] + subTabs["disabled"];
		this.#contentString = allContent;
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
	
	#payloadHash = 0;
			   
	#currTags = 0;
	
	#contentString = "";
				  
	constructor()
	{
		if(Cookies.get("payload"))
		{
			let cookie = JSON.parse(Cookies.get("payload"));
			
			this.#payload = cookie;
			this.#payloadHash = cookie.hash;
				
			this.#currTags = this.getInitialTags()["total"];
		}
		this.#writeCyberdeck();
	}
	
	checkForCookie()
	{
		if(Cookies.get("payload"))
		{
			let cookie = JSON.parse(Cookies.get("payload"));
			
			if(cookie.hash != this.#payloadHash)
			{
				this.#payload = cookie;
				this.#payloadHash = cookie.hash;
				
				this.#currTags = this.getInitialTags()["total"];
				
				this.#writeCyberdeck();
				
				return true;
			}
		}
		else
		{			
			return false;
		}
	}
	
	hasPayload()
	{
		return (this.#payload != null);
	}
	
	getPayloadFunction(func)
	{
		return this.#payload[func];
	}
	
	getInitialTags()
	{
		let initTags = {};
		initTags["hack"] = Math.min(this.#payload.hack*2,10);
		initTags["rex"] = (this.#payload.rex ? 2 : 0);
		initTags["total"] = initTags["hack"] + initTags["rex"];
		
		return initTags;
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
				return 10;
			}
			else if(this.#payload.bd)
			{
				return 20;
			}
			else
			{
				return 30;
			}
		}
		else
		{
			return 30;
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
	
	getContentString()
	{
		return this.#contentString;
	}
	
	#writeCyberdeck()
	{
		//ACTIVE
		//PASSIVE
		//ITEMS
		
		let contents = {};
		
		
		//ACTIVE
		
		let contentString = '<div id="actContent" class="subContent active">' +
								'<div class="subContTitle">' +
									'<u>ACTIVE FUNCTIONS</u>' +
								'</div>' +
								'<div class="subContBody">' +
									'<ul id="actList">';
									
		/*
		'  "wyt"     : "true",' + //Access Log + Active
		'  "reass"   : "true",' + //Access Log + Active
		'  "brick"   : "true",' + //Active
		'  "rigg"    : "true",' + //Active
		'  "root"    : "true",' + //Active
	    */
		let activeCount = 0;
		
		if(this.hasPayload())
		{
			if(this.#payload.brick)
			{
				contentString += 	'<li>' +
										'<span>BRICK:</span>' +
										'<button data-enabled="true" data-cost="4" onclick="payAction(\"brick\")">4 Tags</span>' +
									'</li>'
				activeCount++;
			}
			
			if(this.#payload.rigg)
			{
				contentString += 	'<li>' +
										'<span>RIGGED:</span>' +
										'<button data-enabled="true" data-cost="6" onclick="payAction(\"rigg\")">6 Tags</span>' +
									'</li>'
				activeCount++;
			}
			
			if(this.#payload.root)
			{
				contentString += 	'<li>' +
										'<span>ROOT DEVICE:</span>' +
										'<button data-enabled="true" data-cost="6" onclick="payAction(\"root\")">6 Tags</span>' +
									'</li>'
				activeCount++;
			}
			
			if(this.#payload.reass)
			{
				contentString += 	'<li>' +
										'<span>REASSIGN:</span><br/>' +
										'<span>&nbsp;--&nbsp;CHECK ACCESS LOG</span>' +
									'</li>'
				activeCount++;
			}
			
			if(this.#payload.wyt)
			{
				contentString += 	'<li>' +
										'<span>WIPE YOUR TRACKS:</span><br/>' +
										'<span>&nbsp;--&nbsp;CHECK ACCESS LOG</span>' +
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
							'<div class="subContTitle">' +
								'<u>PASSIVE FUNCTIONS</u>' +
							'</div>' +
							'<div class="subContBody">' +
								'<ul>';

		/*
		'  "hack"    : "3",' + //Passive
		'  "bd"      : "true",' + //Passive
		'  "ibd"     : "true",' + //Passive
		'  "rex"     : "true",' + //Passive
		'  "repeat"  : "2",' + //Passive
		'  "dwa"     : "true",' + //Passive
		*/
		
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
							'<div class="subContTitle">' +
								'<u>ITEM ACTIVATIONS</u>' +
							'</div>' +
							'<div class="subContBody">';
								
								
		contentString +=	'</div>' +
						'</div>'
		
		contents["items"] = contentString;
		
		this.#contentString = contents["active"] + contents["passive"] + contents["items"];
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

$(document).ready(async function()
{	
	preloadImages();
	
	suffix = new URLSearchParams(window.location.search);
	
	termJSON = await fetch("Data\\"+suffix.get("id")+"\\terminal.json", {cache:"reload"});
	catalogJSON = await fetch("Resources\\Scripts\\dataCatalog.json", {cache:"reload"});
	
	accessCSV = await fetch("Data\\"+suffix.get("id")+"\\accessLog.json", {cache:"reload"});

	terminal = new Terminal(suffix.get("id"), await catalogJSON.json(), await termJSON.json(), await accessCSV.json());
	
	payload = new Payload();
	
	setupAccessPage();
	
	startTimer("CRACK",5);
	
	setupTerminalPage();
});

$(document).on("focus",function()
{
	if(payload && ($("#accessZone").css("display") != "none"))
	{
		if(payload.checkForCookie())
		{
			rewriteAccessPage();
		}
	}
});

function preloadImages()
{
	const bracketBorder = new Image();
	bracketBorder.src = "Resources\\Images\\Borders\\Bracket_Border.png"
	const bracketBorderIce = new Image();
	bracketBorderIce.src = "Resources\\Images\\Borders\\Bracket_Border_Ice.png"
	const thinBorder = new Image();
	thinBorder.src = "Resources\\Images\\Borders\\Thin_Border.png"
	const pauseImage = new Image();
	pauseImage.src = "Resources\\Images\\PlayPause\\Pause.png"
	const playImage = new Image();
	playImage.src = "Resources\\Images\\PlayPause\\Play.png"
	const subCameras = new Image();
	subCameras.src = "Resources\\Images\\SubTabs\\cameras.png"
	const subDarkWeb = new Image();
	subDarkWeb.src = "Resources\\Images\\SubTabs\\darkweb.png"
	const subDefenses = new Image();
	subDefenses.src = "Resources\\Images\\SubTabs\\defenses.png"
	const subFiles = new Image();
	subFiles.src = "Resources\\Images\\SubTabs\\files.png"
	const subLocks = new Image();
	subLocks.src = "Resources\\Images\\SubTabs\\locks.png"
	const subUtilties = new Image();
	subUtilties.src = "Resources\\Images\\SubTabs\\utilities.png"
	//SubTabs\log.png
	//SubTabs\puzzles.png
	//SubTabs\active.png
	//SubTabs\items.png
	//SubTabs\passive.png
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
			if((payload.getCurrentTags()-terminal.getReqAccess()) >= 0)
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
}

function pauseTimer()
{
	pause = !pause;
	
	if(pause)
	{
		$("#playPause").html('<img src="Resources\\Images\\PlayPause\\Play.png">');
		
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
	}
	else
	{
		$("#playPause").html('<img src="Resources\\Images\\PlayPause\\Pause.png">');
		
		clearInterval(timerBlink);
	}
}

function setupAccessPage()
{
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
	
	
	
	let payTags = payload.getInitialTags();
	let payTotal = payTags.hack + payTags.rex;
	
	$("#payTags").html(tens(payTotal));
	$("#hackDetails").html("[HACKING: +" + tens(payTags.hack) + "]");
	
	if(payTags.rex)
	{
		$("#rexDetails").show();
	}
	
	$("#remTags").html(tens(Math.max(payTotal - terminal.getReqAccess(),0)));
	
	updateTagDisplay("CRACK",terminal.getReqAccess(),payTotal);
	
	
		if((payload.getCurrentTags()-terminal.getReqAccess()) >= 0)
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
	$("#termSubTabs").html(terminal.getSubTabString());
	$("#termContentContainer").html(terminal.getContentString());
}

function rewriteTerminalPage()
{	
	let payloadHandle = payload.getHandle();
	let handle;
	
	let newLogEntry = {};
	newLogEntry["handle"] = payload.getPayloadFunction("handle");
	newLogEntry["mask"] = payload.getPayloadFunction("mask") ? payload.getPayloadFunction("maskHandle") : null;
	newLogEntry["state"] = "present"
	newLogEntry["reassignee"] = null;
	
	let newIndex = terminal.appendAccessLog(newLogEntry);
	
	let logHandle = ((newLogEntry.reassignee !== null) ? newLogEntry.reassignee :
					((newLogEntry.mask !== null) ? newLogEntry.mask : newLogEntry.handle));
	
	$("#logList").append(	'<li id="log' + newIndex + '" class="logEntry itsYou">' +
								'You:  <span class="logName">' + logHandle + '</span>' +
								'<div class="logActions hidden">' +
									'<hr/>' +
									'<span class="hidden">REASSIGN: <button class="reassButton" data-enabled="true" data-cost="2" onclick="logAction('+newIndex+',\'reassign\')">2 Tags</button></span>' +
									'<span class="hidden">WIPE TRACKS: <button class="wipeButton" data-enabled="true" data-cost="1" onclick="logAction('+newIndex+',\'wipe\')">1 Tag</button></span>' +
								'</div>' +
							'</li>');	
								
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
	
	$("#deckContentContainer").html(payload.getContentString());
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

function extraTags(change)
{
	let initTags;
	
	if(payload.hasPayload())
	{
		initTags = payload.getInitialTags()["total"];
	}
	else
	{
		initTags = 0;
	}
	let newTags = Math.min(Math.max(initTags,payload.getCurrentTags() + change),(99 + terminal.getReqAccess()));
	
	$("#extTags").html(tens(newTags-initTags));
	$("#remTags").html(tens(newTags-terminal.getReqAccess()));
	
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
	
	updateTagDisplay("CRACK",terminal.getReqAccess(),initTags,newTags);
	payload.setCurrentTags(newTags);
}

function accessTerminal()
{
	rewriteTerminalPage();
	
	payload.setCurrentTags(payload.getCurrentTags()-terminal.getReqAccess());
	updateTagDisplay("STANDBY",payload.getCurrentTags());
	
	$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") > payload.getCurrentTags()}).prop("disabled",true);
	
	clearInterval(timer);
	clearInterval(timerBlink);
	$("#mmss > .FG").html("00:"+tens(payload.getTimerSecs()));
	$("#hundsec > .FG").html("00");	
	
	$("#accessZone").css("display","none");
	$("#hackZone").css("display","flex");
	
	$("#status").html(">> AWAITING COMMAND");
}

function executeCommand(path,newState,cost)
{
	updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());
	startTimer("EXECUTE",payload.getTimerSecs(),function() {
		terminal.setEntryState(path,newState);
		
		if(payload.getPayloadFunction("repeat"))
		{
			terminal.repeatCategory(path,payload.getPayloadFunction("repeat"));
		}
		
		$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);
	});
	
	$("button[data-cost]").prop("disabled",true);
	$("#status").html(">> EXECUTING COMMAND...");
	payload.setCurrentTags(payload.getCurrentTags()-cost);
}

function updateAccessLog(logIndex,action,reass)
{
	let cost;
	let callback;

	if(action === "reassign")
	{
		cost = 2;
		callback = function() {
			terminal.updateAccessLog(logIndex,"reassign",reass);
			$("#log"+logIndex+" .logName").html(reass);

			$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);
		};
	}
	else if (action === "wipe")
	{
		cost = 1;
		callback = function() {
			terminal.updateAccessLog(logIndex,"wipe");
			$("#log"+logIndex).html('ERROR: LOG ENTRY NOT FOUND');
			
			$("button[data-enabled!='false']").filter(function(){return $(this).attr("data-cost") <= payload.getCurrentTags()}).prop("disabled",false);
		};
	}
	
	updateTagDisplay("EXECUTE",payload.getCurrentTags()-cost,payload.getCurrentTags());

	startTimer("EXECUTE",payload.getTimerSecs(),callback);
		
	$("button[data-cost]").prop("disabled",true);
	$("#status").html(">> EXECUTING COMMAND...");
	payload.setCurrentTags(payload.getCurrentTags()-cost);
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
	let logEntry = terminal.getLogEntry(logIndex);
	
	let actionCost;
	let buttonActions = [];
	
	if(action === "reassign")
	{
		actionCost = 2;
		$("#popup").html("Reassign Log Entry of User " + logEntry + " to the below username for 2 Tags?<br/><br/>" +
						 "<input id='newReass' placeholder='Enter New Log Entry Name Here' style='width:100%'></input><br/><br/>" +
						 "NOTE: This Reassignment MAY be used to imitate someone else!");
	}
	else if (action === "wipe")
	{
		actionCost = 1;

		$("#popup").html("Wipe Log Entry of User " + logEntry + " for 1 Tag?");
	}
		
	buttonActions.push({
		text: "Confirm",
		click: function()
		{
			$(this).dialog("close");
			updateAccessLog(logIndex,action,$("#newReass").val());
		}
	});
	
	$("#popup").dialog({
		title: "Confirm " + (action.charAt(0).toUpperCase() + action.slice(1)) + " Action",
		height: "auto",
		width:$("#main").width(),
		buttons: buttonActions,
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
	//brick -> 4 Tags, permanently disable device (until repair?)
	//rigg -> 6 Tags, all files/data on terminal deleted at end of scene
	//root -> 6 Tags, wipe all software/data from device (can install new software if in possession)
}

function termAction(path,action)
{
	let entry = terminal.getEntry(path);
	let category = terminal.getCategory(path);
	let dataType = terminal.getDataType(path.split(">")[0]);
	
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
					executeCommand(path,"unwrap",0);
				}
			});
		
			$("#popup").html((action.charAt(0).toUpperCase() + action.slice(1)) + " \"" + entry.displayName + ": " + entry.title + "\" for no Tags?<br/><br/>WARNING: Unwrapping will trip the ICE, incurring negative effects! Break the ICE instead to avoid these effects.");
		}
		else if(action == "break")
		{
			let actionCost = Math.max(entry[action]-category.repeated,0);
			
			buttonActions.push({
				text: "Confirm",
				click: function()
				{
					$(this).dialog("close");
					executeCommand(path,"break",actionCost);
				}
			});
			
			$("#popup").html((action.charAt(0).toUpperCase() + action.slice(1)) + " \"" + entry.displayName + ": " + entry.title + "\" for " + actionCost + " Tag" + (actionCost == 1 ? "" : "s") + "?");
		}
	}
	else
	{		
		let actionCost = Math.max(entry[action]-category.repeated,0);
		
		dataType.states[entry.state][action].actions.forEach(function(button)
		{
			buttonActions.push({
				text: button.title,
				click: function()
				{
					$(this).dialog("close");
					executeCommand(path,(entry.special == "trap" ? action : button.state),actionCost);
				}
			});
		});

		$("#popup").html((action.charAt(0).toUpperCase() + action.slice(1)) + " \"" + entry.displayName + "\" for " + actionCost + " Tag" + (actionCost == 1 ? "" : "s") + "?");
	}
	
	//https://jqueryui.com/dialog/#modal-confirmation
	$("#popup").dialog({
		title: "Confirm " + (action.charAt(0).toUpperCase() + action.slice(1)) + " Action",
		height: "auto",
		width:$("#main").width(),
		buttons: buttonActions,
		open: function(event,ui)
		{
			let actionCost = entry[action] ? Math.max(entry[action]-category.repeated,0) : 0;
			updateTagDisplay("CONFIRM",payload.getCurrentTags()-actionCost,payload.getCurrentTags());
		},
		close: function(event,ui)
		{
			updateTagDisplay("STANDBY",payload.getCurrentTags());
		}
	});
}