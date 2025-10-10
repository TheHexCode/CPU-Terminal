class Payload
{
    #itemSchema;
    #effectSchema;

    #payloadSet;

    #userID;
    #handle;
    #functions;
    #extraFuncs;
    #roles;
    #inventory;

    #cyberdecks;
    #timeMods;
    #costMods;

    constructor()
    {
        this.#inventory = new Inventory();

        this.#payloadSet = false;
        this.#extraFuncs = [];
        this.#cyberdecks = [];
        this.#timeMods = [];
        this.#costMods = [];
    }

    setPayload(payload)
    {
        this.#userID = payload.id;
        this.#handle = payload.name;
        this.#functions = payload.functions;
        this.#roles = payload.roles;

        this.#inventory.establishInventory(payload.items);
        this.#inventory.setupInputs();

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

    hasCyberdeck()
    {
        return this.#cyberdecks.length > 0;
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
                allFuncs[mainFuncIndex]["keyword"] += ";" + xFunc.keyword;
            }
            else
            {
                allFuncs.push(xFunc);
            }
        }, this);

        let userFuncs = allFuncs.filter(function(func)
        {
            return func.name.toLowerCase() === funcName.toLowerCase();
        });

        if(userFuncs.length > 0)
        {
            if(userFuncs.length === 1)
            {
                if(userFuncs[0].rank !== null)
                {
                    return Number(userFuncs[0].rank);
                }
                else
                {
                    return true;
                }
            }
            else if(userFuncs.length >= 2)
            {
                return userFuncs.map(function(func)
                {
                    return func.keyword.split(";")[0];
                }).join(";");
            }
            else
            {
                return 0;
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

    plusFunction(effect_type, plus_amount)
    {
        /*
        switch(func.toLowerCase())
        {
            case("k_hds"): // DISSIM
            {
                let knowIndex = this.#extraFuncs.findIndex(xFunc => xFunc.name.toLowerCase() === "knowledge");

                if(knowIndex !== -1)
                {
                    this.#extraFuncs[knowIndex]["extra"] += "dissim;";
                    this.#extraFuncs[knowIndex]["keyword"] += ";Hacking &amp; DigiSec";
                }
                else
                {
                    this.#extraFuncs.push({
                        name: "Knowledge",
                        rank: null,
                        type: "unique",
                        keyword: "Hacking &amp; DigiSec",
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
                        keyword: null,
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
                        keyword: null,
                        hacking_cat: "repair",
                        extra: "poly;"
                    });
                }
                break;
            }
        }
        */

        switch(effect_type)
        {
            case("plus_hacking"):
            {
                let hackIndex = this.#extraFuncs.findIndex(xFunc => xFunc.name.toLowerCase() === "hacking");

                if(hackIndex !== -1)
                {
                    this.#extraFuncs[hackIndex]["rank"] = Number(this.#extraFuncs[hackIndex]["rank"]) + Number(plus_amount);
                }
                else
                {
                    this.#extraFuncs.push({
                        name: "Hacking",
                        rank: Number(plus_amount),
                        type: "ranked",
                        keyword: null,
                        hacking_cat: "initial"
                    });
                }

                updateTags(Number(plus_amount) * 2, Session.HACK);
                break;
            }
            case("plus_alarm_sense"):
            {
                let asIndex = this.#extraFuncs.findIndex(xFunc => xFunc.name.toLowerCase() === "hacking");

                if(asIndex !== -1)
                {
                    this.#extraFuncs[hackIndex]["rank"] = Number(this.#extraFuncs[asIndex]["rank"]) + Number(plus_amount);
                }
                else
                {
                    this.#extraFuncs.push({
                        name: "Alarm Sense",
                        rank: Number(plus_amount),
                        type: "ranked",
                        keyword: null,
                        hacking_cat: "passive"
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
                    this.#extraFuncs[knowIndex]["keyword"] = this.#extraFuncs[knowIndex]["keyword"].replace(";Hacking &amp; DigiSec","");
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

    setActionTime(timeSource, timeAmount)
    {
        this.#timeMods.push(
            {
                "source": timeSource,
                "amount": timeAmount
            }
        )
    }

    getActionTime()
    {
        // NEGATIVE TIMEMOD = SHORTER TIMER
        let timeModification = this.#timeMods.reduce(function(accumulator, timeObject)
        {
            accumulator + timeObject.amount;
        }, 0);

        let actionTime = Math.max(10, 30 + timeModification);

        return actionTime;
    }

    applyTermLoginEffects()
    {
        this.#inventory.applyTermLoginEffects();
    }

    submitInitialEffects()
    {
        this.#inventory.submitInitialEffects();
    }

    addCyberdeck(deckSource)
    {
        this.#cyberdecks.push(deckSource);
    }

    removeCyberdeck(deckSource)
    {
        this.#cyberdecks.splice(this.#cyberdecks.findIndex(function(source)
        {
            return source === deckSource;
        }), 1);
    }

    toggleItemCheckbox(target, index)
    {
        this.#inventory.toggleEffect(target.id, index, $(target).prop("checked"));
    }

/*
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
    */
}