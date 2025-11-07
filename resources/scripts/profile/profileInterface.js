function romanize(num)
{
	let roman = "";

	let numeralMap = {
		 M: 1000,
		CM: 900,
		 D: 500,
		CD: 400,
		 C: 100,
		XC: 90,
		 L: 50,
		XL: 40,
		 X: 10,
		IX: 9,
		 V: 5,
		IV: 4,
		 I: 1
	}

	for (i in numeralMap)
	{
		while (num >= numeralMap[i])
		{
			roman += i;
			num -= numeralMap[i];
		}
	}

	return roman;
}

function toggleRadio(radio)
{
	if($(radio).prop("data-active"))
	{
		$(radio).prop("data-active",false);
		$(radio).prop("checked",false);
	}
	else
	{
		$('input[name="'+$(radio).prop('name')+'"]').prop("data-active",false);
		$(radio).prop("data-active",true);
	}
}

function lmEnter(event)
{
	event.preventDefault();

	if(event.key === "Enter")
	{
		lmLogin(event);
	}
}

function lmLogin(event)
{
	event.preventDefault();

	if(($("#lmEmail").val() === "") || ($("#lmPass").val() === ""))
	{
		alert("Please fill both fields!");
	}
	else
	{
		$("#load").removeClass("hidden");

		$("#lmEmail").prop("readonly",true);
		$("#lmPass").prop("readonly",true);
		lmEmail = $("#lmEmail").val();
		lmPass = $("#lmPass").val();

		$.ajax({
			type: "POST",
			dataType: "json",
			url: "resources/scripts/profile/larpmanager/lmLogin.php",
			data:
			{
				lmEmail: lmEmail,
				lmPass: lmPass
			}
		})
		.done(function(response)
		{
			processLogin(response);
		})
		.fail(function(response)
		{
			/*
			console.log(response);
			alert("Login Failed! Please Try Again");

			$("#lmEmail").prop("readonly",false);
			$("#lmPass").prop("readonly",false);

			$("#load").addClass("hidden");
			*/
			processLogin(JSON.parse('[{"id":30,"name":"Puck"}]'))
		});
	}
}

function processLogin(loginData)
{
	$("#charSelectModal .modalBodyText").html("");

	if(loginData.length > 1)
	{
		loginData.forEach(function(character, index)
		{
			let buttonID = "char" + index;
			$("#charSelectModal .modalBodyText").append("<button id='" + buttonID + "' class='modalButton'>[ " + character["name"] + " ]</button>");

			$("#" + buttonID).bind("pointerup", function()
			{
				selectCharacter(character);
			});
		});

		$("#charSelectModal").width($("#main").width());

		$("#charSelectModal .modalHeaderText").html("SELECT CHARACTER PROFILE");

		$("#load").addClass("hidden");
		$("#modalBG").css("display","flex");
	}
	else
	{
		selectCharacter(loginData[0]);
	}
}

function closeModal(event)
{
	if((event.type !== "keyup") || (event.key === "Escape"))
	{
		$("#modalBG").css("display","none");

		$("#charListModal .modalHeaderText").html("");

		$("#charListModal .modalBodyText").html("");

		if(event !== "selected")
		{
			$("#lmEmail").prop("readonly",false);
			$("#lmPass").prop("readonly",false);

			$("#lmPass").val("");
		}
	}
}

function selectCharacter(char)
{
	$("#load").removeClass("hidden");
	closeModal("selected");

	lmEmail = $("#lmEmail").val();
	lmPass = $("#lmPass").val();
	lmCharID = char["id"];
	lmCharName = char["name"];

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources/scripts/profile/larpmanager/lmChar.php",
		data:
		{
			lmEmail: lmEmail,
			lmPass: lmPass,
			lmCharID: lmCharID,
			lmCharName: lmCharName
		}
	})
	.done(function(response)
	{
		processCharInfo(response);
	});
}

