$(document).ready(function()
{
	$("input[type='checkbox']").prop("checked",false);

	$.ajaxSetup({ cache: false });

	let suffix = new URLSearchParams(window.location.search);
	
	//let iconJSON = $.getJSON("resources\\schemas\\icons.json");
	//let termJSON = $.getJSON("data\\"+suffix.get("id")+"\\terminal.json");
	//let accessLog = $.getJSON("resources\\scripts\\files\\checklogs.php",{ suffixID: suffix.get("id") });
	//let itemJSON = $.getJSON("resources\\schemas\\items.json");

    let termJSON = $.getJSON("resources\\scripts\\db\\getTerm.php",{ id: suffix.get("id") });

	$.when(termJSON).done(function()
	{
		console.log(termJSON.responseJSON);
	});

});