<?php

class adminTerminal
{
    private $pageTitle;
    private $jobCode;
    private $slug;
    private $takenSlugs;
    private $termID;
    private $displayName;
    private $termAccess;
    private $termState;
    private $stateData;
    private $entries;

    function __construct($pdo, $jobCode, $slug)
    {
        if($jobCode === "" || $slug === "")
        {
            $this->pageTitle = "CREATE";
            $this->termID = -1;
            $this->jobCode = "";
            $this->slug = null;
            $this->takenSlugs = array();
            $this->displayName = "";
            $this->termAccess = "";
            $this->entries = array();
            $this->termState = 'active';
            $this->stateData = null;
        }
        else
        {
            $this->pageTitle = "EDIT";
            $this->jobCode = $jobCode;
            $this->slug = $slug;
            $this->getTerminal($pdo);
        }
    }

    private function getTerminal($pdo)
    {
        $terminalQuery = "  SELECT * FROM cpu_term.terminals
                            WHERE   jobCode=:jobCode
                                AND slug=:slug";
        $terminalStatement = $pdo->prepare($terminalQuery);
        $terminalStatement->execute([':jobCode' => $this->jobCode, ':slug' => $this->slug]);
        $terminalInfo = $terminalStatement->fetch(PDO::FETCH_ASSOC);

        $this->termID = $terminalInfo["id"];
        $this->displayName = $terminalInfo["displayName"];
        $this->termAccess = $terminalInfo["access"];
        $this->termState = $terminalInfo["state"];
        $this->stateData = $terminalInfo["stateData"];

        $entryQuery = " SELECT icon, path, type, access, modify, title, contents, state
                        FROM cpu_term.entries
                        WHERE terminal_id=:termID";
        $entryStatement = $pdo->prepare($entryQuery);
        $entryStatement->execute([':termID' => $this->termID]);
        $this->entries = $entryStatement->fetchAll(PDO::FETCH_ASSOC);

        $slugQuery = "  SELECT slug
                        FROM cpu_term.terminals
                        WHERE jobCode=:jobCode";
        $slugStatement = $pdo->prepare($slugQuery);
        $slugStatement->execute([':jobCode' => $this->jobCode]);
        $this->takenSlugs = $slugStatement->fetchAll(PDO::FETCH_COLUMN);
    }

    function getPageTitle()
    {
        return $this->pageTitle;
    }

    function getJobCode()
    {
        return $this->jobCode;
    }

    function getTerminalSlug()
    {
        return $this->slug;
    }

    function getTermDisplayName()
    {
        return $this->displayName;
    }

    function getTermAccessCost()
    {
        return $this->termAccess;
    }

    function getAvailableSlugs()
    {
        $allSlugs = array(
            "communist",
            "dorm",
            "map",
            "slab",
            "squeeze"
        );

        $slugString = "<option>" . $this->slug . "</option>";

        foreach(array_diff($allSlugs,$this->takenSlugs) as $avaiSlug)
        {
            $slugString .= "<option>" . $avaiSlug . "</option>";
        }

        return $slugString;
    }

