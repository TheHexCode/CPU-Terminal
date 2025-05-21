<?php

class Terminal
{
    private $main;
    private $termID;
    private $termDisplayName;
    private $termAccessCost;
    private $termState;
    private $stateData;
    private $entries;
    private $initialEntries;
    private $logEntries;
    private $iconSchema;

    function __construct($termResponse)
    {
        if($termResponse === false)
        {
            $this->main = " class='hidden'";
        }
        else
        {
            $this->main = "";
            $this->termID = $termResponse["id"];
            $this->termDisplayName = $termResponse["displayName"];
            $this->termAccessCost = $termResponse["access"];
            $this->termState = $termResponse["state"];
            $this->stateData = $termResponse["stateData"];
            $this->entries = $termResponse["entries"];
            $this->initialEntries = array();
            $this->logEntries = $termResponse["logEntries"];

            $iconFilepath = "resources/schemas/icons.json";
            $iconFile = fopen($iconFilepath,"r");
            $this->iconSchema = json_decode(fread($iconFile,filesize($iconFilepath)),true);
            fclose($iconFile);
        }
    }

    public function getMain()
    {
        return $this->main;
    }

    public function getTerminalName()
    {
        return $this->termDisplayName;
    }

    public function getTerminalAccessCost()
    {
        return $this->termAccessCost ?? 0;
    }

    public function getAccessGem($gem)
    {
        if($gem <= $this->termAccessCost)
        {
            return "negative";
        }
        else
        {
            return "clear";
        }
    }

    public function isIconActive($icon)
    {
        return count(array_filter($this->entries,function ($entry) use ($icon)
        {
            return $entry["icon"] === $icon;
        })) > 0;
    }

    public function setupSubTabButtons()
    {
        if($this->main === "")
        {
            $activeIcons = array_unique(array_column($this->entries,"icon"));

            $subTabs = [
                "inactive" => array(),
                "disabled" => array()
            ];

            foreach(array_keys($this->iconSchema) as $icon)
            {
                if(in_array($icon,$activeIcons,true))
                {
                    $subTabString = '<button id="' . $icon . 'SubTab" class="subTab inactive" onclick="openSubTab(this,\'' . $icon . 'Content\')">' . 
                                        '<img src="resources/images/subtabs/' . $icon . '.png" onerror="this.onerror=null;this.src=\'https://placehold.co/30\'"/>' .
                                    '</button>';

                    array_push($subTabs["inactive"],$subTabString);
                }
                else
                {
                    $subTabString = '<button id="' . $icon . 'SubTab" class="subTab disabled">' . 
                                        '<img src="resources/images/subtabs/' . $icon . '.png" onerror="this.onerror=null;this.src=\'https://placehold.co/30\'"/>' .
                                    '</button>';

                    array_push($subTabs["disabled"],$subTabString);
                }
            }

            return (implode($subTabs["inactive"]) . implode($subTabs["disabled"]));
        }
        else
        {
            return "";
        }
    }

    public function setupLogEntries()
    {
        $logArray = array();

        foreach($this->logEntries as $logEntry)
        {
            if($logEntry["state"] === "wiped")
            {
                $logEntryString =   '<li id="log' . $logEntry["id"] . '" class="logEntry" data-user="' . $logEntry["user_id"] . '">' .
                                        '<span class="logPerson">[ERROR:&nbsp;</span><span class="logName">ENTRY NOT FOUND]</span>' .
                                    '</li>';
            }
            else if($logEntry["state"] === "initial")
            {
                if($logEntry["reassignee"] !== null)
                {
                    $logHandle = $logEntry["reassignee"];
                }
                elseif($logEntry["mask"] !== null)
                {
                    $logHandle = $logEntry["mask"];
                }
                else
                {
                    $logHandle = $logEntry["charName"];
                }
    
                $logEntryString =   '<li id="log' . $logEntry["id"] . '" class="logEntry" data-user="' . $logEntry["user_id"] . '">' .
                                        '<span class="logPerson">User:&nbsp;</span><span class="logName">' . $logHandle . '</span>' .
                                        '<div class="logActions hidden">' .
                                            '<hr/>' .
                                            '<span class="reassAction buttonItem hidden">REASSIGN: <button class="reassButton" data-enabled="true" data-cost="2" data-id="' . $logEntry["id"] . '" onclick="takeAction(this)">2 Tags</button></span>' .
                                            '<span class="wipeAction buttonItem hidden">WIPE TRACKS: <button class="wipeButton" data-enabled="true" data-cost="1" data-id="' . $logEntry["id"] . '" onclick="takeAction(this)">1 Tag</button></span>' .
                                        '</div>' .
                                    '</li>';
            }

            array_push($logArray,$logEntryString);
        }
        
        return implode($logArray);
    }

