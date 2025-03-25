class Payload
{
    #payloadSet;

    #userID;
    #handle;
    #mask;
    #priRole;
    #secRole;
    #functions;

    constructor()
    {
        this.#payloadSet = false;
    }

    setPayload(payload)
    {
        this.#userID = payload.id;
        this.#handle = payload.trueName;
        this.#mask = payload.mask;
        this.#priRole = payload.priRole;
        this.#secRole = payload.secRole;
        this.#functions = payload.functions;

        this.#payloadSet = true;
    }

    isSet()
    {
        return this.#payloadSet;
    }

    getHandle()
    {
        return this.#handle;
    }

    getMask()
    {
        return this.#mask;
    }

    hasRole(roleName)
    {
        return ((this.#priRole.toLowerCase() === roleName.toLowerCase()) ||
                (this.#secRole.toLowerCase() === roleName.toLowerCase()));
    }

    getFunction(funcName)
    {
        let userFunc = this.#functions.find(func => func.functionName.toLowerCase() === funcName.toLowerCase());

        if((userFunc.ranked))
        {
            return Number(userFunc.rank);
        }
        else
        {
            return Boolean(Number(userFunc.rank));
        }
    }
}