<!DOCTYPE html>
<?php
    require('../resources/scripts/terminal/db/dbConnect.php');

    $jobCode = htmlentities($_GET["jobCode"] ?? "", ENT_QUOTES, "UTF-8");
    $slug = htmlentities($_GET["slug"] ?? "", ENT_QUOTES, "UTF-8");

    $iceQuery = "   SELECT ice_tiers.type, ice_tiers.tier, effect
                    FROM {$dbName}.ice_effects
                    INNER JOIN ice_tiers ON ice_tiers.id = ice_effects.tier_id
                    WHERE tier_id = ice_tiers.id";
    $iceStatement = $pdo->prepare($iceQuery);
    $iceStatement->execute();
    $iceResults = $iceStatement->fetchAll(PDO::FETCH_ASSOC);

    $iceArray = array();

    array_map(function($ice) use (&$iceArray) {
        if((!(array_key_exists($ice["type"], $iceArray))) || (!(array_key_exists($ice["tier"], $iceArray[$ice["type"]]))))
        {
            $iceArray[$ice["type"]][$ice["tier"]] = array($ice["effect"]);
        }
        else
        {
            array_push($iceArray[$ice["type"]][$ice["tier"]],$ice["effect"]);
        }
    }, $iceResults);

    $allSlugs = array(
        "communist",
        "dorm",
        "map",
        "slab",
        "squeeze"
    );

    if($jobCode === "" || $slug === "")
    {
        $pageTitle = "CREATE";
        $termID = -1;
        $jobCode = "";
        $slug = null;
        $slugString = "";
        foreach($allSlugs as $avaiSlug)
        {
            $slugString .= "<option>" . $avaiSlug . "</option>";
        }
        $displayName = "";
        $termAccess = "";
        $entries = array();
        $termState = 'active';
        $stateData = null;
    }
    else
    {
        $pageTitle = "EDIT";

        $terminalQuery = "  SELECT * FROM {$dbName}.sim_terminals
                            WHERE   jobCode=:jobCode
                                AND slug=:slug";
        $terminalStatement = $pdo->prepare($terminalQuery);
        $terminalStatement->execute([':jobCode' => $jobCode, ':slug' => $slug]);
        $terminalInfo = $terminalStatement->fetch(PDO::FETCH_ASSOC);

        $termID = $terminalInfo["id"];
        $displayName = $terminalInfo["displayName"];
        $termAccess = $terminalInfo["access"];
        $termState = $terminalInfo["state"];
        $stateData = $terminalInfo["stateData"];

        $entryQuery = " SELECT icon, path, type, access, modify, title, contents, state
                        FROM {$dbName}.sim_entries
                        WHERE terminal_id=:termID";
        $entryStatement = $pdo->prepare($entryQuery);
        $entryStatement->execute([':termID' => $termID]);
        $entries = $entryStatement->fetchAll(PDO::FETCH_ASSOC);

        $puzzleQuery = "SELECT * FROM {$dbName}.sim_puzzles
                        WHERE terminal_id=:termID";
        $puzzleStatement = $pdo->prepare($puzzleQuery);
        $puzzleStatement->execute([':termID' => $termID]);
        $puzzles = $puzzleStatement->fetchAll(PDO::FETCH_ASSOC);

        $knowQuery = "  SELECT id, name
                        FROM {$dbName}.sr_knowledges";
        $knowStatement = $pdo->prepare($knowQuery);
        $knowStatement->execute();
        $knowledges = $knowStatement->fetchAll(PDO::FETCH_ASSOC);

        $slugQuery = "  SELECT slug
                        FROM {$dbName}.sim_terminals
                        WHERE jobCode=:jobCode";
        $slugStatement = $pdo->prepare($slugQuery);
        $slugStatement->execute([':jobCode' => $jobCode]);
        $takenSlugs = $slugStatement->fetchAll(PDO::FETCH_COLUMN);

        $slugString = "<option>" . $slug . "</option>";

        foreach(array_diff($allSlugs,$takenSlugs) as $avaiSlug)
        {
            $slugString .= "<option>" . $avaiSlug . "</option>";
        }
    }
?>
<html>
    <head>
        <meta charset="UTF-8">
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <link rel="stylesheet" type="text/css" href="../resources/styles/adminstyle.css"/>
        <script type="text/javascript" src="scripts/termedit.js"></script>
    </head>
    <body>
        <h1><?php echo $pageTitle ?> TERMINAL: </h1>
        <form>
            <div id="termHeader">
                <div>
                    <div>
                        <label>JOB CODE: </label>
                        <input id="jobCode" type="text" value="<?php echo $jobCode ?>" onchange="admTerm.setMasterChanges()" />
                    </div>
                    <div>
                        <label>TERMINAL CODE: </label>
                        <select id="termSlug" onselect="admTerm.setMasterChanges()">
                            <?php echo $slugString; ?>
                        </select>
                    </div>
                    <hr/>
                    <div>
                        <label>TERMINAL DISPLAY NAME: </label>
                        <input id="termDisplayName" type="text" value="<?php echo $displayName; ?>" onchange="admTerm.setMasterChanges()" />
                    </div>
                    <div>
                        <label>TERMINAL ACCESS COST: </label>
                        <input id="termAccess" type="number" value="<?php echo $termAccess; ?>" onchange="admTerm.setMasterChanges()" />
                    </div>
                </div>
                <div id="termControls">
                    <div class="safeZone">
                        <button onclick="saveTerminal(event)">SAVE TERMINAL</button>
                    </div>
                    <div class="dangerZone">
                        <button onclick="deleteTerminal(event)">DELETE TERMINAL</button>
                    </div>
                </div>
            </div>
            <hr/>
            <div>
                <h2>ENTRY LIST:</h2>
                <div>
                    <h3>FILES:</h3>
                    <div class="entryList" data-icon="files"></div>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div>
                    <h3>DARK WEB:</h3>
                    <div class="entryList" data-icon="darkweb"></div>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div>
                    <h3>CAMERAS:</h3>
                    <div class="entryList" data-icon="cameras"></div>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div>
                    <h3>LOCKS:</h3>
                    <div class="entryList" data-icon="locks"></div>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div>
                    <h3>AUTOMATIVE DEFENSIVE SYSTEMS:</h3>
                    <div class="entryList" data-icon="defenses"></div>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div>
                    <h3>UTILITY SYSTEMS:</h3>
                    <div class="entryList" data-icon="utilities"></div>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div>
                    <h3>PUZZLES:</h3>
                    <div class="entryList" data-icon="puzzles"></div>
                    <button class="addPuzzleButton" onclick="addPuzzle(event)">&plus;</button>
                </div>
            </div>
        </form>
        <?php echo "<script>var admTerm = new AdminTerminal(" . $termID . ", " . json_encode($entries) . ", " . json_encode($puzzles ?? array()) . ", " . json_encode($knowledges ?? array()) . ", " . json_encode($iceArray) . ");</script>"; ?>
    </body>
</html>