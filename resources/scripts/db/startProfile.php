<?php

include('E:/Personal/Projects/CPU/dbConfig/dbConfig.php');

$pdo = new PDO('sqlsrv:Server='.DBHOST.',1433;Database='.DBNAME, DBUSER,DBPWD);

$profile_query = $pdo->query("SELECT role_functions.id,role_id,roles.name AS role_name,tier,function_id,functions.name AS function_name,rank
                            FROM CPU_Terminal.dbo.role_functions
                            INNER JOIN CPU_Terminal.dbo.roles ON role_functions.role_id=roles.id
                            INNER JOIN CPU_Terminal.dbo.functions ON role_functions.function_id=functions.id");
$profileResponse = $profile_query->fetchAll(PDO::FETCH_ASSOC);

function fillRoleSelection($profileData)
{
    $roleData = array_combine(array_column($profileData,"role_id"),array_column($profileData,"role_name"));
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
}

function fillProfileTab($tabName, $profileData)
{
    if(strcasecmp($tabName,"STANDARD") === 0)
    {
        $tabHidden = false;
        $tabData = array_filter($profileData,function($function) {
            return (strcasecmp($function["role_name"],"Standard") === 0);
        });
    }
    else
    {
        $tabHidden = true;
        $tabData = array_filter($profileData,function($function) {
            return (strcasecmp($function["role_name"],"Standard") !== 0);
        });
    }

    echo "<script>console.log(".json_encode($tabData).")</script>";

    $roleList = array_combine(array_column($tabData,"role_id"),array_column($tabData,"role_name"));

    echo "<script>console.log(".json_encode($roleList).")</script>";

    $returnString = "";

    foreach($roleList as $roleIndex => $roleName)
    {
        echo "<script>console.log(".$roleIndex.")</script>";
        $roleFunctions = array_filter($tabData,function($function) use ($roleIndex)
        {
            return (intval($function["role_id"]) === $roleIndex);
        });

        //echo "<script>console.log(".$roleID.")</script>";
        echo "<script>console.log(".json_encode($roleFunctions).")</script>";

        $romanTiers = array("1"=>"I","2"=>"II","3"=>"III","4"=>"IV","5"=>"V");

        $returnString .= "<section class='checkGroup" . ($tabHidden ? " hidden" : "") . "' data-role='" . $roleIndex . "'>";

        for($i = 1; $i <= 5; $i++)
        {
            $tierFunctions = array_filter($roleFunctions,function($function) use ($i)
            {
                return (intval($function["tier"]) === $i);
            });

            echo "<script>console.log(".json_encode($tierFunctions).")</script>";
            echo "<script>console.log(".count($tierFunctions).")</script>";

            if(count($tierFunctions) > 0)
            {
                $returnString .= "<h2>TIER " . $romanTiers[$i] . "</h2>";

                foreach($tierFunctions as $function)
                {
                    $returnString .=    "<div class='check' data-role='" . $roleName . "'>" .
                                            "<input type='checkbox' id='check" . $function["id"] . "' form='statsForm'>&nbsp" .
                                            "<label for='check" . $function["id"] . "'>" . $function["function_name"] . (($function["rank"]) ? (" " . $romanTiers[intval($function["rank"])]) : "") . "</label>" .
                                        "</div>";
                }
            }
        }

        $returnString .= "</section>";
    }

    return $returnString;
}