    function getEntries($icon)
    {
        $iconEntries = array_filter($this->entries, function($entry) use ($icon)
        {
            return $entry["icon"] === $icon;
        });

        $entryString = "";

        $iceLayers = array();

        foreach($iconEntries as $entry)
        {
            $iceStatus =    count($iceLayers) === 0 ?
                                null :
                                str_starts_with($entry["path"], $iceLayers[array_key_last($iceLayers)]);

            if($iceStatus === false) // ICE LAYER IS ENDING
            {
                do
                {
                    array_pop($iceLayers);

                    $entryString .= "</div>";
                } while((count($iceLayers) !== 0) && (str_starts_with($entry["path"], $iceLayers[array_key_last($iceLayers)]) === false));
            }

            $accessLabel = "ACCESS";
            $modifyLabel = "MODIFY";
            $contentsLabel = "CONTENTS";

            $entry["access"] = '"' . $entry["access"] . '"';
            $entry["title"] = '"' . $entry["title"] . '"';

            if($entry["type"] === "trap")
            {
                $contentsLabel = "EFFECTS";

                $entry["title"] = '"Trap!" disabled';
                $entry["contents"] = $this->getEntryEffects($entry["contents"]);
            }
            elseif($entry["type"] === "ice")
            {
                array_push($iceLayers, $entry["path"]);

                $accessLabel = "BREAK";
                $modifyLabel = "SLEAZE";
                $contentsLabel = "EFFECTS";

                $entry["access"] = '"0" disabled';
                $entry["contents"] = $this->getEntryEffects($entry["contents"]);
            }
            elseif(($entry["icon"] !== "files") && ($entry["icon"] !== "darkweb"))
            {
                $entry["contents"] = '"No Contents" disabled />';
            }
            else
            {
                $entry["contents"] = '"' . $entry["contents"] . '" />';
            }

            $entryString .= ($entry["type"] === "ice" ? '<div class="iceBox">' : "") .
                            '<div class="entry">' .
                                '<div class="entryControls">' .
                                    '<div class="upControls">' .
                                        '<button>&barwedge;</button>' .
                                        '<button>&wedge;</button>' .
                                    '</div>' .
                                    '<button class="delButton">&times;</button>' .
                                    '<div class="downControls">' .
                                        '<button>&vee;</button>' .
                                        '<button>&veebar;</button>' .
                                    '</div>' .
                                '</div>' .
                                '<div class="entryID">' .
                                    $entry["path"] .
                                '</div>' .
                                '<div class="entryGrid">' .
                                    '<div class="entryTypeRow">' .
                                        '<span class="entryTypeLabel">ENTRY TYPE:</span>' .
                                        '<select class="entryType">' .
                                            $this->getEntryTypes($entry["icon"], $entry["type"]) .
                                        '</select>' .
                                    '</div>' .
                                    '<div class="entryLabelRow">' .
                                        '<span class="entryLabel entryAccess">' . $accessLabel . ' COST</span>' .
                                        '<span class="entryLabel entryModify">' . $modifyLabel . ' COST</span>' .
                                        '<span class="entryLabel entryTitle">TITLE</span>' .
                                        '<span class="entryLabel entryContents">' . $contentsLabel . '</span>' .
                                    '</div>' .
                                    '<div class="entryInputRow">' .
                                        '<input class="entryAccess" type="number" value=' . $entry["access"] . ' />' .
                                        '<input class="entryModify" type="number" value="' . $entry["modify"] . '" />' .
                                        '<input class="entryTitle" type="text" value=' . $entry["title"] . ' />' .
                                        '<input class="entryContents" type="text" value=' . $entry["contents"] .
                                    '</div>' .
                                '</div>' .
                            '</div>';
        }

        for($i = 0; $i < count($iceLayers); $i++)
        {
            $entryString .= "</div>";
        }

        return $entryString;
    }

    private function getEntryTypes($icon, $type)
    {
        $typeArray = array(
            "files" => array(
                "ENTRY",
                "TRAP"
            ),
            "darkweb" => array(
                "ENTRY"
            ),
            "cameras" => array(
                "ENTRY"
            ),
            "locks" => array(
                "ENTRY"
            ),
            "defenses" => array(
                "ENTRY"
            ),
            "utilities" => array(
                "POWER",
                "ALARM"
            )
        );

        $typeListString = "";

        foreach($typeArray[$icon] as $entryType)
        {
            $typeListString .= "<option" . (strtoupper($type) === $entryType ? " selected" : "") . ">$entryType</option>";
        }

        $typeListString .= "<option" . (strtoupper($type) === "ICE" ? " selected" : "") . ">ICE</option>";

        return $typeListString;
    }

    private function getEntryEffects($contents)
    {
        $effects = json_decode($contents);

        $effectString = '"' . $effects[0] . '" /></div>';

        for($i = 1; $i < count($effects); $i++)
        {
            $effectCount = $i + 4;

            $effectString .=    '<div class="entryInputRow" data-row="' . $effectCount . '" style="grid-row: ' . $effectCount . '">' .
                                    '<input class="entryContents" type="text" value="' . $effects[$i] . '" />' .
                                    '<button class="delEffectButton" onclick="delEffect(' . $effectCount . ')">&minus;</button>' .
                                '</div>';
        }

        $effectMax = count($effects) + 4;

        $effectString .=    '<div class="entryInputRow" data-row="' . $effectMax . '" style="grid-row: ' . $effectMax . '">' .
                                '<button class="addEffectButton" onclick="addEffect(' . $effectMax . ')">&plus;</button>';

        return  $effectString;
    }

    function displayTerminal()
    {
        return "<script>var admTerm = new AdminTerminal(" . json_encode($this->entries) . ");</script>";
    }
}