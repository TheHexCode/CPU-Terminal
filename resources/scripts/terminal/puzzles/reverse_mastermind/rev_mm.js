class ReverseMasterMind
{
    #puzzleArray; //array

    #colorSrcs = {
        "A": "/resources/images/puzzles/a_red_lines.png",
        "B": "/resources/images/puzzles/b_amber_hex.png",
        "C": "/resources/images/puzzles/c_green_star.png",
        "D": "/resources/images/puzzles/d_blue_diam.png",
        "E": "/resources/images/puzzles/e_indigo_tri.png",
        "F": "/resources/images/puzzles/f_magenta_circ.png"
    };

    #puzzleID;
    #puzzleIndex; //int
    #pegCount; //int
    #guesses = []; //array
    #difficulty; //int
    #colorCount; //int
    #guessCount; //int
    #answer; //array

    constructor(pegCount = 4, puzzleID)
    {
        let thisInst = this;

        this.#pegCount = pegCount;
        this.#puzzleID = puzzleID;
        
        $.getJSON("/resources/schemas/four_peg.json", function(puzzleDB) {
            thisInst.#puzzleIndex = Math.floor(Math.random() * puzzleDB.length)

            thisInst.#puzzleArray = puzzleDB[thisInst.#puzzleIndex];

            //thisInst.#difficulty = thisInst.#puzzleArray["difficulty"];
            thisInst.#colorCount = thisInst.#puzzleArray["colorCount"];
            //thisInst.#guessCount = thisInst.#puzzleArray["guesses"].length;
            //thisInst.#answer = thisInst.#puzzleArray["answer"];
            thisInst.#guesses = thisInst.#puzzleArray["guesses"];

            /*
            console.log("puzzleArray: " + thisInst.#puzzleArray);
            console.log(" > puzzleIndex: " + thisInst.#puzzleIndex);
            console.log(" > pegCount: " + thisInst.#pegCount);
            console.log(" > difficulty: " + thisInst.#difficulty);
            console.log(" > colorCount: " + thisInst.#colorCount);
            console.log(" > guessCount: " + thisInst.#guessCount);
            console.log(" > answer: [" + thisInst.#answer + "]");
            console.log(" > guesses: ");
            console.log(thisInst.#guesses);
            */

            thisInst.#shuffleColors();

            if(thisInst.#colorCount < 6)
            {
                delete thisInst.#colorCount["F"];
                
                if(thisInst.#colorCount < 5)
                {
                    delete thisInst.#colorCount["E"];
                }
            }

            thisInst.#drawMMBox();
        });
    }

    getColorCount()
    {
        return this.#colorCount;
    }

    getBall(letter)
    {
        return this.#colorSrcs[letter];
    }

    #shuffleColors()
    {
        let colorKeys = Object.keys(this.#colorSrcs);
        let remaining = colorKeys.length;
        let random;
        let temp;

        while(remaining > 0)
        {
            random = Math.floor(Math.random() * remaining);
            remaining -= 1;
            
            temp = this.#colorSrcs[colorKeys[remaining]];
            this.#colorSrcs[colorKeys[remaining]] = this.#colorSrcs[colorKeys[random]];
            this.#colorSrcs[colorKeys[random]] = temp;
        }
    }

    shuffleCheck()
    {
        console.log(this.#colorSrcs);
        this.#shuffleColors();
        console.log(this.#colorSrcs);
    }

    #drawMMBox()
    {
        let guessString = "";

        this.#guesses.forEach(function(guess)
        {
            guessString +=  "<div class='rmmAnswerCheck'>" +
                            "</div>" +
                            "<div class='rmmGuessRow'>" +
                                "<span class='rmmGuessChar'><img src='" + this.#colorSrcs[guess.guess[0]] + "'/></span>" +
                                "<span class='rmmGuessChar'><img src='" + this.#colorSrcs[guess.guess[1]] + "'/></span>" +
                                "<span class='rmmGuessChar'><img src='" + this.#colorSrcs[guess.guess[2]] + "'/></span>" +
                                "<span class='rmmGuessChar'><img src='" + this.#colorSrcs[guess.guess[3]] + "'/></span>" +
                            "</div>" +
                            "<div class='rmmMarkerBox'>" +
                                "<div class='rmmMarkerRow'>";

            // A B
            // C D

            // c c | c w
            // w c | w w

            // c _ | c _ | _ _
            // w _ | _ _ | _ _

            // MARKER BOX A
            if(guess.markers.correct > 0)
            {
                guessString +=      "<span class='rmmMarkerChar'><img src='/resources/images/puzzles/correct.png' /></span>";
            }
            else
            {
                guessString +=      "<span class='rmmMarkerChar'>&nbsp;</span>";
            }

            // MARKER BOX B
            if(guess.markers.correct > 1)
            {
                guessString +=      "<span class='rmmMarkerChar'><img src='/resources/images/puzzles/correct.png' /></span>";
            }
            else if(guess.markers.wrong === 3)
            {
                guessString +=      "<span class='rmmMarkerChar'><img src='/resources/images/puzzles/wrong.png' /></span>";
            }
            else
            {
                guessString +=      "<span class='rmmMarkerChar'>&nbsp;</span>";
            }

            guessString +=      "</div>" +
                                "<div class='rmmMarkerRow'>";

            // MARKER BOX C
            if(guess.markers.wrong > 0)
            {
                guessString +=      "<span class='rmmMarkerChar'><img src='/resources/images/puzzles/wrong.png' /></span>";
            }
            else
            {
                guessString +=      "<span class='rmmMarkerChar'>&nbsp;</span>";
            }

            // MARKER BOX D
            if(guess.markers.wrong > 1)
            {
                guessString +=      "<span class='rmmMarkerChar'><img src='/resources/images/puzzles/wrong.png' /></span>";
            }
            else if(guess.markers.correct === 3)
            {
                guessString +=      "<span class='rmmMarkerChar'><img src='/resources/images/puzzles/correct.png' /></span>";
            }
            else
            {
                guessString +=      "<span class='rmmMarkerChar'>&nbsp;</span>";
            }

            guessString +=      "</div>" +
                            "</div>";
        }, this);
        
        $("#rmmGuessArray").html(guessString);

        $("#rmmAnswerBox").html("<div class='rmmTotalCheck'>" +
                                "</div>" +
                                "<div class='rmmGuessRow rmmAnswerRow'>" +
                                    "<div class='rmmGuessChar rmmAnswerChar' data-ball='null'></div>" +
                                    "<div class='rmmGuessChar rmmAnswerChar' data-ball='null'></div>" +
                                    "<div class='rmmGuessChar rmmAnswerChar' data-ball='null'></div>" +
                                    "<div class='rmmGuessChar rmmAnswerChar' data-ball='null'></div>" +
                                "</div>" +
                                "<div class='rmmMarkerBox'>" +
                                    "<div class='rmmMarkerRow rmmAnswerMarkerRow'>" +
                                        "<span class='rmmMarkerChar rmmAnswerMarker'>&nbsp;</span>" +
                                        "<span class='rmmMarkerChar rmmAnswerMarker'>&nbsp;</span>" +
                                    "</div>" +
                                    "<div class='rmmMarkerRow rmmAnswerMarkerRow'>" +
                                        "<span class='rmmMarkerChar rmmAnswerMarker'>&nbsp;</span>" +
                                        "<span class='rmmMarkerChar rmmAnswerMarker'>&nbsp;</span>" +
                                    "</div>" +
                                "</div>" +
                                "<div class='rmmSubmitBox'>" +
                                    "<button id='rmmSubmitButton' data-id='" + this.#puzzleID + "' onpointerup='submitAnswer(this)' disabled>Submit Answer</button>" +
                                "</div>");

        $(".rmmAnswerChar").bind("pointerup", function(event)
        {
            event.preventDefault();

            if($(event.target).attr("disabled") !== "disabled")
            {
                cycleBalls(event.target,"cycle");

                let disabled = false;
                $(".rmmAnswerChar").each(function(index, char)
                {
                    if(char.dataset["ball"] === "null")
                    {
                        disabled = true;
                        return false;
                    }
                });

                $("#rmmSubmitButton").attr("disabled", disabled);
            }
        });

        $(".rmmAnswerChar").bind("contextmenu", function(event)
        {
            event.preventDefault();

            if($(event.target).attr("disabled") !== "disabled")
            {
                cycleBalls(event.target,"clear");

                $("#rmmSubmitButton").attr("disabled", true);
            }
        });
    }

    checkGuess(guessRow, playerAnswer)
    {
        let guess = this.#guesses[guessRow];
        
        let correct = [];
        let wrong = [];

        // Have to check for correct positioning first, otherwise, the same digit ahead of the correct digit will be counted as wrong
        // When the correct digit needs to claim the answerIndex
        for(let index = 0; index < guess.guess.length; index++)
        {
            if(guess.guess[index] === playerAnswer[index]) // Correct Positioning
            {
                correct.push(index);
            }
        }

        for(let guessIndex = 0; guessIndex < guess.guess.length; guessIndex++)
        {
            for(let answerIndex = 0; answerIndex < playerAnswer.length; answerIndex++)
            {
                // We don't want to check between Guess and Answer if:
                //  - The GuessIndex nor AnswerIndex is in Correct, since if they are, we've already accounted for them
                //  - The AnswerIndex is in Wrong, since if it is, it's already been claimed by one of the Guess Indices
                if((!correct.includes(guessIndex)) && (!correct.includes(answerIndex)))
                {
                    if(!wrong.includes(answerIndex))
                    {
                        if(guess.guess[guessIndex] === playerAnswer[answerIndex]) // Wrong Positioning
                        {
                            // Push the AnswerIndex, because it's the Answer's values that need to be claimed
                            wrong.push(answerIndex);
                            break; //Breaks out of the AnswerIndex loop, because we've resolved this GuessIndex, and need to check the next GuessIndex
                                    //If we kept checking the GuessIndex, then we'd potentially resolve the GuessIndex a second time later
                        }
                    }
                }
            }
        }

        if((guess.markers.correct === correct.length) && (guess.markers.wrong === wrong.length))
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cycleBalls(target, action)
{
    let newBall = "null";

    $(".checkBorder").addClass("checkFade");
    sleep(2100).then(() => {
        $(".checkBorder.checkFade").html("");
        $(".checkBorder.checkFade").removeClass("checkBorder checkFade");
    });

    if(action === "clear") // Right-click sets to null
    {
        $(target).attr("data-ball", newBall);
        $(target).html("");
    }
    else if(action === "cycle") // Left-click cycles, starting from A
    {
        switch(target.dataset["ball"])
        {
            default:
            {
                newBall = "A";
                break;
            }
            case("A"):
            {
                newBall = "B";
                break;
            }
            case("B"):
            {
                newBall = "C";
                break;
            }
            case("C"):
            {
                newBall = "D";
                break;
            }
            case("D"):
            {
                if(revMM.getColorCount() >= 5)
                {
                    newBall = "E";
                }
                else
                {
                    newBall = "A";
                }
                break;
            }
            case("E"):
            {
                if(revMM.getColorCount() >= 6)
                {
                    newBall = "F";
                }
                else
                {
                    newBall = "A";
                }
                break;
            }
            case("F"):
            {
                newBall = "A";
                break;
            }
        }

        let src =  revMM.getBall(newBall);

        $(target).attr("data-ball", newBall);
        $(target).html("<img src='" + src + "'/>");
    }
}

function submitAnswer(target)
{
    let puzzID = target.dataset["id"];

    if($(target).attr("disabled") !== "disabled")
    {
        $("#rmmSubmitButton, .rmmAnswerChar").attr("disabled", true);

        $(".rmmGuessRow").removeClass("checking checkFade");

        $(".rmmAnswerCheck, .rmmTotalCheck").html("");
        $(".rmmAnswerCheck, .rmmTotalCheck").removeClass("checkBorder");

        let playerAnswer = [];
        
        $(".rmmAnswerChar").each(function(index, char)
        {
            playerAnswer.push(char.dataset["ball"]);
        });
        
        $(".rmmAnswerRow").addClass("checking");

        sleep(450).then(() => {
            $(".rmmTotalCheck").addClass("checkBorder");
            $(".rmmTotalCheck").html("<svg id='rmmHexLogo' width='29' height='34' xmlns='http://www.w3.org/2000/svg'>" +
                                        //             width='209' height='229'
                                        "<mask id='rmmLogoMask'>" +
                                        //   <polygon points='105,10 195,62 195,167 105,219 15,167 15,62' fill='black' stroke='white' stroke-width='15' />
                                            "<polygon points='15,1 28,10 28,24 15,33 1,25 1,10' fill='black' stroke='white' stroke-width='2' />" +
                                        "</mask>" +
                                        "<foreignObject x='0' y='0' width='29' height='34' mask='url(#rmmLogoMask)'>" +
                                            "<div id='rmmLogoBG'></div>" +
                                        "</foreignObject>" +
                                    "</svg>");

            sleep(900).then(() => {
                staggerCheck(0, $(".rmmAnswerCheck"), playerAnswer, puzzID);
            });
        });
    }
}

function staggerCheck(index, array, playerAnswer, puzzID)
{
    if(index < array.length)
    {
        let checkBox = array[index];

        $(checkBox).addClass("checkBorder");
        $($(".rmmGuessRow")[index]).addClass("checking");

        sleep(450).then(() => {
            if(revMM.checkGuess(index, playerAnswer))
            {
                $(checkBox).html("<span class='rmmCheckYes'>✓</span>");

                sleep(450).then(() => {
                    staggerCheck(index+1, array, playerAnswer, puzzID);
                });
            }
            else
            {
                $(checkBox).html("<span class='rmmCheckNo'>X</span>");

                sleep(450).then(() => {
                    $(".rmmTotalCheck").html("<span class='rmmCheckNo'>X</span>");
                    $("#rmmSubmitButton, .rmmAnswerChar").attr("disabled", false);

                    $(".rmmGuessRow.checking").addClass("checkFade");
                    sleep(2100).then(() => {
                        $(".rmmGuessRow.checking").removeClass("checking checkFade");
                    });
                });
            }
        });
    }
    else // All are correct
    {
        $(".rmmTotalCheck").html("<span class='rmmCheckYes'>✓</span>");
        sleep(1000).then(() => {
            resolvePuzzle(puzzID);
        });
    }
}