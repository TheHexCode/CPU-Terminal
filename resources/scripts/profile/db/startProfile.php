<?php
require('dbConnect.php');

$roleQuery = "SELECT * FROM {$dbName}.sr_roles";
$roleStatement = $pdo->prepare($roleQuery);
$roleStatement->execute();
$roleArray = $roleStatement->fetchAll(PDO::FETCH_ASSOC);

$pathQuery = "SELECT * FROM {$dbName}.sr_paths";
$pathStatement = $pdo->prepare($pathQuery);
$pathStatement->execute();
$pathArray = $pathStatement->fetchAll(PDO::FETCH_ASSOC);

$sourceQuery = "SELECT * FROM {$dbName}.sr_sources";
$sourceStatement = $pdo->prepare($sourceQuery);
$sourceStatement->execute();
$sourceArray = $sourceStatement->fetchAll(PDO::FETCH_ASSOC);

$modQuery = "SELECT * FROM {$dbName}.sr_mods";
$modStatement = $pdo->prepare($modQuery);
$modStatement->execute();
$modArray = $modStatement->fetchAll(PDO::FETCH_ASSOC);

$funcQuery = "SELECT * FROM {$dbName}.sr_functions";
$funcStatement = $pdo->prepare($funcQuery);
$funcStatement->execute();
$funcArray = $funcStatement->fetchAll(PDO::FETCH_ASSOC);

$kwQuery = "SELECT * FROM {$dbName}.sr_keywords";
$kwStatement = $pdo->prepare($kwQuery);
$kwStatement->execute();
$keywordArray = $kwStatement->fetchAll(PDO::FETCH_ASSOC);

$profQuery = "SELECT * FROM {$dbName}.sr_proficiencies";
$profStatement = $pdo->prepare($profQuery);
$profStatement->execute();
$profArray = $profStatement->fetchAll(PDO::FETCH_ASSOC);

$profChoiceQuery = "SELECT * FROM {$dbName}.sr_prof_choices";
$profChoiceStatement = $pdo->prepare($profChoiceQuery);
$profChoiceStatement->execute();
$profChoiceArray = $profChoiceStatement->fetchAll(PDO::FETCH_ASSOC);

$knowQuery = "SELECT * FROM {$dbName}.sr_knowledges";
$knowStatement = $pdo->prepare($knowQuery);
$knowStatement->execute();
$knowArray = $knowStatement->fetchAll(PDO::FETCH_ASSOC);

$entryQuery = "SELECT * FROM {$dbName}.sr_entries";
$entryStatement = $pdo->prepare($entryQuery);
$entryStatement->execute();
$entryArray = $entryStatement->fetchAll(PDO::FETCH_ASSOC);

$entryFuncQuery = "SELECT * FROM {$dbName}.sr_entry_functions";
$entryFuncStatement = $pdo->prepare($entryFuncQuery);
$entryFuncStatement->execute();
$entryFuncArray = $entryFuncStatement->fetchAll(PDO::FETCH_ASSOC);

######################################################################

function romanize($num)
{
    $roman = "";

	$numeralMap = array(
		 "M" => 1000,
		"CM" => 900,
		 "D" => 500,
		"CD" => 400,
		 "C" => 100,
		"XC" => 90,
		 "L" => 50,
		"XL" => 40,
		 "X" => 10,
		"IX" => 9,
		 "V" => 5,
		"IV" => 4,
		 "I" => 1
    );

    $numerals = array_keys($numeralMap);

	foreach($numerals as $numeral)
	{
		while ($num >= $numeralMap[$numeral])
		{
			$roman .= $numeral;
			$num -= $numeralMap[$numeral];
		}
	}

	return $roman;
}

function getOriginRadios($roleArray)
{
    $origins = array_filter($roleArray, function($role) {
        return $role["origin"];
    });

    $originString = "<div id='originGroup'>";

    foreach($origins as $origin)
    {
        $originString .=    "<div class='originOption" . ($origin["discovered"] ? "" : " hidden") . "'>" .
                                "<input type='radio' id='origin" . $origin["id"] . "' name='origins' value='" . $origin["id"] . "'" . ($origin["id"] === 1 ? " checked" : "") . " onclick='changeOrigin(this)'/>" .
                                "<label for='origin" . $origin["id"] . "'>" . $origin["name"] . "</label>" .
                            "</div>";
    }

    $originString .= "</div>";

    return $originString;
}