function processCharInfo(charData)
{
	console.log(charData);

	$("#payloadCharName").html(charData.name);
	$("#payloadCharName").attr("data-id", charData.id);
	setClamp($("#payloadCharName"),"100%","200%");

	$("#payloadCodeRow .FG").html(charData.userCode);

	/*
	charData.discoveries.forEach(function(discovery)
	{
		switch(discovery["disc_type"])
		{
			case("role"):
			{
				$(".originOption input[value='" + discovery["disc_id"] + "']").parent().removeClass("hidden");
				$("#roleSelect option[value='" + discovery["disc_id"] + "']").removeClass("hidden");
				break;
			}
			case("know"):
			{
				$(".funcChoice[data-kwtype='knowledge'] option[value='" + discovery["disc_id"] + "']").removeClass("hidden");
				break;
			}
		}
	});

	if(charData.origin !== null)
	{
		$(".originOption input[value='" + charData.origin + "']").attr("checked", true);
		$(".originOption input[value='" + charData.origin + "']").prop("checked", true);

		changeOrigin($(".originOption input[value='" + charData.origin + "']")[0]);
	}

	charData.functions.forEach(function(func)
	{
		$(".entrySelect input[data-entry='" + func.entry_id + "']").prop("checked", true);
		selectEntry($(".entrySelect input[data-entry='" + func.entry_id + "']")[0]);

		if($(".funcName[data-id='" + func.function_id + "'] select").length > 0)
		{
			$(".funcName[data-id='" + func.function_id + "'] select .funcOption[value='" + (func.keyword_id === 0 ? "blank" : func.keyword_id) + "']").prop("selected", true);
			chooseKeyword($(".funcName[data-id='" + func.function_id + "'] select")[0]);
		}
	});
	*/

	let funcStrings = {
		initial: [],
		active: [],
		passive: [],
		other: []
	};

	let funcKeywords = [];

	charData.functions.forEach(function(func)
	{
		let postName = "";

		switch (func.type)
		{
			case("ranked"):
			{
				postName = " " + romanize(func.rank);
				break;
			}
			case("charges"):
			{
				postName = " x" + func.rank;
			}
		}

		if(func.keyword !== null)
		{
			let funcKeyword = funcKeywords.find(function(keyworded_func)
			{
				return keyworded_func.name === func.name;
			});

			if(funcKeyword === undefined)
			{
				funcKeywords.push(
					{
						"name": func.name,
						"keywords": []
					}
				);

				funcKeyword = funcKeywords.find(function(keyworded_func)
				{
					return keyworded_func.name === func.name;
				});
			};

			keyword_name = func.keyword.split(";");

			keyword = {
				"keyword_name": keyword_name[0],
				"count": keyword_name.length
			}

			funcKeyword["keywords"].push(keyword);
		}

		let hacking_cat = "";

		switch(func.hacking_cat)
		{
			case(null):
			{
				hacking_cat = "other";
				break;
			}
			case("repair"):
			{
				hacking_cat = "passive";
				break;
			}
			default:
			{
				hacking_cat = func.hacking_cat;
				break;
			}
		};

		funcStrings[hacking_cat].push("<li>" + func.name + postName + "<ul class='lmFuncKWList hidden' data-func='" + func.name + "'></ul></li>");
	});

	Object.keys(funcStrings).forEach(function(category)
	{
		uniqueCategory = [...new Set(funcStrings[category])];
		$("#" + category + "List").html(uniqueCategory.join(""));

		$("#" + category + "Header").removeClass("hidden");
		$("#" + category + "List").removeClass("hidden");
	});

	funcKeywords.forEach(function(keyworded_func)
	{
		funcList = $(".lmFuncKWList[data-func='" + keyworded_func.name + "']");
		funcList.removeClass("hidden");

		//<li>[Choice] *2</li>
		//<li>Law</li>
		keyworded_func["keywords"].forEach(function(keyword)
		{
			funcList.append("<li>" + keyword.keyword_name + (keyword.count > 1 ? " *" + keyword.count : "") + "</li>");
		});

	});

	charData["items"].forEach(function(item)
	{
		if(item["instanceKey"] === "")
		{
			let itemInput = $('input[data-item="' + item['name'] + '"][data-tier="' + item['tier'] + '"]')[0];

			//setItemCharges(item["item_abbr"], item["count"]);

			$(itemInput).prop("checked",true);
			$('input[name="'+$(itemInput).prop('name')+'"]').prop("data-active",false);
			$(itemInput).prop("data-active",true);
		}
		else
		{
			addItemSelectRow($(".itemSelectGrid[data-item='" + item['name'].toLowerCase() + "_t" + item['tier'] + "'] .itemSelectRow:last-child .itemSelectRowButton")[0], {key: item["instanceKey"], value: item["instanceValue"]});
		}
	});

	$("#load").addClass("hidden");

	$("#lmPass").val("");

	$(".postLogon").removeClass("hidden");
	$(".lmLoginBox").addClass("hidden");
}

