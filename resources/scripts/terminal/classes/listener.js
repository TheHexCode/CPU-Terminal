class Listener
{
    #listenID;

    static testConnection()
    {
        $.ajax({
            type: "GET",
            dataType: "text",
            url: "resources/scripts/terminal/listener/listen_test.php",
            timeout: 0
        })
        .fail(function(ajax)
        {
            console.error(ajax);
            $("#serverStatus").attr("src","resources/images/status/server_off.png");
        })
        .done(function()
        {
            $("#serverStatus").attr("src","resources/images/status/server_on.png");
        });
    }

    constructor(listenerID)
    {
        this.#listenID = listenerID;

        this.#listenForUpdates();
    }

    #listenForUpdates()
    {
        var thisClass = this;

        $.ajax({
            type: "GET",
            dataType: "json",
            url: "resources/scripts/terminal/listener/listen_client.php",
            timeout: 0
        })
        .fail(function(ajax)
        {
            switch(ajax.status)
            {
                case(504): // TIMEOUT
                    thisClass.#listenForUpdates();
                    break;
                case(537): // LISTEN SERVER DOWN
                    console.error(ajax.responseText);
                    $("#serverStatus").attr("src","resources/images/status/server_off.png");
                    break;
                case(200): // PARSER ERROR?
                    if(ajax.statusText === "parsererror")
                    {
                        if(ajax.responseText === "ttfn") // SERVER PURPOSEFULLY SHUT DOWN
                        {
                            console.warn("Listen server shut down to switch jobs. Please close this window.");
                        }
                        else // UNKNOWN ERROR
                        {
                            console.error(ajax);
                        }
                    }
                    else // UNKNOWN ERROR
                    {
                        console.error(ajax);
                    }

                    $("#serverStatus").attr("src","resources/images/status/server_off.png");
                    break;
                default: // UNKNOWN ERROR
                    console.error(ajax);
                    $("#serverStatus").attr("src","resources/images/status/server_off.png");
                    break;
            }
        })
        .done(function(update)
        {
            thisClass.#processUpdate(update);
            thisClass.#listenForUpdates();
        });
    }

    #processUpdate(update)
    {
        let actionType = update["actionType"];
        let entryID = update["entryID"];
        let userID = update["userID"];
        let newData = update["newData"];

        if(userID !== this.#listenID)
        {
            //don't need "rig" or "rooted"

            console.log(update);

            switch(actionType)
            {
                case("entry"):
                    //getEntryUpdate()
                    let entryJSON = $.getJSON(
                        "resources/scripts/terminal/db/getEntryUpdate.php",
                        {
                            id: entryID,
                            newState: newData,
                            action: actionType,
                            actionUser: userID,
                            userID: this.#listenID
                        }
                    )
                    .done(function() {
                        //check for open modal that is targeting this entry
                        //if so, X out modal, update, and close modal when update is finished
                        let modal = $("#actionModal")[0];

                        if((($(modal).attr("data-type") === "entry") || ($(modal).attr("data-type") === "ice")) && (Number($(modal).attr("data-id")) === entryID))
                        {
                            // X OUT MODAL, DISABLE BUTTONS
                            mbTimer.killTimer();


                            $(modal).addClass("dimmed");
                            $("#actionModal button").prop("disabled", true);
                        }

                        let resultJSON = entryJSON.responseJSON;

                        $(resultJSON["entryPath"] + " > .entryTitleBar > .entryMaskContainer").html(resultJSON["title"]);
                        $(resultJSON["entryPath"] + " > .entryContentsBar > .entryMaskContainer").html(resultJSON["contents"]);
                        $(resultJSON["entryPath"] + " > .entryIntContainer > .accessInterface").html(resultJSON["access"]);
                        $(resultJSON["entryPath"] + " > .entryIntContainer > .modifyInterface").html(resultJSON["modify"]);
                        $(resultJSON["entryPath"] + " > .subIce").removeClass("subIce");

                        if((($(modal).attr("data-type") === "entry") || ($(modal).attr("data-type") === "ice")) && (Number($(modal).attr("data-id")) === entryID))
                        {
                            closeModal("interrupted");
                        }
                    });
                    break;
                case("log"):
                    //check for open modal that is targeting this log entry
                    //if so, X out modal, update, and close modal
                    // NOTE: THIS NEEDS TO BE TRIGGERED WHEN A NEW USER CONNECTS AND ADDS A NEW LOG!!
                    break;
                case("brick"):
                    //switch to Bricked terminal, after maybe a second of freeze-up?
                    break;
                case("root"):
                    //switch to Rooting terminal
                    break;
            }
        }
    }
}