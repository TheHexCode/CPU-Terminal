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

    #puzzleIndex; //int
    #pegCount; //int
    #guesses = []; //array
    #difficulty; //int
    #colorCount; //int
    #guessCount; //int
    #answer; //array

    constructor(pegCount = 4, puzzIndex = null)
    {
        let thisInst = this;

        this.#pegCount = pegCount;
        this.#puzzleIndex = puzzIndex;

        if(puzzIndex !== null)
        {
            $.getJSON("/resources/schemas/four_peg.json", function(puzzleDB) {
                thisInst.#puzzleArray = puzzleDB[puzzIndex];

                thisInst.#difficulty = thisInst.#puzzleArray["difficulty"];
                thisInst.#colorCount = thisInst.#puzzleArray["colorCount"];
                thisInst.#guessCount = thisInst.#puzzleArray["guesses"].length;
                thisInst.#answer = thisInst.#puzzleArray["answer"];
                thisInst.#guesses = thisInst.#puzzleArray["guesses"];

                console.log("puzzleArray: " + thisInst.#puzzleArray);
                console.log(" > pegCount: " + thisInst.#pegCount);
                console.log(" > difficulty: " + thisInst.#difficulty);
                console.log(" > colorCount: " + thisInst.#colorCount);
                console.log(" > guessCount: " + thisInst.#guessCount);
                console.log(" > answer: [" + thisInst.#answer + "]");
                console.log(" > guesses: ");
                console.log(thisInst.#guesses);

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
    }

    getColorCount()
    {
        return this.#colorCount;
    }

    getBall(letter)
    {
        return this.#colorSrcs[letter];
    }

    #drawMMBox()
    {
        let guessString = "";

        this.#guesses.forEach(function(guess)
        {
            guessString +=  "<div class='rmmGuessRow'>" +
                                "<span class='rmmGuessChar'><img src='" + this.#colorSrcs[guess.guess[0]] + "'/></span>" +
                                "<span class='rmmGuessChar'><img src='" + this.#colorSrcs[guess.guess[1]] + "'/></span>" +
                                "<span class='rmmGuessChar'><img src='" + this.#colorSrcs[guess.guess[2]] + "'/></span>" +
                                "<span class='rmmGuessChar'><img src='" + this.#colorSrcs[guess.guess[3]] + "'/></span>" +
                            "</div>" +
                            "<div class='rmmMarkerBox'>" +
                                "<div class='rmmMarkerRow'>";

            for(let c = 0; c < guess.markers.correct; c++)
            {
                guessString +=      "<span class='rmmMarkerChar'><img src='/resources/images/puzzles/correct.png' /></span>";
            }
            for(let nc = guess.markers.correct; nc < 4; nc++)
            {
                guessString +=      "<span class='rmmMarkerChar'>&nbsp;</span>";
            }

            guessString +=      "</div>" +
                                "<div class='rmmMarkerRow'>";

            for(let w = 0; w < guess.markers.wrong; w++)
            {
                guessString +=      "<span class='rmmMarkerChar'><img src='/resources/images/puzzles/wrong.png' /></span>";
            }
            for(let nw = guess.markers.wrong; nw < 4; nw++)
            {
                guessString +=      "<span class='rmmMarkerChar'>&nbsp;</span>";
            }

            guessString +=      "</div>" +
                            "</div>";
        }, this);

        guessString +=      "<div class='rmmGapRow'>" +
                            "</div>" +
                            "<div class='rmmGuessRow'>" +
                                "<div class='rmmGuessChar rmmAnswerChar' data-ball='null' onclick='cycleBalls(this)'></div>" +
                                "<div class='rmmGuessChar rmmAnswerChar' data-ball='null' onclick='cycleBalls(this)'></div>" +
                                "<div class='rmmGuessChar rmmAnswerChar' data-ball='null' onclick='cycleBalls(this)'></div>" +
                                "<div class='rmmGuessChar rmmAnswerChar' data-ball='null' onclick='cycleBalls(this)'></div>" +
                            "</div>";
        
        $("#rmmBox").html(guessString);
    }
}

function cycleBalls(target)
{
    let newBall = "null";

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