function addItemSelectRow(target, selected=null)
{
	let targetRow = Number(target.dataset["row"]);
	let targetParent = $(target).parent()[0];
	let targetGrid = $(target).parents(".itemSelectGrid")[0];

	let prototypeHTML = $(targetGrid).children(".itemSelectPrototype")[0].innerHTML;

	prototypeHTML = prototypeHTML.replaceAll("!ROW!", targetRow);
	let newTargetHTML = targetParent.outerHTML.replaceAll("\"" + targetRow + "\"", "\"" + (targetRow + 2) + "\"").replaceAll(":" + targetRow + ";", ":" + (targetRow + 2) + ";");

	$(targetParent).html(prototypeHTML);
	$(targetGrid).append(	"<div class='itemSelectHRBox' data-row='" + (targetRow + 1) + "' style='grid-row:" + (targetRow + 1) + ";' >" +
								"<div class='itemSelectHRBG'></div>" +
								"<hr class='itemSelectHR' />" +
								"<div class='itemSelectHRBlur'></div>" +
							"</div>");
	$(targetGrid).append(newTargetHTML);

	if(selected !== null)
	{
		$(targetParent).children(".itemSelectInput[data-key='" + selected["key"]+ "']").children("option[value='" + selected["value"] + "']").prop("selected", true).attr("selected", true);
	}
}

function delItemSelectRow(target)
{
	let targetRow = Number(target.dataset["row"]);

	let targetParent = $(target).parent()[0];
	let targetHR = $(targetParent).prev()[0];

	$(targetParent).remove();
	$(targetHR).remove();
}

