class Listener
{
    #listenID;

    constructor(listenerID)
    {
        this.#listenID = listenerID;
    }

    #listenForUpdates()
    {
        var thisClass = this;
        
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "listener/listen_client.php"
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

            switch(actionType)
            {
                case("entry"):
                    //getEntryUpdate()
                    //check for open modal that is targeting this entry
                    //if so, X out modal, update, and close modal when update is finished
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