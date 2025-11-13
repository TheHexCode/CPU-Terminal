class Inventory
{
    #globalThis = this;

    #itemModel;
    #benefitModel;
    #statusModel;

    #items;
    #effects;

    #initialActivations;
    #confirmInputs;
    #executeInputs;

    constructor()
    {
        this.#itemModel = $.getJSON("/resources/models/items.json");
        this.#benefitModel = $.getJSON("/resources/models/benefits.json");
        this.#statusModel = $.getJSON("/resources/models/statuses.json");

        this.#items = [];
        this.#effects = [];
        this.#initialActivations = [];
        this.#confirmInputs = [];
        this.#executeInputs = [];
    }

    establishInventory(itemList, itemUses)
    {
        this.#itemModel = this.#itemModel.responseJSON["items"];
        this.#benefitModel = this.#benefitModel.responseJSON["benefits"];
        this.#statusModel = this.#statusModel.responseJSON["statuses"];

        // LINK THE ACTUAL OBJECTS BETWEEN EACH OTHER?
        // MAKE A NEW OBJECT WITH ALL OF THE PERTINENT INFO
        // -- CAN THIS INCLUDE DYNAMIC INFO OR IS THAT BY DEFINITION GOING TO MAKE THE DATA STALE

        itemList.forEach(function(dbItem)
        {
            let proposedItem = this.#itemModel.find(function(potentialItem)
            {
                return potentialItem.name.toLowerCase().replace("&#39;","'") === dbItem.name.toLowerCase();
            });

            let proposedTier = proposedItem.tiers.find(function(potentialTier)
            {
                return Number(potentialTier.tier) === Number(dbItem.tier);
            });

            let itemName = proposedItem.name.toLowerCase().replace(" ","+") + "_t" + proposedTier.tier

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

                let extantEffect = this.#effects.find((thisEffect) => {return thisEffect.effect_name === proposedEffect.effect_name});

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

                    this.#effects.push(structuredClone(proposedEffect));

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

        }, this.#globalThis);

        this.#items.forEach(function(item)
        {
            $("#noItems").addClass("hidden");

            let itemCat = null;
            switch(item["category"])
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
                    switch(item["type"])
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
                            "<li id='" + item["item_name"] + "' class='itemItem'>" +
                                "<span class='itemName'>" + item["display_name"] + "</span>" +
                                "<span class='itemActions' data-effect='" + item["dataEffect"] + "'></span>" +
                            "</li>");
        });
    }

    getConfirmInputs()
    {
        let returnArray = [];

        this.#confirmInputs.forEach(function(input, index)
        {
            let parentEffect = this.#effects.find(function(effect)
            {
                return effect.effect_name === input.effect_name;
            });

            let chargeDisabled = false;

            if((parentEffect["charges"] !== null) && (parentEffect["uses"] >= parentEffect["charges"]))
            {
                chargeDisabled = true;
            }

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

            /*
                "<span class='copycatBox'>" +
                    "<input id='copycatActivate' type='checkbox'/>" +
                    "<span class='copycatLabel'>(1/Sim) Activate Copycat for this action to complete it immedidately?</span>" +
                "</span>"
            */

            let HTMLString =    "<span class='confirmBox" + (((conditionCheck === false) || (chargeDisabled === true)) ? " dimmed'" : "'") + " >" +
                                    "<input id='" + input["effect_name"] + "_" + index + "' class='confirmInput' type='checkbox'" + (((conditionCheck === false) || (chargeDisabled === true)) ? " disabled" : "") + " />" +
                                    "<span class='confirmLabel'>" + parsedLabel + "</span>" +
                                "</span>";

            let onChangeFunction = function(eventArg, inputArg, inputIndex)
            {
                inputArg["activation"].forEach(function(activation, activationIndex)
                {
                    switch(activation["type"])
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
        }, this.#globalThis);

        return returnArray;
    }

    getExecuteInputs()
    {
        let returnArray = [];

        this.#executeInputs.forEach(function(input, index)
        {
            let parentEffect = this.#effects.find(function(effect)
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
        // array of conditions
            // left
                // payload:roles [Array]
                // payload:effects [Array]
                // payload:functions:XXX [Array Key > Value]
                // terminal:effects [Array]
                // item:instance:XXX [Array Key > Value]
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

                switch(condition["left"].split(":")[0])
                {
                    case("payload"):
                    {
                        switch(condition["left"].split(":")[1])
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
                                left = payload.getFunction(condition["left"].split(":")[2]);
                                break;
                            }
                        }
                        break;
                    }
                    case("terminal"):
                    {
                        switch(condition["left"].split(":")[1])
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
                        switch(condition["left"].split(":")[1])
                        {
                            case("instance"):
                            case("action"):
                            {
                                leftType = "value";

                                let leftKey = condition["left"].split(":")[2];

                                left = itemValues[leftKey];
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
                    switch(condition["right"].split(":")[0])
                    {
                        case("terminal"):
                        {
                            switch(condition["right"].split(":")[1])
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
                        returnValue = returnValue + condition["effect"];
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

    #parseLabel(parentEffect, labelString, extraInfo=null)
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
                    let resultValue = parentEffect.values.find(function(value)
                    {
                        return value.name === pathArray[1];
                    });

                    if(Object.keys(resultValue).includes("stack"))
                    {
                        result = resultValue["stack"];
                    }
                    else
                    {
                        let mult = Number(pathArray[2].split("*")[1]);
                        let div = Number(pathArray[2].split("/")[1]);
                        let add = Number(pathArray[2].split("+")[1]);
                        let subt = Number(pathArray[2].split("-")[1]);

                        switch(false)
                        {
                            case(Number.isNaN(mult)):
                            {
                                result = resultValue[pathArray[2].split("*")[0]] * mult;
                                break;
                            }
                            case(Number.isNaN(div)):
                            {
                                result = resultValue[pathArray[2].split("/")[0]] / div;
                                break;
                            }
                            case(Number.isNaN(add)):
                            {
                                result = resultValue[pathArray[2].split("+")[0]] + add;
                                break;
                            }
                            case(Number.isNaN(subt)):
                            {
                                result = resultValue[pathArray[2].split("-")[0]] - subt;
                                break;
                            }
                            default:
                            {
                                result = resultValue[pathArray[2]];
                                break;
                            }
                        }
                    }
                    break;
                }
                case("remainCharges"):
                {
                    result = parentEffect.charges - parentEffect.uses;
                    break;
                }
                case("totalCharges"):
                case("charges"):
                {
                    result = parentEffect.charges;
                    break;
                }
                case("perType"):
                {
                    result = parentEffect.perType;
                    break;
                }
                case("displayName"):
                {
                    result = parentEffect.displayName;
                    break;
                }
                case("cost"):
                {
                    result = 0;

                    let costPath = extraInfo.amount.split(":");
                    let baseCost = parentEffect.values.find(function(value)
                    {
                        return value.name === costPath[1];
                    })[costPath[2]];

                    switch(extraInfo["type"])
                    {
                        case("dynamic"):
                        {
                            let costEffect = this.#checkCondition(extraInfo["condition"]);
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
                    result = (result !== 1 ? "s" : "")
                    break;
                }
                case("tens"):
                {
                    result = tens(result);
                    break;
                }
                case("title"):
                {
                    result = result.charAt(0).toUpperCase() + result.slice(1);
                    break;
                }
            }

            labelString = labelString.replace(match, result);
        }, this.#globalThis);

        return labelString;
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

    setupInputs()
    {
        let inputHavingEffects = this.#effects.filter(function(potentialEffect)
        {
            return Object.keys(potentialEffect).includes("input");
        });

        inputHavingEffects.forEach(function(mainEffect)
        {
            let disabled = false;

            if((mainEffect["charges"] !== null) && (mainEffect["uses"] >= mainEffect["charges"]))
            {
                disabled = true;
            }

            mainEffect.input.forEach(function(inputEntry, index)
            {
                switch(inputEntry.type)
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
                        switch(inputEntry.screen)
                        {
                            case("crack"):
                            {
                                let inputHTML = '<div class="initItem' + (disabled ? ' dimmed' : '') + '">' +
                                                    '<div class="initHeader">' + inputEntry.header + '</div>' +
                                                    '<div class="initOption">' +
                                                        '<input type="checkbox" id="' + mainEffect.effect_name + '" onclick="initCheck(this, ' + index + ')"' + (disabled ? ' disabled' : '') + '>' +
                                                        '<label for="' + mainEffect.effect_name + '">' + inputEntry.label + "</label>" +
                                                    '</div>' +
                                                '</div>';

                                $("#initItemList").append(inputHTML);

                                break;
                            }
                            case("confirm"):
                            {
                                inputEntry["effect_name"] = mainEffect["effect_name"];

                                this.#confirmInputs.push(inputEntry);
                                break;
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
                        switch(inputEntry.screen)
                        {
                            case("inventory"):
                            {
                                let buttonHTML = "<span class='itemActionRow'>";

                                let remCharges = Number.POSITIVE_INFINITY;

                                if(mainEffect["charges"] !== null)
                                {
                                    buttonHTML += "<span class='itemMarks'>";

                                    for(let i = 0; i < mainEffect["uses"]; i++)
                                    {
                                        buttonHTML += "<img src='/resources/images/actions/itemfilled.png' />";
                                    }

                                    for(let j = mainEffect["uses"]; j < mainEffect["charges"]; j++)
                                    {
                                        buttonHTML += "<img src='/resources/images/actions/itemopen.png' />";
                                    }

                                    buttonHTML +=   "<span>per " + (mainEffect["perType"] === "sim" ? "Sim" : "Scene") + "</span>" +
                                                "</span>";
                                    remCharges = mainEffect["charges"] - mainEffect["uses"];
                                }

                                let parsedLabel = this.#parseLabel(mainEffect, inputEntry["label"]);
                                let conditionCheck = true;

                                if(Object.keys(inputEntry).includes("condition"))
                                {
                                    let checkResults = this.#checkCondition(inputEntry.condition);
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

                                if(Object.keys(inputEntry).includes("cost"))
                                {
                                    let costPath = inputEntry["cost"].amount.split(":");
                                    let baseCost = mainEffect.values.find(function(value)
                                    {
                                        return value.name === costPath[1];
                                    })[costPath[2]];

                                    switch(inputEntry["cost"]["type"])
                                    {
                                        case("dynamic"):
                                        {
                                            let costEffect = this.#checkCondition(inputEntry["cost"]["condition"]);

                                            cost = baseCost + costEffect;
                                        }
                                        case("static"):
                                        {
                                            cost = baseCost;
                                        }
                                    }
                                }

                                buttonHTML += "<button id='" + mainEffect.effect_name + "' class='itemButton' data-input='" + index + "' onclick='useItem(this," + index + ")'" + ((cost !== null) ? " data-cost='" + cost + "'" : "") + (((remCharges <= 0) || (conditionCheck === false)) ? " disabled" : "") + ">" + parsedLabel + "</button>" +
                                            "</span>";

                                $(".itemItem > .itemActions[data-effect*='!" + mainEffect["effect_name"] + ";']").append(buttonHTML);

                                break;
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
                                let buttonHTML = "";
                                let remCharges = Number.POSITIVE_INFINITY;

                                if(mainEffect["charges"] !== null)
                                {
                                    buttonHTML += "<span class='itemMarks'>";

                                    for(let i = 0; i < mainEffect["uses"]; i++)
                                    {
                                        buttonHTML += "<img src='/resources/images/actions/itemfilled.png' />";
                                    }

                                    for(let j = mainEffect["uses"]; j < mainEffect["charges"]; j++)
                                    {
                                        buttonHTML += "<img src='/resources/images/actions/itemopen.png' />";
                                    }

                                    buttonHTML +=   "<span>per " + (mainEffect["perType"] === "sim" ? "Sim" : "Scene") + "</span>" +
                                                "</span>";
                                    remCharges = mainEffect["charges"] - mainEffect["uses"];
                                }

                                let parsedLabel = this.#parseLabel(mainEffect, inputEntry["label"]);
                                let conditionCheck = true;

                                if(Object.keys(inputEntry).includes("condition"))
                                {
                                    let checkResults = this.#checkCondition(inputEntry.condition);
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

                                buttonHTML +=   '<div class="initItem' + (disabled ? ' dimmed' : '') + '">' +
                                                    '<div class="initHeader">' + mainEffect.displayName + '</div>' +
                                                    '<div class="initOption">' +
                                                        '<button id="' + mainEffect.effect_name + '" class="itemButton" data-input="' + index + '" onclick="useItem(this,' + index + ')"' + (((remCharges <= 0) || (conditionCheck === false)) ? ' disabled' : '') + '>' + parsedLabel + '</button>' +
                                                    '</div>' +
                                                '</div>';

                                $("#initItemList").append(buttonHTML);
                                break;
                            }
                            case("execute"):
                            {
                                inputEntry["effect_name"] = mainEffect["effect_name"];

                                this.#executeInputs.push(inputEntry);
                                break;
                            }
                        }

                        break;
                    }
                }
            }, this.#globalThis);
        }, this.#globalThis);
    }

    toggleEffect(target_id, target_index, activate)
    {
        let targetEffect = this.#effects.find(function(effect)
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
        let targetEffect = this.#effects.find(function(effect)
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

        let parentEffect = this.#effects.find(function(potentialEffect)
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
        let termLoginHavingEffects = this.#effects.filter(function(potentialEffect)
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
            JSON.stringify(this.#effects, (_, nestedValue) => {
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
            let parentEffect = this.#effects.find(function(potentialEffect)
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
        let postActionHavingEffects = this.#effects.filter(function(potentialEffect)
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
            let parentEffect = globalThis.#effects.find(function(proposedEffect)
            {
                return proposedEffect.effect_name === $(itemButton).attr("id");
            });

            let targetInput = parentEffect.input[Number($(itemButton).attr("data-input"))];

            console.log({parentEffect});

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