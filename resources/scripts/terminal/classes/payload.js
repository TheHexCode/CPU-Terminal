class Payload
{
    #payloadSet;

    #userID;
    #handle;
    #functions;
    #roles;
    #items;
    #activeEffects = [];

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
        this.#items = payload.items;

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
        return this.#roles.find(role => role.toLowerCase() === roleName.toLowerCase());
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
            else if((userFunc.type === "collect"))
            {
                return userFunc.caviats;
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

    getInventory()
    {
        return this.#items;
    }

    getItem(itemID)
    {
        return this.#items.find(function(item)
        {
            return item.item_id === itemID
        });
    }

    getEffect(effectID)
    {
        let targetItem = this.#items.find(function(item)
        {
            return item.effects.find(function(effect)
            {
                return effect.id === effectID;
            });
        });

        return targetItem.effects.find(function(effect)
        {
            return effect.id === effectID;
        });
    }

    useItemEffect(effectID)
    {
        let targetItem = this.#items.find(function(item)
        {
            return item.effects.find(function(effect)
            {
                return effect.id === effectID;
            });
        });

        let targetEffect = targetItem.effects.find(function(effect)
        {
            return effect.id === effectID;
        });

        targetEffect["termUses"] += 1;
        targetEffect["uses"] += 1;
    }

    setActiveEffect(effectID, state)
    {
        if(state)
        {
            if(!this.#activeEffects.includes(effectID))
            {
                this.#activeEffects.push(effectID);
            }
        }
        else
        {
            if(this.#activeEffects.includes(effectID))
            {
                let effectIndex = this.#activeEffects.findIndex((eID) => eID === effectID);
                this.#activeEffects.splice(effectIndex,1);
            }
        }
    }

    getActiveEffect(effectID)
    {
        return this.#activeEffects.includes(effectID);
    }

    getAllActiveEffects()
    {
        return this.#activeEffects;
    }

    getActionTime()
    {
        // POSITIVE IS A BUFF; NEGATIVE IS A DEBUFF
        let bd = ((this.getFunction("BACKDOOR") > 0) ? (this.getFunction("BACKDOOR") * 5) + 5 : 0);
        let pgUK9K = (this.getActiveEffect(18) ? 5 : 0);
        let ssT0 = (this.getActiveEffect(19) ? -30 : 0);
        let ssT1 = (this.getActiveEffect(20) ? -15 : 0);

        let actionTime = Math.max(10, 30 - (bd + pgUK9K + ssT0 + ssT1));

        return actionTime;
    }
}