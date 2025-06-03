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
			selectCharacter(loginData["charList"][0]["charID"]);
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

function selectCharacter(charID)
{
	$("#load").removeClass("hidden");
	closeModal("selected");

	mlEmail = $("#mlEmail").val();
	mlPass = $("#mlPass").val();
	mlCharID = charID;

	$.ajax({
		type: "POST",
		dataType: "json",
		url: "resources/scripts/profile/mylarp/myLarpChar.php",
		data:
		{
			mlEmail: mlEmail,
			mlPass: mlPass,
			mlCharID: mlCharID
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

	charData["items"].forEach(function(item)
	{
		let inputID = "#item_" + item["item_id"];

		setItemCharges(item["item_id"], item["count"]);

		$(inputID).prop("checked",true);
		$("input[name='"+$(inputID).prop("name")+"']").prop("data-active",false);
		$(inputID).prop("data-active",true);
	});

	$("#load").addClass("hidden");

	$("#mlPass").val("");

	$(".postLogon").removeClass("hidden");
	$(".mlLoginBox").addClass("hidden");
}

function setItemCharges(itemID, charges)
{
	$(".itemCount[data-id='" + itemID + "']").attr("data-charges", charges);
	$(".itemCount[data-id='" + itemID + "'] .countSum").html(charges);

	let chargeImages = $(".itemCount[data-id='" + itemID + "']").find("img");

	for(let i = 0; i < charges; i++)
	{
		$(chargeImages[i]).attr("src","resources/images/actions/itemopen.png");
	}

	for(let j = charges; j < chargeImages.length; j++)
	{
		$(chargeImages[j]).attr("src","resources/images/actions/itemfilled.png");
	}


	$(".itemCount[data-id='" + itemID + "']").removeClass("hidden");
}

function changeItemCharges(itemID, change)
{
	let target = $(".itemCount[data-id='" + itemID + "']")[0];

	if(target !== undefined)
	{
		let currentCharges = Number($(target).attr("data-charges"));
		let maxCharges = $(target).find("img").length;
		let newCharges = Math.max(0, Math.min(maxCharges, currentCharges + change));

		setItemCharges(itemID, newCharges);
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
			id: Number($(item).attr("data-id"))
		}

		let itemCount = $(".itemCount[data-id=" + $(item).attr("data-id") + "]");
		
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