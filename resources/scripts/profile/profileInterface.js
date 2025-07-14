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
		$("input[name='"+$(radio).prop("name")+"']").prop("data-active",false);
		$(radio).prop("data-active",true);
	}
}

function mlEnter(event)
{
	event.preventDefault();

	if(event.key === "Enter")
	{
		mlLogin(event);
	}
}

function mlLogin(event)
{
	event.preventDefault();

	if(($("#mlEmail").val() === "") || ($("#mlPass").val() === ""))
	{
		alert("Please fill both fields!");
	}
	else
	{
		$("#load").removeClass("hidden");

		$("#mlEmail").prop("readonly",true);
		$("#mlPass").prop("readonly",true);
		mlEmail = $("#mlEmail").val();
		mlPass = $("#mlPass").val();

		$.ajax({
			type: "POST",
			dataType: "json",
			url: "resources/scripts/profile/mylarp/myLarpLogin.php",
			data:
			{
				mlEmail: mlEmail,
				mlPass: mlPass
			}
		})
		.done(function(response)
		{
			processLogin(response);
		});
	}
}

function processLogin(loginData)
{
	if(loginData["result"] !== "pass")
	{
		console.log(loginData);
		alert("Login Failed! Please Try Again");

		$("#mlEmail").prop("readonly",false);
		$("#mlPass").prop("readonly",false);

		$("#load").addClass("hidden");
	}
	else
	{
		$("#charSelectModal .modalBodyText").html("");

		if(loginData["charList"].count > 1)
		{
			loginData["charList"].forEach(function(character, index)
			{
				let buttonID = "char" + index;
				$("#charSelectModal .modalBodyText").append("<button id='" + buttonID + "' class='modalButton'>[ " + character["charName"] + " ]</button>");

				$("#" + buttonID).bind("pointerup", function()
				{
					selectCharacter(character["charID"]);
				});
			});
			
			$("#charSelectModal").width($("#main").width());

			$("#charSelectModal .modalHeaderText").html("SELECT CHARACTER PROFILE");
			
			$("#load").addClass("hidden");
			$("#modalBG").css("display","flex");
		}
		else
		{
			selectCharacter(loginData["charList"][0]);
		}
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
			$("#mlEmail").prop("readonly",false);
			$("#mlPass").prop("readonly",false);

			$("#mlPass").val("");
		}
	}
}

function selectCharacter(char)
{
	$("#load").removeClass("hidden");
	closeModal("selected");

	mlEmail = $("#mlEmail").val();
	mlPass = $("#mlPass").val();
	mlCharID = char["charID"];
	mlCharName = char["charName"];

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources/scripts/profile/mylarp/myLarpChar.php",
		data:
		{
			mlEmail: mlEmail,
			mlPass: mlPass,
			mlCharID: mlCharID,
			mlCharName: mlCharName
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
	let funcStrings = {
		initial: "",
		active: "",
		passive: ""
	};

	charData.functions.forEach(function(func)
	{
		let postName = "";

		switch (func.type)
		{
			case("ranked"):
				postName = " " + romanize(func.rank);
				break;
			case("collect"):
			{
				postName = "<ul><li>" + func.caviats.replace(";","</li><li>") + "</li></ul>";
				break;
			}
		}

		let hacking_cat = func.hacking_cat;

		if(func.hacking_cat === "repair")
		{
			hacking_cat = "passive";
		}

		funcStrings[hacking_cat] += "<li>" + func.name + postName + "</li>";
	});

	Object.keys(funcStrings).forEach(function(category)
	{
		$("#" + category + "List").html(funcStrings[category]);

		$("#" + category + "Header").removeClass("hidden");
		$("#" + category + "List").removeClass("hidden");
	});
	*/

	charData["items"].forEach(function(item)
	{
		let inputID = "#item_" + item["item_abbr"];

		setItemCharges(item["item_abbr"], item["count"]);

		$(inputID).prop("checked",true);
		$("input[name='"+$(inputID).prop("name")+"']").prop("data-active",false);
		$(inputID).prop("data-active",true);
	});

	$("#load").addClass("hidden");

	$("#mlPass").val("");

	$(".postLogon").removeClass("hidden");
	$(".mlLoginBox").addClass("hidden");
}

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
		$(".roleBox[data-role='" + target.value + "'] input[disabled]").attr("checked", true);
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

	$(".pathBox[data-path='" + pathID + "']").removeClass("hidden");
}

function selectEntry(target)
{
	$(".funcChoice[data-entry='" + target.dataset["entry"] + "']").prop("disabled", !target.checked);
}

function chooseKeyword(target)
{
	let entry = target.dataset["entry"];
	let kwType = target.dataset["kwtype"];
	let funcType = target.dataset["functype"];

	if(funcType === "unique")
	{
		
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

function statSubmit(event)
{
	event.preventDefault();

	$("#saveText").html("SAVING...");
	$("#saveText").removeClass("hidden");

	// LIST OF ITEMS
	let items = [];
	$(".itemSelect input:checked").each(function(index, item) {
		let itemPush = {
			abbr: $(item).attr("data-abbr")
		}

		let itemCount = $(".itemCount[data-abbr=" + $(item).attr("data-abbr") + "]");
		
		itemPush["count"] = (itemCount.length ? Number($(itemCount[0]).attr("data-charges")) : null);


		items.push(itemPush);
	});

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources/scripts/profile/db/updateInventory.php",
		data:
		{
			userID: $("#payloadCharName").attr("data-id"),
			items: items
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