class Payload
{
    #payloadSet;

    #userID;
    #handle;
    #functions;
    #extraFuncs;
    #roles;
    #items;
    #activeEffects;
    #hasDeck;

    constructor()
    {
        this.#payloadSet = false;
        this.#extraFuncs = [];
        this.#activeEffects = [];
        this.#hasDeck = false;
    }

    setPayload(payload)
    {
        this.#userID = payload.id;
        this.#handle = payload.name;
        this.#functions = payload.functions;
        this.#roles = payload.roles;
        this.#items = payload.items;

        if(this.#items.find(item => item.radio === "deck"))
        {
            this.#hasDeck = true;
        }

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

    hasDeck()
    {
        return this.#hasDeck;
    }

    getFunctionList()
    {
        return this.#functions;
    }

    getFunction(funcName)
    {
        let allFuncs = JSON.parse(JSON.stringify(this.#functions)); //DEEP COPY SO AS TO NOT AFFECT ORIGINAL #functions ARRAY

        this.#extraFuncs.forEach(function(xFunc)
        {
            let mainFuncIndex = allFuncs.findIndex(mFunc => mFunc.name.toLowerCase() === xFunc.name.toLowerCase());

            if(mainFuncIndex !== -1)
            {
                allFuncs[mainFuncIndex]["rank"] = Number(allFuncs[mainFuncIndex]["rank"]) + Number(xFunc["rank"]);
                allFuncs[mainFuncIndex]["keywords"] += ";" + xFunc.keywords;
            }
            else
            {
                allFuncs.push(xFunc);
            }
        }, this);

        let userFunc = allFuncs.find(func => func.name.toLowerCase() === funcName.toLowerCase());

        if(userFunc !== undefined)
        {
            if(userFunc.keywords !== null)
            {
                return userFunc.keywords;
            }
            else if(userFunc.rank !== null)
            {
                return Number(userFunc.rank);
            }
            else
            {
                return true;
            }
        }
        else
        {
            return 0;
        }
    }

    getExtraFunction(xFuncName)
    {
        let extraFunc = this.#extraFuncs.find(xFunc => xFunc.name.toLowerCase() === xFuncName.toLowerCase());

        return extraFunc;
    }

    plusFunction(func)
    {
        switch(func.toLowerCase())
        {
            case("k_hds"): // DISSIM
            {
                let knowIndex = this.#extraFuncs.findIndex(xFunc => xFunc.name.toLowerCase() === "knowledge");
                
                if(knowIndex !== -1)
                {
                    this.#extraFuncs[knowIndex]["extra"] += "dissim;";
                    this.#extraFuncs[knowIndex]["keywords"] += ";Hacking &amp; DigiSec";
                }
                else
                {
                    this.#extraFuncs.push({
                        name: "Knowledge",
                        rank: null,
                        type: "unique",
                        keywords: "Hacking &amp; DigiSec",
                        hacking_cat: "passive",
                        extra: "dissim;"
                    });
                }
                break;
            }
            case("alarmsense"): // POLYMATH
            {
                let asIndex = this.#extraFuncs.findIndex(xFunc => xFunc.name.toLowerCase() === "alarm sense");
                
                if(asIndex !== -1)
                {
                    this.#extraFuncs[asIndex]["extra"] += "poly;";
                }
                else
                {
                    this.#extraFuncs.push({
                        name: "Alarm Sense",
                        rank: null,
                        type: "unique",
                        keywords: null,
                        hacking_cat: "passive",
                        extra: "poly;"
                    });
                }
                break;
            }
            case("repair"): // POLYMATH
            {
                let repIndex = this.#extraFuncs.findIndex(xFunc => xFunc.name.toLowerCase() === "repair");
                
                if(repIndex !== -1)
                {
                    this.#extraFuncs[repIndex]["extra"] += "poly;";
                    this.#extraFuncs[repIndex]["rank"] = Number(this.#extraFuncs[repIndex]["rank"]) + 1;
                }
                else
                {
                    this.#extraFuncs.push({
                        name: "Repair",
                        rank: 1,
                        type: "ranked",
                        keywords: null,
                        hacking_cat: "repair",
                        extra: "poly;"
                    });
                }
                break;
            }
        }
    }

    minusFunction(func)
    {
        switch(func.toLowerCase())
        {
            case("k_hds"): // DISSIM
            {
                let knowIndex = this.#extraFuncs.findIndex(xFunc => xFunc.name.toLowerCase() === "knowledge");
                
                if(knowIndex["extra"] !== "dissim;")
                {
                    this.#extraFuncs[knowIndex]["extra"] = this.#extraFuncs[knowIndex]["extra"].replace("dissim;","");
                    this.#extraFuncs[knowIndex]["keywords"] = this.#extraFuncs[knowIndex]["keywords"].replace(";Hacking &amp; DigiSec","");
                }
                else
                {
                    this.#extraFuncs.splice(knowIndex,1);
                }
                break;
            }
            case("alarmsense"): // POLYMATH
            {
                let asIndex = this.#extraFuncs.findIndex(xFunc => xFunc.name.toLowerCase() === "alarm sense");
                
                if(knowIndex["extra"] !== "poly;")
                {
                    this.#extraFuncs[asIndex]["extra"] = this.#extraFuncs[asIndex]["extra"].replace("poly;","");
                }
                else
                {
                    this.#extraFuncs.splice(asIndex,1);
                }

                break;
            }
            case("repair"): // POLYMATH
            {
                let repIndex = this.#extraFuncs.findIndex(xFunc => xFunc.name.toLowerCase() === "repair");
                
                if(knowIndex["extra"] !== "poly;")
                {
                    this.#extraFuncs[repIndex]["extra"] = this.#extraFuncs[repIndex]["extra"].replace("poly;","");
                    this.#extraFuncs[repIndex]["rank"] = Number(this.#extraFuncs[repIndex]["rank"]) - 1;
                }
                else
                {
                    this.#extraFuncs.splice(repIndex,1);
                }

                break;
            }
        }
    }

    getInventory()
    {
        return this.#items;
    }

    getItem(itemAbbr)
    {
        return this.#items.find(function(item)
        {
            return item.abbr === itemAbbr
        });
    }

    getItemEffects(itemAbbr)
    {
        let targetItems = this.#items.filter(function(item)
        {
            return item.abbr === itemAbbr
        });

        return targetItems.map(item => (item.effects));
    }

    getEffect(effectAbbr)
    {
        let targetItem = this.#items.find(function(item)
        {
            return item.effects.find(function(effect)
            {
                return effect.abbr === effectAbbr;
            });
        });

        return targetItem.effects.find(function(effect)
        {
            return effect.abbr === effectAbbr;
        });
    }

    useItemEffect(effectAbbr)
    {
        let targetItem = this.#items.find(function(item)
        {
            return item.effects.find(function(effect)
            {
                return effect.abbr === effectAbbr;
            });
        });

        let targetEffect = targetItem.effects.find(function(effect)
        {
            return effect.abbr === effectAbbr;
        });

        targetEffect["termUses"] += 1;
        targetEffect["uses"] += 1;
    }

    setActiveEffect(effectAbbr, state)
    {
        if(state)
        {
            if(!this.#activeEffects.includes(effectAbbr))
            {
                this.#activeEffects.push(effectAbbr);
            }
        }
        else
        {
            if(this.#activeEffects.includes(effectAbbr))
            {
                let effectIndex = this.#activeEffects.findIndex((eA) => eA === effectAbbr);
                this.#activeEffects.splice(effectIndex,1);
            }
        }
    }

    getActiveEffect(effectAbbr)
    {
        return this.#activeEffects.includes(effectAbbr);
    }

    getActiveEffects()
    {
        let activeEffects = [];

        this.#activeEffects.forEach(function(effectAbbr)
        {
            let targetItem = this.#items.find(function(item)
            {
                return item.effects.find(function(effect)
                {
                    return effect.abbr === effectAbbr;
                });
            });

            let targetEffect = targetItem.effects.find(function(effect)
            {
                return effect.abbr === effectAbbr;
            })

            activeEffects.push(targetEffect["abbr"]);
        }, this);

        return activeEffects;
    }

    getActionTime()
    {
        // POSITIVE IS A BUFF; NEGATIVE IS A DEBUFF
        let bd = ((this.getFunction("BACKDOOR") > 0) ? (this.getFunction("BACKDOOR") * 5) + 5 : 0);
        let pgUK9K = (this.getActiveEffect("deck_uh9k") ? 5 : 0);
        let ssT0 = (this.getActiveEffect("shim_0") ? -30 : 0);
        let ssT1 = (this.getActiveEffect("shim_1") ? -15 : 0);

        let actionTime = Math.max(10, 30 - (bd + pgUK9K + ssT0 + ssT1));

        return actionTime;
    }
}