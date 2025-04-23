<?php

require('dbConnect.php');

$userCode = $_POST["userCode"];

###############################################################################################################################

$userQuery = '  SELECT id,charName
                FROM cpu_term.users
                WHERE userCode = :userCode';

$userStatement = $pdo->prepare($userQuery);
$userStatement->execute([':userCode' => $userCode]);
$userResponse = $userStatement->fetch(PDO::FETCH_ASSOC);

if($userResponse === false)
{
    echo json_encode(array());
}
else
{
    $functionQuery = "  SELECT DISTINCT functions.name,
                                        SUM(ml_functions.rank) AS 'rank',
                                        functions.type,
                                        functions.hacking_cat
                        FROM cpu_term.user_functions
                        INNER JOIN cpu_term.ml_functions ON ml_functions.id=user_functions.mlFunction_id
                        INNER JOIN cpu_term.functions ON ml_functions.function_id=functions.id
                        WHERE user_id = :userID
                            AND functions.hacking_cat IS NOT NULL
                        GROUP BY functions.name,
                                functions.type,
                                functions.hacking_cat";

    $functionStatement = $pdo->prepare($functionQuery);
    $functionStatement->execute([':userID' => $userResponse["id"]]);
    $functionResponse = $functionStatement->fetchAll(PDO::FETCH_ASSOC);

    $roleQuery = "  SELECT DISTINCT roles.name
                    FROM cpu_term.ml_functions
                    INNER JOIN cpu_term.user_functions ON ml_functions.id=user_functions.mlFunction_id
                    INNER JOIN cpu_term.roles ON ml_functions.role_id=roles.id
                    WHERE user_id = :userID";

    $roleStatement = $pdo->prepare($roleQuery);
    $roleStatement->execute([':userID' => $userResponse["id"]]);
    $roleResponse = $roleStatement->fetchAll(PDO::FETCH_FUNC,function($roleName){return $roleName;});

    echo json_encode(array(  "id" => $userResponse["id"],
                                    "name" => $userResponse["charName"],
                                    "userCode" => $userCode,
                                    "functions" => $functionResponse,
                                    "roles" => $roleResponse ));
}