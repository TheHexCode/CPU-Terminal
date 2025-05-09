class AdminTerminal
{
    static #iconTypeMap = {
        "files": ["entry","trap"],
        "darkweb": ["entry", "trap"],
        "cameras": ["entry"],
        "locks": ["entry"],
        "defenses": ["entry"],
        "utilities": ["power", "alarm"]
    };

    static #iconTypeStateMap = {
        "ice": [
            "initial",
            "break",
            "sleaze"
        ],
        "entry": {
            "files": [
                "initial",
                "read",
                "copied",
                "deleted"
            ],
            "darkweb": [
                "initial",
                "read",
                "copied",
                "deleted"
            ],
            "cameras": [
                "initial",
                "viewed",
                "disabled",
                "copied",
                "deleted"
            ],
            "locks": [
                "initial",
                "disabled",
                "friendly"
            ],
            "defenses": [
                "initial",
                "disabled",
                "friendly"
            ],
            "utilities": [
                "initial",
                "disabled"
            ]
        },
        "trap": [
            "initial",
            "read",
            "copied",
            "deleted"
        ],
        "power": [
            "initial",
            "disabled"
        ],
        "alarm": [
            "initial",
            "disabled"
        ]
    };

    static #iconTypeAlertMap = {
        "ice": {
            "access": true,
            "modify": false,
            "title": true,
            "contents": "effects"
        },
        "entry": {
            "files": {
                "access": false,
                "modify": false,
                "title": false,
                "contents": false
            },
            "darkweb": {
                "access": false,
                "modify": false,
                "title": false,
                "contents": false
            },
            "cameras": {
                "access": false,
                "modify": false,
                "title": false,
                "contents": true
            },
            "locks": {
                "access": false,
                "modify": false,
                "title": false,
                "contents": true
            },
            "defenses": {
                "access": false,
                "modify": false,
                "title": false,
                "contents": true
            },
            "utilities": {
                "access": false,
                "modify": false,
                "title": false,
                "contents": true
            }
        },
        "trap": {
            "access": false,
            "modify": false,
            "title": true,
            "contents": "effects"
        },
        "power": {
            "access": false,
            "modify": false,
            "title": false,
            "contents": true
        },
        "alarm": {
            "access": false,
            "modify": false,
            "title": false,
            "contents": true
        }
    }

    #termID;
    #entryList = [];
    #changesPending = false;

    constructor(termID, entries)
    {
        this.#termID = termID;
        this.#entryList = this.#listifyEntries(entries);

        //console.log(this.#entryList);

        $(".entryList[data-icon='files']").html(this.drawEntries(this.#entryList["files"]));
        $(".entryList[data-icon='darkweb']").html(this.drawEntries(this.#entryList["darkweb"]));
        $(".entryList[data-icon='cameras']").html(this.drawEntries(this.#entryList["cameras"]));
        $(".entryList[data-icon='locks']").html(this.drawEntries(this.#entryList["locks"]));
        $(".entryList[data-icon='defenses']").html(this.drawEntries(this.#entryList["defenses"]));
        $(".entryList[data-icon='utilities']").html(this.drawEntries(this.#entryList["utilities"]));
    }

    areChangesPending()
    {
        return this.#changesPending;
    }

    getIconTypeAlerts(icon, type)
    {
        if(type === "entry")
        {
            return AdminTerminal.#iconTypeAlertMap["entry"][icon];
        }
        else
        {
            return AdminTerminal.#iconTypeAlertMap[type];
        }
    }

    #listifyEntries(entries)
    {
        let entryList = {
            "files": [],
            "darkweb": [],
            "cameras": [],
            "locks": [],
            "defenses": [],
            "utilities": [],
            "puzzles": []
        };

        entries.forEach(function(entry)
        {
            let entryParent = entry["path"].split("-").slice(0,-1).join("-");
            let entrySubIce = [];

            entry["parent"] = entryParent;
            entry["subIce"] = entrySubIce;

            if(entry["parent"] === "")
            {
                entryList[entry["icon"]].push(entry);
            }
            else
            {
                let entryParent = this.#findEntryParent(entry["parent"], entryList[entry["icon"]]);

                entryParent["subIce"].push(entry);
            }
        }, this);

        return entryList;
    }

    #findEntryParent(entryPath, entryArray)
    {
        let entryReturn = null;

        entryArray.forEach(function(entry)
        {
            if(entry["path"] === entryPath)
            {
                entryReturn = entry;
            }
            else
            {
                let entryAttempt = this.#findEntryParent(entryPath, entry["subIce"]);

                if(entryAttempt !== null)
                {
                    entryReturn = entryAttempt;
                }
            }
        }, this);

        return entryReturn;
    }

    getIconEntries(icon)
    {
        return this.#entryList[icon];
    }

    drawEntries(entries)
    {
        let entryString = "";

        entries.forEach(function(entry)
        {
            let accessLabel = "ACCESS";
            let modifyLabel = "MODIFY";
            let titleLabel = "TITLE";
            let contentsLabel = "CONTENTS";

            entry["parsedAccess"] = '"' + (entry["access"] === null ? 0 : entry["access"]) + '"';
            entry["parsedModify"] = '"' + (entry["modify"] === null ? 0 : entry["modify"]) + '"';
            entry["parsedTitle"] = '"' + (entry["title"] === null ? "" : entry["title"]) + '"';

            if(entry["type"] === "trap")
            {
                contentsLabel = "EFFECTS";

                entry["parsedTitle"] = '"Trap!" disabled';
                entry["parsedContents"] = this.#getEntryEffects(entry["contents"]);
            }
            else if(entry["type"] === "ice")
            {
                accessLabel = "BREAK";
                modifyLabel = "SLEAZE";
                titleLabel = "ice NAME";
                contentsLabel = "EFFECTS";

                entry["parsedAccess"] = '"0" disabled';
                entry["parsedContents"] = this.#getEntryEffects(entry["contents"]);
            }
            else if((entry["icon"] !== "files") && (entry["icon"] !== "darkweb"))
            {
                entry["parsedContents"] = '"No Contents" disabled />';
            }
            else
            {
                entry["parsedContents"] = '"' + entry["contents"] + '" onchange="changeEntry(this)" />';
            }

            entryString +=  (entry["type"] === "ice" ? '<div class="iceBox">' : '') +
                            '<div class="entry" data-id="' + entry["path"] + '">' +
                                '<div class="entryControls">' +
                                    /*'<div class="upControls">' +
                                        '<button>&barwedge;</button>' +
                                        '<button>&wedge;</button>' +
                                    '</div>' + */
                                    '<button class="delEntryButton" data-id="' + entry["path"] + '" onclick="deleteEntry(event)">&#x2716;</button>' +
                                    /*'<div class="downControls">' +
                                        '<button>&vee;</button>' +
                                        '<button>&veebar;</button>' +
                                    '</div>' + */
                                '</div>' +
                                '<div class="entryID">' +
                                    entry["path"] +
                                '</div>' +
                                '<div class="entryGrid">' +
                                    '<div class="entryTypeRow">' +
                                        '<span class="entryTypeLabel">ENTRY TYPE:</span>' +
                                        '<select class="entryType" onchange="changeType(this, \'' + entry["type"] + '\')">' +
                                            this.#getEntryTypes(entry["icon"], entry["type"]) +
                                        '</select>' +
                                        '<span class="entryStateLabel">ENTRY STATE:</span>' +
                                        '<select class="entryState" onchange="changeState(this)">' +
                                            this.#getTypeStates(entry["icon"], entry["type"], entry["state"]) +
                                        '</select>' +
                                    '</div>' +
                                    '<div class="entryLabelRow">' +
                                        '<span class="entryLabel entryAccess">' + accessLabel + ' COST</span>' +
                                        '<span class="entryLabel entryModify">' + modifyLabel + ' COST</span>' +
                                        '<span class="entryLabel entryTitle">' + titleLabel + '</span>' +
                                        '<span class="entryLabel entryContents">' + contentsLabel + '</span>' +
                                    '</div>' +
                                    '<div class="entryInputRow">' +
                                        '<input class="entryAccess" type="number" value=' + entry["parsedAccess"] + ' onchange="changeEntry(this)" />' +
                                        '<input class="entryModify" type="number" value=' + entry["parsedModify"] + ' onchange="changeEntry(this)" />' +
                                        '<input class="entryTitle" type="text" value=' + entry["parsedTitle"] + ' onchange="changeEntry(this)" />' +
                                        '<input class="entryContents" type="text" value=' + entry["parsedContents"] +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            (entry["type"] === "ice" ?
                                this.drawEntries(entry["subIce"]) + 
                                '<button class="addEntryButton" onclick="addiceEntry(event)">&plus; Add Entry to ICE ' + entry["path"] + '</button>' +
                            '</div>' : '');
        }, this);

        return entryString;
    }

    #getEntryTypes(icon, type)
    {
        let typeListString = "";

        AdminTerminal.#iconTypeMap[icon].forEach(function(iconType)
        {
            typeListString += "<option" + (type === iconType ? " selected" : "") + ">" + iconType + "</option>";
        });

        typeListString += "<option" + (type === "ice" ? " selected" : "") + ">ice</option>";

        return typeListString;
    }

    #getTypeStates(icon, type, selectedState)
    {
        let stateList;
        let stateListString = "";

        if(type === "entry")
        {
            stateList = AdminTerminal.#iconTypeStateMap["entry"][icon];
        }
        else
        {
            stateList = AdminTerminal.#iconTypeStateMap[type];
        }

        stateList.forEach(function(state)
        {
            stateListString += "<option" + (selectedState === state ? " selected" : "") + ">" + state + "</option>";
        });

        return stateListString;
    }

    #getEntryEffects(contents)
    {
        let effects = JSON.parse(contents);

        let effectString = '"' + effects[0] + '" onchange="changeEntry(this,0)" /></div>';

        for(let i = 1; i < effects.length; i++)
        {
            let effectCount = i + 4;

            effectString += '<div class="entryInputRow" style="grid-row: ' + effectCount + '">' +
                                '<input class="entryContents" type="text" value="' + effects[i] + '" onchange="changeEntry(this,' + i + ')" />' +
                                '<button class="delEffectButton" onclick="deleteEffect(event, ' + i + ')">&minus;</button>' +
                            '</div>';
        }

        let effectMax = effects.length + 4;

        effectString += '<div class="entryInputRow" style="grid-row: ' + effectMax + '">' +
                            '<button class="addEffectButton" onclick="addEffect(event, ' + effects.length + ')">&plus;</button>';

        return effectString;
    }

    #resetIconPaths(entries, path = "")
    {
        entries.forEach(function (entry, index)
        {
            entry["path"] = path + index;

            if(entry["subIce"].length > 0)
            {
                this.#resetIconPaths(entry["subIce"], entry["path"] + "-");
            }
        }, this);
    }

    setMasterChanges()
    {
        this.#changesPending = true;
    }

    clearChanges()
    {
        this.#changesPending = false;
    }

    addEntry(icon)
    {
        let newEntry = {
            icon: icon,
            parent: "",
            path: this.#entryList[icon].length,
            access: 1,
            modify: 1,
            title: "",
            contents: "",
            state: "initial",
            type: AdminTerminal.#iconTypeMap[icon][0],
            subIce: []
        };

        this.#entryList[icon].push(newEntry);

        this.#changesPending = true;

        $(".entryList[data-icon='" + icon + "']").html(this.drawEntries(this.#entryList[icon]));
    }

    addiceEntry(icon, iceID)
    {
        let targetice = this.#entryList[icon];

        iceID.split("-").forEach(function (pathPart, pathIndex, pathArray)
        {
            if(pathIndex === pathArray.length-1)
            {
                targetice = targetice[pathPart];
            }
            else
            {
                targetice = targetice[pathPart]["subIce"];
            }
        });

        let newiceEntry = {
            icon: icon,
            parent: iceID,
            path: iceID + "-" + targetice["subIce"].length,
            access: 1,
            modify: 1,
            title: "",
            contents: "",
            state: "initial",
            type: AdminTerminal.#iconTypeMap[icon][0],
            subIce: []
        };

        targetice["subIce"].push(newiceEntry);

        this.#changesPending = true;

        $(".entryList[data-icon='" + icon + "']").html(this.drawEntries(this.#entryList[icon]));
    }

    deleteEntry(icon, id)
    {
        let targetArray = this.#entryList[icon];
        let targetIndex = -1;

        id.split("-").forEach(function (pathPart, pathIndex, pathArray)
        {
            if(pathIndex === pathArray.length-1)
            {
                targetIndex = pathPart;
            }
            else
            {
                targetArray = targetArray[pathPart]["subIce"];
            }
        });

        targetArray.splice(targetIndex,1);

        this.#changesPending = true;

        this.#resetIconPaths(this.#entryList[icon]);

        $(".entryList[data-icon='" + icon + "']").html(this.drawEntries(this.#entryList[icon]));
    }

    changeEntry(newValue, icon, id, type, effectIndex)
    {
        let targetEntry = this.#entryList[icon];

        id.split("-").forEach(function (pathPart, pathIndex, pathArray)
        {
            if(pathIndex === pathArray.length-1)
            {
                targetEntry = targetEntry[pathPart];
            }
            else
            {
                targetEntry = targetEntry[pathPart]["subIce"];
            }
        });

        if(effectIndex === null)
        {
            targetEntry[type] = newValue;
        }
        else //contents array
        {
            let parsedContents = JSON.parse(targetEntry["contents"]);

            parsedContents[effectIndex] = newValue;

            targetEntry["contents"] = JSON.stringify(parsedContents);
        }

        this.#changesPending = true;
    }

    changeType(icon, entryID, newSelected)
    {
        console.log("Test");

        let targetEntry = this.#entryList[icon];

        entryID.split("-").forEach(function (pathPart, pathIndex, pathArray)
        {
            if(pathIndex === pathArray.length-1)
            {
                targetEntry = targetEntry[pathPart];
            }
            else
            {
                targetEntry = targetEntry[pathPart]["subIce"];
            }
        });

        //access = true
        //modify = true
        //title = true or oldType = ice
        //contents = true or oldTypeAtts[contents] = effects

        let oldAtts = admTerm.getIconTypeAlerts(icon, targetEntry["type"]);
        let newAtts = admTerm.getIconTypeAlerts(icon, newSelected);

        if(newAtts["access"])
        {
            targetEntry["access"] = null;
        }

        if(newAtts["modify"])
        {
            targetEntry["modify"] = null;
        }

        if((newAtts["title"]) || (targetEntry["type"] === "ice"))
        {
            targetEntry["title"] = null;
        }

        if((newAtts["contents"]) || (oldAtts["contents"] === "effects"))
        {
            if(newAtts["contents"] === "effects")
            {
                targetEntry["contents"] = JSON.stringify([""]);
            }
            else
            {
                targetEntry["contents"] = "";
            }
        }

        targetEntry["type"] = newSelected;

        this.#changesPending = true;

        $(".entryList[data-icon='" + icon + "']").html(this.drawEntries(this.#entryList[icon]));
    }

    changeState(icon, entryID, newSelected)
    {
        let targetEntry = this.#entryList[icon];

        entryID.split("-").forEach(function (pathPart, pathIndex, pathArray)
        {
            if(pathIndex === pathArray.length-1)
            {
                targetEntry = targetEntry[pathPart];
            }
            else
            {
                targetEntry = targetEntry[pathPart]["subIce"];
            }
        });

        targetEntry["state"] = newSelected;

        this.#changesPending = true;
    }

    addEffect(icon, entryID)
    {
        let targetEntry = this.#entryList[icon];

        entryID.split("-").forEach(function (pathPart, pathIndex, pathArray)
        {
            if(pathIndex === pathArray.length-1)
            {
                targetEntry = targetEntry[pathPart];
            }
            else
            {
                targetEntry = targetEntry[pathPart]["subIce"];
            }
        });

        let parsedContents = JSON.parse(targetEntry["contents"]);

        parsedContents.push("");

        targetEntry["contents"] = JSON.stringify(parsedContents);

        this.#changesPending = true;

        $(".entryList[data-icon='" + icon + "']").html(this.drawEntries(this.#entryList[icon]));
    }

    deleteEffect(icon, entryID, effectIndex)
    {
        let targetEntry = this.#entryList[icon];

        entryID.split("-").forEach(function (pathPart, pathIndex, pathArray)
        {
            if(pathIndex === pathArray.length-1)
            {
                targetEntry = targetEntry[pathPart];
            }
            else
            {
                targetEntry = targetEntry[pathPart]["subIce"];
            }
        });

        let parsedContents = JSON.parse(targetEntry["contents"]);

        parsedContents.splice(effectIndex,1);

        targetEntry["contents"] = JSON.stringify(parsedContents);

        this.#changesPending = true;

        $(".entryList[data-icon='" + icon + "']").html(this.drawEntries(this.#entryList[icon]));
    }

    saveTerminal()
    {
        let termInfo = {
            "termID": this.#termID,
            "jobCode": $("#jobCode").val(),
            "termSlug": $("#termSlug").val(),
            "displayName": $("#termDisplayName").val(),
            "termAccess": Number($("#termAccess").val()),
            "entries": JSON.stringify(this.#entryList)
        };

        console.log(JSON.stringify(this.#entryList));
        
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "scripts\\updateTerm.php",
            data:
            {
                action: (this.#termID === -1 ? "CREATE" : "SAVE"),
                terminal: termInfo
            }
        })
        .done(function()
        {
            admTerm.clearChanges();
        });
        
    }

    deleteTerminal()
    {
        let termInfo = {
            "termID": this.#termID
        };

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "scripts\\updateTerm.php",
            data:
            {
                action: "DELETE",
                terminal: termInfo
            }
        })
        .done(function()
        {
            admTerm.clearChanges();
            window.location.href = 'dashboard.php';
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////

$(window).bind('beforeunload', function()
{
    if(admTerm.areChangesPending())
    {
        return 'Leave page?\nChanges that you have made will not be saved.';
    }
    else
    {
        return true;
    }
});

function addEntry(event)
{
    event.preventDefault();

    let icon = $(event.target).prev()[0].dataset["icon"];

    admTerm.addEntry(icon);
}

function addiceEntry(event)
{
    event.preventDefault();

    let icon = $(event.target).parents(".entryList")[0].dataset["icon"];
    let iceID = $(event.target).prevAll().last()[0].dataset["id"];

    admTerm.addiceEntry(icon, iceID);
}

function deleteEntry(event)
{
    event.preventDefault();

    let entry = $(event.target).parents(".entry")[0];

    let icon = $(entry).parents(".entryList")[0].dataset["icon"];
    let entryID = $(entry).attr("data-id");
    let ice = ($(entry).parent().hasClass("iceBox") && ($(entry).prev().length === 0));

    let confirmText = "Delete entry " + entryID + " from the " + icon + " icon" + (ice ? ", as well as all entries encapsulated in this ice" : "") + "? You can recover this entry if you refresh the page without saving changes.";

    if (confirm(confirmText) == true)
    {
        admTerm.deleteEntry(icon, entryID);
    }
    else
    {
        // CANCEL
    }
}

function changeEntry(field, effectIndex = null)
{
    let icon = $(field).parents(".entryList")[0].dataset["icon"];
    let entryID = $(field).parents(".entry")[0].dataset["id"];
    let fieldType = field.classList[0].split("entry")[1];

    admTerm.changeEntry(field.value, icon, entryID, fieldType, effectIndex);
}

function addEffect(event)
{
    event.preventDefault();

    let icon = $(event.target).parents(".entryList")[0].dataset["icon"];
    let entryID = $(event.target).parents(".entry")[0].dataset["id"];

    admTerm.addEffect(icon, entryID);
}

function deleteEffect(event, effectIndex)
{
    event.preventDefault();

    let icon = $(event.target).parents(".entryList")[0].dataset["icon"];
    let entryID = $(event.target).parents(".entry")[0].dataset["id"];

    let confirmText = "Delete this effect? You can recover this effect if you refresh the page without saving changes.";

    if (confirm(confirmText) == true)
    {
        admTerm.deleteEffect(icon, entryID, effectIndex);
    }
    else
    {
        // CANCEL
    }
}

function changeType(target, oldSelected)
{
    oldSelected = oldSelected;

    console.log("Test First");

    let icon = $(target).parents(".entryList")[0].dataset["icon"];
    let entryID = $(target).parents(".entry")[0].dataset["id"];
    let oldIndex = $(target).children().filter(function(index, option){return option.value === oldSelected})[0].index 
    let newSelected = $(target)[0].selectedOptions[0].value;

    let oldAtts = admTerm.getIconTypeAlerts(icon, oldSelected);
    let newAtts = admTerm.getIconTypeAlerts(icon, newSelected);

    let alertString = "";

    if(!oldAtts["access"] && newAtts["access"])
    {
        alertString += " - Access Cost\n";
    }

    if(!oldAtts["modify"] && newAtts["modify"])
    {
        alertString += " - Modify Cost\n";
    }

    if((oldSelected === "ice"))
    {
        alertString += " - ice Name\n"
    }
    else if((newSelected === "ice") || (!oldAtts["title"] && newAtts["title"]))
    {
        alertString += " - Title\n";
    }

    if(oldAtts["contents"] === "effects")
    {
        alertString += " - Effects\n";
    }
    else if(!oldAtts["contents"] && newAtts["contents"])
    {
        alertString += " - Contents\n";
    }

    if(alertString.length > 0)
    {
        let confirmText =   "Change Entry Type to " + newSelected + "?\n\n" + 
                            "The following fields will be cleared due to differences in the new type: \n" + 
                            alertString + 
                            " - Entry State\n\n" +
                            "All changes can be reverted by refreshing the page without saving.";

        if (confirm(confirmText) == true)
        {
            admTerm.changeType(icon, entryID, newSelected);
        }
        else
        {
            $(target).children().prop("selected",false);
            $($(target).children()[oldIndex]).prop("selected",true);
        }
    }
}

function changeState(target)
{
    let icon = $(target).parents(".entryList")[0].dataset["icon"];
    let entryID = $(target).parents(".entry")[0].dataset["id"];
    let newSelected = $(target)[0].selectedOptions[0].value;

    admTerm.changeState(icon, entryID, newSelected);
}

function saveTerminal(event)
{
    event.preventDefault();

    let confirmText =   "Save all pending changes for this terminal to the database?\n\nWARNING: Changes will be permanent.";

    if (confirm(confirmText) == true)
    {
        admTerm.saveTerminal();
    }
    else
    {
        // CANCEL
    }
}

function deleteTerminal(event)
{
    event.preventDefault();

    let confirmText =   " -- CAUTION -- CAUTION --\n\nDelete this terminal from the database?\n\nWARNING: Changes will be permanent!";

    if (confirm(confirmText) == true)
    {
        admTerm.deleteTerminal();
    }
    else
    {
        // CANCEL
    }
}