<!DOCTYPE html>
<?php
    require ("scripts\\adminTerm.php");
    $terminal = new adminTerminal($_GET["slug"] ?? null);
?>
<html>
    <head>
        <meta charset="UTF-8">
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <link rel="stylesheet" type="text/css" href="../resources/styles/adminstyle.css"/>
        <script type="text/javascript" src="scripts/termedit.js"></script>
    </head>
    <body>
        <h1><?php echo $terminal->pageTitle();?> TERMINAL: </h1>
        <form>
            <div>
                <label>JOB CODE: </label>
                <input type="text"></input>
            </div>
            <div>
                <label>TERMINAL CODE: </label>
                <select>
                    <option>dorm</option>
                    <option>communist</option>
                </select>
            </div>
            <hr/>
            <div>
                <label>TERMINAL DISPLAY NAME: </label>
                <input type="text"></input>
            </div>
            <div>
                <label>TERMINAL ACCESS COST: </label>
                <input type="number" value="0" />
            </div>
            <hr/>
            <div>
                <h2>ENTRY LIST:</h2>
                <div class="entryList">
                    <h3>FILES:</h3>
                    <div class="entry">
                        <div class="entryControls">
                            <div class="upControls">
                                <button>&barwedge;</button>
                                <button>&wedge;</button>
                            </div>
                            <button class="delButton">&times;</button>
                            <div class="downControls">
                                <button>&vee;</button>
                                <button>&veebar;</button>
                            </div>
                        </div>
                        <div class="entryID">
                            01
                        </div>
                        <div class="entryGrid">
                            <div class="entryTypeRow">
                                <span class="entryTypeLabel">ENTRY TYPE:</span>
                                <select class="entryType">
                                    <option>ENTRY</option>
                                    <option>TRAP</option>
                                    <option>ICE</option>
                                </select>
                            </div>
                            <div class="entryLabelRow">
                                <span class="entryLabel entryAccess">ACCESS COST</span>
                                <span class="entryLabel entryModify">MODIFY COST</span>
                                <span class="entryLabel entryTitle">TITLE</span>
                                <span class="entryLabel entryContents">CONTENTS</span>
                            </div>
                            <div class="entryInputRow">
                                <input class="entryAccess" type="number" value="0" />
                                <input class="entryModify" type="number" value="0" />
                                <input class="entryTitle" type="text" />
                                <input class="entryContents" type="text" />
                            </div>
                        </div>
                    </div>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList">
                    <h3>DARK WEB:</h3>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList">
                    <h3>CAMERAS:</h3>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList">
                    <h3>LOCKS:</h3>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList">
                    <h3>AUTOMATED DEFENSE SYSTEMS:</h3>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
                <div class="entryList">
                    <h3>UTILITY SYSTEMS:</h3>
                    <button class="addEntryButton" onclick="addEntry(event)">&plus;</button>
                </div>
            </div>
        </form>
    </body>
</html>