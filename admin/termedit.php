<!DOCTYPE html>
<?php
    require('../resources/scripts/terminal/db/dbConnect.php');
    require ("scripts/adminTerm.php");

    $jobCode = htmlentities($_GET["jobCode"] ?? "", ENT_QUOTES, "UTF-8");
    $slug = htmlentities($_GET["slug"] ?? "", ENT_QUOTES, "UTF-8");

    $terminal = new adminTerminal($pdo, $dbName, $jobCode, $slug);
?>
<html>
    <head>
        <meta charset="UTF-8">
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <link rel="stylesheet" type="text/css" href="../resources/styles/adminstyle.css"/>
        <script type="text/javascript" src="scripts/termedit.js"></script>
    </head>
    <body>
        <h1><?php echo $terminal->getPageTitle(); ?> TERMINAL: </h1>
        <form>
            <div id="termHeader">
                <div>
                    <div>
                        <label>JOB CODE: </label>
                        <input id="jobCode" type="text" value="<?php echo $terminal->getJobCode(); ?>" onchange="admTerm.setMasterChanges()" />
                    </div>
                    <div>
                        <label>TERMINAL CODE: </label>
                        <select id="termSlug" onselect="admTerm.setMasterChanges()">
                            <?php echo $terminal->getAvailableSlugs(); ?>
                        </select>
                    </div>
                    <hr/>
                    <div>
                        <label>TERMINAL DISPLAY NAME: </label>
                        <input id="termDisplayName" type="text" value="<?php echo $terminal->getTermDisplayName(); ?>" onchange="admTerm.setMasterChanges()" />
                    </div>
                    <div>
                        <label>TERMINAL ACCESS COST: </label>
                        <input id="termAccess" type="number" value="<?php echo $terminal->getTermAccessCost(); ?>" onchange="admTerm.setMasterChanges()" />
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
        <?php echo $terminal->displayTerminal(); ?>
    </body>
</html>