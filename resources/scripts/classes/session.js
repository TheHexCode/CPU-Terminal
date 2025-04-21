class Session
{
    #totalTags;
    #payTags;
    #extTags;

    static TOTAL = "TOTAL";
    static PAYLOAD = "PAYLOAD";
    static EXTRA = "EXTRA";

    #termID;
    #entryData;
    #repeatIcons = new Object();

    constructor(termInfo, initialEntries)
    {
        this.#totalTags = 0;
        this.#payTags = 0;
        this.#extTags = 0;

        this.#termID = termInfo;
        this.#entryData = initialEntries;
    }

    /*
    getEntryData()
    {
        return this.#entryData;
    }
    getRepeatIcons()
    {
        return this.#repeatIcons;
    }
    */

    getTerminalID()
    {
        return this.#termID;
    }

    getCurrentTags(tagType = Session.TOTAL)
    {
        if(tagType === Session.TOTAL)
        {
            return this.#totalTags;
        }
        else if(tagType === Session.PAYLOAD)
        {
            return this.#payTags;
        }
        else if(tagType === Session.EXTRA)
        {
            return this.#extTags;
        }
    }

    setCurrentTags(newTags, tagType = Session.TOTAL)
    {
        if(tagType === Session.TOTAL)
        {
            this.#totalTags = newTags;
        }
        else if(tagType === Session.PAYLOAD)
        {
            this.#payTags = newTags;
            this.#totalTags = newTags + this.#extTags;
        }
        else if(tagType === Session.EXTRA)
        {
            this.#extTags = newTags;
            this.#totalTags = this.#payTags + newTags;
        }
    }

    getEntryState(entryID)
    {
        let searchResults = this.#entryData.find(entry => entry.id === entryID);

        return searchResults.state;
    }

    getActionCost(entryID, action)
    {
        let searchResults = this.#entryData.find(entry => entry.id === entryID);

        let actionCost = Number(searchResults[action]);

        if(Object.keys(this.#repeatIcons).includes(searchResults["icon"]))
        {
            actionCost = Math.max(actionCost - this.#repeatIcons[searchResults["icon"]][action], 0);
        }

        return actionCost;
    }

    setFunctionState(functionName, entryID, entryAction, functionRank)
    {
        let entry = this.#entryData.find(entry => entry.id === entryID);

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
        }
    }
}