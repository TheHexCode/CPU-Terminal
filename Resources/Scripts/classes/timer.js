class Timer
{
    #lcdElement;
    #timerInterval = null;

    #baseDate;
    #elapse = 0;

    #pause = false;

    constructor(lcdID)
    {
        this.#lcdElement = lcdID;
    }
    
    #interval(maxTime)
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
                
                //$("#playPause").prop("disabled",true);
                
                //return endTimer(context,callback);
            }
            
            let readTime = Math.max(maxTime-this.#elapse,0);
            
            let min = tens(parseInt(readTime/60));
            let sec = tens(parseInt(readTime%60));
            let hundsec = tens(parseInt((readTime*100)%100));
            
            //           hundsec < 50
            let colon = (sec % 2 == 0) ? ":" : " ";
            
            let mmss = min + colon + sec;
            
            $(this.#lcdElement + " > .mmss > .FG").html(mmss);
            $(this.#lcdElement + " > .hundsec > .FG").html(hundsec);
        }
    }

    startTimer(maxTime)
    {
        this.#baseDate = Date.now();

        if(!this.#timerInterval)
        {
            this.#elapse = 0;
            this.#timerInterval = setInterval(() => this.#interval(maxTime), 10);
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
}