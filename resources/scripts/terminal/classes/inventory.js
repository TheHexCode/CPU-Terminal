class Inventory
{
    #globalThis = this;

    #itemSchema;
    #effectSchema;

    #items;
    #effects;

    constructor()
    {
        this.#itemSchema = $.getJSON("/resources/schemas/items.json");
        this.#effectSchema = $.getJSON("/resources/schemas/effects.json");

        this.#items = [];
        this.#effects = [];
    }

    establishInventory(itemList)
    {
        this.#itemSchema = this.#itemSchema.responseJSON;
        this.#effectSchema = this.#effectSchema.responseJSON;

        itemList.forEach(function(dbItem)
        {
            let proposedItem = this.#itemSchema.find(function(potentialItem)
            {
                return potentialItem.name.toLowerCase() === dbItem.name.toLowerCase();
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
                })

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

            console.log(this.#effects);
        }, this.#globalThis);
    }

    #displayActivationLabel(effectValues, labelObject)
    {
        let amountPath = labelObject.label.substring(labelObject.label.indexOf("{values:")+1,labelObject.label.indexOf("}")).split(":");

        let amount = effectValues.find(function(value)
        {
            return value.name === amountPath[1];
        })[amountPath[2]];

        switch(labelObject.location)
        {
            case("crack_extra"):
            {
                let parsedLabel = labelObject.label.replace(/{.*?}/, tens(amount));

                $("#extraDetails").append("<span>" + parsedLabel + "</span>");

                break;
            }
            case("crack_hacking"):
            {
                let parsedLabel = labelObject.label.replace(/{.*?}/, tens(amount * 2));

                $("#hackDetails").append("<span>" + parsedLabel + "</span>");
                break;
            }
        }
    }

    #removeActivationLabel(effectValues, labelObject)
    {

    }

    #displayActivationIcon(effectValues, iconPath)
    {

    }

    #affectEffect(effectValues, effectDetails)
    {
        let amount = null;

        if(Object.keys(effectDetails).includes("amount"))
        {
            let amountPath = effectDetails.amount.split(":");
            amount = effectValues.find(function(value)
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
            this.#displayActivationLabel(effectValues, effectDetails.label);
        }

        switch(effectDetails.type)
        {
            case("plus_tags"):
            {
                updateTags(amount, Session.EXTRA);
                break;
            }
            case("plus_hacking"):
            case("plus_alarm_sense"):
            {
                payload.plusFunction(effectDetails.type, amount);
                break;
            }
            case("payload_has_cyberdeck"):
            {
                payload.addCyberdeck(effectDetails.effect_name);
                break;
            }
            case("action_time"):
            {
                payload.setActionTime(effectDetails.effect_name, amount);
                break;
            }
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
            mainEffect.input.forEach(function(inEffect)
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
                                                        '<input type="checkbox" id="' + mainEffect.effect_name + '" onclick="initCheck(this)">' +
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
                                                        '<input type="checkbox" id="' + mainEffect.effect_name + '" onclick="initCheck(this)">' +
                                                        '<label for="' + mainEffect.effect_name + '">' + inEffect.label + "</label>" +
                                                    '</div>' +
                                                '</div>'

                                $("#initItemList").append(inputHTML);
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

    activateEffect(target_id)
    {

    }

    deactivateEffect(target_id)
    {

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
                    this.#affectEffect(mainEffect.values, tlEffect);
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
}