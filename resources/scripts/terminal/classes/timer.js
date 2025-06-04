class Timer
{
    #timerContainer;
    #timerInterval = null;
    #colon = ":";

    #baseDate;
    #elapse = 0;

    #pause = false;

    constructor(containerID)
    {
        this.#timerContainer = containerID;
        setInterval(() => this.#colonBlink())
    }

    #colonBlink()
    {
        let now = Date.now();

        if(parseInt(now/1000) % 2 == 0)
        {
            this.#colon = ":";
        }
        else
        {
            this.#colon = " ";
        }
    }
    
    #interval(maxTime, callback, callargs=null, results=null)
    {
        if(this.#pause === false)
        {
            let newDate = Date.now();

            let dateDiff = (newDate - this.#baseDate)/1000;
        
            this.#baseDate = newDate;

            this.#elapse += dateDiff;
            
            if(this.#elapse > maxTime)
            {
                clearInterval(this.#timerInterval);
                this.#timerInterval = null;

                if(callargs !== null)
                {
                    if(callargs["global"])
                    {
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: "resources/scripts/terminal/db/updateTerminal.php",
                            data:
                            {
                                actionType: callargs["actionType"],
                                entryID: callargs["entryID"],
                                userID: callargs["userID"],
                                newData: callargs["newData"],
                                oldData: callargs["entryState"]
                            }
                        });
                    }

                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "resources/scripts/terminal/db/userActions.php",
                        data:
                        {
                            userID: callargs["userID"],
                            targetID: callargs["entryID"],
                            action: callargs["upperAction"],
                            newState: callargs["newData"],
                            actionCost: callargs["actionCost"],
                            global: callargs["global"]
                        }
                    });
                    
                    //Decks don't use a timer
                    /*
                    if(callargs["actionType"] === "item")
                    {
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: "resources/scripts/terminal/db/useItems.php",
                            data:
                            {
                                userID: callargs["userID"],
                                effectIDs: callargs["entryID"],
                                termID: callargs["newData"]
                            }
                        })
                    }
                    */

                    if(results !== null)
                    {
                        callargs["results"] = results.responseJSON;
                    }
                }

                callback(callargs);
            }
        }

        let readTime = Math.max(maxTime-this.#elapse,0);
            
        let min = tens(parseInt(readTime/60));
        let sec = tens(parseInt(readTime%60));
        let hundsec = tens(parseInt((readTime*100)%100));
        
        let mmss = min + this.#colon + sec;
        
        $(this.#timerContainer + " .mmss > .FG").html(mmss);
        $(this.#timerContainer + " .hundsec > .FG").html(hundsec);
    }

    startTimer(maxTime, callback, callargs=null)
    {
        this.#baseDate = Date.now();

        if(!this.#timerInterval)
        {
            this.#elapse = 0;
            this.#pause = false;

            let results = null;
            
            if(callargs !== null)
            {
                if((callargs["actionType"] === "entry") || (callargs["actionType"] === "ice"))
                {
                    results = $.getJSON(
                        "resources/scripts/terminal/db/getEntryUpdate.php",
                        { id: callargs["entryID"], newState: callargs["newData"] }
                    );
                }
            }

            this.#timerInterval = setInterval(() => this.#interval(maxTime, callback, callargs, results), 10);
        }
        else
        {
            this.#pause = false;
        }
    }

    skipTimer(callback, callargs=null)
    {
        let results = null;
            
        if(callargs !== null)
        {
            if((callargs["actionType"] === "entry") || (callargs["actionType"] === "ice"))
            {
                results = $.getJSON(
                    "resources/scripts/terminal/db/getEntryUpdate.php",
                    { id: callargs["entryID"], newState: callargs["newData"] }
                )
                .done(function()
                {
                    if(callargs["global"])
                    {
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: "resources/scripts/terminal/db/updateTerminal.php",
                            data:
                            {
                                actionType: callargs["actionType"],
                                entryID: callargs["entryID"],
                                newData: callargs["newData"],
                                oldData: callargs["entryState"]
                            }
                        });
                    }

                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "resources/scripts/terminal/db/userActions.php",
                        data:
                        {
                            userID: callargs["userID"],
                            targetID: callargs["entryID"],
                            action: callargs["upperAction"],
                            newState: callargs["newData"],
                            actionCost: callargs["actionCost"],
                            global: callargs["global"]
                        }
                    });

                    if(callargs["actionType"] === "item")
                    {
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: "resources/scripts/terminal/db/useItems.php",
                            data:
                            {
                                userID: callargs["userID"],
                                effectIDs: callargs["entryID"],
                                termID: callargs["newData"]
                            }
                        })
                    }

                    callargs["results"] = results.responseJSON;

                    callback(callargs);
                });
            }
            else
            {
                if(callargs["global"])
                {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "resources/scripts/terminal/db/updateTerminal.php",
                        data:
                        {
                            actionType: callargs["actionType"],
                            entryID: callargs["entryID"],
                            newData: callargs["newData"],
                            oldData: callargs["entryState"]
                        }
                    });
                }

                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "resources/scripts/terminal/db/userActions.php",
                    data:
                    {
                        userID: callargs["userID"],
                        targetID: callargs["entryID"],
                        action: callargs["upperAction"],
                        newState: callargs["newData"],
                        actionCost: callargs["actionCost"],
                        global: callargs["global"]
                    }
                });

                if(callargs["actionType"] === "deck")
                {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "resources/scripts/terminal/db/useItems.php",
                        data:
                        {
                            userID: callargs["userID"],
                            effectIDs: payload.getEffect(callargs["entryID"])["id"],
                            termID: callargs["newData"]
                        }
                    })
                }

                callback(callargs);
            }
        }
        else
        {
            callback(callargs);
        }
    }

    pauseTimer()
    {
        this.#pause = Date.now();
    }

    killTimer()
    {
        clearInterval(this.#timerInterval);
        this.#timerInterval = null
    }

    isAlive()
    {
        return !(this.#timerInterval === null);
    }
}