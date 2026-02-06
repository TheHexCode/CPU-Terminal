class Payload
{
    #payloadSet;

    #userID;
    #handle;
    #remTags;
    #functions;
    #extraFuncs;
    #roles;
    #inventory;

    #statusEffects;
    #tempEffects;
    #cyberdecks;
    #timeMods;
    #costMods;

    constructor()
    {
        this.#inventory = new Inventory();

        this.#payloadSet = false;
        this.#extraFuncs = [
            {
                name: "Button Masher",
                rank: 0,
                type: "ranked",
                keywords: null,
                hacking_cat: "initial"
            },
            {
                name: "Knowledge",
                rank: null,
                type: "unique",
                keywords: [],
                hacking_cat: "passive"
            },
            {
                name: "Repair",
                rank: 0,
                type: "ranked",
                keywords: null,
                hacking_cat: "repair"
            },
            {
                name: "Hacking",
                rank: 0,
                type: "ranked",
                keywords: null,
                hacking_cat: "initial"
            },
            {
                name: "Siphon Charge",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "active"
            },
            {
                name: "Field Repair",
                rank: 0,
                type: "ranked",
                keywords: null,
                hacking_cat: "repair"
            },
            {
                name: "Dark Web Operator",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "passive"
            },
            {
                name: "Reassign",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "active"
            },
            {
                name: "Alarm Sense",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "passive"
            },
            {
                name: "Backdoor",
                rank: 0,
                type: "ranked",
                keywords: null,
                hacking_cat: "passive"
            },
            {
                name: "Ping",
                rank: 0,
                type: "charges",
                keywords: null,
                hacking_cat: "active"
            },
            {
                name: "Repeat",
                rank: 0,
                type: "ranked",
                keywords: null,
                hacking_cat: "passive"
            },
            {
                name: "Wipe Your Tracks",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "active"
            },
            {
                name: "Brick",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "active"
            },
            {
                name: "Rigged",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "active"
            },
            {
                name: "Root Exploit",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "initial"
            },
            {
                name: "Dark Web Merchant",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "passive"
            },
            {
                name: "Mask",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "initial"
            },
            {
                name: "Root Device",
                rank: 0,
                type: "unique",
                keywords: null,
                hacking_cat: "active"
            }
        ];
        this.#statusEffects = [];
        this.#tempEffects = [];
        this.#cyberdecks = [];
        this.#timeMods = [];
        this.#costMods = [];
    }

    setPayload(payload)
    {
        this.#userID = payload.id;
        this.#handle = payload.name;
        this.#remTags = payload.remTags;
        this.#functions = payload.functions;
        this.#roles = payload.roles;

        payload.effects.forEach(function(effect)
        {
            this.#statusEffects.push({
                name: effect.effect_name,
                values: JSON.parse(effect.effect_values)
            });
        }, this);

        this.#inventory.establishInventory(payload.items, payload.itemUses);
        this.#inventory.setupInputs();

        session.setCopyableActions(payload.copyables);

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

    getRemainingTags()
    {
        return this.#remTags;
    }

    getRoles()
    {
        return this.#roles.map(role => role.toLowerCase());
    }

    hasRole(roleName)
    {
        return this.#roles.find(role => role.toLowerCase() === roleName.toLowerCase());
    }

    hasCyberdeck()
    {
        return this.#cyberdecks.length > 0;
    }

    getInventoryConfirmInputs(actionType)
    {
        return this.#inventory.getConfirmInputs(actionType);
    }

    getInventoryExecuteInputs()
    {
        return this.#inventory.getExecuteInputs();
    }

    getFunctionList()
    {
        return this.#functions;
    }

    getFunction(funcName)
    {
        let baseFunc = this.getBaseFunction(funcName);
        let extraFunc = this.getExtraFunction(funcName);

        let baseRank = 0;
        let baseKW = "";

        if(baseFunc !== undefined)
        {
            baseRank = Number(baseFunc.rank);
            baseKW = baseFunc.keyword + ";";
        }

        if(extraFunc.keywords === null)
        {
            return baseRank + extraFunc.rank;
        }
        else // KNOWLEDGE
        {
            return (baseKW + extraFunc.keywords.map(kw => kw.keyword).join(";")).split(";");
        }
    }

    getBaseFunction(funcName)
    {
        let baseFunc = this.#functions.find(function(bFunc)
        {
            return bFunc.name.toLowerCase().replace(" ","_") === funcName.toLowerCase().replace(" ","_");
        });

        if(baseFunc === undefined)
        {
            return {
                "name": funcName,
                "rank": 0
            };
        }
        else
        {
            return baseFunc;
        }
    }

    getExtraFunction(xFuncName)
    {
        return this.#extraFuncs.find(function(xFunc)
        {
            return xFunc.name.toLowerCase().replace(" ","_") === xFuncName.toLowerCase().replace(" ","_");
        });
    }

    plusFunction(activation_function, plus_amount, keyword_source=null)
    {
        let extraFunc = this.#extraFuncs.find(function(xFunc)
        {
            return xFunc.name.toLowerCase().replaceAll(" ","_") === activation_function;
        });

        if(extraFunc.keywords === null)
        {
            extraFunc["rank"] += Number(plus_amount);
        }
        else // KNOWLEDGE
        {
            extraFunc["keywords"].push(
                {
                    "source": keyword_source,
                    "keyword": plus_amount
                }
            )
        }

        if(activation_function.toLowerCase() === "hacking")
        {
            updateTags(Number(plus_amount) * 2, Session.HACK);
        }
    }

    minusFunction(activation_function, minus_amount, keyword_source=null)
    {
        let extraFunc = this.#extraFuncs.find(function(xFunc)
        {
            return xFunc.name.toLowerCase().replaceAll(" ","_") === activation_function;
        });

        if(extraFunc.keywords === null)
        {
            extraFunc["rank"] -= Number(minus_amount);
        }
        else // KNOWLEDGE
        {
            extraFunc["keywords"].splice(extraFunc["keywords"].findIndex(function(keyword)
            {
                return keyword.source === keyword_source;
            }), 1);
        }
    }

    addTempEffect(benefit_id, input_index, activation_index)
    {
        this.#tempEffects.push({
            "benefit_id": benefit_id,
            "input_index": input_index,
            "activation_index": activation_index
        });
    }

    removeTempEffect(benefit_id, input_index, activation_index)
    {
        this.#tempEffects.splice(this.#tempEffects.findIndex(function(effect)
        {
            return ((effect.benefit_id === benefit_id) &&
                    (effect.input_index === input_index) &&
                    (effect.activation_index === activation_index));
        }), 1);
    }

    hasSkipTimer()
    {
        return this.#tempEffects.some(function(effect)
        {
            return ((effect.benefit_id === "skip_timer") &&
                    (effect.input_index === null) &&
                    (effect.activation_index === null));
        });
    }

    submitTempEffects(initial=false)
    {
        this.#inventory.submitEffects(this.#tempEffects.filter(function(effect)
        {
            return ((effect.input_index !== null) &&
                    (effect.input_index !== undefined));
        }), initial);

        if(initial)
        {
            this.#inventory.submitEffects(this.#tempEffects.filter(function(effect)
            {
                return (effect.name !== null);
            }), false);
        }

        this.#tempEffects = [];
    }

    clearTempEffects()
    {
        this.#tempEffects = [];
    }

    /*
    submitInitialEffects()
    {
        this.#inventory.submitInitialEffects();
    }
    */

    addStatusEffect(effect_name, effect_values, temp=false)
    {
        if(!temp)
        {
            this.#statusEffects.push({
                name: effect_name,
                values: effect_values
            });

            this.#inventory.applyStatusEffect(effect_name, effect_values);
        }
        else
        {
            this.#tempEffects.push({
                name: effect_name,
                values: effect_values
            });
            this.#inventory.applyStatusEffect(effect_name, effect_values, true);
        }
    }

    removeStatusEffect(effect_name)
    {
        this.#statusEffects.splice(this.#statusEffects.findIndex(function(potentialEffect)
        {
            return potentialEffect.name === effect_name;
        }), 1);

        this.#inventory.disableStatusEffect(effect_name);
    }

    getStatusEffects()
    {
        return this.#statusEffects;
    }

    addActionTime(timeSource, timeAmount)
    {
        let extantMod = this.#timeMods.find(function(mod)
        {
            return mod.source === timeSource;
        })

        if(extantMod !== undefined)
        {
            extantMod.amount = timeAmount;
        }
        else
        {
            this.#timeMods.push(
                {
                    "source": timeSource,
                    "amount": timeAmount
                }
            )
        }
    }

    minusActionTime(timeSource)
    {
        let extantModIndex = this.#timeMods.find(function(mod)
        {
            return mod.source === timeSource;
        })

        if(extantModIndex !== -1)
        {
            this.#timeMods.splice(extantModIndex,1);
        }
    }

    getActionTime()
    {
        // NEGATIVE TIMEMOD = SHORTER TIMER
        let timeModification = this.#timeMods.reduce(function(accumulator, timeObject)
        {
            return accumulator + timeObject.amount;
        }, 0);

        if(this.getFunction("BACKDOOR"))
        {
            // BACKDOOR I   = -10
            // BACKDOOR II  = -15
            // BACKDOOR III = -20
            timeModification = timeModification - (5 + (5 * this.getFunction("BACKDOOR")));
        }

        // DEFAULT TIME IS 30s
        let actionTime = Math.max(10, 30 + timeModification);

        return actionTime;
    }

    addActionCost(costSource, actionType, costAmount)
    {
        let extantMod = this.#costMods.find(function(mod)
        {
            return mod.source === costSource;
        })

        if(extantMod !== undefined)
        {
            extantMod.amount = costAmount;
        }
        else
        {
            this.#costMods.push(
                {
                    "source": costSource,
                    "actionType": actionType,
                    "amount": costAmount
                }
            )
        }
    }

    minusActionCost(costSource)
    {
        let extantModIndex = this.#costMods.find(function(mod)
        {
            return mod.source === costSource;
        })

        if(extantModIndex !== -1)
        {
            this.#costMods.splice(extantModIndex,1);
        }
    }

    getActionCost(baseCost, actionType)
    {
        let costModification = this.#costMods.reduce(function(accumulator, costObject)
        {
            if((costObject["actionType"] === "any") || (costObject["actionType"] === actionType))
            {
                return accumulator + costObject["amount"];
            }
            else
            {
                return accumulator;
            }
        }, baseCost);

        return Math.max(0, costModification);
    }

    applyTermLoginEffects()
    {
        this.#statusEffects.forEach(function(statusEffect)
        {
            this.#inventory.applyStatusEffect(statusEffect.name, statusEffect.values, true);
        }, this);

        this.#inventory.applyTermLoginEffects();

        this.clearTempEffects();
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
        this.#inventory.toggleInitialEffect(target.id, index, $(target).prop("checked"));
    }

    confirmItem(target, index)
    {
        this.#inventory.confirmItem(target.id, index);
    }

    executeItem(actionMap)
    {
        this.#inventory.executeItem(actionMap);
    }

    completeItem(actionMap)
    {
        this.#inventory.completeItem(actionMap);
    }

    /*
    activateItemEffect(effectName, inputIndex)
    {
        this.#inventory.toggleEffect(effectName, inputIndex, true);
    }
    */

    applyPostActionEffects(actionMap)
    {
        this.#inventory.applyPostActionEffects(actionMap);
    }

    checkItemConditions()
    {
        this.#inventory.resetOnScreenInputs();
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