class Modal
{
    static ACTION = "action";
    
    #modalType;
    #background;
    #modal;
    #overlay;
    #headerRow;
    #headerText;
    #bodyBox;
    #timerBox;
    #modalTimer;
    #bodyText;
    #buttonRow;

    constructor(modalType)
    {
        this.#modalType = modalType;
        this.#background = $("#modalBG")[0];
        this.#modal = $(".modalBox")[0];
        this.#overlay = $(".modalOverlay")[0];
        this.#headerRow = $(".modalHeaderRow")[0];
        this.#headerText = $(".modalHeaderText")[0];
        this.#bodyBox = $(".modalBody")[0];
        this.#timerBox = $("#modalBodyTimer")[0];
        this.#bodyText = $(".modalBodyText")[0];
        this.#modalTimer = new Timer("#modalBodyTimer");
        this.#buttonRow = $(".modalButtonRow")[0];
    }

    #displayModal()
    {
        $(this.#modal).width($("#main").width());
        
		$("#load").addClass("hidden");
        $(this.#background).css("display","flex");
    }

    clearModal()
    {
        this.#modalTimer.killTimer();

        $(this.#background).css("display","none");

		$(this.#modal).attr("data-type", "");
		$(this.#modal).attr("data-id", "");
        $(this.#modal).removeClass("ice");
		
		$(this.#overlay).removeClass("blink");
		$(this.#overlay).addClass("hidden");

		$(this.#headerRow).removeClass("dimmed");
		$(this.#headerText).html("");

		$(this.#bodyBox).removeClass("dimmed");
		$(this.#timerBox).addClass("hidden");
		$(this.#bodyText).html("");
		$(this.#bodyText).addClass("hidden");

		$(this.#buttonRow).removeClass("dimmed");
		$(this.#buttonRow).attr("data-mode","none");
		$(this.#buttonRow).html("");
    }

    interruptModal()
    {
        this.#modalTimer.killTimer();

        $(this.#modal).children(":not(.modalOverlay)").addClass("dimmed");
        $(this.#modal).children(".modalOverlay").removeClass("hidden");
        $(this.#modal).children(".modalOverlay").addClass("blink");
        $("#" + this.#modal.id + " button").prop("disabled", true);
    }

    showConfirmPage(actionMap, confirmMap)
    {
        this.clearModal();

        $(this.#modal).attr("data-type", actionMap["actionType"]);
	    $(this.#modal).attr("data-id", actionMap["targetID"]);

        if(actionMap["actionType"] === "ice")
        {
            $("#actionModal").addClass("ice");
        }

        $("#actionModal .modalHeaderText").html(confirmMap["headerText"]);

        $(this.#bodyText).html(confirmMap["bodyText"]);
        $(this.#bodyText).removeClass("hidden");

        $(this.#buttonRow).attr("data-mode","confirm");

        /********************************
         BUTTON ARRAY ITEMS REQUIRE:
          - id
          - text
          - data
          - global
        *********************************/
        confirmMap["buttonArray"].forEach(function(button)
        {
            $(this.#buttonRow).append("<button id='" + button.id + "' class='modalButton'>" + button.text + "</button>");
                
            $("#" + button.id).bind("pointerup", function()
            {
                let buttonData = button.data;

                if(actionMap["action"] === "reass")
                {
                    buttonData = ($("#reassInput").val() === "" ? "Anonymous User" : $("#reassInput").val());
                };

                actionMap["buttonData"] = buttonData;
                actionMap["global"] = button.global;

                executeAction(actionMap, confirmMap["executeHeader"]);
            });
        }, this);

        this.#displayModal();
    }

    showExecutePage(actionMap, executeMap)
    {
        $(this.#modal).width($("#main").width());

		$(this.#buttonRow).html("");
		$(this.#buttonRow).append("<button id='executeButton' class='modalButton'>HOLD TO EXECUTE</button>");

        switch(executeMap["petStage"])
        {
            case(1):
            {
                $(this.#buttonRow).append("<button id='digiPetButton' class='modalButton' disabled>YOUR DIGIPET IS STILL UNHATCHED!<br/>PLAY WITH IT TO USE IT!</button>");
                break;
            }
            case(2):
            {
                $(this.#buttonRow).append("<button id='digiPetButton' class='modalButton'>ACTIVATE DIGIPET?<br/>(1/SCENE)</button>");
                break;
            }
            case(3):
            {
                $(this.#buttonRow).append("<button id='digiPetButton' class='modalbutton' disabled>YOUR DIGIPET IS ALL TUCKERED OUT!<br/>LET IT REST UNTIL NEXT SCENE");
                break;
            }
        }

        $("#executeButton").on("pointerdown", {this: this}, function(event)
		{
			event.preventDefault();

			if(!$("#executeButton").prop("disabled"))
			{
				$("#executeButton").addClass("active");

				event.data.this.#modalTimer.startTimer(executeMap["maxTime"],completeAction,actionMap);
			}
		});
		$("#executeButton").on("pointerup pointerleave pointerout",  {this: this}, function(event)
		{
            event.preventDefault();

			if(!$("#executeButton").prop("disabled"))
			{
				$("#executeButton").removeClass("active");

				event.data.this.#modalTimer.pauseTimer();
			}
		});
		$("#executeButton").on("contextmenu",  function(event)
		{
			if(event.originalEvent.pointerType === "touch")
			{
				event.preventDefault();
				$("#executeButton").trigger("pointerdown");
			}
		});

        $("#digiPetButton").on("pointerup", {this: this}, function(event)
		{
			$("#digiPetButton").remove();
			//!! Dancing Digipet Animation
			$("#executeButton").prop("disabled", true);

			actionMap["digipet"] = true;

			event.data.this.#modalTimer.startTimer(executeMap["maxTime"],completeAction,actionMap);
		});

        $(this.#headerText).html(executeMap["headerText"]);

		$(this.#bodyText).addClass("hidden");

		$("#" + this.#timerBox.id + " .mmss .FG").html(mmss(executeMap["maxTime"]));
		$("#" + this.#timerBox.id + " .hundsec .FG").html("00");
		$(this.#timerBox).removeClass("hidden");

		$(this.#buttonRow).attr("data-mode","execute");
		
        this.#displayModal();
    }

    skipExecutePage(actionMap)
    {
        $("#load").removeClass("hidden");

        this.#modalTimer.skipTimer(completeAction,actionMap);
    }
}