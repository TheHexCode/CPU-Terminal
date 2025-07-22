<?php
require('dbConnect.php');

$masherCode = $_POST["masherCode"];
$termID = $_POST["termID"];

###############################################################################################################################

$activeQuery = "SELECT simCode,jobCode
                FROM {$dbName}.sim_active_codes";

$activeStatement = $pdo->prepare($activeQuery);
$activeStatement->execute();
$activeCodes = $activeStatement->fetch(PDO::FETCH_ASSOC);

$userQuery = "  SELECT ml_id,charName
                FROM {$dbName}.users
                WHERE userCode = :masherCode";

$userStatement = $pdo->prepare($userQuery);
$userStatement->execute([':masherCode' => $masherCode]);
$userResponse = $userStatement->fetch(PDO::FETCH_ASSOC);

if($userResponse === false)
{
    echo json_encode(array("name" => NULL));
}
else
{
    
    $masherQuery = "SELECT SUM(sr_entry_functions.rank) AS bm_rank
                    FROM sr_entry_functions
                    INNER JOIN user_functions ON user_functions.function_id = sr_entry_functions.id
                    INNER JOIN sr_functions ON sr_functions.id = sr_entry_functions.func_id
                    WHERE
                        user_functions.user_id = :masherID
                        AND sr_functions.name = 'Button Masher'";

    $masherStatement = $pdo->prepare($masherQuery);
    $masherStatement->execute([':masherID' => $userResponse["ml_id"]]);
    $masherRank = $masherStatement->fetch(PDO::FETCH_COLUMN);

    
    $sceneUseQuery = "  SELECT COUNT(*)
                        FROM {$dbName}.sim_user_actions
                        INNER JOIN {$dbName}.sim_terminals ON sim_terminals.id = sim_user_actions.target_id
                        WHERE   sim_terminals.jobCode = :jobCode
                            AND sim_user_actions.action = 'masher'
                            AND sim_user_actions.newState = :masherID";

    $sceneUseStatement = $pdo->prepare($sceneUseQuery);
    $sceneUseStatement->execute([':jobCode' => $activeCodes["jobCode"], ':masherID' => $userResponse["ml_id"]]);

    $sceneUses = $sceneUseStatement->fetch(PDO::FETCH_COLUMN);

    echo json_encode(array(  "id" => $userResponse["ml_id"],
                                    "name" => $userResponse["charName"],
                                    "rank" => intval($masherRank),
                                    "uses" => $sceneUses
                                ));
}