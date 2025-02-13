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
			itemString += '<img src="resources/images/actions/itemopen.png"/>';
		}

		for(let i = usedCharges; i > 0; i--)
		{
			itemString += '<img src="resources/images/actions/itemfilled.png"/>';
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
			itemString += 					'<img src="resources/images/actions/itemopen.png"/>';
		}

		for(let i = payItem.used; i > 0; i--)
		{
			itemString += 					'<img src="resources/images/actions/itemfilled.png"/>';
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