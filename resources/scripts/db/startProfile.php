<?php

require('dbConnect.php');

//** NEW FUNCTION STUFF **//

$functionQuery = "  SELECT roles.name AS role_name, tier, ml_functions.id, functions.name AS function_name, `rank`, functions.type, functions.hacking_cat FROM cpu_term.ml_functions
                    INNER JOIN cpu_term.functions ON function_id=functions.id
                    INNER JOIN cpu_term.roles ON role_id=roles.id
                    WHERE functions.hacking_cat IS NOT NULL";

$functionStatement = $pdo->prepare($functionQuery);
$functionStatement->execute();

$functionResponse = $functionStatement->fetchAll(PDO::FETCH_GROUP);

$stndString = "";
$roleString = "";
$funcString = "";

$roman = array(null,"I","II","III","IV","V");

foreach($functionResponse as $role => $functions)
{
    $tieredArray = array(null,array(),array(),array(),array(),array());

    foreach($functions as $function)
    {
        array_push($tieredArray[$function["tier"]],$function);
    }

    //echo "<script>console.log(" . json_encode($tieredArray) . ");</script>";

    if($role === "Standard")
    {
        $stndString .= "<section class='checkGroup'>";

        foreach($tieredArray as $tier => $functions)
        {
            if($functions !== null)
            {
                if(count($functions) > 0)
                {
                    $stndString .= "<h2>TIER " . $roman[$tier] . "</h2>";

                    foreach($functions as $function)
                    {
                        $stndString .= '<div class="check">' .
                                            '<input type="checkbox" id="stnd_' . $function["id"] . '" form="statsForm">' .
                                            '<label for="stnd_' . $function["id"] . '">' . $function["function_name"] . ($function["type"] === "ranked" ? ' ' . $roman[$function["rank"]] : '') .'</label>' .
                                        '</div>';
                    }
                }
            }
        }

        $stndString .= "</section>";
    }
    else
    {
        $roleString .= "<option value='" . $role . "'>" . $role . "</option>";

        $funcString .= "<section class='checkGroup hidden' data-role='" . $role . "'>";

        foreach($tieredArray as $tier => $functions)
        {
            if($functions !== null)
            {
                if(count($functions) > 0)
                {
                    $funcString .= "<h2>TIER " . $roman[$tier] . "</h2>";

                    foreach($functions as $function)
                    {
                        $funcString .= '<div class="check">' .
                                            '<input type="checkbox" id="!role!_' . $function["id"] . '" data-id="' . $function["id"] . '" form="statsForm">' .
                                            '<label for="!role!_' . $function["id"] . '">' . $function["function_name"] . ($function["type"] === "ranked" ? ' ' . $roman[$function["rank"]] : '') .'</label>' .
                                        '</div>';
                    }
                }
            }
        }

        $funcString .= "</section>";
    }
}

function getRoleSelect()
{
    global $roleString;

    return $roleString;
}

function getFunctionTab($tabName)
{
    global $stndString;
    global $funcString;

    if($tabName === "STANDARD")
    {
        return $stndString;
    }
    elseif($tabName === "PRIMARY")
    {
        return str_replace("!role!","pri",$funcString);
    }
    elseif($tabName === "SECONDARY")
    {
        return str_replace("!role!","sec",$funcString);
    }
}

//** END NEW FUNCTION STUFF **//


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

$itemQuery = "  SELECT id,name,tier,type,radio
                FROM cpu_term.items
                WHERE enabled=1";

$itemStatement = $pdo->prepare($itemQuery);
$itemStatement->execute();

$itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

foreach($itemResponse as $item)
{
    $itemPush = array(
        "id" => $item["id"],
        "name" => $item["name"] . ($item["tier"] !== null ? " [T" . $item["tier"] . "]" : ""),
        "radio" => ($item["radio"] !== null ? "radio-" . $item["radio"] : null)
    );

    array_push($itemArray[$item["type"]]["items"],$itemPush);
}

$itemString = "";

foreach($itemArray as $itemCat)
{
    $itemString .=  "<section class='itemSection'>" .
                        "<h2>" . $itemCat["title"] . "</h2>";

    foreach($itemCat["items"] as $item)
    {
        $itemString .=  "<div class='itemSelect " . ($item["radio"] !== null ? "radio" : "check") . "'>" .
                            "<input type='" . ($item["radio"] !== null ? "radio" : "checkbox") . "' id='item_" . $item["id"] . "' " . ($item["radio"] !== null ? "name='" . $item["radio"] . "' " : "") . "data-id='" . $item["id"] . "' form='itemForm' onclick='toggleRadio(this)'>" .
                            "<label for='item_" . $item["id"] . "'>" . $item["name"] . "</label>" .
                        "</div>";
    }

    $itemString .= "</section>";
}

function getItemsTab()
{
    global $itemString;

    return $itemString;
}