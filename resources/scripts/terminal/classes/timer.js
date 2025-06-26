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
                        this.#updateTerminal(callargs);
                    }

                    this.#userActions(callargs);

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
                        "/resources/scripts/terminal/db/getEntryUpdate.php",
                        { id: callargs["targetID"], newState: callargs["buttonData"] }
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
                    "/resources/scripts/terminal/db/getEntryUpdate.php",
                    { id: callargs["targetID"], newState: callargs["buttonData"] }
                )
                .done(function()
                {
                    if(callargs["global"])
                    {
                        this.#updateTerminal(callargs);
                    }

                    this.#userActions(callargs);

                    if(callargs["actionType"] === "item")
                    {
                        this.#useItems(callargs);
                    }

                    callargs["results"] = results.responseJSON;

                    callback(callargs);
                });
            }
            else
            {
                if(callargs["global"])
                {
                    this.#updateTerminal(callargs);
                }

                this.#userActions(callargs);

                if(callargs["actionType"] === "item")
                {
                    this.#useItems(callargs);
                }

                callback(callargs);
            }
        }
        else
        {
            callback(callargs);
        }
    }

    #updateTerminal(callargs)
    {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/resources/scripts/terminal/db/updateTerminal.php",
            data:
            {
                actionType: callargs["actionType"],
                targetID: callargs["targetID"],
                userID: callargs["userID"],
                newData: callargs["buttonData"],
                oldData: callargs["currentState"]
            }
        });
    }

    #userActions(callargs)
    {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/resources/scripts/terminal/db/userActions.php",
            data:
            {
                userID: callargs["userID"],
                targetID: callargs["targetID"],
                action: callargs["action"],
                actionType: callargs["actionType"],
                newState: callargs["buttonData"],
                actionCost: callargs["actionCost"],
                global: callargs["global"]
            }
        });
    }

    #useItems(callargs)
    {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/resources/scripts/terminal/db/useItems.php",
            data:
            {
                userID: callargs["userID"],
                effects: callargs["targetID"],
                termID: callargs["buttonData"]
            }
        });
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