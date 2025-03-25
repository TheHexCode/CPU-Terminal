class Terminal
{
    #iconSchema;
    #terminalID;
    #termDisplayName;
    #termAccessCost;
    #termState;
    #entries;
    #logs;

    constructor(termJSON)
    {
        this.#terminalID = termJSON.id;
        this.#termDisplayName = termJSON.name;
        this.#termAccessCost = termJSON.access;
        this.#termState = termJSON.state;
        this.#entries = termJSON.entries;
        this.#logs = termJSON.logs;
    }

    async initSchemas()
    {
        const iconResponse = await fetch("resources/schemas/icons.json",{cache: "no-store"});
        this.#iconSchema = await iconResponse.json();
    }

    getTerminalID()
    {
        return this.#terminalID;
    }

    getTerminalDisplayName()
    {
        return this.#termDisplayName;
    }

    getTerminalAccessCost()
    {
        return this.#termAccessCost;
    }

    getTerminalState()
    {
        return this.#termState;
    }

    getLogEntries()
    {
        return this.#logs;
    }

    getActiveIcons()
    {
        let icons = this.#entries.map(entry => entry.icon)
        
        icons = icons.filter(function(value,index,array){
            return array.indexOf(value) === index;
        });

        return icons;
    }

    getIconEntries(requestedIcon)
    {
        let filtered = this.#entries.filter(entry => entry.icon === requestedIcon)

        let sorted = filtered.toSorted((a,b) => {
            const pathA = a.path.split("-");
            const pathB = b.path.split("-");

            let answer = null;

            pathA.forEach((element, index) => {
                if(answer === null)
                {
                    if((pathB[index] === null) || (pathA[index] > pathB[index]))
                    {
                        answer = 1;
                    }
                    else if (pathA[index] < pathB[index])
                    {
                        answer = -1
                    }
                    //else equal, check next value in forEach
                }
            });

            if(answer === null)
            {
                //pathB was longer than pathA
                return -1;
            }
            else
            {
                return answer;
            }
        });

        let iconGuide = this.#iconSchema[requestedIcon];

        let returnArray = new Array();

        sorted.forEach((element,index) => {
            let entry = new Object();
            entry.ice = false;
            entry.subIce = false;

            let unitCode = element.path.split("-");

            for(let i = 1; i < unitCode.length; i++)
            {
                entry.subIce = true;
                unitCode[i] = String.fromCharCode(Number(unitCode[i]) + 65);
            }

            unitCode = unitCode.join("");

            if(element.type === "ice")
            {
                entry.ice = true;
                entry.unit = "ICE " + unitCode;
                entry.path = element.path;
                entry.access = (element.state === "initial") ? 0 : null;
                entry.modify = (element.state === "initial") ? element.modify : null;
                entry.title = element.title;
                entry.contents = (element.state === "initial") ? null : entry.contents;
            }
            else
            {
                let stateGuide = iconGuide.types[element.type][element.state];

                entry.unit = iconGuide.unit + " " + unitCode;
                entry.path = element.path;

                entry.access = (stateGuide.access.enabled) ? element.access :
                                                             null;
                entry.modify = (stateGuide.modify.enabled) ? element.modify :
                                                             null;

                entry.title =   (stateGuide.title === false) ? null :
                                (stateGuide.title === true) ? element.title :
                                                              stateGuide.title;
                entry.contents =    (stateGuide.contents === false) ? null :
                                    (stateGuide.contents === true) ? element.contents :
                                                                     stateGuide.contents;
            }

            returnArray.push(entry);
        });

        return returnArray;
    }
}