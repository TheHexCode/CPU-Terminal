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
            return potentialTag.tag === tagName;
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
        }, this);

        if(useObject !== undefined)
        {
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
        }
        else
        {
            this._uses = 0;
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

    get parent()
    {
        return (Array.isArray(this._parent) ? this._parent[0] : this._parent);
    }
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

    static parseValuesLabel(labelString, parentValues)
    {
        let parseMatches = [];

        if(labelString !== null)
        {
            parseMatches = labelString.match(/{.*?}/g) ?? [];
        }

        parseMatches.forEach(function(match)
        {
            let modifier = (match.split("!")[1] ?? "}").split("}")[0];
            let pathArray = match.split("!")[0].split("{")[1].split("}")[0].split(":");

            let result = 0;

            if(pathArray[0] === "values")
            {
                let splitKey = pathArray[1].split(/([*/+-])/);
                let resultValue = parentValues[splitKey[0]];

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
            }
            else
            {
                // Needs to be a "values:..." string
                return false;
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

    parseLabel(labelString, effectIndex=null)
    {
        let parseMatches = [];

        if(labelString !== null)
        {
            parseMatches = labelString.match(/{.*?}/g) ?? [];
        }

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

    checkConditions(effectConditions, extraValue=null)
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

        if(effectConditions === null)
        {
            return true;
        }
        else
        {
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
                                case("status"):
                                {
                                    leftType = "array";
                                    left = payload.getStatusEffects().map((effectObject) => effectObject.name );
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
                        case("session"):
                        {
                            switch(leftArray[1])
                            {
                                case("status"):
                                {
                                    leftType = "array";
                                    left = session.getStatusEffects();
                                    break;
                                }
                                case("copyables"):
                                {
                                    leftType = "array";
                                    left = session.getCopyableActions();
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
                                    left = extraValue;
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
                            case("action"):
                            {
                                switch(rightArray[1])
                                {
                                    case("type"):
                                    {
                                        right = extraValue;
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

                    /*
                    console.log(this._name);
                    console.log(left);
                    console.log(operation);
                    console.log(right);
                    console.log(pass);
                    console.log("-----------------------")
                    */

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
            }, this);

            return returnValue;
        }
    }

    getCost(inputObject, inputIndex)
    {
        let cost = null;

        if(Object.keys(inputObject).includes("cost"))
        {
            cost = this.parseLabel("{cost}", inputIndex);
        }
        else if(Object.keys(inputObject).includes("activations"))
        {
            let thisBenefit = this;
            let plusAmount = inputObject.activations.reduce(function(accumulator, thisActivation)
            {
                if(thisActivation.type === "plus_tags")
                {
                    return accumulator + Number(thisBenefit.parseLabel("{" + thisActivation.amount + "}"));
                }
                else
                {
                    return accumulator;
                }
            }, 0);

            if(plusAmount > 0)
            {
                cost = plusAmount * -1;
            }
        }

        return cost;
    }

    isDisabled()
    {
        return ((this._charges !== null) &&
                (this.#remCharges <= 0));
    }

    #getInputDetails(inputObject, inputIndex, extraValue=null)
    {
        let parsedLabel = this.parseLabel(inputObject.label);
        let conditionCheck = true;

        if(Object.keys(inputObject).includes("conditions"))
        {
            let checkResults = this.checkConditions(inputObject.conditions, extraValue);
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

        let cost = this.getCost(inputObject, inputIndex);

        return {
            label: parsedLabel,
            passed: conditionCheck,
            cost: cost
        }
    }

    getInputHTML(inputIndex, extraValue=null)
    {
        if(this._effectType !== "inputs") { return; }

        let targetInput = this._effects[inputIndex];
        let inputID = this._id + "-" + inputIndex;

        let inputDetails = this.#getInputDetails(targetInput, inputIndex, extraValue);
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
                        returnHTML += '<div class="initItem' + ((chargeDisabled || !inputDetails.passed) ? ' dimmed' : '') + '" data-input="' + inputID +'">' +
                                            '<div class="initHeader">' + targetInput.header + '</div>' +
                                            '<div class="initOption">' +
                                                '<input type="checkbox" id="' + this._id + '" onclick="initCheck(this, ' + inputIndex + ')"' + ((chargeDisabled || !inputDetails.passed) ? ' disabled' : '') + '>' +
                                                '<label for="' + this._id + '">' + inputDetails.label + "</label>" +
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
                        returnHTML +=     "<span class='confirmBox" + ((chargeDisabled || !inputDetails.passed) ? " dimmed'" : "'") + " >" +
                                                "<input id='" + this._id + "-" + inputIndex + "' class='confirmInput' type='checkbox'" + ((chargeDisabled || !inputDetails.passed) ? " disabled" : "") + " />" +
                                                "<span class='confirmLabel'>" + inputDetails.label + "</span>" +
                                            "</span>";

                        let onChangeFunction = function(eventArg, benefitArg, inputIndex)
                        {
                            let targetInput = benefitArg.effects[inputIndex];
                            targetInput.activations.forEach(function(activation, activationIndex)
                            {
                                switch(activation.type)
                                {
                                    case("skip_timer"):
                                    {
                                        if($(eventArg.target).prop("checked"))
                                        {
                                            payload.addTempEffect(benefitArg.id, inputIndex, activationIndex);
                                            payload.addTempEffect("skip_timer", null, null);
                                        }
                                        else
                                        {
                                            payload.removeTempEffect(benefitArg.id, inputIndex, activationIndex);
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

                        return {
                            category: "confirm",
                            value: {
                                "inputHTML": returnHTML,
                                "itemID": this._id + "-" + inputIndex,
                                "function": onChangeFunction,
                                "functionBenefit": this,
                                "functionIndex": inputIndex
                            }
                        };
                    }
                    case("ph_login"):
                    {
                        return {
                            category: "ph_login",
                            value: null
                        }
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
                        returnHTML += "<span class='itemActionRow' data-input='" + inputID + "'>";

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

                        returnHTML += "<button id='" + this._id + "' class='itemButton' onclick='useItem(this," + inputIndex + ")'" + ((inputDetails.cost !== null) ? " data-cost='" + inputDetails.cost + "'" : "") + ((chargeDisabled || !inputDetails.passed) ? " disabled" : "") + ">" + inputDetails.label + "</button>" +
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

                        returnHTML +=   "<div class='initItem" + ((chargeDisabled || !inputDetails.passed) ? " dimmed" : "") + "' data-input='" + inputID + "'>" +
                                            '<div class="initHeader">' + this._parent.displayName + '</div>' +
                                            "<div class='initActionRow' >";

                        if(this._chargePerType === "sim" || this._chargePerType === "scene")
                        {
                            returnHTML +=       "<span class='itemMarks'>";

                            for(let i = 0; i < this._uses; i++)
                            {
                                returnHTML +=       "<img src='/resources/images/actions/itemfilled.png' />";
                            }

                            for(let j = this._uses; j < this._charges; j++)
                            {
                                returnHTML +=       "<img src='/resources/images/actions/itemopen.png' />";
                            }

                            returnHTML +=           "<span>per " + (titleCase(this._chargePerType)) + "</span>" +
                                                "</span>";
                        }

                        returnHTML +=           '<div class="initOption">' +
                                                    '<button id="' + this._id + '" class="itemButton" data-input="' + inputIndex + '" onclick="useItem(this,' + inputIndex + ')"' + ((chargeDisabled || !inputDetails.passed) ? ' disabled' : '') + '>' + inputDetails.label + '</button>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>';

                         return {
                            category: "crack",
                            value: returnHTML
                        };
                    }
                    case("execute"):
                    {
                        returnHTML += "<button id='" + this._id + "-" + inputIndex + "' class='modalButton'" + ((chargeDisabled || !inputDetails.passed) ? " disabled" : "") + ">" + inputDetails.label + "</button>";

                        let onPointerUpFunction = function(benefitArg, inputIndex, timer=null, startTimerArgs=null)
                        {
                            let targetInput = benefitArg.effects[inputIndex];

                            targetInput.activations.forEach(function(activation, activationIndex)
                            {
                                switch(activation.type)
                                {
                                    case("complete_timer"):
                                    {
                                        $("#" + benefitArg._id + "-" + inputIndex).remove();

                                        if(activation.animation !== null)
                                        {
                                            //!! DIGIPET ANIMATION
                                        }

                                        $("#executeButton").prop("disabled", true);

                                        timer.startTimer(startTimerArgs[0], startTimerArgs[1], startTimerArgs[2]);
                                        break;
                                    }
                                    case("status"):
                                    {
                                        switch(activation.scope)
                                        {
                                            case("payload"):
                                            {
                                                payload.addTempEffect(benefitArg.id, inputIndex, activationIndex);
                                                break;
                                            }
                                            case("session"):
                                            {
                                                //session.addTempEffect(benefitArg.id, inputIndex, activationIndex);
                                                break;
                                            }
                                        }
                                    }
                                    default:
                                    {
                                        //payload.activateItemEffect(inputArg["effect_name"], inputIndex, activationIndex);
                                        break;
                                    }
                                }
                            });
                        };

                        return {
                            category: "execute",
                            value: {
                                "buttonHTML": returnHTML,
                                "buttonEnabled": inputDetails.passed,
                                "itemID": this._id + "-" + inputIndex,
                                "function": onPointerUpFunction,
                                "functionBenefit": this,
                                "functionIndex": inputIndex
                            }
                        };
                    }
                    case("ph_login"):
                    {
                        return {
                            category: "ph_login",
                            value: null
                        }
                    }
                }
                break;
            }
        }
    }

    useBenefit()
    {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/resources/scripts/terminal/db/useItems.php",
            data:
            {
                userID: payload.getUserID(),
                effects: this._id,
                termID: session.getTerminalID()
            }
        });


        this._uses++;
        this.#remCharges = this._charges - this._uses;
    }
}

class Activation
{
    /*
    TYPE: ENUM (
        PLUS_TAGS: {
            AMOUNT [REQUIRES PARSING],
            ?LABEL:
            {
                LOCATION: ENUM (
                    "CRACK_EXTRA",
                ),
                LABEL [REQUIRES PARSING]
            },
            CONDITIONS
        },
        PLUS_FUNCTION: {
            FUNCTION,
            AMOUNT,
            ?LABEL
        }
        SKIP_TIMER: {},
        STATUS: {
            SCOPE: ENUM (
                SESSION,
                PAYLOAD
            ),
            NAME
        },
        COMPLETE_TIMER: {
            ?ANIMATION
        },
        POP-UP: {
            NAME
        },
        ACTION_COST: {
            AMOUNT,
            ACTION_TYPE: "ACCESS" / "ANY" ...
        },
        ACTION_TIME: {
            AMOUNT
        },
        CYBERDECK_OVERRIDE: {},

    )
    */
    #parent;
    #type;
    #amount;
    #label;
    #name;
    /*
    #function;
    #scope;
    #animation;
    #actionType;
    */
    #detail;

    constructor(parentInstance, activationObject)
    {
        this.#parent = parentInstance;
        this.#type = activationObject.type;
        this.#amount = activationObject.amount ?? null;
        this.#label = activationObject.label ?? null;
        this.#name = activationObject.name ?? null;

        switch(true)
        {
            case(Object.keys(activationObject).includes("function")):
            {
                this.#detail = activationObject.function;
                break;
            }
            case(Object.keys(activationObject).includes("scope")):
            {
                this.#detail = activationObject.scope;
                break;
            }
            case(Object.keys(activationObject).includes("animation")):
            {
                this.#detail = activationObject.animation;
                break;
            }
            case(Object.keys(activationObject).includes("action_type")):
            {
                this.#detail = activationObject.action_type;
                break;
            }
            default:
            {
                this.#detail = null;
                break;
            }
        }
    }

    #displayActivationLabel(labelObject)
    {
        if(labelObject !== null)
        {
            switch(labelObject.location)
            {
                case("crack_extra"):
                {
                    $("#extraDetails").append("<span id='" + this.#parent.id + "'>" + labelObject.parsedLabel + "</span>");
                    break;
                }
                case("crack_hacking"):
                {
                    $("#hackDetails").append("<span id='" + this.#parent.id + "'>" + labelObject.parsedLabel + "</span>");
                    break;
                }
            }
        }
    }

    #removeActivationLabel(labelObject)
    {
        if(labelObject !== null)
        {
            switch(labelObject.location)
            {
                case("crack_extra"):
                {
                    $("#extraDetails #" + this.#parent.id).remove();
                    break;
                }
                case("crack_hacking"):
                {
                    $("#hackDetails #" + this.#parent.id).remove();
                    break;
                }
            }
        }
    }

    activate(useStatic=false)
    {
        let amount = null;

        if(useStatic)
        {
            amount = Number(Benefit.parseValuesLabel("{" + this.#amount + "}", this.#parent.values));
            if(this.#label !== null)
            {
                this.#label["parsedLabel"] = Benefit.parseValuesLabel(this.#label.label, this.#parent.values);
            }
        }
        else
        {
            amount = Number(this.#parent.parseLabel("{" + this.#amount + "}"));
            if(this.#label !== null)
            {
                this.#label["parsedLabel"] = this.#parent.parseLabel(this.#label.label);
            }
        }

        switch(this.#type)
        {
            case("plus_tags"):
            {
                this.#displayActivationLabel(this.#label);

                if(Gems.getCurrentStage() === Gems.ACCESS)
                {
                    updateTags(amount, Session.ITEMS);
                }
                else
                {
                    session.setCurrentTags(session.getCurrentTags() + amount);
                    Gems.updateTagGems(Gems.STANDBY, session.getCurrentTags());
                }
                break;
            }
            case("plus_function"):
            {
                this.#displayActivationLabel(this.#label);
                payload.plusFunction(this.#detail, amount);
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
            case("action_cost"):
            {
                payload.setActionCost(this.#parent.id, this.#detail, amount);
                break;
            }
            case("action_time"):
            {
                payload.setActionTime(this.#parent.id, amount);
                break;
            }
            case("cyberdeck_override"):
            {
                payload.addCyberdeck(this.#parent.id);
                break;
            }
            case("status"):
            {
                switch(this.#detail) // scope
                {
                    case("payload"):
                    {
                        payload.addStatusEffect(this.#name, this.#parent.values);
                        break;
                    }
                    case("session"):
                    {
                        session.addStatusEffect(this.#name);
                        break;
                    }
                }
                break;
            }
            case("pop-up"):
            {
                // pass for now
                break;
            }
        }
    }

    deactivate(useStatic=false)
    {
        let amount = -1;

        if(useStatic)
        {
            amount = amount * Number(Benefit.parseValuesLabel("{" + this.#amount + "}", this.#parent.values));
        }
        else
        {
            amount = amount * Number(this.#parent.parseLabel("{" + this.#amount + "}"));
        }

        switch(this.#type)
        {
            case("plus_tags"):
            {
                this.#removeActivationLabel(this.#label);

                if(Gems.getCurrentStage() === Gems.ACCESS)
                {
                    updateTags(amount, Session.ITEMS);
                }
                else
                {
                    session.setCurrentTags(session.getCurrentTags() + amount);
                    Gems.updateTagGems(Gems.STANDBY, session.getCurrentTags());
                }
                break;
            }
            case("plus_function"):
            {
                this.#removeActivationLabel(this.#label);
                payload.plusFunction(this.#detail, amount);
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
            case("action_cost"):
            {
                payload.setActionCost(this.#parent.id, this.#detail, amount);
                break;
            }
            case("action_time"):
            {
                payload.setActionTime(this.#parent.id, amount);
                break;
            }
            case("cyberdeck_override"):
            {
                payload.addCyberdeck(this.#parent.id);
                break;
            }
            case("status"):
            {
                switch(this.#detail) // scope
                {
                    case("payload"):
                    {
                        payload.removeStatusEffect(this.#name);
                        break;
                    }
                    case("session"):
                    {
                        session.removeStatusEffect(this.#name);
                        break;
                    }
                }
                break;
            }
            case("pop-up"):
            {
                // pass for now
                break;
            }
        }
    }
}

class StatusEffect
{
    _name;
    _type;
    _duration;
    #icon;
    #activations = [];
    _parentValues = [];

    constructor(type, statusObject)
    {
        this._name = statusObject.name;
        this._type = type;
        this._duration = statusObject.duration ?? null;
        this.#icon = statusObject.icon ?? null;

        if(Object.keys(statusObject).includes("activations"))
        {
            statusObject["activations"].forEach(function(activation)
            {
                this.#activations.push(new Activation(this, activation));
            }, this);
        }
    }

    get name()      { return this._name;            }
    get id()        { return this._name;            }
    get type()      { return this._type;            }
    get duration()  { return this._duration;        }
    get values()    { return this._parentValues;    }

    setValues(parentValues)
    {
        this._parentValues = parentValues;
    }

    #displayStatusIcon()
    {
        if($("#itemStatus img[data-icon='" + this._name + "']").length === 0)
        {
            if(Object.keys(this.#icon).includes("hierarchy"))
            {
                let lower_tier = this.#icon.hierarchy.superior_to;
                let higher_tier = this.#icon.hierarchy.inferior_to;

                let higherImg = $("#itemStatus img").filter(function(index, imgElement)
                {
                    return higher_tier.includes(imgElement.dataset["icon"]);
                });

                if(higherImg.length === 0) // No img higher than you is present
                {
                    let lowerImg = $("#itemStatus img").filter(function(index, imgElement)
                    {
                        return lower_tier.includes(imgElement.dataset["icon"]);
                    });

                    if(lowerImg.length === 0) // No img lower than you is present either, so just exist
                    {
                        $("#itemStatus").append('<img data-icon="' + this._name + '" src="' + this.#icon.source + '"/>');
                    }
                    else
                    {
                        $(lowerImg[0]).attr("src", this.#icon.source);
                        $(lowerImg[0]).attr("data-icon", this._name);
                    }
                }
                else
                {
                    // Do nothing, you were the lower tier
                }
            }
            else // No hierarchy, just add
            {
                $("#itemStatus").append('<img data-icon="' + this._name + '" src="' + this.#icon.source + '"/>');
            }
        }
        else
        {
            $("#itemStatus img[data-icon='" + this._name + "']").attr("src", this.#icon.source);
        }
    }

    #removeStatusIcon()
    {
         $("#itemStatus img[data-icon='" + this._name + "']").remove();
    }

    activate(reapply=false)
    {
        // display Icon
        // create parentless Activation

        this.#activations.forEach(function(activation)
        {
            if(Object.keys(activation).includes("icon"))
            {
                this.#displayStatusIcon();
            }
            activation.activate(true);
        });

        if((!reapply) && (this._duration !== null))
        {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "/resources/scripts/terminal/db/toggleEffect.php",
                data:
                {
                    targetType: this._type,
                    targetID: payload.getUserID(),
                    effectName: this._name,
                    effectValues: JSON.stringify(this._parentValues),
                    duration: this._duration,
                    termID: session.getTerminalID(),
                    toggle: true
                }
            });
        }
    }

    deactivate()
    {
        // removeIcon
        // deactivate Activations

        this.#activations.forEach(function(activation)
        {
            if(Object.keys(activation).includes("icon"))
            {
                this.#removeStatusIcon();
            }
            activation.deactivate(true);
        });

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/resources/scripts/terminal/db/toggleEffect.php",
            data:
            {
                targetType: this._type,
                targetID: payload.getUserID(),
                effect: this._name,
                duration: this._duration,
                termID: session.getTerminalID(),
                toggle: false
            }
        });
    }
}

class Inventory
{
    #globalThis = this;

    #models;
    #itemModel;
    #benefitModel;
    #statusModel;

    #allStatusEffects;

    #items;
    #benefits;

    #confirmInputs;
    #executeInputs;

    constructor()
    {
        this.#itemModel = $.getJSON("/resources/models/items.json");
        this.#benefitModel = $.getJSON("/resources/models/benefits.json");
        this.#statusModel = $.getJSON("/resources/models/statuses.json");

        this.#allStatusEffects = [];

        this.#items = [];
        this.#benefits = [];
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

        this.#statusModel["payload"].forEach(function(modelStatus)
        {
            this.#allStatusEffects.push((new StatusEffect("payload", modelStatus)));
        }, this);

        this.#statusModel["session"].forEach(function(modelStatus)
        {
            this.#allStatusEffects.push((new StatusEffect("session", modelStatus)));
        }, this);

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
                            payload.addCyberdeck(item.name);
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
                    case("inventory"):
                    {
                        $(".itemItem > .itemActions[data-effect*='" + mainBenefit.id + "']").append(inputHTML.value);
                        break;
                    }
                    case("confirm"):
                    {
                        this.#confirmInputs.push(inputHTML.value);
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

    getStatusEffect(statusEffectName)
    {
        return this.#allStatusEffects.find(function(statusEffect)
        {
            return statusEffect.name === statusEffectName;
        });
    }

    resetOnScreenInputs()
    {
        let benefitsHavingInputs = this.#benefits.filter(function(potentialEffect)
        {
            return potentialEffect.effectType === "inputs";
        });

        benefitsHavingInputs.forEach(function(mainBenefit)
        {
            mainBenefit.effects.forEach(function(inputEntry, inputIndex)
            {
                let inputHTML = mainBenefit.getInputHTML(inputIndex);
                let inputID = mainBenefit.id + "-" + inputIndex;

                switch(inputHTML.category)
                {
                    case("crack"):
                    {
                        $(".initItem[data-input='" + inputID + "']").replaceWith(inputHTML.value);
                        break;
                    }
                    case("inventory"):
                    {
                        $(".itemItem > .itemActions[data-effect*='" + mainBenefit.id + "'] > .itemActionRow[data-input='" + inputID + "']").replaceWith(inputHTML.value);
                        break;
                    }
                    case("confirm"):
                    case("execute"):
                    {
                        // PASS > Not "On Screen", don't need updates
                        break;
                    }
                }
            }, this);
        }, this);
    }

    getConfirmInputs(actionType)
    {
        this.#confirmInputs.forEach(function(confirmInput)
        {
            let newInputHTML =  confirmInput.functionBenefit.getInputHTML(confirmInput.functionIndex, actionType).value

            confirmInput.inputHTML = newInputHTML.inputHTML;
        }, this);

        return this.#confirmInputs;
    }

    getExecuteInputs()
    {
        this.#executeInputs.forEach(function(executeInput)
        {
            let newInputHTML =  executeInput.functionBenefit.getInputHTML(executeInput.functionIndex).value

            executeInput.buttonHTML = newInputHTML.buttonHTML;
            executeInput.buttonEnabled = newInputHTML.buttonEnabled;
        }, this);
        return this.#executeInputs;
    }

    /*
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
            parentEffect.toggleActivationLabel(activationDetails.label, activate);
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
            case("plus_function"):
            {
                if(activate)
                {
                    payload.plusFunction(activationDetails.function, amount);
                }
                else
                {
                    payload.minusFunction(activationDetails.function, amount);
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
    */

    // Used by toggling an item checkbox (init/crack screen)
    toggleInitialEffect(benefitID, inputIndex, activate)
    {
        let targetBenefit = this.#benefits.find(function(potentialBenefit)
        {
            return potentialBenefit.id === benefitID;
        });

        targetBenefit.effects[inputIndex].activations.forEach(function(activation, activationIndex)
        {
            if(activate)
            {
                (new Activation(targetBenefit, activation)).activate();

                payload.addTempEffect(targetBenefit.id, inputIndex, activationIndex);
            }
            else
            {
                (new Activation(targetBenefit, activation)).deactivate();

                payload.removeTempEffect(targetBenefit.id, inputIndex, activationIndex);
            }
        });
    }

    // Used when a button is clicked which spawns a confirm/execute window
    confirmItem(benefitID, inputIndex)
    {
        let targetBenefit = this.#benefits.find(function(potentialBenefit)
        {
            return potentialBenefit.id === benefitID;
        });

        let targetInput = targetBenefit.effects[inputIndex];

        let actionMap = {
            userID: payload.getUserID(),
            targetID: targetBenefit.id,
            action: targetBenefit.id,
            actionType: "item",
            buttonData: null,
            actionCost: targetBenefit.getCost(targetInput, inputIndex),
            global: false,
            /////////////////////////////
            targetBenefit: targetBenefit,
            targetInput: targetInput,
            inputIndex: inputIndex
        };

        if(Object.keys(targetInput).includes("confirm"))
        {
            let buttonArray = [{
				id: targetBenefit.id + "-" + inputIndex,
				text: targetInput["confirm"]["button"],
				data: session.getTerminalID(),
				global: false
			}];

			let confirmMap = {
				headerText: "Confirm Item Activation",
				bodyText: targetBenefit.parseLabel(targetInput["confirm"]["body"], inputIndex),
				buttonArray: buttonArray
			};

            actionModal.showConfirmPage(actionMap, confirmMap, true);
        }
        else
        {
            this.executeItem(actionMap);
        }
    }

    // Used when executing an item
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
                return;
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

    // Used when an item's execution completes
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

        let targetBenefit = actionMap["targetBenefit"];
        let targetInput = actionMap["targetInput"];

        targetInput["activations"].forEach(function(activation)
        {
            (new Activation(targetBenefit, activation)).activate();
        });

        targetBenefit.useBenefit();

        this.resetOnScreenInputs();
    }

    // Used when a user *first* logs into a terminal
    applyTermLoginEffects()
    {
        let hackingScriptTotal = this.#items.reduce(function(accumulator, currentItem)
        {
            let currentHackingScript = currentItem.hasTag("hacking_script");

            return (accumulator + (currentHackingScript !== false ? currentHackingScript : 0));
        }, 0);

        if(hackingScriptTotal > 0)
        {
            let handmadeValues = {
                "hacking": (hackingScriptTotal * -1)
            }

            this.applyStatusEffect("hacking_script", handmadeValues, true);
        }

        let benefitsHavingTermLoginEffects = this.#benefits.filter(function(potentialEffect)
        {
            return potentialEffect.effectType === "term_login";
        });

        benefitsHavingTermLoginEffects.forEach(function(mainBenefit)
        {
            mainBenefit.effects.forEach(function(tlEntry, inputIndex)
            {
                let disabled = mainBenefit.isDisabled();
                let conditionCheck = mainBenefit.checkConditions(tlEntry["conditions"] ?? null);

                if((disabled === false) && (conditionCheck === true))
                {
                    (new Activation(mainBenefit, tlEntry)).activate();
                    payload.addTempEffect(mainBenefit.id, inputIndex, null);
                }
            });
        });
    }

    // Used after every action
    applyPostActionEffects(actionMap)
    {
        let benefitsHavingPostActionEffects = this.#benefits.filter(function(potentialBenefit)
        {
            return potentialBenefit.effectType === "post_actions";
        });

        benefitsHavingPostActionEffects.forEach(function(mainBenefit)
        {
            let used = false;

            mainBenefit.effects.forEach(function(paEntry)
            {
                let disabled = mainBenefit.isDisabled();
                let conditionCheck = mainBenefit.checkConditions(paEntry["conditions"] ?? null, actionMap.action);

                if((disabled === false) && (conditionCheck === true))
                {
                    used = true;
                    (new Activation(mainBenefit, paEntry)).activate();
                }
            });

            if(used)
            {
                mainBenefit.useBenefit();
            }
        });
    }

    // Used when a user logs in with status effects
    applyStatusEffect(effectName, effectValues, reapply=false)
    {
        let statusEffect = this.getStatusEffect(effectName);

        statusEffect.setValues(effectValues);

        statusEffect.activate(reapply);
    }

    disableStatusEffect(effectName)
    {
        let statusEffect = this.getStatusEffect(effectName);

        statusEffect.deactivate();
    }

    /*
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
    */

    // Used to submit effects, including Temp Effects, including login, but login should not apply activations
    submitEffects(effectArray, initial=false)
    {
        let uniqueBenefits = [];

        effectArray.forEach(function(effect)
        {
            let targetBenefit = this.#benefits.find(function(potentialBenefit)
            {
                return potentialBenefit.id === effect.benefit_id;
            });

            if(!initial)
            {
                if(targetBenefit.effectType === "inputs")
                {
                    let targetActivation = targetBenefit.effects[effect.input_index].activations[effect.activation_index];

                    (new Activation(targetBenefit, targetActivation)).activate();
                }
                else
                {
                    let targetActivation = targetBenefit.effects[effect.input_index];

                    (new Activation(targetBenefit, targetActivation)).activate();
                }
            }

            if((uniqueBenefits.find((benefit) => benefit.id === targetBenefit.id)) === undefined)
            {
                uniqueBenefits.push(targetBenefit);
            }
        }, this.#globalThis);

        uniqueBenefits.forEach(function(targetBenefit)
        {
            targetBenefit.useBenefit();
        });
    }
}