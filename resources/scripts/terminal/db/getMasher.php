<?php
require('dbConnect.php');

$masherCode = $_POST["masherCode"];
$mainID = $_POST["mainID"];
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
    
    $masherQuery = "  SELECT SUM(ml_functions.rank) AS bm_rank
                        FROM ml_functions
                        INNER JOIN user_functions ON user_functions.mlFunction_id = ml_functions.id
                        INNER JOIN cpu_functions ON cpu_functions.id = ml_functions.function_id
                        WHERE
                            user_functions.user_id = :masherID
                            AND cpu_functions.name = 'Button Masher'";

    $masherStatement = $pdo->prepare($masherQuery);
    $masherStatement->execute([':masherID' => $userResponse["ml_id"]]);
    $masherRank = $masherStatement->fetch(PDO::FETCH_COLUMN);

    /* NEED TO FIGURE OUT WHERE TO PUT BUTTON MASHER ASSIST INFO INTO DB FIRST
    $sceneUseQuery = "  SELECT COUNT(*)
                        FROM {$dbName}.item_uses
                        WHERE 	user_id = :userID
                            AND effect_id = :effectID
                            AND jobCode = :jobCode
                            AND simCode = :simCode";

    $sceneUseStatement = $pdo->prepare($sceneUseQuery);
    */

    echo json_encode(array(  "id" => $userResponse["ml_id"],
                                    "name" => $userResponse["charName"],
                                    "bmRank" => intval($masherRank)
                                ));
}