function getRoleSelect($roleArray)
{
    $optionString = "";

    foreach($roleArray as $role)
    {
        $optionString .= "<option" . (!($role["discovered"]) || (($role["id"] !== 1) && ($role["origin"])) ? " class='hidden' " : " ") . "value='" . $role["id"] . "'" . ($role["id"] === 1 ? " selected" : "") . ">" . $role["name"] . "</option>";
    }

    return $optionString;
}

function getPathSelect($pathArray)
{
    $optionString = "";

    foreach($pathArray as $path)
    {
        $optionString .= "<option class='hidden' value='" . $path["id"] . "' data-role='" . $path["role_id"] . "'>" . $path["name"] . "</option>";
    }

    return $optionString;
}

function fillRoleSection($roleArray, $pathArray, $sourceArray, $modArray, $funcArray, $keywordArray, $profArray, $profChoiceArray, $knowArray, $entryArray, $entryFuncArray)
{
    $returnString = "";

    foreach($roleArray as $role)
    {
        $paths = array_values(array_filter($pathArray,function($path) use ($role)
        {
            return $path["role_id"] === $role["id"];
        }));

        $pathIndex = -1;

        $returnString .=    "<div class='roleBox". ($role["id"] === 1 ? "" : " hidden") ."' data-role='" . $role["id"] . "'>" .
                                "<h1>" . strtoupper($role["name"]) . "</h1>";

        while($pathIndex < count($paths))
        {
            $path = $paths[$pathIndex] ?? null;

            if($path)
            {
                $returnString .=    "<div class='pathBox hidden' data-path='" . $path["id"] . "'>" . 
                                        "<h1>" . strtoupper($path["name"]) . "</h1>";
            }                                    

            for($tier = 1; $tier <= 5; $tier++)
            {
                $filteredEntries = array_filter($entryArray,function ($entry) use ($role, $tier, $path)
                {
                        return (($entry["role_id"] === $role["id"]) && ($entry["tier"] === $tier) && ($entry["path_id"] === ($path["id"] ?? null)));
                });

                if(count($filteredEntries))
                {
                    $returnString .= "<h2>TIER " . romanize($tier) . "</h2>";
                }

                foreach($filteredEntries as $entry)
                {
                    $entryFunctions = array_filter($entryFuncArray, function($function) use ($entry)
                    {
                        return $function["entry_id"] === $entry["id"];
                    });

                    $functionNames = array_map(function($function) use ($modArray, $sourceArray, $funcArray, $keywordArray, $profArray, $profChoiceArray, $knowArray)
                    {
                        $mod = $function["mod_id"] ? array_values(array_filter($modArray, function($mod) use ($function)
                        {
                            return $mod["id"] === $function["mod_id"];
                        }))[0] : null;

                        $source = $function["source_id"] ? array_values(array_filter($sourceArray, function($source) use ($function)
                        {
                            return $source["id"] === $function["source_id"];
                        }))[0] : null;

                        $func = $function["func_id"] ? array_values(array_filter($funcArray, function($func) use ($function)
                        {
                            return $func["id"] === $function["func_id"];
                        }))[0] : null;

                        if($function["keyword_id"] !== null)
                        {
                            if($function["keyword_choose"]) // CHOICE
                            {
                                switch($function["keyword_type"])
                                {
                                    case("proficiency"):
                                    {
                                        $profChoices = array_filter($profChoiceArray, function($prof) use ($function)
                                        {
                                            return $prof["cat_id"] === $function["keyword_id"];
                                        });

                                        $keyword = array();
                                        $undisc = array();

                                        foreach($profChoices as $profChoice)
                                        {
                                            $foundProf = array_values(array_filter($profArray,function($prof) use ($profChoice)
                                            {
                                                return $prof["id"] === $profChoice["prof_id"];
                                            }))[0];

                                            array_push($keyword, $foundProf);
                                        }
                                        break;
                                    }
                                    case("knowledge"):
                                    {
                                        switch($function["keyword_id"])
                                        {
                                            //1 = KNOW_ALL
                                            case(1):
                                            {
                                                $keyword = array_filter($knowArray, function($knowledge)
                                                {
                                                    return $knowledge["discovered"];
                                                });
                                                $undisc = array_filter($knowArray, function($knowledge)
                                                {
                                                    return !$knowledge["discovered"];
                                                });
                                                break;
                                            }
                                            //2 = KNOW_FACT(ION)
                                            case(2):
                                            {
                                                $keyword = array_filter($knowArray, function($knowledge)
                                                {
                                                    return ($knowledge["discovered"]) && ($knowledge["is_fact"]);
                                                });
                                                $undisc = array_filter($knowArray, function($knowledge)
                                                {
                                                    return (!$knowledge["discovered"]) && ($knowledge["is_fact"]);
                                                });
                                                break;
                                            }
                                            //3 = KNOW_CORP
                                            case(3):
                                            {
                                                $keyword = array_filter($knowArray, function($knowledge)
                                                {
                                                    return ($knowledge["discovered"]) && ($knowledge["is_corp"]);
                                                });
                                                $undisc = array_filter($knowArray, function($knowledge)
                                                {
                                                    return (!$knowledge["discovered"]) && ($knowledge["is_corp"]);
                                                });
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            else // NO CHOICE
                            {
                                switch($function["keyword_type"])
                                {
                                    case("keyword"):
                                    {
                                        $targetArray = $keywordArray;
                                        break;
                                    }
                                    case("proficiency"):
                                    {
                                        $targetArray = $profArray;
                                        break;
                                    }
                                    case("knowledge"):
                                    {
                                        $targetArray = $knowArray;
                                        break;
                                    }
                                }

                                $keyword = array_values(array_filter($targetArray, function($kw) use ($function)
                                {
                                    return $kw["id"] === $function["keyword_id"];
                                }))[0]["name"];
                            }
                        }
                        else
                        {
                            $keyword = null;
                        }

                        switch($func["type"])
                        {
                            case("charges"):
                            {
                                $rank = ($function["rank"] ? " x" . $function["rank"] : "");
                                break;
                            }
                            case("ranked"):
                            {
                                $rank = ($function["rank"] ? " " . romanize($function["rank"]) : "");
                                break;
                            }
                            default: //unique
                            {
                                $rank = "";
                                break;
                            }
                        }

                        if($function["keyword_choose"])
                        {
                            $kwString = "<select class='funcChoice' data-id='" . $function["id"] . "' data-entry='" . $function["entry_id"] . "' data-kwType='" . $function["keyword_type"] . "' data-funcType='" . $func["type"] . "' onchange='chooseKeyword(this)' disabled>" .
                                            "<option class='funcOption' value='blank'>-Select-</option>";

                            foreach($keyword as $kw)
                            {
                                $kwString .= "<option class='funcOption' value='" . $kw["id"] . "'>" . $kw["name"] . "</option>";
                            }

                            foreach($undisc as $ud)
                            {
                                $kwString .= "<option class='funcOption hidden' value='" . $ud["id"] . "'>" . $ud["name"] . "</option>";
                            }

                            $kwString .= "</select>";
                        }
                        else if($function["keyword_id"] !== null) // && implicit !$function["keyword_choose"]
                        {
                            $kwString = " <span class='funcStatic' data-id='" . $function["id"] . "' data-entry='" . $function["entry_id"] . "' data-kwType='" . $function["keyword_type"] . "' data-kwID='" . $function["keyword_id"] . "'>(" . $keyword . ")</span>";
                        }
                        else
                        {
                            $kwString = null;
                        }

                        $functionName = "<span id='func" . $function["id"] . "' class='funcName' data-id='" . $function["id"] . "'>" .
                                            ($mod ? $mod["name"] . " " : "") . ($source ? $source["name"] . " " : "") . ($func["name"]) .($kwString ? $kwString : "") . $rank .
                                        "</span>";

                        return array("name" => $functionName, "keyword" => $keyword);
                    }, $entryFunctions);

                    $returnString .=    "<div class='entrySelect'>" .
                                            "<input id='entry" . $entry["id"] . "' type='checkbox' data-entry='" . $entry["id"] . "' onclick='selectEntry(this)' " . ($entry["free"] ? "checked disabled" : "") . "/>" .
                                            "<label for='entry" . $entry["id"] . "'>" . implode(" &<br/>", array_column($functionNames,"name")) . "</label>" .
                                        "</div>";
                }
            }

            if($path)
            {
                $returnString .= "</div>";
            }

            $pathIndex++;
        }
        
        $returnString .= "</div>";
    }
    
    return $returnString;
}

######################################################################

$itemArray = array(
    "deck" => array(
        "title" => "CYBERDECKS",
        "items" => array()
    ),
    "arms" => array(
        "title" => "WEAPONS/SHIELDS",
        "items" => array()
    ),
    "cust" => array(
        "title" => "CUSTOMIZATIONS",
        "items" => array()
    ),
    "util" => array(
        "title" => "UTILITY ITEMS",
        "items" => array()
    ),
    "impl" => array(
        "title" => "IMPLANTS",
        "items" => array()
    ),
    "cons" => array(
        "title" => "CONSUMABLES",
        "items" => array()
    )
);

$itemQuery = "  SELECT DISTINCT items.abbr,name,tier,category,radio,
                    CASE
                        WHEN item_effects.per_type = 'item'
                        THEN item_effects.charges
                        ELSE NULL
                    END AS max_charges
                FROM {$dbName}.items
                LEFT JOIN {$dbName}.items_to_effects ON items_to_effects.item_abbr = items.abbr
		        LEFT JOIN {$dbName}.item_effects ON item_effects.abbr = items_to_effects.effect_abbr
                WHERE enabled = 1";

$itemStatement = $pdo->prepare($itemQuery);
$itemStatement->execute();

$itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

foreach($itemResponse as $item)
{
    $itemPush = array(
        "abbr" => $item["abbr"],
        "name" => $item["name"] . ($item["tier"] !== null ? " [T" . $item["tier"] . "]" : ""),
        "radio" => ($item["radio"] !== null ? "radio-" . $item["radio"] : null),
        "max_charges" => $item["max_charges"]
    );

    array_push($itemArray[$item["category"]]["items"],$itemPush);
}

$itemString = "";

foreach($itemArray as $itemCat)
{
    $itemString .=  "<section class='itemSection'>" .
                        "<h2>" . $itemCat["title"] . "</h2>";

    foreach($itemCat["items"] as $item)
    {
        $itemString .=  "<div class='itemSelect " . ($item["radio"] !== null ? "radio" : "check") . "'>" .
                            "<input type='" . ($item["radio"] !== null ? "radio" : "checkbox") . "' id='item_" . $item["abbr"] . "' " . ($item["radio"] !== null ? "name='" . $item["radio"] . "' " : "") . "data-abbr='" . $item["abbr"] . "' form='itemForm' onclick='toggleRadio(this)'>" .
                            "<label for='item_" . $item["abbr"] . "'>" . $item["name"] . "</label>";

        if($item["max_charges"] > 1)
        {
            $itemString .=  "<div class='itemCount' data-abbr='" . $item["abbr"] . "' data-charges='" . $item["max_charges"] . "'>" .
                                "<div class='itemCountHeader'>" .
                                    "<span>USES LEFT: <span class='countSum'>" . $item["max_charges"] . "</span>/" . $item["max_charges"] . "</span>" .
                                "</div>" .
                                "<div class='itemCountRow'>" .
                                    "<button onclick='changeItemCharges(\"" . $item["abbr"] . "\", -1)'><b>&lt;</b>&nbsp;&#x2501;</button>" . 
                                    "<span class='itemImgBox'>";
            
            for($i = 1; $i <= $item["max_charges"]; $i++)
            {
                $itemString .=          "<img src='resources/images/actions/itemopen.png' />";
            }
                                    
            $itemString .=          "</span>" .
                                    "<button onclick='changeItemCharges(\"" . $item["abbr"] . "\", 1)'>&#x271A;&nbsp;<b>&gt;</b></button>" .
                                "</div>" .
                            "</div>";
        }

        $itemString .= "</div>";
    }

    $itemString .= "</section>";
}

function getItemsTab()
{
    global $itemString;

    return $itemString;
}