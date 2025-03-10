class Session
{
    #tags;

    constructor()
    {
        this.#tags = 0;
    }

    getCurrentTags()
    {
        return this.#tags;
    }

    setCurrentTags(newTags)
    {
        this.#tags = newTags;
    }
}