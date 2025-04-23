<?php

require('dbConnect.php');
//require('codeGen.php');

#$profile_query = $pdo->query("SELECT role_functions.id,role_id,roles.roleName AS roleName,tier,function_id,functions.functionName AS functionName,rank
#                            FROM cpu_term.role_functions
#                            INNER JOIN cpu_term.roles ON role_functions.role_id=roles.id
#                            INNER JOIN cpu_term.functions ON role_functions.function_id=functions.id");
#$profileResponse = $profile_query->fetchAll(PDO::FETCH_ASSOC);
$profileResponse = "Placeholder";

/*
echo generateCode($pdo) . "<br/>";

echo "333333: " . testCode($pdo,array(3,3,3,3,3,3)) . "<br/>"; // in $codeList
echo "222222: " . testCode($pdo,array(2,2,2,2,2,2)) . "<br/>"; // same number
echo "123456: " . testCode($pdo,array(1,2,3,4,5,6)) . "<br/>"; // increment
echo "765432: " . testCode($pdo,array(7,6,5,4,3,2)) . "<br/>"; // decrement
echo "890123: " . testCode($pdo,array(8,9,0,1,2,3)) . "<br/>"; // increment
echo "109876: " . testCode($pdo,array(1,0,9,8,7,6)) . "<br/>"; // decrement
echo "123123: " . testCode($pdo,array(1,2,3,1,2,3)) . "<br/>"; // repeated 3
echo "876876: " . testCode($pdo,array(8,7,6,8,7,6)) . "<br/>"; // repeated 3
echo "121212: " . testCode($pdo,array(1,2,1,2,1,2)) . "<br/>"; // repeated 2
echo "484848: " . testCode($pdo,array(4,8,4,8,4,8)) . "<br/>"; // repeated 2
echo "792297: " . testCode($pdo,array(7,9,2,2,9,7)) . "<br/>"; // palendrome
echo "123321: " . testCode($pdo,array(1,2,3,3,2,1)) . "<br/>"; // palendrome
echo "264172: " . testCode($pdo,array(2,6,4,1,7,2)) . "<br/>"; // Valid
echo "672899: " . testCode($pdo,array(6,7,2,8,9,9)) . "<br/>"; // Valid
*/

function fillRoleSelection($profileData)
{
    return "Old Function";

    /*
    $roleData = array_combine(array_column($profileData,"role_id"),array_column($profileData,"roleName"));
    asort($roleData);

    $selectString = "";

    foreach($roleData as $roleIndex => $roleName)
    {
        if($roleName !== "Standard")
        {
            $selectString .= "<option value='".$roleIndex."'>".$roleName."</option>";
        }
    }

    return $selectString;
    */
}

function fillProfileTab($tabName, $profileData)
{
    return "Old Function";

    /*
    if(strcasecmp($tabName,"STANDARD") === 0)
    {
        $tabHidden = false;
        $tabData = array_filter($profileData,function($function) {
            return (strcasecmp($function["roleName"],"Standard") === 0);
        });
    }
    else
    {
        $tabHidden = true;
        $tabData = array_filter($profileData,function($function) {
            return (strcasecmp($function["roleName"],"Standard") !== 0);
        });
    }

    $roleList = array_combine(array_column($tabData,"role_id"),array_column($tabData,"roleName"));

    $returnString = "";

    foreach($roleList as $roleIndex => $roleName)
    {
        $roleFunctions = array_filter($tabData,function($function) use ($roleIndex)
        {
            return (intval($function["role_id"]) === $roleIndex);
        });

        $romanTiers = array("1"=>"I","2"=>"II","3"=>"III","4"=>"IV","5"=>"V");

        $returnString .= "<section class='checkGroup" . ($tabHidden ? " hidden" : "") . "' data-role='" . $roleIndex . "'>";

        for($i = 1; $i <= 5; $i++)
        {
            $tierFunctions = array_filter($roleFunctions,function($function) use ($i)
            {
                return (intval($function["tier"]) === $i);
            });

            if(count($tierFunctions) > 0)
            {
                $returnString .= "<h2>TIER " . $romanTiers[$i] . "</h2>";

                foreach($tierFunctions as $function)
                {
                    $returnString .=    "<div class='check' data-role='" . $roleName . "'>" .
                                            "<input type='checkbox' id='check" . $function["id"] . "' form='statsForm'>&nbsp" .
                                            "<label for='check" . $function["id"] . "'>" . $function["functionName"] . (($function["rank"]) ? (" " . $romanTiers[intval($function["rank"])]) : "") . "</label>" .
                                        "</div>";
                }
            }
        }

        $returnString .= "</section>";
    }

    return $returnString;
    */
}