<!DOCTYPE html>
<?php
    require('..\\resources\\scripts\\db\\dbConnect.php');
    require ("scripts\\adminTerm.php");

    $jobCode = htmlentities($_GET["jobCode"] ?? "", ENT_QUOTES, "UTF-8");
    $slug = htmlentities($_GET["slug"] ?? "", ENT_QUOTES, "UTF-8");

    $terminal = new adminTerminal($pdo, $jobCode, $slug);
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
                        <input type="text"><?php echo $terminal->getJobCode(); ?></input>
                    </div>
                    <div>
                        <label>TERMINAL CODE: </label>
                        <select>
                            <option><?php echo $terminal->getTerminalSlug(); ?></option>
                            <option>dorm</option>
                            <option>communist</option>
                        </select>
                    </div>
                    <hr/>
                    <div>
                        <label>TERMINAL DISPLAY NAME: </label>
                        <input type="text"><?php echo $terminal->getTermDisplayName(); ?></input>
                    </div>
                    <div>
                        <label>TERMINAL ACCESS COST: </label>
                        <input type="number" value="<?php echo $terminal->getTermAccessCost(); ?>" />
                    </div>
                </div>
                <div id="termControls">
                    <div class="safeZone">
                        <button>SAVE TERMINAL</button>
                    </div>
                    <div class="dangerZone">
                        <button>DELETE TERMINAL</button>
                    </div>
                </div>
            </div>
            <hr/>
            <div>
                <h2>ENTRY LIST:</h2>
                <div class="entryList" data-icon="files">
                    <h3>FILES:</h3>
                    <?php echo $terminal->getEntries("files"); ?>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList" data-icon="darkweb">
                    <h3>DARK WEB:</h3>
                    <?php echo $terminal->getEntries("darkweb"); ?>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList" data-icon="cameras">
                    <h3>CAMERAS:</h3>
                    <?php echo $terminal->getEntries("cameras"); ?>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList" data-icon="locks">
                    <h3>LOCKS:</h3>
                    <?php echo $terminal->getEntries("locks"); ?>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList" data-icon="defenses">
                    <h3>AUTOMATED DEFENSE SYSTEMS:</h3>
                    <?php echo $terminal->getEntries("defenses"); ?>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList" data-icon="utilities">
                    <h3>UTILITY SYSTEMS:</h3>
                    <?php echo $terminal->getEntries("utilities"); ?>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
            </div>
        </form>
    </body>
</html>