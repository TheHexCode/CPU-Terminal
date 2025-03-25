class Session
{
    #totalTags;
    #payTags;
    #extTags;

    static TOTAL = "TOTAL";
    static PAYLOAD = "PAYLOAD";
    static EXTRA = "EXTRA";

    #entryData;

    constructor(initialEntries)
    {
        this.#totalTags = 0;
        this.#payTags = 0;
        this.#extTags = 0;

        this.#entryData = initialEntries;
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

        return Number(searchResults[action]);
    }
}