/*
function changeOrigin(target)
{
	let oldValue = $(".originOption input").toArray().find(function(origin)
	{
		return $(origin).prop("data-active") === true;
	}).value;

	$(".originOption input").each(function()
	{
		$(this).prop("data-active", false);
		$("#roleSelect option[value='" + this.value + "']").addClass("hidden");
	});

	$("#roleSelect option").attr("selected",false);
	$("#roleSelect option[value='" + target.value + "']").removeClass("hidden");
	$("#roleSelect option[value='" + target.value + "']").attr("selected", true);
	$(target).prop("data-active", true);

	changeRole(target, oldValue);
}

function changeRole(target, wipeOld=null)
{
	$(".roleBox").addClass("hidden");
	$(".pathBox").addClass("hidden");

	if(wipeOld !== null)
	{
		$(".roleBox[data-role='" + wipeOld + "'] input").attr("checked", false);
		$(".roleBox[data-role='" + wipeOld + "'] input").prop("checked", false);
		$(".roleBox[data-role='" + wipeOld + "'] input").each(function(index, input)
		{
			selectEntry(input);
		});

		$(".roleBox[data-role='" + target.value + "'] input[disabled]").attr("checked", true);
		$(".roleBox[data-role='" + target.value + "'] input[disabled]").prop("checked", true);
	}

	$(".roleBox[data-role='" + target.value + "']").removeClass("hidden");

	if($("#pathSelect option[data-role='" + target.value + "']").length > 0)
	{
		$("#pathSelect option").addClass("hidden");
		$("#pathSelect option[value='']").attr("selected", false);
		$("#pathSelect option[value='']").prop("selected", false);

		let allPaths = $("#pathSelect option[data-role='" + target.value + "']");
		$(allPaths).removeClass("hidden");

		let newPath = $(allPaths).toArray().find(function(path)
		{
			let pathCount = 0;

			$(".pathBox[data-path='" + path.value + "'] input").each(function(index, input)
			{
				if($(input).prop("checked"))
				{
					pathCount++;
				}
			});

			return (pathCount > 0);
		}) ?? $(allPaths)[0];

		$(newPath).attr("selected", true);
		$(newPath).prop("selected", true);
		$(".pathBox[data-path='" + newPath.value + "']").removeClass("hidden");

		$("#pathSelect").attr("disabled", false);
	}
	else
	{
		$("#pathSelect option").attr("selected", false);
		$("#pathSelect option").prop("selected", false);
		$("#pathSelect option[value='']").removeClass("hidden");
		$("#pathSelect option[value='']").attr("selected", true);
		$("#pathSelect option[value='']").prop("selected", true);

		$("#pathSelect").attr("disabled", true);
	}
}

function changePath(target)
{
	let pathID = target.value;
	let roleID = $("#pathSelect option[value='" + pathID + "']").attr("data-role");

	$(".pathBox").addClass("hidden");
	$(".roleBox[data-role='" + roleID + "'] .pathBox input").attr("checked", false);
	$(".roleBox[data-role='" + roleID + "'] .pathBox input").prop("checked", false);
	$(".roleBox[data-role='" + roleID + "'] .pathBox input").each(function(index, input)
	{
		selectEntry(input);
	});

	$(".pathBox[data-path='" + pathID + "']").removeClass("hidden");
}

function selectEntry(target)
{
	if(!target.checked)
	{
		$(".funcChoice[data-entry='" + target.dataset["entry"] + "'] .funcOption[value='blank']").prop("selected", true);

		$(".funcChoice[data-entry='" + target.dataset["entry"] + "']").each(function(index,choiceBox)
		{
			chooseKeyword(choiceBox);
		});
	}

	$(".funcChoice[data-entry='" + target.dataset["entry"] + "']").prop("disabled", !target.checked);
}

function chooseKeyword(target)
{
	let entry = target.dataset["entry"];
	let kwType = target.dataset["kwtype"];
	let funcType = target.dataset["functype"];

	let options = target.options;
	let selected = $(target).children(".funcOption[value='" + target.value + "']")[0];

	if(funcType === "unique")
	{
		$(options).each(function(index, option)
		{
			if(!$(option).prop("disabled"))
			{
				$(".funcChoice[data-kwtype='" + kwType + "'] .funcOption[value='" + option.value + "']").prop("disabled", false);
			}

			if(option.value != "blank")
			{
				$("funcChoice[data-kwtype='" + kwType + "'] .funcOption[value='" + target.value + "']").each(function(index, otherOption)
				{
					if((otherOption.value !== "blank") && (otherOption !== selected))
					{
						$(otherOption).prop("disabled", true);
					}
				});
			}
		});
	}
}

function setItemCharges(itemAbbr, charges)
{
	$(".itemCount[data-abbr='" + itemAbbr + "']").attr("data-charges", charges);
	$(".itemCount[data-abbr='" + itemAbbr + "'] .countSum").html(charges);

	let chargeImages = $(".itemCount[data-abbr='" + itemAbbr + "']").find("img");

	for(let i = 0; i < charges; i++)
	{
		$(chargeImages[i]).attr("src","resources/images/actions/itemopen.png");
	}

	for(let j = charges; j < chargeImages.length; j++)
	{
		$(chargeImages[j]).attr("src","resources/images/actions/itemfilled.png");
	}


	$(".itemCount[data-abbr='" + itemAbbr + "']").removeClass("hidden");
}

function changeItemCharges(itemAbbr, change)
{
	let target = $(".itemCount[data-abbr='" + itemAbbr + "']")[0];

	if(target !== undefined)
	{
		let currentCharges = Number($(target).attr("data-charges"));
		let maxCharges = $(target).find("img").length;
		let newCharges = Math.max(0, Math.min(maxCharges, currentCharges + change));

		setItemCharges(itemAbbr, newCharges);
	}

}
*/

