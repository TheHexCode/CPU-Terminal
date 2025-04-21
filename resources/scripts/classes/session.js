class Session
{
    #totalTags;
    #payTags;
    #extTags;

    static TOTAL = "TOTAL";
    static PAYLOAD = "PAYLOAD";
    static EXTRA = "EXTRA";

    #entryData;
    #repeatIcons = new Object();

    constructor(initialEntries)
    {
        this.#totalTags = 0;
        this.#payTags = 0;
        this.#extTags = 0;

        this.#entryData = initialEntries;
    }

    /*
    getEntryData()
    {
        return this.#entryData;
    }
    */

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

        actionCost = Math.max(actionCost - this.#repeatIcons[searchResults["icon"]][action], 0);

        return Number(searchResults[action]);
    }

    setFunctionState(functionName, entryID, entryAction, functionRank)
    {
        let entry = this.#entryData.find(entry => entry.id === entryID);

        switch (functionName)
        {
            case "REPEAT":
                let icon = entry["icon"];

                if((entryAction.toLowerCase() === "access") || (entryAction.toLowerCase() === "modify"))
                {
                    if(Object.keys(this.#repeatIcons).includes(icon))
                    {
                        if(this.#repeatIcons[icon][entryAction.toLowerCase()] === 0)
                        {
                            this.#repeatIcons[icon][entryAction.toLowerCase()] = functionRank;
                        }
                    }
                    else
                    {
                        let newIcon = {};
                        newIcon["access"] = (entryAction.toLowerCase() === "access") ? functionRank : 0;
                        newIcon["modify"] = (entryAction.toLowerCase() === "modify") ? functionRank : 0;
                        this.#repeatIcons[icon] = newIcon;
                    }
                }

                break;
        }
    }
}