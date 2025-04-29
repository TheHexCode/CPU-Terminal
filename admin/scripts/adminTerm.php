<?php

class adminTerminal
{
    private $pageTitle;
    private $jobCode;
    private $slug;
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

        echo var_dump($terminalInfo);

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

        echo var_dump($this->entries);
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

    function getEntries($icon)
    {
        $iconEntries = array_filter($this->entries, function($entry) use ($icon)
        {
            return $entry["icon"] === $icon;
        });

        $entryString = "";

        foreach($iconEntries as $entry)
        {
            $entryString .= '<div class="entry">'+
                                '<div class="entryControls">' +
                                    '<div class="upControls">' +
                                        '<button>&barwedge;</button>' +
                                        '<button>&wedge;</button>' +
                                    '</div>' +
                                    '<button class="delButton">&times;</button>' +
                                    '<div class="downControls">' +
                                        '<button>&vee;</button>' +
                                        '<button>&veebar;</button>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="entryID">' +
                                    tens(newID) +
                                '</div>' +
                                '<div class="entryGrid">' +
                                    '<div class="entryTypeRow">' +
                                        '<span class="entryTypeLabel">ENTRY TYPE:</span>' +
                                        '<select class="entryType">' +
                                            '<option>ENTRY</option>' +
                                            '<option>TRAP</option>' +
                                            '<option>ICE</option>' +
                                        '</select>' +
                                    '</div>' +
                                    '<div class="entryLabelRow">' +
                                        '<span class="entryLabel entryAccess">ACCESS COST</span>' +
                                        '<span class="entryLabel entryModify">MODIFY COST</span>' +
                                        '<span class="entryLabel entryTitle">TITLE</span>' +
                                        '<span class="entryLabel entryContents">CONTENTS</span>' +
                                    '</div>' +
                                    '<div class="entryInputRow">' +
                                        '<input class="entryAccess" type="number" value="0" />' +
                                        '<input class="entryModify" type="number" value="0" />' +
                                        '<input class="entryTitle" type="text" />' +
                                        '<input class="entryContents" type="text" />' +
                                    '</div>' +
                                '</div>' +
                            '</div>'
        }

        return var_dump($iconEntries);
    }
}