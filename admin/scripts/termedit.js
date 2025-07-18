class AdminTerminal
{
    static #iconTypeMap = {
        "files": ["entry","trap"],
        "darkweb": ["entry", "trap"],
        "cameras": ["entry"],
        "locks": ["entry"],
        "defenses": ["entry"],
        "utilities": ["power", "alarm"],
        "puzzles": ["free_rp", "rev_mm"]
    };

    static #puzzleTypeMap = [
        {
            "shorthand": "free_rp",
            "fullname": "Hacking Action RP"
        },
        {
            "shorthand": "rev_mm",
            "fullname": "Reverse Mastermind"
        }
    ];

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
                "taken",
                "deleted"
            ],
            "darkweb": [
                "initial",
                "read",
                "taken",
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
            "taken",
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
    #puzzles = [];
    #knowledges = [];
    #changesPending = false;

    constructor(termID, entries, puzzles, knowledges)
    {
        this.#termID = termID;
        this.#entryList = this.#listifyEntries(entries);
        this.#puzzles = puzzles;
        this.#knowledges = knowledges;

        //console.log(this.#entryList);

        $(".entryList[data-icon='files']").html(this.drawEntries(this.#entryList["files"]));
        $(".entryList[data-icon='darkweb']").html(this.drawEntries(this.#entryList["darkweb"]));
        $(".entryList[data-icon='cameras']").html(this.drawEntries(this.#entryList["cameras"]));
        $(".entryList[data-icon='locks']").html(this.drawEntries(this.#entryList["locks"]));
        $(".entryList[data-icon='defenses']").html(this.drawEntries(this.#entryList["defenses"]));
        $(".entryList[data-icon='utilities']").html(this.drawEntries(this.#entryList["utilities"]));
        $(".entryList[data-icon='puzzles']").html(this.drawPuzzles(this.puzzles));
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
            "utilities": []
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
                titleLabel = "ICE NAME";
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
                                '<button class="addEntryButton" onclick="addIceEntry(event)">&plus; Add Entry to ICE ' + entry["path"] + '</button>' +
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

    #getPuzzleTypes(activeType)
    {
        let typeListString = "";

        AdminTerminal.#puzzleTypeMap.forEach(function(puzzleType)
        {
            typeListString += "<option value='" + puzzleType['shorthand'] + "'" + (activeType === puzzleType["shorthand"] ? " selected" : "") + ">" + puzzleType["fullname"] + "</option>";
        });

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

    drawPuzzles()
    {
        let puzzleString = "";

        this.#puzzles.forEach(function(puzzle, index)
        {
            console.log(puzzle);
            
            puzzleString += '<div class="puzzle" data-id="' + index + '">' +
                                '<div class="entryControls">' +
                                    /*'<div class="upControls">' +
                                        '<button>&barwedge;</button>' +
                                        '<button>&wedge;</button>' +
                                    '</div>' + */
                                    '<button class="delPuzzleButton" data-id="' + index + '" onclick="deletePuzzle(event)">&#x2716;</button>' +
                                    /*'<div class="downControls">' +
                                        '<button>&vee;</button>' +
                                        '<button>&veebar;</button>' +
                                    '</div>' + */
                                '</div>' +
                                '<div class="entryID">' +
                                    index +
                                '</div>' +
                                '<div class="entryGrid">' +
                                    '<div class="entryTypeRow">' +
                                        '<span class="entryTypeLabel">PUZZLE TYPE:</span>' +
                                        '<select class="entryType" onchange="changePuzzleType(this)">' +
                                            this.#getPuzzleTypes(puzzle['puzzle_type']) +
                                        '</select>' +
                                        '<span class="entryStateLabel">REWARD TYPE</span>' +
                                        '<select class="entryState" onchange="changeRewardType(this)">' +
                                            '<option' + (puzzle['reward_type'] === 'tags' ? ' selected' : '') + '>tags</option>' +
                                            '<option' + (puzzle['reward_type'] === 'item' ? ' selected' : '') + '>item</option>' +
                                        '</select>' +
                                    '</div>' +
                                    '<div class="entryLabelRow">' +
                                        '<span class="entryLabel entryAccess">PUZZLE COST</span>' +
                                        '<span class="entryLabel entryModify">REPEATABLE?</span>' +
                                        '<span class="entryLabel entryTitle">REQUIREMENTS</span>' +
                                        '<span class="entryLabel entryContents">REWARD</span>' +
                                    '</div>' +
                                    this.#getPuzzleInputRows(puzzle, index) +
                                '</div>' +
                            '</div>';
        }, this);

        return puzzleString;
    }

    #getPuzzleInputRows(puzzle, puzzIndex)
    {
        let puzzleString = '<div class="entryInputRow" style="grid-row: 4">' +
                                '<input class="entryAccess" type="number" data-field="cost" value=' + puzzle['cost'] + ' onchange="changePuzzleNumber(this)" />' +
                                '<div class="entryModify puzzleRepeat">' +
                                    '<div>' +
                                        '<input type="radio" id="inf' + puzzIndex + '" name="repeat' + puzzIndex + '" value="infinite" ' +
                                            (puzzle['repeat'] === null ? 'checked ' : '') + ' onchange="changeRepeatType(this)" />' +
                                        '<label for="inf' + puzzIndex + '">&infin;</label>' +
                                    '</div>' +
                                    '<div>' +
                                        '<input type="radio" id="lim' + puzzIndex + '" name="repeat' + puzzIndex + '" value="limited" ' +
                                            (puzzle['repeat'] >= 1 ? 'checked ' : '') +  'onchange="changeRepeatType(this)" />' +
                                        '<label for="lim' + puzzIndex + '">Limited</label>' +
                                    '</div>' +
                                    '<div>' +
                                        '<input type="radio" id="no' + puzzIndex + '" name="repeat' + puzzIndex + '" value="no" ' +
                                            (puzzle['repeat'] === 0 ? 'checked ' : '') + ' onchange="changeRepeatType(this)" />' +
                                        '<label for="no' + puzzIndex + '">No</label>' +
                                    '</div>' +
                                '</div>' +
                                this.#getPuzzleReq(puzzle['know_reqs'], 0) +
                                this.#getPuzzleReward(puzzle['reward'], 0) +
                            '</div>';

        puzzleString +=     '<div class="entryInputRow" style="grid-row: 5">' +
                                '<span class="entryAccess" style="text-align: right"># OF REPEATS &gt;&gt;</span>' +
                                '<input class="entryModify" type="number" data-field="repeat" value=' + (puzzle['repeat'] > 0 ? puzzle['repeat'] : null) + ' onchange="changePuzzleNumber(this)" ' +
                                    (puzzle['repeat'] > 0 ? '' : 'disabled ') + '/>' +
                                this.#getPuzzleReq(puzzle['know_reqs'], 1) +
                                this.#getPuzzleReward(puzzle['reward'], 1) +
                            '</div>';

        for(let i = 2; i <= Math.max((puzzle['know_reqs'] === null ? 0 : puzzle['know_reqs'].length), (Array.isArray(JSON.parse(puzzle['reward'])) ? JSON.parse(puzzle['reward']).length : 0)); i++)
        {
            puzzleString += '<div class="entryInputRow" style="grid-row: ' + (i+4) +'">' +
                                this.#getPuzzleReq(puzzle['know_reqs'], i) +
                                this.#getPuzzleReward(puzzle['reward'], i) +
                            '</div>';
        }

        return puzzleString;
    }

    #getPuzzleReq(requirements, index)
    {
        let know_reqs = JSON.parse(requirements);

        let reqString = '';

        if(know_reqs === null)
        {
            if(index === 0)
            {
                reqString = '<select class="puzzleTitle" onchange="changePuzzleReq(this)" data-index="' + index + '">';
                
                if(index === 0)
                {
                    reqString += '<option>None</option>';
                }

                this.#knowledges.forEach(function(knowledge)
                {
                    reqString += "<option" + (((know_reqs !== null) && (know_reqs[index] === knowledge["name"])) ? " selected" : "") + ">" + knowledge["name"] + "</option>";
                }, this);

                reqString += '</select>';
            }
            else if(index === 1)
            {
                reqString += '<button class="addPuzzleReq" onclick="addPuzzleReq(event)">&plus;</button>';
            }
        }
        else
        {
            if(index < know_reqs.length)
            {
                reqString = '<select class="puzzleTitle" onchange="changePuzzleReq(this)" data-index="' + index + '">';

                if(index === 0)
                {
                    reqString += '<option>None</option>';
                }

                this.#knowledges.forEach(function(knowledge)
                {
                    reqString += "<option" + (((know_reqs !== null) && (know_reqs[index] === knowledge["name"])) ? " selected" : "") + ">" + knowledge["name"] + "</option>";
                }, this);

                reqString += '</select>';

                if(index !== 0)
                {
                    reqString += '<button class="delPuzzleReq" onclick="delPuzzleReq(event, ' + index + ')">&minus;</button>';
                }
            }
            else if(index === know_reqs.length)
            {
                reqString += '<button class="addPuzzleReq" onclick="addPuzzleReq(event)">&plus;</button>';
            }
        }

        return reqString;
    }

    #getPuzzleReward(rewards, index)
    {
        let rewardArray = JSON.parse(rewards);

        let rewardString = "";

        if(Array.isArray(rewardArray))
        {
            if(index < rewardArray.length)
            {
                rewardString += '<input class="entryReward" type="text" value="" onchange="changePuzzleReward(this)" />';

                if(index !== 0)
                {
                    rewardString += '<button class="delPuzzleReward" onclick="delPuzzleReward(event, ' + index + ')">&minus;</button>';
                }
            }
            else if(index === rewardArray.length)
            {
                rewardString += '<button class="addPuzzleReward" onclick="addPuzzleReward(event)">&plus;</button>';
            }
        }
        else
        {
            if(index === 0)
            {
                rewardString += '<input class="entryReward" type="number" value=' + Number(rewardArray) + ' onchange="changePuzzleReward(this)" />'
            }
        }

        return rewardString;
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

    addPuzzle()
    {
        let newPuzzle = {
            puzzle_type: "free_rp",
            cost: 0,
            repeat: null,
            know_reqs: null,
            reward_type: "tags",
            reward: "1",
            global: 0
        };

        this.#puzzles.push(newPuzzle);

        this.#changesPending = true;

        $(".entryList[data-icon='puzzles']").html(this.drawPuzzles());
    }

    addIceEntry(icon, iceID)
    {
        let targetIce = this.#entryList[icon];

        iceID.split("-").forEach(function (pathPart, pathIndex, pathArray)
        {
            if(pathIndex === pathArray.length-1)
            {
                targetIce = targetIce[pathPart];
            }
            else
            {
                targetIce = targetIce[pathPart]["subIce"];
            }
        });

        let newIceEntry = {
            icon: icon,
            parent: iceID,
            path: iceID + "-" + targetIce["subIce"].length,
            access: 1,
            modify: 1,
            title: "",
            contents: "",
            state: "initial",
            type: AdminTerminal.#iconTypeMap[icon][0],
            subIce: []
        };

        targetIce["subIce"].push(newIceEntry);

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

    deletePuzzle(puzzleIndex)
    {
        this.#puzzles.splice(puzzleIndex,1);

        this.#changesPending = true;

        $(".entryList[data-icon='puzzles']").html(this.drawPuzzles());
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

    changePuzzleNumber(puzzleIndex, numberType, newNumber)
    {
        this.#puzzles[Number(puzzleIndex)][numberType] = newNumber;

        this.#changesPending = true;
    }

    changeType(icon, entryID, newSelected)
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

    changePuzzleType(puzzleIndex, newType)
    {
        this.#puzzles[Number(puzzleIndex)]["puzzle_type"] = newType;

        this.#changesPending = true;
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

    changeRepeat(puzzleIndex, newValue)
    {
        let targetPuzz = this.#puzzles[puzzleIndex];

        targetPuzz["repeat"] = newValue;

        this.#changesPending = true;
        
        $(".entryList[data-icon='puzzles']").html(this.drawPuzzles());
    }

    changePuzzleReqs(puzzleIndex, newReqs)
    {
        let targetPuzz = this.#puzzles[puzzleIndex];

        targetPuzz["know_reqs"] = newReqs;

        this.#changesPending = true;
    }

    changeRewardType(puzzleIndex, newType)
    {
        let targetPuzz = this.#puzzles[puzzleIndex];

        targetPuzz["reward_type"] = newType;

        switch(newType)
        {
            case("tags"):
            {
                targetPuzz["reward"] = 1;
                break;
            }
            case("item"):
            {
                targetPuzz["reward"] = '[""]';
            }
        }

        this.#changesPending = true;

        $(".entryList[data-icon='puzzles']").html(this.drawPuzzles());
    }

    changePuzzleReward(puzzleIndex, newReward)
    {
        let targetPuzz = this.#puzzles[puzzleIndex];

        targetPuzz["reward"] = newReward;

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

    addPuzzleReq(puzzleIndex)
    {
        let target = this.#puzzles[Number(puzzleIndex)];

        let targetReqs = JSON.parse(target["know_reqs"]) ?? [];

        targetReqs.push(this.#knowledges[0]["name"]);

        target["know_reqs"] = JSON.stringify(targetReqs);

        $(".entryList[data-icon='puzzles']").html(this.drawPuzzles());
    }

    delPuzzleReq(puzzleIndex, reqIndex)
    {
        let target = this.#puzzles[Number(puzzleIndex)];

        let targetReqs = JSON.parse(target["know_reqs"]);

        targetReqs.splice(reqIndex, 1);

        target["know_reqs"] = JSON.stringify(targetReqs);

        $(".entryList[data-icon='puzzles']").html(this.drawPuzzles());
    }

    addPuzzleReward(puzzleIndex, rewardIndex)
    {
        let target = this.#puzzles[Number(puzzleIndex)];

        let targetRewards = JSON.parse(target["reward"]);

        targetRewards.push("");

        target["reward"] = JSON.stringify(targetRewards);

        $(".entryList[data-icon='puzzles']").html(this.drawPuzzles());
    }

    delPuzzleReward(puzzleIndex, rewardIndex)
    {
        let target = this.#puzzles[Number(puzzleIndex)];

        let targetRewards = JSON.parse(target["reward"]);

        targetRewards.splice(rewardIndex, 1);

        target["reward"] = JSON.stringify(targetRewards);

        $(".entryList[data-icon='puzzles']").html(this.drawPuzzles());
    }

    saveTerminal()
    {
        let termInfo = {
            "termID": this.#termID,
            "jobCode": $("#jobCode").val(),
            "termSlug": $("#termSlug").val(),
            "displayName": $("#termDisplayName").val(),
            "termAccess": Number($("#termAccess").val()),
            "entries": JSON.stringify(this.#entryList),
            "puzzles": JSON.stringify(this.#puzzles)
        };
        
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

$(window).bind('beforeunload', function(event)
{
    event.preventDefault();

    if(admTerm.areChangesPending())
    {
        return 'Leave page?\nChanges that you have made will not be saved.';
    }
});

function addEntry(event)
{
    event.preventDefault();

    let icon = $(event.target).prev()[0].dataset["icon"];

    admTerm.addEntry(icon);
}

function addPuzzle(event)
{
    event.preventDefault();

    admTerm.addPuzzle();
}

function addIceEntry(event)
{
    event.preventDefault();

    let icon = $(event.target).parents(".entryList")[0].dataset["icon"];
    let iceID = $(event.target).prevAll().last()[0].dataset["id"];

    admTerm.addIceEntry(icon, iceID);
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

function deletePuzzle(event)
{
    event.preventDefault();

    let puzzle = $(event.target).parents(".puzzle")[0];
    let puzzleIndex = $(puzzle).attr("data-id");

    let confirmText = "Delete puzzle " + puzzleIndex + "? You can recover this puzzle if you refresh the page without saving changes.";

    if (confirm(confirmText) == true)
    {
        admTerm.deletePuzzle(puzzleIndex);
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
    let fieldType = field.classList[0].split("entry")[1].toLowerCase();

    admTerm.changeEntry(field.value, icon, entryID, fieldType, effectIndex);
}

function changePuzzleNumber(target)
{
    let puzzleIndex = $(target).parents(".puzzle")[0].dataset["id"];

    let minNum = (target.dataset["field"] === "repeat" ? 1 : 0);
    let newNum = Math.max(target.value, minNum);

    target.value = newNum;

    admTerm.changePuzzleNumber(puzzleIndex, target.dataset["field"], newNum);
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
        alertString += " - ICE Name\n"
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

function changePuzzleType(target)
{
    let puzzleIndex = $(target).parents(".puzzle")[0].dataset["id"];
    let newType = target.selectedOptions[0].value;

    admTerm.changePuzzleType(puzzleIndex, newType);
}

function changeState(target)
{
    let icon = $(target).parents(".entryList")[0].dataset["icon"];
    let entryID = $(target).parents(".entry")[0].dataset["id"];
    let newSelected = $(target)[0].selectedOptions[0].value;

    admTerm.changeState(icon, entryID, newSelected);
}

function changeRepeatType(target)
{
    let puzzleIndex = $(target).parents(".puzzle")[0].dataset["id"];
    let newValue = null;

    switch(target.value)
    {
        case("infinite"):
        {
            newValue = null;
            break;
        }
        case("limited"):
        {
            newValue = 1;
            break;
        }
        case("no"):
        {
            newValue = 0;
            break;
        }
    }

    admTerm.changeRepeat(puzzleIndex, newValue);
}

function changePuzzleReq(target)
{
    let puzzleIndex = $(target).parents(".puzzle")[0].dataset["id"];
    let reqArray = [];

    $(".puzzle[data-id='" + puzzleIndex + "'] .puzzleTitle").each(function(index, req)
    {
        if(req.selectedOptions[0].value !== "None")
        {
            reqArray.push(req.selectedOptions[0].value);
        }
    });

    let reqString = (reqArray.length === 0 ? null : '["' + reqArray.join('", "') + '"]');

    admTerm.changePuzzleReqs(puzzleIndex, reqString);
}

function changeRewardType(target)
{
    let puzzleIndex = $(target).parents(".puzzle")[0].dataset["id"];
    let newType = target.selectedOptions[0].value;

    admTerm.changeRewardType(puzzleIndex, newType);
}

function changePuzzleReward(target)
{
    let puzzleIndex = $(target).parents(".puzzle")[0].dataset["id"];

    switch($(target).attr("type"))
    {
        case("text"):
        {
            let rewardArray = [];

            $(".puzzle[data-id='" + puzzleIndex + "'] .entryReward").each(function(index, reward)
            {
                rewardArray.push(reward.value);
            });

            let rewardString = '["' + rewardArray.join('", "') + '"]'

            admTerm.changePuzzleReward(puzzleIndex, rewardString);
            break;
        }
        case("number"):
        {
            let newNum = Math.max(target.value, 1);

            target.value = newNum;

            admTerm.changePuzzleReward(puzzleIndex, newNum);
            break;
        }
    }
}

function addPuzzleReq(event)
{
    event.preventDefault();

    admTerm.addPuzzleReq($(event.target).parents(".puzzle")[0].dataset["id"]);
}

function delPuzzleReq(event, index)
{
    event.preventDefault();

    admTerm.delPuzzleReq($(event.target).parents(".puzzle")[0].dataset["id"], index);
}

function addPuzzleReward(event)
{
    event.preventDefault();

    admTerm.addPuzzleReward($(event.target).parents(".puzzle")[0].dataset["id"]);
}

function delPuzzleReward(event, index)
{
    event.preventDefault();

    admTerm.delPuzzleReward($(event.target).parents(".puzzle")[0].dataset["id"], index);
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