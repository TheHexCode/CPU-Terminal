class Terminal
{
    //TEMP
    #termJSON;

    #terminalID;
    #termDisplayName;
    #termAccessCost;
    #termState;
    #entries;

    constructor(termJSON)
    {
        this.#terminalID = termJSON.id;
        this.#termDisplayName = termJSON.name;
        this.#termAccessCost = termJSON.access;
        this.#termState = termJSON.state;
        this.#entries = termJSON.entries;
    }

    getTerminalID()
    {
        return this.#terminalID;
    }

    getTerminalDisplayName()
    {
        return this.#termDisplayName;
    }

    getTerminalAccessCost()
    {
        return this.#termAccessCost;
    }

    getTerminalState()
    {
        return this.#termState;
    }
}