function statSubmit(event)
{
	event.preventDefault();

	$("#saveText").html("SAVING...");
	$("#saveText").removeClass("hidden");

	// FUNCTION LIST
	/*
	let origin = $("input[name='origins']:checked").attr("value");
	let functions = [];

	$(".roleBox[data-role='" + origin + "'] .entrySelect input:checked:disabled + label .funcName").each(function(index, freeFunc)
	{
		let funcID = Number(freeFunc.dataset["id"]);
		let kwID;
		let kwType;
		if($(".funcStatic[data-id='" + funcID + "']").length > 0)
		{
			kwID = Number($(".funcStatic[data-id='" + funcID + "']")[0].dataset["kwid"]);
			kwType = $(".funcStatic[data-id='" + funcID + "']")[0].dataset["kwtype"];
		}
		else if ($(".funcChoice[data-id='" + funcID + "']").length > 0)
		{
			kwID = Number($(".funcChoice[data-id='" + funcID + "']")[0].value);
			kwType = $(".funcChoice[data-id='" + funcID + "']")[0].dataset["kwtype"];
		}
		else
		{
			kwID = null;
			kwType = null;
		}

		functions.push({
			"funcID": funcID,
			"kwType": kwType,
			"kwID": kwID
		});
	});

	$(".entrySelect input:checked:not(:disabled) + label .funcName").each(function(index, func)
	{
		let funcID = Number(func.dataset["id"]);
		let kwID;
		let kwType;
		if($(".funcStatic[data-id='" + funcID + "']").length > 0)
		{
			kwID = Number($(".funcStatic[data-id='" + funcID + "']")[0].dataset["kwid"]);
			kwType = $(".funcStatic[data-id='" + funcID + "']")[0].dataset["kwtype"];
		}
		else if ($(".funcChoice[data-id='" + funcID + "']").length > 0)
		{
			kwID = Number($(".funcChoice[data-id='" + funcID + "']")[0].value);
			kwType = $(".funcChoice[data-id='" + funcID + "']")[0].dataset["kwtype"];
		}
		else
		{
			kwID = null;
			kwType = null;
		}

		functions.push({
			"funcID": funcID,
			"kwType": kwType,
			"kwID": kwID
		});
	});

	let originID = Number($("#roleSelect option[selected]")[0].value);
	*/
	// LIST OF ITEMS
	let items = [];
	$('.itemInput input:checked').each(function(index, item)
	{
		let itemPush = {
			name: $(item).attr("data-item"),
			tier: $(item).attr("data-tier"),
			instanceKey: null,
			instanceValue: null
		}

		items.push(itemPush);
	});
	$(".itemSelectRow select").each(function(index, item)
	{
		let instanceValue = item.options[item.selectedIndex].value
		if(instanceValue !== "null")
		{
			let itemPush = {
				name: $(item).attr("data-item"),
				tier: $(item).attr("data-tier"),
				instanceKey: $(item).attr("data-key"),
				instanceValue: Number(instanceValue)
			}

			items.push(itemPush);
		}
	});

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources/scripts/profile/db/updateInventory.php",
		data:
		{
			userID: $("#payloadCharName").attr("data-id"),
			//userOrigin: originID,
			//userFunctions: functions,
			userItems: items
		}
	})
	.done(function()
	{
		$("#saveText").html("SAVED!");

		setTimeout(function(){
			$("#saveText").addClass("hidden");
		},5000);
	});
}