    public function setupIconEntries($icon)
    {
        if($this->main === "")
        {
            $dbArray = array_filter($this->entries,function ($entry) use ($icon)
            {
                return $entry["icon"] === $icon;
            });

            array_multisort(array_column($dbArray,"path"),SORT_NATURAL,$dbArray);

            $iconGuide = $this->iconSchema[$icon];

            $returnArray = array();

            $inIce = array();
            $outIce = 0;

            foreach($dbArray as $entry)
            {
                $entryData = array(
                    "icon"   => $entry["icon"],
                    "id"     => $entry["id"],
                    "state"  => $entry["state"],
                    "access" => $entry["access"],
                    "modify" => $entry["modify"]
                );

                if($entry["icon"] === "utilities")
                {
                    $entryData["type"] = $entry["type"];
                }

                $unitCode = explode("-",$entry["path"]);
                $subClass = "";

                if(count($unitCode) > 1)
                {
                    $parentPath = implode("-",array_splice($unitCode, 0,count($unitCode)-1));
                    $parent = current(array_filter($this->entries,function ($entry) use ($icon, $parentPath)
                    {
                        return (($entry["icon"] === $icon) && ($entry["path"] === $parentPath));
                    }));

                    $subClass .= ($parent["state"] === "initial" ? " subIce" : "");

                    for($i = 1; $i < count($unitCode); $i++)
                    {
                        $unitCode[$i] = chr(intval($unitCode[$i])+65);
                    }
                }
                
                $unitCode = implode($unitCode);

                if($entry["type"] === "ice")
                {
                    array_push($inIce,$entry["path"]);

                    $subClass .= " ice";

                    $unit = "ICE " . $unitCode;

                    $accessInt = ($entry["state"] === "initial") ?
                                    'Break: <button class="breakButton" data-enabled="true" data-cost="0" data-id=' . $entry["id"] . ' onclick="takeAction(this)">0 Tags</button>' : 
                                    'Break: <button class="breakButton" data-enabled="false" disabled="" ">N/A</button>';

                    $modifyInt = ($entry["state"] === "initial") ?
                                    'Sleaze: <button class="sleazeButton" data-enabled="true" data-cost="' . $entry["modify"] . '" data-id=' . $entry["id"] . ' onclick="takeAction(this)">' . $entry["modify"] . ' Tag' . ((intval($entry["modify"]) === 1) ? '' : 's') . '</button>' :
                                    'Sleaze: <button class="sleazeButton" data-enabled="false" disabled="" ">N/A</button>';

                    $titleMask = $entry["title"];
                    $entryData["title"] = $entry["title"];

                    if($entry["state"] === "initial")
                    {
                        $contentsMask = '<span class="entryMasking">&nbsp;</span>';
                        $entryData["contents"] = null;
                    }
                    else
                    {
                        $contentsMask = '<span class="entrySecret">';

                        foreach(json_decode($entry["contents"]) as $entryContent)
                        {
                            $contentsMask .= "<span" . ($entry["state"] === "break" ? " class='backstroke' data-text='" . $entryContent . "'" : "") . ">" . $entryContent . "</span>";
                        }

                        $contentsMask .= '</span>';
                        
                        $entryData["contents"] = $entry["contents"];
                    }
                }
                else
                {
                    $stateGuide = $iconGuide["types"][$entry["type"]][$entry["state"]];

                    $outIce = count(array_filter($inIce,function($icePath) use($entry) {
                        return !preg_match('/(' . $icePath . ')/',$entry["path"]);
                    }));

                    $unit = $iconGuide["unit"] . " " . $unitCode;

                    $accessInt = ($stateGuide["access"]["enabled"]) ?
                                    'Access: <button class="accessButton" data-enabled="true" data-cost="' . $entry["access"] . '" data-id=' . $entry["id"] . ' onclick="takeAction(this)">' . $entry["access"] . ' Tag' . ((intval($entry["access"]) === 1) ? '' : 's') . '</button>' :
                                    'Access: <button class="accessButton" data-enabled="false" disabled="" ">N/A</button>';

                    $modifyInt = ($stateGuide["modify"]["enabled"]) ?
                                    'Modify: <button class="modifyButton" data-enabled="true" data-cost="' . $entry["modify"] . '" data-id=' . $entry["id"] . ' onclick="takeAction(this)">' . $entry["modify"] . ' Tag' . ((intval($entry["modify"]) === 1) ? '' : 's') . '</button>' :
                                    'Modify: <button class="modifyButton" data-enabled="false" disabled="" ">N/A</button>';

                    if(gettype($stateGuide["title"]) === "array")
                    {
                        switch($stateGuide["title"]["if"])
                        {
                            case("user"):
                                $stateGuide["title"] = $stateGuide["title"]["false"];
                                break;
                        }
                    }

                    if(gettype($stateGuide["contents"]) === "array")
                    {
                        switch($stateGuide["contents"]["if"])
                        {
                            case("user"):
                                $stateGuide["contents"] = $stateGuide["contents"]["false"];
                                break;
                        }
                    }
                    
                    
                    if($stateGuide["title"] === false)
                    {
                        $titleMask = '<span class="entryMasking">&nbsp;</span>';
                        $entryData["title"] = null;
                    }
                    elseif($stateGuide["title"] === true)
                    {
                        
                        $titleMask = '<span class="entrySecret">' . $entry["title"] . '</span>';
                        $entryData["title"] = $entry["title"];
                    }
                    else
                    {
                        $titleMask = '<span class="entrySecret">' . $stateGuide["title"] . '</span>';
                        $entryData["title"] = $stateGuide["title"];
                    }

                    if($stateGuide["contents"] === false)
                    {
                        $contentsMask = '<span class="entryMasking">&nbsp;</span>';
                        $entryData["contents"] = null;
                    }
                    elseif($stateGuide["contents"] === true)
                    {
                        if($entry["type"] === "trap")
                        {
                            if($entry["state"] === "initial")
                            {
                                $contentsMask = '<span class="entryMasking">&nbsp;</span>';
                                $entryData["contents"] = null;
                            }
                            else
                            {
                                $contentsMask = '<span class="entrySecret">';

                                foreach(json_decode($entry["contents"]) as $entryContent)
                                {
                                    $contentsMask .= "<span>" . $entryContent . "</span>";
                                }

                                $contentsMask .= '</span>';
                                
                                $entryData["contents"] = json_decode($entry["contents"]);
                            }
                        }
                        else
                        {
                            $contentsMask = '<span class="entrySecret">' . $entry["contents"] . '</span>';
                            $entryData["contents"] = $entry["contents"];
                        }
                    }
                    else
                    {
                        $contentsMask = '<span class="entrySecret">' . $stateGuide["contents"] . '</span>';
                        $entryData["contents"] = $stateGuide["contents"];
                    }
                }

                $entryString = "";

                for($i = 0; $i < $outIce; $i++)
                {
                    $entryString .= '</div>';
                    array_pop($inIce);
                }
                $outIce = 0;

                $prefixIntro = ">> ";

                if($entry["type"] === "alarm")
                {
                    $prefixIntro = "&#x23F0;&#x269F; ";
                }

                $entryString .= '<div id="' . $icon . '-' . $entry["path"] . '" class="entry' . $subClass . '">' .
                                    '<div class="entryTitleBar">' .
                                        '<span class="entryPrefix">' . $prefixIntro . $unit . ':\\</span>' .
                                        '<span class="entryMaskContainer">' .
                                            $titleMask .
                                        '</span>' .
                                    '</div>' .
                                    '<div class="entryContentsBar">' .
                                        '<span class="entryMaskContainer">' .
                                            $contentsMask .
                                        '</span>' .
                                    '</div>' .
                                    '<div class="entryIntContainer">' .
                                        '<div class="entryInterface accessInterface">' .
                                            $accessInt .
                                        '</div>' .
                                        '<div class="entryInterface modifyInterface">' .
                                            $modifyInt .
                                        '</div>' .
                                    '</div>' . 
                                    '<hr/>';

                if($entry["type"] !== "ice")
                {
                    $entryString .= '</div>';
                }

                array_push($returnArray, $entryString);
                array_push($this->initialEntries,$entryData);
            }

            $returnString = join("",$returnArray);
            for($i = 0; $i < count($inIce); $i++)
            {
                $returnString .= '</div>';
            }

            return $returnString;
        }
        else
        {
            return "";
        }
    }

    public function sendInitialEntries()
    {
        if($this->main === "")
        {
            $termInfo = array(
                "termID" => $this->termID,
                "termState" => $this->termState,
                "stateData" => $this->stateData
            );

            return "<script>var session = new Session(" . json_encode($termInfo) . ", " . json_encode($this->initialEntries) . ");</script>";
        }
        else
        {
            return "<script>$('#main').remove();</script>";
        }
    }
}