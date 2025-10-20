class Inventory
{
    #globalThis = this;

    #itemSchema;
    #effectSchema;

    #items;
    #effects;

    #initialActivations;

    constructor()
    {
        this.#itemSchema = $.getJSON("/resources/schemas/items.json");
        this.#effectSchema = $.getJSON("/resources/schemas/effects.json");

        this.#items = [];
        this.#effects = [];
        this.#initialActivations = [];
    }

    establishInventory(itemList, itemUses)
    {
        this.#itemSchema = this.#itemSchema.responseJSON;
        this.#effectSchema = this.#effectSchema.responseJSON;

        itemList.forEach(function(dbItem)
        {
            let proposedItem = this.#itemSchema.find(function(potentialItem)
            {
                return potentialItem.name.toLowerCase().replace("&#39;","'") === dbItem.name.toLowerCase();
            });

            let proposedTier = proposedItem.tiers.find(function(potentialTier)
            {
                return Number(potentialTier.tier) === Number(dbItem.tier);
            });

            proposedTier.effects.forEach(function(effect)
            {
                let proposedEffect = this.#effectSchema.find(function(potentialEffect)
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
                "item_name": proposedItem.name.toLowerCase().replace(" ","+") + "_t" + proposedTier.tier,
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

    #checkCondition()
    {
        // array of conditions
            // left
                // payload:roles [Array]
                // payload:effects [Array]
                // payload:functions:XXX [Array Key]
                // terminal:effects:remote_enabled [Array Key]
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
    }

    #parseLabel(parentEffect, labelString)
    {
        let parseMatches = labelString.match(/{.*?}/g);

        console.log(parentEffect);

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
            }

            labelString = labelString.replace(match, result);
        });

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

    #displayActivationIcon(parentEffect, iconPath)
    {

    }

    #removeActivationIcon(parentEffect, iconPath)
    {

    }

    #activateEffect(parentEffect, effectDetails, activate=true)
    {
        let amount = null;

        if(Object.keys(effectDetails).includes("amount"))
        {
            if(Object.keys(effectDetails).includes("stack"))
            {
                amount = effectDetails["stack"];
            }
            else
            {
                let amountPath = effectDetails.amount.split(":");
                amount = parentEffect.values.find(function(value)
                {
                    return value.name === amountPath[1];
                })[amountPath[2]];
            }
        }

        if(Object.keys(effectDetails).includes("icon"))
        {
            if(activate)
            {
                this.#displayActivationIcon(parentEffect, effectDetails.icon);
            }
            else
            {
                this.#removeActivationIcon(parentEffect, effectDetails.icon);
            }
        }

        if(Object.keys(effectDetails).includes("label"))
        {
            if(activate)
            {
                this.#displayActivationLabel(parentEffect, effectDetails.label);
            }
            else
            {
                this.#removeActivationLabel(parentEffect, effectDetails.label);
            }
        }

        switch(effectDetails.type)
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
                    payload.plusFunction(effectDetails.type, amount);
                }
                else
                {
                    payload.minusFunction(effectDetails.type, amount);
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
        }

        if(activate)
        {
            this.#initialActivations.push(parentEffect.effect_name);
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
                                let inputHTML = '<div class="initItem' + (disabled ? ' dimmed' : '') + '">' +
                                                    '<div class="initHeader">' + inputEntry.header + '</div>' +
                                                    '<div class="initOption">' +
                                                        '<input type="checkbox" id="' + mainEffect.effect_name + '" onclick="initCheck(this, ' + index + ')"' + (disabled ? ' disabled' : '') + '>' +
                                                        '<label for="' + mainEffect.effect_name + '">' + inputEntry.label + "</label>" +
                                                    '</div>' +
                                                '</div>';

                                //$("#initItemList").append(inputHTML);
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
                                /*
                                    effectString += "<span class='itemActionRow'>" +
                                                        "<span class='itemMarks'>";

                                    for(let i = 0; i < effect.uses; i++)
                                    {
                                        effectString += "<img src='/resources/images/actions/itemfilled.png' />";
                                    }

                                    for(let j = 0; j < remCharges; j++)
                                    {
                                        effectString += "<img src='/resources/images/actions/itemopen.png' />";
                                    }

                                    effectString += "<span>per " + (effect.per_type === "sim" ? "Sim" : "Scene") + "</span>" +
                                                "</span>" +
                                                "<button class='deckButton' data-effect='" + effect.abbr + "' data-plus='" + plusTags + "' onclick='takeAction(this)' " + (remCharges === 0 ? "disabled" : "") + ">+" + plusTags + " Tag" + (plusTags === 1 ? "" : "s") + "</button>" +
                                            "</span>"
                                */
                                let buttonHTML = "<span class='itemActionRow'>" +
                                                        "<span class='itemMarks'>";

                                let remCharges = 100;

                                if(mainEffect["charges"] !== null)
                                {
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

                                buttonHTML += "<button id='" + mainEffect.effect_name + "' class='sideItemButton' onclick='useItem(this," + index + ")' " + (remCharges <= 0 ? "disabled" : "") + ">" + this.#parseLabel(mainEffect, inputEntry["label"]) + "</button>" +
                                            "</span>";

                                $(".itemItem > .itemActions[data-effect*='!" + mainEffect["effect_name"] + ";']").append(buttonHTML);

                                break;
                            }
                            case("crack"):
                            {
                                break;
                            }
                            case("execute"):
                            {
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
            this.#activateEffect(targetEffect, activation, activate);
        }, this.#globalThis);
    }

    useItem(target_id, target_index)
    {
        let targetEffect = this.#effects.find(function(effect)
        {
            return effect.effect_name === target_id;
        });

        let targetInput = targetEffect.input[target_index];

        if(Object.keys(targetInput).includes("confirm"))
        {
            let buttonArray = [{
				id: target_id + "_" + target_index,
				text: targetInput["confirm"]["button"],
				data: session.getTerminalID(),
				global: false
			}];

			let actionMap = {
                targetEffect: targetEffect,
                targetInput: targetInput,
				targetID: targetEffect["effect_name"],
				action: "item",
				actionType: "item"
			};

			let confirmMap = {
				headerText: "Confirm Item Activation",
				bodyText: this.#parseLabel(targetEffect, targetInput["confirm"]["body"]),
				buttonArray: buttonArray
			};

            actionModal.showConfirmPage(actionMap, confirmMap, true);
        }
        else
        {
        }
    }

    executeItem(actionMap)
    {
        let maxTime = 30;

        switch(actionMap["targetInput"]["confirm"]["timer"]["type"])
        {
            case("skip"):
            {
                break;
            }
            case("static"):
            {
                break;
            }
            case("action"):
            {
                break;
            }
        }

        let executeMap = {
            petStage: null,
            headerText: "Activate / Item",
            maxTime: 0
        }

        actionModal.showExecutePage(actionMap, executeMap, true);
    }

    applyTermLoginEffects()
    {
        let termLoginHavingEffects = this.#effects.filter(function(potentialEffect)
        {
            return Object.keys(potentialEffect).includes("term_login");
        });

        termLoginHavingEffects.forEach(function(mainEffect)
        {
            let disabled = false;

            if((mainEffect["charges"] !== null) && (mainEffect["uses"] >= mainEffect["charges"]))
            {
                disabled = true;
            }

            mainEffect.term_login.forEach(function(tlEntry)
            {
                let condition_passed = true;

                if(Object.keys(tlEntry).includes("condition"))
                {
                    //pass
                }

                if(condition_passed && !disabled)
                {
                    this.#activateEffect(mainEffect, tlEntry);
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
}