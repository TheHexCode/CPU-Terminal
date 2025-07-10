<?php

require('dbConnect.php');

$roleFuncQuery = "SELECT * FROM {$dbName}.sr_role_functions";
$roleFuncStatement = $pdo->prepare($roleFuncQuery);
$roleFuncStatement->execute();
$masterFuncArray = $roleFuncStatement->fetchAll(PDO::FETCH_ASSOC);

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

$choiceQuery = "SELECT * FROM {$dbName}.sr_choices";
$choiceStatement = $pdo->prepare($choiceQuery);
$choiceStatement->execute();
$choiceArray = $choiceStatement->fetchAll(PDO::FETCH_ASSOC);

$knowQuery = "SELECT * FROM {$dbName}.sr_knowledges";
$knowStatement = $pdo->prepare($knowQuery);
$knowStatement->execute();
$knowArray = $knowStatement->fetchAll(PDO::FETCH_ASSOC);

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

function getSpeciesRadios()
{

}

function getRoleSelect($roleArray)
{
    $optionString = "";

    foreach($roleArray as $role)
    {
        $optionString .= "<option" . ($role["discovered"] ? " " : " class='hidden' ") . "value='" . $role["id"] . "'" . ($role["id"] === 1 ? " selected" : "") . ">" . $role["name"] . "</option>";
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

function fillRoleSection($masterFuncArray, $roleArray, $pathArray, $sourceArray, $modArray, $funcArray, $keywordArray, $choiceArray, $knowArray)
{
    $returnString = "";

    foreach($roleArray as $role)
    {
        $returnString .= "<h3>" . strtoupper($role["name"]) . "</h3>";

        for($tier = 1; $tier <= 5; $tier++)
        {
            $filteredEntryIDs = array_unique(array_filter(array_map(function ($function) use ($role, $tier)
            {
                if(($function["role_id"] === $role["id"]) && ($function["tier"] === $tier))
                {
                    return $function["entry_id"];
                }
            }, $masterFuncArray)));

            if(count($filteredEntryIDs))
            {
                $returnString .= "<h4>TIER " . romanize($tier) . "</h4>";
            }

            foreach($filteredEntryIDs as $entryID)
            {
                $entryFunctions = array_filter($masterFuncArray, function($function) use ($entryID)
                {
                    return $function["entry_id"] === $entryID;
                });

                $functionNames = array_map(function($function) use ($sourceArray, $modArray, $funcArray, $keywordArray, $choiceArray, $knowArray)
                {
                    $source = $function["source_id"] ? array_filter($sourceArray, function($source) use ($function)
                    {
                        return $source["id"] === $function["source_id"];
                    })[0] : null;

                    $mod = $function["mod_id"] ? array_filter($modArray, function($mod) use ($function)
                    {
                        return $mod["id"] === $function["mod_id"];
                    })[0] : null;

                    $func = $function["func_id"] ? array_filter($funcArray, function($func) use ($function)
                    {
                        return $func["id"] === $function["func_id"];
                    })[0] : null;

                    if($function["keyword_id"] !== null)
                    {
                        if($function["keyword_choose"])
                        {
                            switch($function["keyword_type"])
                            {
                                case("misc"):
                                {
                                    $keyword = array_filter($choiceArray, function($choice) use ($function)
                                    {
                                        return $choice["cat_id"] === $function["keyword_id"];
                                    });
                                    break;
                                }
                                case("know"):
                                {
                                    switch($function["keyword"])
                                    {
                                        //1 = KNOW_ALL
                                        case(1):
                                        {
                                            break;
                                        }
                                        //2 = KNOW_CORP
                                        case(2):
                                        {
                                            break;
                                        }
                                        //3 = KNOW_FACT(ION)
                                        case(3):
                                        {
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        else
                        {
                            switch($function["keyword_type"])
                            {
                                case("keyword"):
                                {
                                    break;
                                }
                                case("misc"):
                                {
                                    break;
                                }
                                case("know"):
                                {
                                    break;
                                }
                            }
                        }
                    }
                    else
                    {
                        $keyword = null;
                    }

                    return ($function[""]);
                }, $entryFunctions);

                $returnString .=    "<div class='functionSelect'>" .
                                        "<input id='func" . $entryID . "' type='checkbox' data-entry='" . $entryID . "' onclick='' />" .
                                        "<label for='func" . $entryID . "'>" . "FUNCTION NAME" . "</label>" .
                                    "</div>";
            }
        }

        return $returnString;
    }
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
		        LEFT JOIN {$dbName}.item_effects ON item_effects.abbr = items_to_effects.effect_abbr";

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