class Timer
{
    #lcdElement;
    #timerInterval = null;
    #colon = ":";

    #baseDate;
    #elapse = 0;

    #pause = false;

    constructor(lcdID)
    {
        this.#lcdElement = lcdID;
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
    
    #interval(maxTime, callback, callargs, results)
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

                //if global = true, run interrupt script IMMEDIATELY

                callargs["results"] = results.responseJSON;

                if(callargs["global"])
                {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "resources\\scripts\\db\\terminalInterrupt.php",
                        data:
                        {
                            termID: callargs["results"]["terminal_id"],
                            entryID: callargs["entryID"],
                            newState: callargs["newState"]
                        }
                    });
                }

                callback(callargs);
            }
        }

        let readTime = Math.max(maxTime-this.#elapse,0);
            
        let min = tens(parseInt(readTime/60));
        let sec = tens(parseInt(readTime%60));
        let hundsec = tens(parseInt((readTime*100)%100));
        
        let mmss = min + this.#colon + sec;
        
        $(this.#lcdElement + " > .mmss > .FG").html(mmss);
        $(this.#lcdElement + " > .hundsec > .FG").html(hundsec);
    }

    startTimer(maxTime, callback, callargs)
    {
        this.#baseDate = Date.now();

        if(!this.#timerInterval)
        {
            this.#elapse = 0;

            let results = $.getJSON(
                "resources\\scripts\\db\\getEntryUpdate.php",
                { id: callargs["entryID"], newState: callargs["newState"] }
            );

            this.#timerInterval = setInterval(() => this.#interval(maxTime, callback, callargs, results), 10);
        }
        else
        {
            this.#pause = false;
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
}