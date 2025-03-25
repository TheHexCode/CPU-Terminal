<?php

class Terminal
{
    private $termID;
    private $termDisplayName;
    private $termAccessCost;
    private $termState;
    private $entries;
    private $initialEntries;
    private $logEntries;
    private $iconSchema;

    function __construct($termResponse)
    {
        $this->termID = $termResponse["id"];
        $this->termDisplayName = $termResponse["displayName"];
        $this->termAccessCost = $termResponse["access"];
        $this->termState = $termResponse["state"];
        $this->entries = $termResponse["entries"];
        $this->initialEntries = array();
        $this->logEntries = $termResponse["logEntries"];

        $iconFilepath = "resources/schemas/icons.json";
        $iconFile = fopen($iconFilepath,"r");
        $this->iconSchema = json_decode(fread($iconFile,filesize($iconFilepath)),true);
        fclose($iconFile);
    }

    public function getTerminalName()
    {
        return $this->termDisplayName;
    }

    public function getTerminalAccessCost()
    {
        return $this->termAccessCost;
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

    public function setupLogEntries()
    {
        $logArray = array();

        foreach($this->logEntries as $logEntry)
        {
            if($logEntry["state"] === "wiped")
            {
                $logEntryString =   '<li id="log' . $logEntry["id"] . '" class="logEntry">' .
                                        'ERROR: LOG ENTRY NOT FOUND' .
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
                    $logHandle = $logEntry["trueName"];
                }
    
                $logEntryString =   '<li id="log' . $logEntry["id"] . '" class="logEntry">' .
                                        '<span class="logPerson">User:&nbsp;</span><span class="logName">' . $logHandle . '</span>' .
                                        '<div class="logActions hidden">' .
                                            '<hr/>' .
                                            '<span class="hidden">REASSIGN: <button class="reassButton" data-enabled="true" data-cost="2" onclick="logAction(' . $logEntry["id"] . ',\'reassign\')">2 Tags</button></span>' .
                                            '<span class="hidden">WIPE TRACKS: <button class="wipeButton" data-enabled="true" data-cost="1" onclick="logAction(' . $logEntry["id"] . ',\'wipe\')">1 Tag</button></span>' .
                                        '</div>' .
                                    '</li>';
            }

            array_push($logArray,$logEntryString);
        }
        
        return implode($logArray);
    }

    public function setupIconEntries($icon)
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
                "id"     => $entry["id"],
                "state"  => $entry["state"],
                "access" => $entry["access"],
                "modify" => $entry["modify"]
            );

            $unitCode = explode("-",$entry["path"]);
            $subClass = "";

            if(count($unitCode) > 1)
            {
                //$newEntry["subIce"] = implode("-",array_slice($unitCode,0,count($unitCode)-1));
                $subClass .= " subIce";

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
                                'Unwrap: <button class="accessButton" data-enabled="true" data-cost="0" data-id=' . $entry["id"] . ' onclick="iceAction(this)">0 Tags</button>' : 
                                'Unwrap: <button class="accessButton" data-enabled="false" disabled="" ">N/A</button>';

                $modifyInt = ($entry["state"] === "initial") ?
					            'Break: <button class="modifyButton" data-enabled="true" data-cost="' . $entry["modify"] . '" data-id=' . $entry["id"] . ' onclick="iceAction(this)">' . $entry["modify"] . ' Tag' . ((intval($entry["modify"]) === 1) ? '' : 's') . '</button>' :
                                'Break: <button class="modifyButton" data-enabled="false" disabled="" ">N/A</button>';

                $titleMask = $entry["title"];
                $entryData["title"] = $entry["title"];

                $contentsMask = ($entry["state"] === "initial") ?
                                    '<span class="entryMasking">&nbsp;</span>' :
							  	    '<span class="entrySecret">' . $entry["contents"] . '</span>';

                $entryData["contents"] = ($entry["state"] === "initial") ? null : $entry["contents"];
            }
            else
            {
                $stateGuide = $iconGuide["types"][$entry["type"]][$entry["state"]];

                $outIce = count(array_filter($inIce,function($icePath) use($entry) {
                    return !preg_match('/(' . $icePath . ')/',$entry["path"]);
                }));

                $unit = $iconGuide["unit"] . " " . $unitCode;

                $accessInt = ($stateGuide["access"]["enabled"]) ?
                                'Access: <button class="accessButton" data-enabled="true" data-cost="' . $entry["access"] . '" data-id=' . $entry["id"] . ' onclick="entryAction(this)">' . $entry["access"] . ' Tag' . ((intval($entry["access"]) === 1) ? '' : 's') . '</button>' :
                                'Access: <button class="accessButton" data-enabled="false" disabled="" ">N/A</button>';

                $modifyInt = ($stateGuide["modify"]["enabled"]) ?
                                'Modify: <button class="modifyButton" data-enabled="true" data-cost="' . $entry["modify"] . '" data-id=' . $entry["id"] . ' onclick="entryAction(this)">' . $entry["modify"] . ' Tag' . ((intval($entry["modify"]) === 1) ? '' : 's') . '</button>' :
                                'Modify: <button class="modifyButton" data-enabled="false" disabled="" ">N/A</button>';

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
                    $contentsMask = '<span class="entrySecret">' . $entry["contents"] . '</span>';
                    $entryData["contents"] = $entry["contents"];
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

            $entryString .= '<div id="' . $icon . '-' . $entry["path"] . '" class="entry' . $subClass . '">' .
								'<div class="entryTitleBar">' .
									'<span class="entryPrefix">>> ' . $unit . ':\\</span>' .
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

    public function sendInitialEntries()
    {
        return "<script>var session = new Session(" . json_encode($this->initialEntries) . ");</script>";
    }
}