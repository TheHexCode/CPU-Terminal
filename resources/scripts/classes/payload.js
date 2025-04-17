class Payload
{
    #payloadSet;

    #userID;
    #handle;
    #mask;
    #functions;
    #roles;

    constructor()
    {
        this.#payloadSet = false;
    }

    setPayload(payload)
    {
        this.#userID = payload.id;
        this.#handle = payload.name;
        this.#functions = payload.functions;
        this.#roles = payload.roles;

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
        //return ((this.#priRole.toLowerCase() === roleName.toLowerCase()) ||
        //        (this.#secRole.toLowerCase() === roleName.toLowerCase()));
    }

    getFunction(funcName)
    {
        let userFunc = this.#functions.find(func => func.name.toLowerCase() === funcName.toLowerCase());

        if(userFunc !== undefined)
        {
            if((userFunc.type === "ranked"))
            {
                return Number(userFunc.rank);
            }
            else
            {
                return Boolean(Number(userFunc.rank));
            }
        }
        else
        {
            return 0;
        }
    }
}