class Payload
{
    #payloadSet;

    #userID;
    #handle;
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
    
    getUserID()
    {
        return this.#userID;
    }

    getHandle()
    {
        return this.#handle;
    }

    hasRole(roleName)
    {
        //return ((this.#priRole.toLowerCase() === roleName.toLowerCase()) ||
        //        (this.#secRole.toLowerCase() === roleName.toLowerCase()));
    }

    getFunctionList()
    {
        return this.#functions;
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

    rigTerminal(userID)
    {
        if(userID === this.#userID)
        {
            session.rigTerminal(true);
        }
    }
}