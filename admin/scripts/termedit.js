class AdminTerminal
{
    static #iconTypeMap = {
        "files": ["ENTRY","TRAP"],
        "darkweb": ["ENTRY", "TRAP"],
        "cameras": ["ENTRY"],
        "locks": ["ENTRY"],
        "defenses": ["ENTRY"],
        "utilities": ["POWER", "ALARM"]
    };

    #entryList = [];

    constructor(entries)
    {
        this.#entryList = this.#listifyEntries(entries);

        console.log(this.#entryList);

        $(".entryList[data-icon='files']").html(this.drawEntries(this.#entryList["files"]));
        $(".entryList[data-icon='darkweb']").html(this.drawEntries(this.#entryList["darkweb"]));
        $(".entryList[data-icon='cameras']").html(this.drawEntries(this.#entryList["cameras"]));
        $(".entryList[data-icon='locks']").html(this.drawEntries(this.#entryList["locks"]));
        $(".entryList[data-icon='defenses']").html(this.drawEntries(this.#entryList["defenses"]));
        $(".entryList[data-icon='utilities']").html(this.drawEntries(this.#entryList["utilities"]));
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

            entry["access"] = '"' + entry["access"] + '"';
            entry["title"] = '"' + entry["title"] + '"';

            if(entry["type"] === "trap")
            {
                contentsLabel = "EFFECTS";

                entry["title"] = '"Trap!" disabled';
                entry["contents"] = this.#getEntryEffects(entry["contents"]);
            }
            else if(entry["type"] === "ice")
            {
                accessLabel = "BREAK";
                modifyLabel = "SLEAZE";
                titleLabel = "ICE NAME";
                contentsLabel = "EFFECTS";

                entry["access"] = '"0" disabled';
                entry["contents"] = this.#getEntryEffects(entry["contents"]);
            }
            else if((entry["icon"] !== "files") && (entry["icon"] !== "darkweb"))
            {
                entry["contents"] = '"No Contents" disabled />';
            }
            else
            {
                entry["contents"] = '"' + entry["contents"] + '" />';
            }

            entryString +=  (entry["type"] === "ice" ? '<div class="iceBox">' : '') +
                            '<div class="entry">' +
                                '<div class="entryControls">' +
                                    '<div class="upControls">' +
                                        '<button>&barwedge;</button>' +
                                        '<button>&wedge;</button>' +
                                    '</div>' +
                                    '<button class="delButton">&times;</button>' +
                                    '<div class="downControls">' +
                                        '<button>&vee;</button>' +
                                        '<button>&veebar;</button>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="entryID">' +
                                    entry["path"] +
                                '</div>' +
                                '<div class="entryGrid">' +
                                    '<div class="entryTypeRow">' +
                                        '<span class="entryTypeLabel">ENTRY TYPE:</span>' +
                                        '<select class="entryType">' +
                                            this.#getEntryTypes(entry["icon"], entry["type"]) +
                                        '</select>' +
                                    '</div>' +
                                    '<div class="entryLabelRow">' +
                                        '<span class="entryLabel entryAccess">' + accessLabel + ' COST</span>' +
                                        '<span class="entryLabel entryModify">' + modifyLabel + ' COST</span>' +
                                        '<span class="entryLabel entryTitle">' + titleLabel + '</span>' +
                                        '<span class="entryLabel entryContents">' + contentsLabel + '</span>' +
                                    '</div>' +
                                    '<div class="entryInputRow">' +
                                        '<input class="entryAccess" type="number" value=' + entry["access"] + ' />' +
                                        '<input class="entryModify" type="number" value="' + entry["modify"] + '" />' +
                                        '<input class="entryTitle" type="text" value=' + entry["title"] + ' />' +
                                        '<input class="entryContents" type="text" value=' + entry["contents"] +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            (entry["type"] === "ice" ?
                                this.drawEntries(entry["subIce"]) + 
                                '<button class="addEntryButton">&plus; Add Entry to ICE ' + entry["path"] + '</button>' +
                            '</div>' : '');
        }, this);

        return entryString;
    }

    #getEntryTypes(icon, type)
    {
        let typeListString = "";

        AdminTerminal.#iconTypeMap[icon].forEach(function(iconType)
        {
            typeListString += "<option" + (type.toUpperCase() === iconType ? " selected" : "") + ">" + iconType + "</option>";
        });

        typeListString += "<option" + (type.toUpperCase() === "ICE" ? " selected" : "") + ">ICE</option>";

        return typeListString;
    }

    #getEntryEffects(contents)
    {
        let effects = JSON.parse(contents);

        let effectString = '"' + effects[0] + '" /></div>';

        for(let i = 1; i < effects.length; i++)
        {
            let effectCount = i + 4;

            effectString += '<div class="entryInputRow" data-row="' + effectCount + '" style="grid-row: ' + effectCount + '">' +
                                '<input class="entryContents" type="text" value="' + effects[i] + '" />' +
                                '<button class="delEffectButton" onclick="delEffect(' + effectCount + ')">&minus;</button>' +
                            '</div>';
        }

        let effectMax = effects.length + 4;

        effectString += '<div class="entryInputRow" data-row="' + effectMax + '" style="grid-row: ' + effectMax + '">' +
                            '<button class="addEffectButton" onclick="addEffect(' + effectMax + ')">&plus;</button>';

        return effectString;
    }


}

//////////////////////////////////////////////////////////////////////////////////////////

function tens(numStr)
{
	var tensFormat = new Intl.NumberFormat('en-US', { 
		minimumIntegerDigits: 2
	});
	
	return tensFormat.format(Number(numStr));
}

function addEntry(event)
{
    event.preventDefault();

    let entryList = $(event.target).parent();

    let newID = entryList.children(".entry").length;

    $(event.target).before('<div class="entry">'+
                                '<div class="entryControls">' +
                                    '<div class="upControls">' +
                                        '<button>&barwedge;</button>' +
                                        '<button>&wedge;</button>' +
                                    '</div>' +
                                    '<button class="delButton">&times;</button>' +
                                    '<div class="downControls">' +
                                        '<button>&vee;</button>' +
                                        '<button>&veebar;</button>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="entryID">' +
                                    newID +
                                '</div>' +
                                '<div class="entryGrid">' +
                                    '<div class="entryTypeRow">' +
                                        '<span class="entryTypeLabel">ENTRY TYPE:</span>' +
                                        '<select class="entryType">' +
                                            '<option>ENTRY</option>' +
                                            '<option>TRAP</option>' +
                                            '<option>ICE</option>' +
                                        '</select>' +
                                    '</div>' +
                                    '<div class="entryLabelRow">' +
                                        '<span class="entryLabel entryAccess">ACCESS COST</span>' +
                                        '<span class="entryLabel entryModify">MODIFY COST</span>' +
                                        '<span class="entryLabel entryTitle">TITLE</span>' +
                                        '<span class="entryLabel entryContents">CONTENTS</span>' +
                                    '</div>' +
                                    '<div class="entryInputRow">' +
                                        '<input class="entryAccess" type="number" value="0" />' +
                                        '<input class="entryModify" type="number" value="0" />' +
                                        '<input class="entryTitle" type="text" />' +
                                        '<input class="entryContents" type="text" />' +
                                    '</div>' +
                                '</div>' +
                            '</div>'
                        );
}