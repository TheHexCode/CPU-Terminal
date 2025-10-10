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

    establishInventory(itemList)
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
                        value["stack"] = 1;
                    });
                }
                else
                {
                    proposedEffect["effect_name"] = effect.name.toLowerCase() + "_t" + proposedTier.tier;
                }

                proposedEffect["values"] = effect.values ?? null;
                proposedEffect["charges"] = effect.charges ?? null;
                proposedEffect["perType"] = effect.perType ?? null;

                let extantEffect = this.#effects.find((effect) => {return effect.effect_name === proposedEffect.effect_name});
                if(extantEffect === undefined)
                {
                    this.#effects.push(proposedEffect);
                }
                else
                {
                    extantEffect.values.forEach(function(value)
                    {
                        value["stack"] += 1;
                    });
                }
            }, this.#globalThis);

            this.#items.push({
                "item_name": proposedItem.name.toLowerCase() + "_t" + proposedTier.tier,
                "display_name": proposedItem.name,
                "category": proposedItem.category,
                "type": proposedItem.type,
                "tags": proposedItem.tags,
                "effects": proposedTier.effects
            });

        }, this.#globalThis);
    }

    #displayActivationLabel(parentEffect, labelObject)
    {
        let amountPath = labelObject.label.substring(labelObject.label.indexOf("{values:")+1,labelObject.label.indexOf("}")).split(":");

        let amount = parentEffect.values.find(function(value)
        {
            return value.name === amountPath[1];
        })[amountPath[2]];

        switch(labelObject.location)
        {
            case("crack_extra"):
            {
                let parsedLabel = labelObject.label.replace(/{.*?}/, tens(amount));

                $("#extraDetails").append("<span id='" + parentEffect.effect_name + "'>" + parsedLabel + "</span>");

                break;
            }
            case("crack_hacking"):
            {
                let parsedLabel = labelObject.label.replace(/{.*?}/, tens(amount * 2));

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

    #affectEffect(parentEffect, effectDetails, activate=true)
    {
        let amount = null;

        if(Object.keys(effectDetails).includes("amount"))
        {
            let amountPath = effectDetails.amount.split(":");
            amount = parentEffect.values.find(function(value)
            {
                return value.name === amountPath[1];
            })[amountPath[2]];
        }

        if(Object.keys(effectDetails).includes("icon"))
        {
            this.#displayActivationIcon(effectDetails.icon);
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
        let inputEffects = this.#effects.filter(function(potentialEffect)
        {
            return Object.keys(potentialEffect).includes("input");
        });

        inputEffects.forEach(function(mainEffect)
        {
            mainEffect.input.forEach(function(inEffect, index)
            {
                // button
                switch(inEffect.type)
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
                        switch(inEffect.screen)
                        {
                            case("crack"):
                            {
                                let inputHTML = '<div class="initItem">' +
                                                    '<div class="initHeader">' + inEffect.header + '</div>' +
                                                    '<div class="initOption">' +
                                                        '<input type="checkbox" id="' + mainEffect.effect_name + '" onclick="initCheck(this, ' + index + ')">' +
                                                        '<label for="' + mainEffect.effect_name + '">' + inEffect.label + "</label>" +
                                                    '</div>' +
                                                '</div>'

                                $("#initItemList").append(inputHTML);

                                break;
                            }
                            case("confirm"):
                            {
                                let inputHTML = '<div class="initItem">' +
                                                    '<div class="initHeader">' + inEffect.header + '</div>' +
                                                    '<div class="initOption">' +
                                                        '<input type="checkbox" id="' + mainEffect.effect_name + '" onclick="initCheck(this, ' + index + ')">' +
                                                        '<label for="' + mainEffect.effect_name + '">' + inEffect.label + "</label>" +
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
                        break;
                    }
                }
            });
        });
    }

    toggleEffect(target_id, target_index, activate)
    {
        let targetEffect = this.#effects.find(function(effect)
        {
            return effect.effect_name === target_id;
        });

        targetEffect.input[target_index].activation.forEach(function(activation)
        {
            this.#affectEffect(targetEffect, activation, activate);
        }, this.#globalThis);
    }

    applyTermLoginEffects()
    {
        let termLoginEffects = this.#effects.filter(function(potentialEffect)
        {
            return Object.keys(potentialEffect).includes("term_login");
        });

        termLoginEffects.forEach(function(mainEffect)
        {
            mainEffect.term_login.forEach(function(tlEffect)
            {
                let condition_passed = true;

                if(Object.keys(tlEffect).includes("condition"))
                {
                    //pass
                }

                if(condition_passed)
                {
                    this.#affectEffect(mainEffect, tlEffect);
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