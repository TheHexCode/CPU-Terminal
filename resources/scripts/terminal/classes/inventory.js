function titleCase(str)
{
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

class Item
{
    _name;
    _id;
    _displayName;
    _category;
    _subCat;
    _tags;
    _tier;
    _tierName;
    _instanceValues = {};
    _benefits = [];
    _dataEffectString = "";

    constructor(models, dbObject, itemUses)
    {
        let itemObject = models["items"].find(function(proposedItem)
        {
            return proposedItem.name.toLowerCase().replaceAll("&#39;","'") === dbObject.name;
        });

        let tierObject = itemObject["tiers"].find(function(proposedTier)
        {
            return proposedTier.tier === dbObject.tier;
        });

        if(Object.keys(tierObject).includes("tierName"))
        {
            this._tierName = tierObject["tierName"];
        }
        else
        {
            this._tierName = "T" + tierObject["tier"];
        }

        this._name = itemObject["name"];
        this._tier = Number(tierObject["tier"]);

        this._id = this._name.toLowerCase().replaceAll("&#39;","").replaceAll(" ","_") + "_" + this._tierName.toLowerCase();
        this._displayName = itemObject["name"].replaceAll("&#39;","'") + " [" + this._tierName + "]";
        this._category = itemObject["category"];
        this._subCat = itemObject["subCategory"];
        this._tags = itemObject["tags"];

        /*
        if(Object.keys(itemObject).includes("instance"))
        {
            itemObject["instance"].forEach(function(value)
            {
                let valueObject =
                {

                }
                this.#instanceValues[value.name] = value.amount;
            }, this);
        }
        */

        if(dbObject.instanceKey !== "")
        {
            this._instanceValues[dbObject.instanceKey] = [dbObject.instanceValue];
        }

        tierObject["benefits"].forEach(function(itemBenefit)
        {
            let benefitObject = models["benefits"].find(function(proposedBenefit)
            {
                return proposedBenefit.name === itemBenefit.name;
            });

            let newBenefit = new Benefit(this, itemBenefit, benefitObject, itemUses)

            this._benefits.push(newBenefit);
            this._dataEffectString += "!" + newBenefit.id + ";";

        }, this);
    }

    get name()              { return this._name;                }
    get id()                { return this._id;                  }
    get displayName()       { return this._displayName;         }
    get category()          { return this._category;            }
    get subCategory()       { return this._subCat;              }
    get tags()              { return this._tags;                }
    get tier()              { return this._tier;                }
    get tierName()          { return this._tierName;            }
    get instanceValues()    { return this._instanceValues;      }
    get benefits()          { return this._benefits;            }
    get dataEffectString()  { return this._dataEffectString;    }

    hasTag(tagName)
    {
        let targetTag = this._tags.find(function(potentialTag)
        {
            return potentialTag.name === tagName;
        });

        if(targetTag !== undefined)
        {
            if(Object.keys(targetTag).includes("value"))
            {
                return targetTag.value;
            }
            else
            {
                return true;
            }
        }
        else
        {
            return false;
        }
    }

    addInstanceValue(newKey, newValue)
    {
        if(Object.keys(this._instanceValues).includes(newKey))
        {
            this._instanceValues[newKey].push(newValue);
        }
        else
        {
            this._instanceValues[newKey] = [newValue];
        }
    }
}

class Benefit
{
    _parent;

    _name;
    _stacking;
    _id;
    _charges;
    _chargePerType;
    _uses;
    #remCharges;
    _values = {};

    _effectType;
    _effects = [];

    constructor(parent, itemBenefit, benefitObject, itemUses)
    {

        this._parent = parent;

        this._name = itemBenefit.name;
        this._stacking = benefitObject.stacking ?? false;

        if(this._stacking)
        {
            this._id = itemBenefit.name;
        }
        else
        {
            this._id = itemBenefit.name + "_" + parent.tierName.toLowerCase();
        }

        this._charges = Number(itemBenefit.charges) ?? null;
        this._chargePerType = itemBenefit.perType ?? null;

        let useObject = itemUses.find(function(potentialUse)
        {
            return potentialUse.effect === this._id;
        });

        switch(this._chargePerType)
        {
            case("sim"):
            {
                this._uses = useObject.simUses;
                break;
            }
            case("scene"):
            {
                this._uses = useObject.jobUses;
                break;
            }
            case("term"):
            {
                this._uses = useObject.termUses;
                break;
            }
            case("item"):
            {
                this._uses = useObject.itemUses;
                break;
            }
        }
        this.#remCharges = this._charges - this._uses;

        if(Object.keys(itemBenefit).includes("values"))
        {
            itemBenefit["values"].forEach(function(value)
            {
                this._values[value.name] = value.amount;
            }, this);
        }

        switch(true)
        {
            case(Object.keys(benefitObject).includes("term_login")):
            {
                this._effects = benefitObject["term_login"];
                this._effectType = "term_login";
                break;
            }
            case(Object.keys(benefitObject).includes("inputs")):
            {
                this._effects = benefitObject["inputs"];
                this._effectType = "inputs";
                break;
            }
            case(Object.keys(benefitObject).includes("post_actions")):
            {
                this._effects = benefitObject["post_actions"];
                this._effectType = "post_actions";
                break;
            }
            case(Object.keys(benefitObject).includes("ph_login")):
            {
                this._effectType = "ph_login";
                break;
            }
        }
    }

    get parent()        { return this._parent;          }
    get name()          { return this._name;            }
    get stacking()      { return this._stacking;        }
    get id()            { return this._id;              }
    get values()        { return this._values;          }
    get effects()       { return this._effects;         }
    get effectType()    { return this._effectType;      }
    get charges()       { return this._charges;         }
    get perType()       { return this._chargePerType;   }
    get uses()          { return this._uses;            }

    stackBenefits(newBenefitObject)
    {
        Object.keys(newBenefitObject.values).forEach(function(newKey)
        {
            if(Object.keys(this._values).includes(newKey))
            {
                this._values[newKey] += newBenefitObject.values[newKey];
            }
            else
            {
                this._values[newKey] = newBenefitObject.values[newKey];
            }
        }, this);

        if((typeof this._parent) === "array")
        {
            if((typeof newBenefitObject.parent) === "array")
            {
                newBenefitObject.parent.forEach(function(newParent)
                {
                    this._parent.push(newParent);
                }, this);
            }
            else
            {
                this._parent.push(newBenefitObject.parent);
            }
        }
        else
        {
            this._parent = [this._parent];

            if((typeof newBenefitObject.parent) === "array")
            {
                newBenefitObject.parent.forEach(function(newParent)
                {
                    this._parent.push(newParent);
                }, this);
            }
            else
            {
                this._parent.push(newBenefitObject.parent);
            }
        }
    }

    parseLabel(labelString, effectIndex=null)
    {
        let parseMatches = (labelString.match(/{.*?}/g) ?? []);

        parseMatches.forEach(function(match)
        {
            let modifier = (match.split("!")[1] ?? "}").split("}")[0];
            let pathArray = match.split("!")[0].split("{")[1].split("}")[0].split(":");

            let result = 0;

            switch(pathArray[0])
            {
                case("values"):
                {
                    let splitKey = pathArray[1].split(/([*/+-])/);

                    let resultValue = this._values[splitKey[0]];

                    switch(splitKey[1])
                    {
                        case("*"):
                        {
                            result = resultValue * Number(splitKey[2]);
                            break;
                        }
                        case("/"):
                        {
                            result = resultValue / Number(splitKey[2]);
                            break;
                        }
                        case("+"):
                        {
                            result = resultValue + Number(splitKey[2]);
                            break;
                        }
                        case("-"):
                        {
                            result = resultValue - Number(splitKey[2]);
                            break;
                        }
                        default: //undefined
                        {
                            result = resultValue;
                            break;
                        }
                    }
                    break;
                }
                case("remainCharges"):
                {
                    result = this.#remCharges;
                    break;
                }
                case("totalCharges"):
                case("charges"):
                {
                    result = this._charges;
                    break;
                }
                case("perType"):
                {
                    result = this._chargePerType;
                    break;
                }
                case("displayName"):
                {
                    result = this._parent.displayName;
                    break;
                }
                case("cost"):
                {
                    let thisEffect = this._effects[effectIndex];
                    let costPath = thisEffect.cost.amount.split(":");

                    let baseCost = 0;

                    switch(costPath[0])
                    {
                        case("values"):
                        {
                            baseCost = this._values[costPath[1]];
                            break;
                        }
                    }

                    switch(thisEffect.cost.type)
                    {
                        case("dynamic"):
                        {
                            let costEffect = this.checkConditions(thisEffect.cost.conditions);
                            result = baseCost + costEffect;
                            break;
                        }
                        case("static"):
                        {
                            result = baseCost;
                            break;
                        }
                    }
                    break;
                }
            }

            switch(modifier)
            {
                case("plurality"):
                {
                    result = (result !== 1 ? "s" : "");
                    break;
                }
                case("tens"):
                {
                    result = tens(result);
                    break;
                }
                case("title"):
                {
                    result = titleCase(result);
                    break;
                }
            }

            labelString = labelString.replace(match, result);
        }, this);

        return labelString;
    }

    checkConditions(effectConditions)
    {
        // array of conditions
            // left
                // payload:roles [Array]
                // payload:effects [Array]
                // payload:functions:XXX [Array Key > Value]
                // terminal:effects [Array]
                // item:instance:XXX [Array Key > Array]
                // action:type [Value]
            // operation
                // contains [Arrays]
                // not_contains [Arrays]
                // greater_than [Numbers]
                // equals [Numbers / Strings / Boolean]
                // not_equals [Numbers / Strings / Boolean]
            // right
                // String
                // Number
                // Boolean
            // effect
                // Number
            // rejection_label
                // String

        let returnValue = 0;
        let continueState = true;

        effectConditions.forEach(function(condition)
        {
            if(!continueState)
            {
                return;
            }
            else
            {
                let leftType = null;
                let left = null;

                let leftArray = condition["left"].split(":");

                switch(leftArray[0])
                {
                    case("payload"):
                    {
                        switch(leftArray[1])
                        {
                            case("roles"):
                            {
                                leftType = "array";
                                left = payload.getRoles();
                                break;
                            }
                            case("effects"):
                            {
                                leftType = "array";
                                left = payload.getStatusEffects();
                                break;
                            }
                            case("functions"):
                            {
                                leftType = "value";
                                left = payload.getFunction(leftArray[2]);
                                break;
                            }
                        }
                        break;
                    }
                    case("terminal"):
                    {
                        switch(leftArray[1])
                        {
                            case("effects"):
                            {
                                leftType = "array";
                                left = session.getStatusEffects();
                                break;
                            }
                        }
                        break;
                    }
                    case("item"):
                    {
                        switch(leftArray[1])
                        {
                            case("instance"):
                            {
                                leftType = "array";
                                left = this._parent.instanceValues[leftArray[2]];
                                break;
                            }
                        }
                        break;
                    }
                    case("action"):
                    {
                        switch(leftArray[1])
                        {
                            case("type"):
                            {
                                leftType = "value";
                                left = itemValues[leftkey];
                                break;
                            }
                        }
                        break;
                    }
                }

                let right = null;

                if(((typeof condition["right"]) === "string") &&
                    (condition["right"].includes(":")))
                {
                    let rightArray = condition["right"].split(":");
                    switch(rightArray[0])
                    {
                        case("terminal"):
                        {
                            switch(rightArray[1])
                            {
                                case("owner"):
                                {
                                    right = session.getTerminalOwner();
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                else
                {
                    right = condition["right"];
                }

                let operation = condition["operation"];

                let pass = false;

                switch(leftType)
                {
                    case("array"):
                    {
                        switch(operation)
                        {
                            case("equals"):
                            case("contains"):
                            {
                                pass = left.includes(right);
                                break;
                            }
                            case("not_contains"):
                            {
                                pass = !(left.includes(right));
                                break;
                            }
                        }
                        break;
                    }
                    case("value"):
                    {
                        switch(operation)
                        {
                            case("greater_than"):
                            {
                                pass = left > right;
                                break;
                            }
                            case("greater_than_equals"):
                            {
                                pass = left >= right;
                                break;
                            }
                            case("equals"):
                            {
                                pass = left === right;
                                break;
                            }
                            case("not_equals"):
                            {
                                pass = left !== right;
                                break;
                            }
                            case("lesser_than_equals"):
                            {
                                pass = left <= right;
                                break;
                            }
                            case("lesser_than"):
                            {
                                pass = left < right;
                                break;
                            }
                        }
                        break;
                    }
                }

                if(pass)
                {
                    if(Object.keys(condition).includes("effect"))
                    {
                        returnValue = returnValue + condition.effect;
                        continueState = true;
                    }
                    else
                    {
                        returnValue = pass;
                        continueState = true;
                    }
                }
                else
                {
                    if(Object.keys(condition).includes("rejection_label"))
                    {
                        returnValue = condition["rejection_label"];
                        continueState = false;
                    }
                    else if(Object.keys(condition).includes("effect"))
                    {
                        //effect not added to returnValue
                        continueState = true;
                    }
                    else
                    {
                        returnValue = pass;
                        continueState = false;
                    }
                }
            }
        });

        return returnValue;
    }

    isDisabled()
    {
        return ((this._charges !== null) &&
                (this.#remCharges >= 0));
    }

    #getInputDetails(inputObject, inputIndex)
    {
        let parsedLabel = this.parseLabel(inputObject.label);
        let conditionCheck = true;

        if(Object.keys(inputObject).includes("conditions"))
        {
            let checkResults = this.checkConditions(inputObject.conditions);
            if(typeof checkResults === "string")
            {
                conditionCheck = false;
                parsedLabel = checkResults;
            }
            else
            {
                conditionCheck = checkResults;
            }
        }

        let cost = null;

        if(Object.keys(inputObject).includes("cost"))
        {
            cost = this.parseLabel("{cost}", inputIndex);
        }

        return {
            label: parsedLabel,
            passed: conditionCheck,
            cost: cost
        }
    }

    getInputHTML(inputIndex)
    {
        if(this._effectType !== "inputs") { return; }

        let targetInput = this._effects[inputIndex];
        let chargeDisabled = this.isDisabled();

        let returnHTML = "";

        switch(targetInput.type)
        {
            case("checkbox"):
            {
                // checkbox
                    // screen:
                        // crack
                        // confirm
                    // label: string
                    // activation
                        // amount: string
                        // label: string
                        // type:
                            // plus_tags
                            // skip_timer
                            // payload_effect
                            // action_cost
                            // action_time
                            // payload_has_cyberdeck
                            // pop-up
                switch(targetInput.screen)
                {
                    case("crack"):
                    {
                        returnHTML += '<div class="initItem' + (chargeDisabled ? ' dimmed' : '') + '">' +
                                            '<div class="initHeader">' + targetInput.header + '</div>' +
                                            '<div class="initOption">' +
                                                '<input type="checkbox" id="' + this._id + '" onclick="initCheck(this, ' + inputIndex + ')"' + (chargeDisabled ? ' disabled' : '') + '>' +
                                                '<label for="' + this._id + '">' + targetEntry.label + "</label>" +
                                            '</div>' +
                                        '</div>';

                        return {
                            category: "crack",
                            value: returnHTML
                        };
                    }
                    case("confirm"):
                    {
                        /*
                            "<span class='copycatBox'>" +
                                "<input id='copycatActivate' type='checkbox'/>" +
                                "<span class='copycatLabel'>(1/Sim) Activate Copycat for this action to complete it immedidately?</span>" +
                            "</span>"
                        */
                        let inputDetails = this.#getInputDetails(targetInput, inputIndex);

                        returnString +=     "<span class='confirmBox" + ((chargeDisabled || !inputDetails.passed) ? " dimmed'" : "'") + " >" +
                                                "<input id='" + this._id + "_" + inputIndex + "' class='confirmInput' type='checkbox'" + ((chargeDisabled || !inputDetails.passed) ? " disabled" : "") + " />" +
                                                "<span class='confirmLabel'>" + inputDetails.label + "</span>" +
                                            "</span>";

                        let onChangeFunction = function(eventArg, inputArg, inputIndex)
                        {
                            inputArg.activations.forEach(function(activation, activationIndex)
                            {
                                switch(activation.type)
                                {
                                    case("skip_timer"):
                                    {
                                        if($(eventArg.target).prop("checked"))
                                        {
                                            payload.addTempEffect(inputArg["effect_name"], inputIndex, activationIndex);
                                            payload.addTempEffect("skip_timer", null, null);
                                        }
                                        else
                                        {
                                            payload.removeTempEffect(inputArg["effect_name"], inputIndex, activationIndex);
                                            payload.removeTempEffect("skip_timer", null, null);
                                        }
                                        break;
                                    }
                                    default:
                                    {
                                        //payload.activateItemEffect(inputArg["effect_name"], inputIndex, activationIndex);
                                        break;
                                    }
                                }
                            });
                        };

                        returnArray.push({
                            "inputHTML": HTMLString,
                            "itemID": input["effect_name"] + "_" + index,
                            "function": onChangeFunction,
                            "functionInput": structuredClone(input),
                            "functionIndex": index
                        });
                        return {
                            category: "confirm",
                            value: {
                                benefit: this,
                                index: inputIndex
                            }
                        };
                    }
                }
                break;
            }
            case("button"):
            {
                // button
                    // screen:
                        // inventory
                        // crack
                        // execute
                    // condition: []
                    // cost:
                        // type
                            // dynamic
                        // base [for dynamic]
                        // condition [for dynamic]: []
                    // label:
                        // +{amount}...{plurality}
                    // confirm:
                        // body
                            // {charges}...{charges!plurality}
                        // button
                            // Confirm
                        // timer
                            // type
                                // skip
                                // static [not affected by actionTime]
                                // action [affected by actionTime]
                            // seconds [for static / action]
                                // 30
                    // activation: []
                        // type
                            // plus_tags
                            // terminal_effect
                            // payload_effect
                            // complete_timer
                            // action_cost
                            // action_time
                            // payload_has_cyberdeck
                            // pop-up
                        // amount [for plus_tags && action_* && pop_up]
                        // name [for *_effect]
                        // value [for payload_has_cyberdeck]
                switch(targetInput.screen)
                {
                    case("inventory"):
                    {
                        returnHTML += "<span class='itemActionRow'>";

                        if(this._chargePerType === "sim" || this._chargePerType === "scene")
                        {
                            returnHTML += "<span class='itemMarks'>";

                            for(let i = 0; i < this._uses; i++)
                            {
                                returnHTML += "<img src='/resources/images/actions/itemfilled.png' />";
                            }

                            for(let j = this._uses; j < this._charges; j++)
                            {
                                returnHTML += "<img src='/resources/images/actions/itemopen.png' />";
                            }

                            returnHTML +=   "<span>per " + (titleCase(this._chargePerType)) + "</span>" +
                                        "</span>";
                        }

                        let inputDetails = this.#getInputDetails(targetInput, inputIndex);

                        returnHTML += "<button id='" + this._id + "' class='itemButton' data-input='" + inputIndex + "' onclick='useItem(this," + inputIndex + ")'" + ((inputDetails.cost !== null) ? " data-cost='" + inputDetails.cost + "'" : "") + ((chargeDisabled || !inputDetails.passed) ? " disabled" : "") + ">" + inputDetails.label + "</button>" +
                                    "</span>";

                        return {
                            category: "inventory",
                            value: returnHTML
                        };
                    }
                    case("crack"):
                    {
                        /*
                        <div id="brad_init" class="initItem hidden">
                            <div class="initHeader">BUDGET ACCESS REMOTE DRIVE:</div>
                            <div class="initOption">
                                <button data-effect="brad" onclick="initAction(this)">Set up for Remote Contractor?<span class="hasDeck"><br>(Can set up later)</span></button>
                            </div>
                        </div>
                        */

                        returnHTML += "<span class='itemActionRow'>";

                        if(this._chargePerType === "sim" || this._chargePerType === "scene")
                        {
                            returnHTML += "<span class='itemMarks'>";

                            for(let i = 0; i < this._uses; i++)
                            {
                                returnHTML += "<img src='/resources/images/actions/itemfilled.png' />";
                            }

                            for(let j = this._uses; j < this._charges; j++)
                            {
                                returnHTML += "<img src='/resources/images/actions/itemopen.png' />";
                            }

                            returnHTML +=   "<span>per " + (titleCase(this._chargePerType)) + "</span>" +
                                        "</span>";
                        }

                        let inputDetails = this.#getInputDetails(targetInput, inputIndex);

                        returnHTML +=   '<div class="initItem' + (chargeDisabled ? ' dimmed' : '') + '">' +
                                            '<div class="initHeader">' + this._parent.displayName + '</div>' +
                                            '<div class="initOption">' +
                                                '<button id="' + this._id + '" class="itemButton" data-input="' + inputIndex + '" onclick="useItem(this,' + inputIndex + ')"' + ((chargeDisabled || !inputDetails.passed) ? ' disabled' : '') + '>' + inputDetails.label + '</button>' +
                                            '</div>' +
                                        '</div>';

                         return {
                            category: "crack",
                            value: returnHTML
                        };
                    }
                    case("execute"):
                    {
                        return {
                            category: "execute",
                            value: {
                                benefit: this,
                                index: inputIndex
                            }
                        };
                    }
                }
                break;
            }
        }
    }
}

class StatusEffect
{
    constructor()
    {

    }
}

class Inventory
{
    #globalThis = this;

    #models;
    #itemModel;
    #benefitModel;
    #statusModel;

    #items;
    #benefits;

    #initialActivations;
    #confirmInputs;
    #executeInputs;

    constructor()
    {
        this.#itemModel = $.getJSON("/resources/models/items.json");
        this.#benefitModel = $.getJSON("/resources/models/benefits.json");
        this.#statusModel = $.getJSON("/resources/models/statuses.json");

        this.#items = [];
        this.#benefits = [];
        this.#initialActivations = [];
        this.#confirmInputs = [];
        this.#executeInputs = [];
    }

    establishInventory(itemList, itemUses)
    {
        this.#itemModel = this.#itemModel.responseJSON["items"];
        this.#benefitModel = this.#benefitModel.responseJSON["benefits"];
        this.#statusModel = this.#statusModel.responseJSON["statuses"];

        this.#models = {
            "items": this.#itemModel,
            "benefits": this.#benefitModel,
            "statuses": this.#statusModel
        }

        itemList.forEach(function(dbItem)
        {
            let extantItem = this.#items.find(function(potentialItem)
            {
                return ((potentialItem.name === dbItem.name) &&
                        (potentialItem.tier === Number(dbItem.tier)));
            });

            if(extantItem !== undefined)
            {
                extantItem.addInstanceValue(dbItem.instanceKey, dbItem.instanceValue);
            }
            else
            {
                let newItem = new Item(this.#models, dbItem, itemUses)

                newItem.benefits.forEach(function(newBenefit)
                {
                    let extantBenefit = this.#benefits.find(function(potentialBenefit)
                    {
                        return ((potentialBenefit.name === newBenefit.name) &&
                                (potentialBenefit.stacking === true));
                    });

                    if(extantBenefit !== undefined)
                    {
                        extantBenefit.stackBenefits(newBenefit);
                    }
                    else
                    {
                        this.#benefits.push(newBenefit);
                    }
                }, this);

                this.#items.push(newItem);
            }

            /*
            let proposedItem = this.#itemModel.find(function(potentialItem)
            {
                return potentialItem.name.toLowerCase().replace("&#39;","'") === dbItem.name.toLowerCase();
            });

            let proposedTier = proposedItem.tiers.find(function(potentialTier)
            {
                return Number(potentialTier.tier) === Number(dbItem.tier);
            });

            proposedTier.effects.forEach(function(effect)
            {
                let proposedEffect = this.#effectModel.find(function(potentialEffect)
                {
                    return potentialEffect.name.toLowerCase() === effect.name.toLowerCase();
                }) ?? {};

                if(proposedEffect.stacking)
                {
                    proposedEffect["effect_name"] = effect.name.toLowerCase();

                    effect.values.forEach(function(value)
                    {
                        value["stack"] = value.amount;
                    });
                }
                else
                {
                    proposedEffect["effect_name"] = effect.name.toLowerCase().replace(" ","+") + "_t" + proposedTier.tier;
                }

                proposedEffect["values"] = effect.values ?? null;
                proposedEffect["charges"] = effect.charges ?? null;
                proposedEffect["perType"] = effect.perType ?? null;
                proposedEffect["displayName"] = proposedItem.name + " [T" + proposedTier.tier + "]";
                proposedEffect["item_name"] = itemName;
                proposedEffect["instance"] = (dbItem.instanceKey === "" ? null : {[dbItem.instanceKey]: Number(dbItem.instanceValue)});

                let extantEffect = this.#benefits.find((thisEffect) => {return thisEffect.effect_name === proposedEffect.effect_name});

                if(extantEffect === undefined)
                {
                    let usedItem = itemUses.find(function(itemEffect)
                    {
                        return itemEffect.effect === proposedEffect["effect_name"];
                    }, this.#globalThis);

                    if(usedItem !== undefined)
                    {
                        switch(proposedEffect["perType"])
                        {
                            case("sim"):
                            {
                                proposedEffect["uses"] = usedItem["simUses"];
                                break;
                            }
                            case("scene"):
                            {
                                proposedEffect["uses"] = usedItem["jobUses"];
                                break;
                            }
                            case("term"):
                            {
                                proposedEffect["uses"] = usedItem["termUses"];
                                break;
                            }
                            case("item"):
                            default:
                            {
                                proposedEffect["uses"] = usedItem["itemUses"];
                                break;
                            }
                        }
                    }
                    else
                    {
                        proposedEffect["uses"] = 0;
                    }

                    this.#benefits.push(structuredClone(proposedEffect));

                    if(Object.keys(proposedItem).includes("dataEffectString"))
                    {
                        proposedItem["dataEffectString"] += "!" + proposedEffect["effect_name"] + ";"
                    }
                    else
                    {
                        proposedItem["dataEffectString"] = "!" + proposedEffect["effect_name"] + ";"
                    }

                }
                else
                {
                    extantEffect.values.forEach(function(extantValue)
                    {
                        let propValue = proposedEffect.values.find((proposedValue) => {return proposedValue.name === extantValue.name;});
                        extantValue["stack"] += propValue.amount;
                    });
                }
            }, this.#globalThis);

            this.#items.push({
                "item_name": itemName,
                "tier": proposedTier.tier,
                "display_name": proposedItem.name + " [T" + proposedTier.tier + "]",
                "category": proposedItem.category,
                "type": proposedItem.type,
                "tags": proposedItem.tags,
                "effects": proposedTier.effects,
                "dataEffect": proposedItem.dataEffectString
            });
            */

        }, this.#globalThis);

        console.log(this.#items);
        console.log(this.#benefits);

        this.#items.forEach(function(item)
        {
            $("#noItems").addClass("hidden");

            let itemCat = null;
            switch(item.category)
            {
                case("arms"):
                {
                    itemCat = "arms";
                    break;
                }
                case("customization"):
                {
                    itemCat = "cust";
                    break;
                }
                default:
                {
                    switch(item.subCategory)
                    {
                        case("cyberdeck"):
                        {
                            itemCat = "deck";
                            break;
                        }
                        case("implant_arm"):
                        {
                            itemCat = "impl";
                            break;
                        }
                        case("consumable"):
                        case("consumable_drug"):
                        {
                            itemCat = "cons";
                            break;
                        }
                        default:
                        {
                            itemCat = "util";
                            break;
                        }
                    }
                    break;
                }
            }
            $(".itemCat[data-cat='" + itemCat + "']").removeClass("hidden");

            $(".itemCat[data-cat='" + itemCat + "'] > .itemList").append(
                            "<li id='" + item.id + "' class='itemItem'>" +
                                "<span class='itemName'>" + item.displayName + "</span>" +
                                "<span class='itemActions' data-effect='" + item.dataEffectString + "'></span>" +
                            "</li>");
        });
    }

    setupInputs()
    {
        let benefitsHavingInputs = this.#benefits.filter(function(potentialEffect)
        {
            return potentialEffect.effectType === "inputs";
        });

        benefitsHavingInputs.forEach(function(mainBenefit)
        {
            let disabled = mainBenefit.isDisabled();

            mainBenefit.effects.forEach(function(inputEntry, inputIndex)
            {
                let inputHTML = mainBenefit.getInputHTML(inputIndex);

                switch(inputHTML.category)
                {
                    case("crack"):
                    {
                        $("#initItemList").append(inputHTML.value);
                        break;
                    }
                    case("confirm"):
                    {
                        this.#confirmInputs.push(inputHTML.value);
                        break;
                    }
                    case("inventory"):
                    {
                        $(".itemItem > .itemActions[data-effect*='" + mainBenefit.parent.dataEffectString + "']").append(inputHTML.value);
                        break;
                    }
                    case("execute"):
                    {
                        this.#executeInputs.push(inputHTML.value);
                        break;
                    }
                }
            }, this);
        }, this);
    }

    getConfirmInputs()
    {
        let returnArray = [];

        this.#confirmInputs.forEach(function(confirmObject)
        {

        }, this.#globalThis);

        return returnArray;
    }

    getExecuteInputs()
    {
        let returnArray = [];

        this.#executeInputs.forEach(function(input, index)
        {
            let parentEffect = this.#benefits.find(function(effect)
            {
                return effect.effect_name === input.effect_name;
            });

            let parsedLabel = this.#parseLabel(parentEffect, input["label"]);
            let conditionCheck = true;

            if(Object.keys(input).includes("condition"))
            {
                let checkResults = this.#checkCondition(input.condition);
                if(typeof checkResults === "string")
                {
                    conditionCheck = false;
                    parsedLabel = checkResults;
                }
                else
                {
                    conditionCheck = checkResults;
                }
            }

            let HTMLString = "<button id='" + input["effect_name"] + "_" + index + "' class='modalButton'" + (conditionCheck === false ? " disabled" : "") + ">" + parsedLabel + "</button>";

            let onPointerUpFunction = function(inputArg, inputIndex, timer=null, startTimerArgs=null)
            {
                inputArg["activation"].forEach(function(activation, activationIndex)
                {
                    switch(activation["type"])
                    {
                        case("complete_timer"):
                        {
                            $("#" + inputArg["effect_name"] + "_" + inputIndex).remove();

                            if(activation["animation"] !== null)
                            {
                                //!! DIGIPET ANIMATION
                            }

                            $("#executeButton").prop("disabled", true);

                            timer.startTimer(startTimerArgs[0], startTimerArgs[1], startTimerArgs[2]);
                            break;
                        }
                        case("payload_effect"):
                        {
                            payload.addTempEffect(inputArg["effect_name"], inputIndex, activationIndex);
                        }
                        default:
                        {
                            //payload.activateItemEffect(inputArg["effect_name"], inputIndex, activationIndex);
                            break;
                        }
                    }
                });
            };

            returnArray.push({
                "buttonHTML": HTMLString,
                "buttonEnabled": conditionCheck,
                "itemID": input["effect_name"] + "_" + index,
                "function": onPointerUpFunction,
                "functionInput": structuredClone(input),
                "functionIndex": index
            });
        }, this.#globalThis);

        return returnArray;
    }

    #checkCondition(effectConditions, itemValues=null)
    {

    }

    #parseLabel(parentEffect, labelString, extraInfo=null)
    {

    }

    #displayActivationLabel(parentEffect, labelObject)
    {
        let parsedLabel = this.#parseLabel(parentEffect, labelObject.label);

        switch(labelObject.location)
        {
            case("crack_extra"):
            {
                $("#extraDetails").append("<span id='" + parentEffect.effect_name + "'>" + parsedLabel + "</span>");
                break;
            }
            case("crack_hacking"):
            {
                $("#hackDetails").append("<span id='" + parentEffect.effect_name + "'>" + parsedLabel + "</span>");
                break;
            }
        }
    }

    #removeActivationLabel(parentEffect, labelObject)
    {
        switch(labelObject.location)
        {
            case("crack_extra"):
            {
                $("#extraDetails #" + parentEffect.effect_name).remove();
                break;
            }
            case("crack_hacking"):
            {
                $("#hackDetails #" + parentEffect.effect_name).remove();
                break;
            }
        }
    }

    #displayActivationIcon(activationDetails)
    {
        let iconObject = activationDetails["icon"];

        if($("#itemStatus img[data-icon='" + activationDetails["name"] + "']").length === 0)
        {
            if(Object.keys(iconObject).includes("hierarchy"))
            {
                let overwrites = iconObject["hierarchy"]["overwrites"];
                let overwritten = iconObject["hierarchy"]["overwritten_by"];

                if($("#itemStatus img").filter(function(index, element)
                {
                    return overwritten.includes(element.dataset["icon"]);
                }).length === 0)
                {
                    let replaceableImg = $("#itemStatus img").filter(function(index, element)
                    {
                        return overwrites.includes(element.dataset["icon"]);
                    });

                    if(replaceableImg.length === 0)
                    {
                        $("#itemStatus").append('<img data-icon="' + activationDetails["name"] + '" src="' + iconObject["source"] + '"/>');
                    }
                    else
                    {
                        $(replaceableImg[0]).attr("src", iconObject["source"]);
                        $(replaceableImg[0]).attr("data-icon", activationDetails["name"]);
                    }
                }
                else
                {
                    // Do nothing, you were overwritten
                }
            }
            else
            {
                $("#itemStatus").append('<img data-icon="' + activationDetails["name"] + '" src="' + iconObject["source"] + '"/>');
            }
        }
        else
        {
            $("#itemStatus img[data-icon='" + activationDetails["name"] + "']").attr("src", iconObject["source"]);
        }
    }

    #removeActivationIcon(activationDetails)
    {
        $("#itemStatus img[data-icon='" + activationDetails["name"] + "']").remove();
    }

    #activateEffect(parentEffect, activationDetails, activate=true, initial=false)
    {
        let amount = null;

        if(Object.keys(activationDetails).includes("amount"))
        {
            if(Object.keys(activationDetails).includes("stack"))
            {
                amount = activationDetails["stack"];
            }
            else
            {
                let amountPath = activationDetails.amount.split(":");
                amount = parentEffect.values.find(function(value)
                {
                    return value.name === amountPath[1];
                })[amountPath[2]];
            }
        }

        if(Object.keys(activationDetails).includes("icon"))
        {
            if(activate)
            {
                this.#displayActivationIcon(activationDetails);
            }
            else
            {
                this.#removeActivationIcon(activationDetails);
            }
        }

        if(Object.keys(activationDetails).includes("label"))
        {
            if(activate)
            {
                this.#displayActivationLabel(parentEffect, activationDetails.label);
            }
            else
            {
                this.#removeActivationLabel(parentEffect, activationDetails.label);
            }
        }

        switch(activationDetails.type)
        {
            case("plus_tags"):
            {
                if(activate)
                {
                    updateTags(amount, Session.ITEMS);
                }
                else
                {
                    updateTags(amount * -1, Session.ITEMS);
                }
                break;
            }
            case("plus_hacking"):
            case("plus_alarm_sense"):
            {
                if(activate)
                {
                    payload.plusFunction(activationDetails.type, amount);
                }
                else
                {
                    payload.minusFunction(activationDetails.type, amount);
                }
                break;
            }
            case("payload_has_cyberdeck"):
            {
                if(activate)
                {
                    payload.addCyberdeck(parentEffect.effect_name);
                }
                else
                {
                    payload.removeCyberdeck(parentEffect.effect_name);
                }
                break;
            }
            case("action_time"):
            {
                if(activate)
                {
                    payload.setActionTime(parentEffect.effect_name, amount);
                }
                else
                {
                    payload.setActionTime(parentEffect.effect_name, amount * -1);
                }
                break;
            }
            case("action_cost"):
            {
                if(activate)
                {
                    payload.setActionCost(parentEffect.effect_name, activationDetails["action_type"], amount);
                }
                else
                {
                    payload.setActionCost(parentEffect.effect_name, activationDetails["action_type"], amount * -1);
                }
                break;
            }
            case("skip_timer"):
            {
                // Handled by ConfirmInputs
                break;
            }
            case("complete_timer"):
            {
                // Handled by ExecuteInputs
                break;
            }
            case("terminal_effect"):
            {
                if(activate)
                {
                    session.addStatusEffect(activationDetails.name);
                }
                else
                {
                    session.removeStatusEffect(activationDetails.name);
                }
                break;
            }
            case("payload_effect"):
            {
                if(activate)
                {
                    payload.addStatusEffect(activationDetails.name, parentEffect.perType, session.getTerminalID());
                }
                else
                {
                    payload.removeStatusEffect(activationDetails.name);
                }
                break;
            }
            case("pop-up"):
            {
                break;
            }
        }

        if(initial)
        {
            if(activate)
            {
                this.#initialActivations.push(parentEffect.effect_name);
            }
            else
            {
                this.#initialActivations.splice(this.#initialActivations.findIndex(function(effect_name)
                {
                    return effect_name === parentEffect.effect_name;
                }), 1);
            }
        }
    }

    toggleEffect(target_id, target_index, activate)
    {
        let targetEffect = this.#benefits.find(function(effect)
        {
            return effect.effect_name === target_id;
        });

        targetEffect.input[target_index].activation.forEach(function(activation)
        {
            this.#activateEffect(targetEffect, activation, activate, true);
        }, this.#globalThis);
    }

    useItem(target_id, target_index)
    {
        let targetEffect = this.#benefits.find(function(effect)
        {
            return effect.effect_name === target_id;
        });

        let targetInput = targetEffect.input[target_index];

        let actionMap = {
            targetEffect: targetEffect,
            targetInput: targetInput,
            targetID: targetEffect["effect_name"],
            action: targetEffect["effect_name"],
            actionType: "item"
        };

        if(Object.keys(targetInput).includes("confirm"))
        {
            let buttonArray = [{
				id: target_id + "_" + target_index,
				text: targetInput["confirm"]["button"],
				data: session.getTerminalID(),
				global: false
			}];

			let confirmMap = {
				headerText: "Confirm Item Activation",
				bodyText: this.#parseLabel(targetEffect, targetInput["confirm"]["body"], targetInput["cost"] ?? null),
				buttonArray: buttonArray
			};

            actionModal.showConfirmPage(actionMap, confirmMap, true);
        }
        else
        {
            this.executeItem(actionMap);
        }
    }

    executeItem(actionMap)
    {
        let maxTime = 30;

        let targetTimer = actionMap["targetInput"]["confirm"]["timer"];

        switch(targetTimer["type"])
        {
            case("skip"):
            {
                // skip the execute window entirely
                actionModal.skipExecutePage(actionMap, true);
                break;
            }
            case("static"):
            {
                maxTime = targetTimer["seconds"];
                break;
            }
            case("action"):
            {
                maxTime = payload.getActionTime(targetTimer["seconds"]);
                break;
            }
        }

        let executeMap = {
            headerText: "Activate / Item",
            maxTime: maxTime
        }

        actionModal.showExecutePage(actionMap, executeMap, true);
    }

    completeItem(actionMap)
    {
        closeModal("executed");

        $("#load").addClass("hidden");

        //actionMap:
            // targetEffect: targetEffect,
            // targetInput: targetInput,
            // targetID: targetEffect["effect_name"],
            // action: targetEffect["effect_name"],
            // actionType: "item"

        // Update charges on item in inventory
        // >> itemMarks under id=effect_name...
        /* $(".deckButton[data-effect='" + actionMap["targetID"] + "']").parent().find(".itemMarks img:nth-child(-n + " + actionMap["usedCharges"] + ")").attr("src","/resources/images/actions/itemfilled.png");
        */
        // >> if no more charges, disable button
        // #activateEffect()
        // useItems.php
        // >> userID
        // >> effects: []
        // >> termID

        let parentEffect = this.#benefits.find(function(potentialEffect)
        {
            return potentialEffect.effect_name === actionMap["targetEffect"].effect_name;
        });
        let targetInput = actionMap["targetInput"];

        let parsedLabel = this.#parseLabel(parentEffect, targetInput["label"]);
        let conditionCheck = true;

        if(Object.keys(targetInput).includes("condition"))
        {
            let checkResults = this.#checkCondition(targetInput.condition);
            if(typeof checkResults === "string")
            {
                conditionCheck = false;
                parsedLabel = checkResults;
            }
            else
            {
                conditionCheck = checkResults;
            }
        }

        let remCharges = Number.POSITIVE_INFINITY;

        if(Object.keys(parentEffect).includes("charges"))
        {
            parentEffect["uses"]++;

            $("#" + parentEffect["effect_name"]).parent().find(".itemMarks img:nth-child(-n + " + parentEffect["uses"] + ")").attr("src","/resources/images/actions/itemfilled.png");

            remCharges = parentEffect["charges"] - parentEffect["uses"];
        }

        if((remCharges <= 0) || (conditionCheck === false))
        {
            $("#" + parentEffect["effect_name"]).attr("disabled", true);
            $("#" + parentEffect["effect_name"]).prop("disabled", true);
        }
        $("#" + parentEffect["effect_name"]).html(parsedLabel);

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/resources/scripts/terminal/db/useItems.php",
            data:
            {
                userID: payload.getUserID(),
                effects: parentEffect["effect_name"],
                termID: session.getTerminalID()
            }
        });

        targetInput["activation"].forEach(function(activation)
        {
            this.#activateEffect(parentEffect, activation, true);
        }, this.#globalThis);
    }

    applyTermLoginEffects()
    {
        let termLoginHavingEffects = this.#benefits.filter(function(potentialEffect)
        {
            return Object.keys(potentialEffect).includes("term_login");
        });

        termLoginHavingEffects.forEach(function(mainEffect)
        {
            let chargeDisabled = false;

            if((mainEffect["charges"] !== null) && (mainEffect["uses"] >= mainEffect["charges"]))
            {
                chargeDisabled = true;
            }

            mainEffect.term_login.forEach(function(tlEntry)
            {
                let conditionCheck = true;

                if(Object.keys(tlEntry).includes("condition"))
                {
                    let itemInstance = null

                    if(Object.keys(mainEffect).includes("instance"))
                    {
                        itemInstance = mainEffect.instance;
                    }
                    let checkResults = this.#checkCondition(tlEntry.condition, itemInstance);
                    if(typeof checkResults === "string")
                    {
                        conditionCheck = false;
                        parsedLabel = checkResults;
                    }
                    else
                    {
                        conditionCheck = checkResults;
                    }
                }

                if((conditionCheck === true) && (chargeDisabled === false))
                {
                    this.#activateEffect(mainEffect, tlEntry, true, true);
                }
            }, this.#globalThis);
        }, this.#globalThis);

        let decks = this.#items.filter(function(potentialItem)
        {
            return potentialItem.type === "cyberdeck";
        });

        decks.forEach(function(deck)
        {
            payload.addCyberdeck(deck.item_name);
        });
    }

    reapplyDisplayEffects(payloadEffects)
    {
        /*
        payloadEffects.forEach(function(payloadEffect)
        {
            let activation = null;
            JSON.stringify(this.#benefits, (_, nestedValue) => {
                if (nestedValue &&
                    nestedValue["type"] === "payload_effect" &&
                    Object.keys(nestedValue).includes("icon") &&
                    nestedValue["name"] === payloadEffect)
                {
                    activation = nestedValue;
                }
                return nestedValue;
            });

            if(activation !== null)
            {
                this.#displayActivationIcon(activation);
            }
        }, this.#globalThis); */
    }

    submitInitialEffects()
    {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/resources/scripts/terminal/db/useItems.php",
            data:
            {
                userID: payload.getUserID(),
                effects: [...new Set(this.#initialActivations)],
                termID: session.getTerminalID()
            }
        });
    }

    submitEffects(effectArray)
    {
        effectArray.forEach(function(effect)
        {
            let parentEffect = this.#benefits.find(function(potentialEffect)
            {
                return potentialEffect.effect_name === effect.effect_name;
            });
            let targetActivation = parentEffect["input"][effect.input_index]["activation"][effect.activation_index];

            parentEffect.uses++;

            $.ajax({
                type: "POST",
                dataType: "json",
                url: "/resources/scripts/terminal/db/useItems.php",
                data:
                {
                    userID: payload.getUserID(),
                    effects: parentEffect["effect_name"],
                    termID: session.getTerminalID()
                }
            });

            this.#activateEffect(parentEffect, targetActivation, true);
        }, this.#globalThis);
    }

    applyPostActionEffects(actionMap)
    {
        let postActionHavingEffects = this.#benefits.filter(function(potentialEffect)
        {
            return Object.keys(potentialEffect).includes("post_action");
        });

        postActionHavingEffects.forEach(function(mainEffect)
        {
            let chargeDisabled = false;

            if((mainEffect["charges"] !== null) && (mainEffect["uses"] >= mainEffect["charges"]))
            {
                chargeDisabled = true;
            }

            mainEffect.post_action.forEach(function(pAEntry)
            {
                let conditionCheck = true;

                if(Object.keys(pAEntry).includes("condition"))
                {
                    let checkResults = this.#checkCondition(pAEntry.condition, actionMap);

                    conditionCheck = checkResults;
                }

                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "/resources/scripts/terminal/db/useItems.php",
                    data:
                    {
                        userID: payload.getUserID(),
                        effects: mainEffect["effect_name"],
                        termID: session.getTerminalID()
                    }
                });

                if((conditionCheck === true) && (chargeDisabled === false))
                {
                    this.#activateEffect(mainEffect, pAEntry, true);
                }
            }, this.#globalThis);
        }, this.#globalThis);
    }

    checkItemConditions()
    {
        let itemButtons = $(".itemButton");

        let globalThis = this.#globalThis;

        itemButtons.each(function (index, itemButton)
        {
            let parentEffect = globalThis.#benefits.find(function(proposedEffect)
            {
                return proposedEffect.effect_name === $(itemButton).attr("id");
            });

            let targetInput = parentEffect.input[Number($(itemButton).attr("data-input"))];

            let chargeDisabled = false;

            if((parentEffect["charges"] !== null) && (parentEffect["uses"] >= parentEffect["charges"]))
            {
                chargeDisabled = true;
            }

            let conditionCheck = true;

            if(Object.keys(targetInput).includes("condition"))
            {
                let checkResults = globalThis.#checkCondition(targetInput.condition);
                if(typeof checkResults === "string")
                {
                    conditionCheck = false;
                    $(itemButton).html(checkResults);
                }
                else
                {
                    conditionCheck = checkResults;
                }
            }

            if((chargeDisabled === true) || (conditionCheck !== true))
            {
                $(itemButton).prop("disabled",true);
                $(itemButton).attr("disabled",true);
            }
        });
    }
}