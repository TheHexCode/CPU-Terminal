var red = "rgb(187,0,0)";
var black = "rgb(10,10,10)";
var grey = "rgb(128,128,128)";
var amber = "rgb(255,147,0)";

var bbGrid;
var ctx;

var playRows = 8;
var playCols = 8;

var totalRows = playRows + 2;
var totalCols = playCols + 2;

var boxSize = 34; //px
var spacerSize = 5; //px

function drawGrid()
{
    bbGrid = $("#bbGrid")[0];
    ctx = bbGrid.getContext("2d");

    // 10 squares + 11 spacers
    // (10 * boxSize) + (11 * spacerSize)
    // (10 * 34 = 340) + (11 * 5 = 55) = 395, largest size <= 400
    let gridW = (totalCols * boxSize) + ((totalCols + 1) * spacerSize);
    let gridH = (totalRows * boxSize) + ((totalRows + 1) * spacerSize);

    $("#"+bbGrid.id).attr("height",gridH);
    $("#"+bbGrid.id).attr("width",gridW);

    ctx.fillStyle = grey;
    ctx.fillRect(0,0,gridW,gridH);

    for(let row = 0; row < totalRows; row++)
    {
        let boxY = row * boxSize;
        let spaceY = (row+1) * spacerSize;

        for(let col = 0; col < totalCols; col++)
        {
            let boxX = col * boxSize;
            let spaceX = (col+1) * spacerSize;

            if(((row === 0) || (row === (totalRows-1))) && ((col === 0) || (col === (totalCols-1))))
            {
                ctx.fillStyle = grey;
            }
            else if((row === 0) || (col === 0) || (row === (totalRows-1)) || (col === (totalCols-1)))
            {
                ctx.fillStyle = red;
            }
            else
            {
                ctx.fillStyle = black;
            }

            ctx.fillRect(boxX+spaceX,boxY+spaceY,boxSize,boxSize);
        }
    }

    /*
    bbGrid.addEventListener("pointermove", function(event)
    {
        console.log(getRCfromXY(event.offsetX, event.offsetY));
    });
    */
}

function getXYfromRC(row, col, rcType = "total")
{
    let xy;
    
    switch (rcType)
    {
        case("total"):
        {
            let boxY = row * boxSize;
            let spaceY = (row+1) * spacerSize;

            let boxX = col * boxSize;
            let spaceX = (col+1) * spacerSize;

            xy = {
                x: boxX+spaceX,
                y: boxY+spaceY
            };

            break;
        }
        case("playable"):
        {
            let boxY = (row+1) * boxSize;
            let spaceY = (row+2) * spacerSize;

            let boxX = (col+1) * boxSize;
            let spaceX = (col+2) * spacerSize;

            xy = {
                x: boxX+spaceX,
                y: boxY+spaceY
            };
            break;
        }
    }

    return xy;
}

function getRCfromXY(x, y)
{
    let rc = {
        row: null,
        col: null
    };

    let boxY = y % (spacerSize + boxSize);
    let boxX = x % (spacerSize + boxSize);

    if((boxX < spacerSize) || (boxY < spacerSize))
    {
        //Not inside a box
        return null;
    }
    else
    {
        rc = {
            row: Math.floor(y / (spacerSize + boxSize)),
            col: Math.floor(x / (spacerSize + boxSize))
        };

        return rc;
    }
}

function hideBalls()
{
    let ballCoords = [];

    while(ballCoords.length < 4)
    {
        let randX = Math.floor(Math.random() * playCols);
        let randY = Math.floor(Math.random() * playRows);

        let matches = ballCoords.find(function(coords) {
            return ((coords.col === randX) && (coords.row === randY));
        });

        if(matches === undefined)
        {
            ballCoords.push({col: randX, row: randY});
        }
    }

    ctx.fillStyle = amber;

    ballCoords.forEach(function(ball)
    {
        let ballXY = getXYfromRC(ball.row, ball.col, "playable");

        ctx.beginPath();
        ctx.arc((ballXY.x + (boxSize / 2)), (ballXY.y + (boxSize / 2)), (boxSize / 2) - 3, 0, 2*Math.PI);
        ctx.fill();
    });
}

function projectBeam(row, col)
{
    let beamXY = {
        x: ((spacerSize + boxSize) * col) + (boxSize / 2),
        y: ((spacerSize + boxSize) * row) + (boxSize / 2)
    }
    let beamDir;

    if(row === 0) // NORTH SHOOTING SOUTH
    {
        beamDir = "SOUTH";
    }
    else if(col === 0) // WEST SHOOTING EAST
    {
        beamDir = "EAST";
    }
    else if(row === (totalRows-1)) // SOUTH SHOOTING NORTH
    {
        beamDir = "NORTH";
    }
    else if(col === (totalCols-1)) // EAST SHOOTING WEST
    {
        beamDir = "WEST";
    }
}