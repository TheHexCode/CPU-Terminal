class Session
{
    #totalTags = 0;
    #payTags = {
        "hack": 0,
        "csb": 0,
        "dissim": 0,
        "clec": 0
    };
    #extTags = {
        "rex": 0,
        "extra": 0
    };
    #minExtra = 0;

    static TOTAL = "total";
    static PAYLOAD = "payload";
    static EXTRA = "extra";

    static HACK = "hack";
    static REX = "rex";
    static BEACON = "csb";
    static DISSIM = "dissim";
    static CLEC = "clec";

    #termID;
    #termState;
    #stateData;

    #entryData;
    #repeatIcons = new Object();

    #touched = false;
    #copyableActions = [];

    constructor(termInfo, initialEntries)
    {
        this.#termID = termInfo["termID"];
        this.#termState = termInfo["termState"];
        this.#stateData = termInfo["stateData"];
        this.#entryData = initialEntries;

        switch(this.#termState)
        {
            case("bricked"):
                this.brickTerminal(this.#stateData);
                break;
            case("rooting"):
                this.rootTerminal();
                break;
            case("rooted"):
                this.terminalRooted();
                break;
        }

        $("footer script").remove();
    }

    
    getEntryData()
    {
        return this.#entryData;
    }

    getTerminalID()
    {
        return this.#termID;
    }

    getExtraTagMin()
    {
        return this.#minExtra;
    }

    setExtraTagMin(minChange)
    {
        this.#minExtra = this.#minExtra + minChange;
    }

    getCurrentTags(tagType = Session.TOTAL)
    {
        switch(tagType)
        {
            case(Session.TOTAL):
                return this.#totalTags;
                break;
            case(Session.PAYLOAD):
                return Math.min(10,Object.values(this.#payTags).reduce(
                        (sum, current) => sum + current,
                    0));
                break;
            case(Session.EXTRA):
                return Object.values(this.#extTags).reduce(
                        (sum, current) => sum + current,
                    0);
                break;
        }
    }

    setCurrentTags(newTags, tagType = Session.TOTAL)
    {
        switch(tagType)
        {
            case(Session.TOTAL):
                this.#totalTags = newTags;
                break;
            case(Session.HACK):
            case(Session.BEACON):
            case(Session.DISSIM):
            case(Session.CLEC):
                this.#payTags[tagType] += newTags;
                this.#totalTags = this.getCurrentTags(Session.PAYLOAD) + this.getCurrentTags(Session.EXTRA);
                break;
            case(Session.EXTRA):
            case(Session.REX):
                this.#extTags[tagType] += newTags;
                this.#totalTags = this.getCurrentTags(Session.PAYLOAD) + this.getCurrentTags(Session.EXTRA);
                break;
        }
    }

    setEntry(entryID)
    {
        $.getJSON(
            "resources/scripts/terminal/db/getEntryState.php",
            { id: entryID }
        )
        .done(this.#setEntryState.bind(this, entryID));
    }

    #setEntryState(entryID, entryJSON)
    {
        let entryIndex = this.#entryData.findIndex(entry => entry.id === Number(entryID));

        this.#entryData[entryIndex] = entryJSON;
    }

    getEntryState(entryID)
    {
        let searchResults = this.#entryData.find(entry => entry.id === Number(entryID));

        return searchResults.state;
    }

    getActionCost(entryID, action)
    {
        let actionCost;

        if(entryID === "nonEntry")
        {
            switch(action)
            {
                case("reass"):
                    actionCost = 2;
                    break;
                case("wipe"):
                    actionCost = 1;
                    break;
                case("brick"):
                    actionCost = 4;
                    break;
                case("rig"):
                case("root"):
                    actionCost = 6;
                    break;
            }
        }
        else
        {
            let searchResults = this.#entryData.find(entry => entry.id === Number(entryID));

            actionCost = Number(searchResults[action]);

            if((searchResults["type"] === "alarm") && (payload.getFunction("ALARM SENSE")))
            {
                actionCost = Math.max(actionCost - 1, 0);
            }

            if(Object.keys(this.#repeatIcons).includes(searchResults["icon"]))
            {
                actionCost = Math.max(actionCost - this.#repeatIcons[searchResults["icon"]][action], 0);
            }

            if((action === "access") && (this.#touched))
            {
                actionCost = Math.max(actionCost - 1, 0);
            }
        }

        actionCost += ((payload.getActiveEffect(19) || payload.getActiveEffect(20)) ? 1 : 0);

        return actionCost;
    }

    setFunctionState(functionName, entryID, entryAction, functionRank)
    {
        let entry = this.#entryData.find(entry => entry.id === Number(entryID));

        switch (functionName)
        {
            case "REPEAT":
                let icon = entry["icon"];

                if((entryAction === "access") || (entryAction === "modify"))
                {
                    if(Object.keys(this.#repeatIcons).includes(icon))
                    {
                        if(this.#repeatIcons[icon][entryAction] === 0)
                        {
                            this.#repeatIcons[icon][entryAction] = functionRank;
                        }
                    }
                    else
                    {
                        let newIcon = {};
                        newIcon["access"] = (entryAction === "access") ? functionRank : 0;
                        newIcon["modify"] = (entryAction === "modify") ? functionRank : 0;
                        this.#repeatIcons[icon] = newIcon;
                    }
                }
                break;
            case "TOUCHED":
                if((entryAction === "access") && (!this.#touched))
                {
                    this.#touched = true;
                }
                break;
        }
    }

    brickTerminal(brickHandle)
    {
        let hexHandle = [];

        for(let i = 0; i < brickHandle.length; i++)
        {
            hexHandle.push(brickHandle.charCodeAt(i).toString(16).padStart(2,0));
        }

        for(let j = brickHandle.length; j < 15; j++)
        {
            hexHandle.push("00");
        }

        $("body").addClass("bricked");

        let stopCode =  "0x000000" + hexHandle[0] + "<br/>" +
                        "(0x" + hexHandle[1] + hexHandle[2] + hexHandle[3] + hexHandle[4] + "," +
                        "0x" + hexHandle[5] + hexHandle[6] + hexHandle[7] + hexHandle[8] + ",<br/>" +
                        "&nbsp;0x" + hexHandle[9] + hexHandle[10] + hexHandle[11] + hexHandle[12] + "," +
                        "0x" + hexHandle[13] + hexHandle[14] + "0000)";

        /*
        <svg id="hexLogo" width="209" height="229" xmlns="http://www.w3.org/2000/svg">
            <mask id="logoMask">
                <polygon points="105,10 195,62 195,167 105,219 15,167 15,62" fill="black" stroke="white" stroke-width="15" /> 
            </mask>
        
            <foreignObject x="0" y="0" width="209" height="229" mask="url(#logoMask)">
                <div id="logoBG"></div>
            </foreignObject>
        </svg>
        */

        $("#main").css("max-width","100%");
        $("#main").html("<div id='logoParagraph'>" +
                            "<img id='hexImg' src=''/>" +
                            "<p>A problem has been detected and HexOS has been shut down to prevent damage to your device.</p>" +
                        "</div>" +
                        "<p>UNMOUNTABLE_BOOT_VOLUME</p>" +
                        "<p>If this is the first time you've seen this error screen, restart your computer. If this screen appears again, follow these steps:" +
                        "<p>Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or software manufacturer for any HexOS updates you might need.</p>" +
                        "<p>If problems continue, disable or remove any newly installed hardware or software. Disable BIOS memory options such as caching or shadowing. If you need to use Safe Mode to remove or disable components, restart your computer, press F8 to select Advanced Startup Options, and then select Safe Mode.</p>" +
                        "<p>Technical Information:</p>" +
                        "<p>*** STOP: " + stopCode + "</p>" +
                        "<p><br/>Beginning dump of physical memory...<br/>" +
                        "Physical memory dump complete.<br/>" +
                        "Contact your system administrator or technical support group for further<br/>" +
                        "assistance.</p>");
    }

    rigTerminal(userID = -1)
    {
        if(this.userID === -1)
        {
            $("#rigged").removeClass("hidden");
        }
        else if ((this.#termState === "rigged") && (this.#stateData === userID))
        {
            $("#rigged").removeClass("hidden");
        }
    }

    rootTerminal(rootStart = null)
    {

        if(rootStart === null)
        {
            rootStart = new Date(this.#stateData * 1000); //PHP Time() is in seconds, not milliseconds
        }

        let rootEnd = new Date(rootStart.getTime() + (5*60000));

        let rootDiff = Math.ceil((rootEnd - Date.now()) / 1000); // Timer needs seconds

        let rootTimer = new Timer("#rootingTimer");
        rootTimer.startTimer(rootDiff,this.terminalRooted,{
            actionType:"rooted",
            global: true,
            entryID: this.#termID,
            newData: null
        });

        $("body").addClass("rooting");
        Gems.updateTagGems(Gems.ROOT,10);

        $("#rootStatus").removeClass("hidden");
        $("#rootingTimer").removeClass("hidden");

        $(".zoneBox").addClass("hidden");
    }

    terminalRooted()
    {
        $("body").removeClass("rooting");

        /*
        $("#main").html("<p>HexOS PXE-2.1 (build 083)<br/>Copyright &copy; 2XX5 -<br/>&nbsp;&nbsp;Hexadecachoron Corporation</p>" +
                        "<p>This Product is covered by one or more of the following patents:<br/>US6,570,884, US6,115,776 and US6,327,625</p>" +
                        "<p>Realtek PCIe GBE Family Controller Series v2.58 (10/08/13)</p>" +
                        "<p>PXE-E61: Media test failure, check cable</p>" +
                        "<p>PXE-M0F: Exiting PXE ROM</p>" +
                        "<p>No Bootable Device Found -- Insert Boot Disk and press any key</p>" +
                        "<p>_</p>");
        */
        $("#main").css("max-width","100%");
        $("#main").html("<p>No boot device available or Operating System detected<br/>" +
                        "Current boot mode is set to UEFI<br/>" +
                        "Please ensure a compatible bootable media is available</p>" +
                    /*    "<p>Available Actions<br/><ul>" +
                        "<li>No Available Actions</li>" +
                        "</ul></p>" +
                    */    "<p>Booting from Hard Drive C:\\<br/>" +
                        "ERROR: Missing OS");
    }

    isActionCopyable(action)
    {
        return this.#copyableActions.includes(action.toLowerCase());
    }

    makeActionCopyable(action)
    {
        this.#copyableActions.push(action.toLowerCase());
    }
}