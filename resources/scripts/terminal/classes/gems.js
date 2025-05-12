class Gems {
	static #gems= [ "",
		$("#gem1"), $("#gem2"),
		$("#gem3"), $("#gem4"),
		$("#gem5"), $("#gem6"),
		$("#gem7"), $("#gem8"),
		$("#gem9"), $("#gem10")
	];

	//Color Enums
	static ACCESS = new Map([
        ["negative", "root"],
        ["access",   "blend"],
        ["payload",  "amber"],
        ["extra",    "blue"]
    ]);
	static STANDBY = new Map([
        ["all",  "blue"]
    ]);
	static CONFIRM = new Map([
        ["remain",  "blue"],
        ["using", "amber"]
    ]);
	static EXECUTE = new Map([
        ["remain", "blue"],
        ["using",  "blend"]
    ]);
	static ROOT = new Map([
        ["all", "root"]
    ]);

	static updateTagGems(gemStage, stageOne, stageTwo=stageOne, totalTags=stageTwo)
	{
        let tenOnes = Math.floor((stageOne-1)/10);
        let remOnes = ((stageOne-1) % 10)+1;
        
        let tenTwos = Math.floor((stageTwo-1)/10);
        let remTwos = ((stageTwo-1) % 10)+1;
        
        let tenTotal = Math.floor((totalTags-1)/10);
        let remTotal = ((totalTags-1) % 10)+1;

        let maxTen = Math.max(tenOnes,tenTwos,tenTotal);

        for(let i = 10; i > 0; i--)
        {
            Gems.#gems[i].removeClass();
            Gems.#gems[i].addClass("gem clear");
        }

		switch(gemStage)
        {
            case this.ACCESS:
            {
                if(totalTags < stageOne) // Negative
                {
                    // stageTwo/totalTags = working up to access
                    // stageOne = negative
                    for(let one = remOnes; one > remTotal; one--)
                    {
                        Gems.#gems[one].removeClass();
                        Gems.#gems[one].addClass("gem " + gemStage.get("negative"));
                    }

                    if(tenTotal === maxTen)
                    {
                        // if we're negative, then whatever tags they DO have will be within access, so it blends
                        for(let total = remTotal; total > 0; total--)
                        {
                            Gems.#gems[total].removeClass();
                            Gems.#gems[total].addClass("gem " +  + gemStage.get("access"));
                        }
                    }
                }
                else // Normal
                {
                    // stageOne = access
                    // stageTwo = payload
                    // totalTags = payload + extras

                    if(tenTotal === maxTen)
                    {
                        for(let total = remTotal; total > 0; total--)
                        {
                            Gems.#gems[total].removeClass();
                            Gems.#gems[total].addClass("gem " + gemStage.get("extra"));
                        }
                    }

                    if(tenTwos === maxTen)
                    {
                        for(let two = remTwos; two > 0; two--)
                        {
                            Gems.#gems[two].removeClass();
                            Gems.#gems[two].addClass("gem " + gemStage.get("payload"));
                        }
                    }

                    if(tenOnes === maxTen)
                    {
                        for(let one = remOnes; one > 0; one--)
                        {
                            Gems.#gems[one].removeClass();
                            Gems.#gems[one].addClass("gem " + gemStage.get("access"));
                        }
                    }
                }

                break;
            }
            case this.CONFIRM:
            case this.EXECUTE:
            {
                if(tenTwos === maxTen)
                {
                    for(let two = remTwos; two > 0; two--)
                    {
                        Gems.#gems[two].removeClass();
                        Gems.#gems[two].addClass("gem " + gemStage.get("using"));
                    }
                }

                if(tenOnes === maxTen)
                {
                    for(let one = remOnes; one > 0; one--)
                    {
                        Gems.#gems[one].removeClass();
                        Gems.#gems[one].addClass("gem " + gemStage.get("remain"));
                    }
                }

                break;
            }
            case this.STANDBY:
            case this.ROOT:
            {
                if(tenOnes === maxTen)
                {
                    for(let one = remOnes; one > 0; one--)
                    {
                        Gems.#gems[one].removeClass();
                        Gems.#gems[one].addClass("gem " + gemStage.get("all"));
                    }
                }

                break;
            }
            default:
                console.log("No Such GemStage");
        }

        if(maxTen > 0)
        {
            $("#gemTens").removeClass("dimmed");
            $("#gemTenTags").html("x" + tens(maxTen));
        }
        else
        {
            $("#gemTens").addClass("dimmed");
            $("#gemTenTags").html("");
        }
	}
}