<?php

require('dbConnect.php');

$userCode = $_POST["userCode"];

$userQuery = 'SELECT users.id,trueName,mask,pRoles.roleName AS priRole,sRoles.roleName AS secRole
              FROM CPU_Terminal.dbo.users
              INNER JOIN CPU_Terminal.dbo.roles AS pRoles ON users.priRole=pRoles.id
			  INNER JOIN CPU_Terminal.dbo.roles AS sRoles ON users.secRole=sRoles.id
              WHERE userCode = :userCode';

$userFuncQuery = 'SELECT functions.functionName, functions.type, rank
                  FROM CPU_Terminal.dbo.user_functions
                  INNER JOIN CPU_Terminal.dbo.functions ON user_functions.function_id=functions.id
                  WHERE userCode = :userCode';

$userStatement = $pdo->prepare($userQuery);
$uFStatement = $pdo->prepare($userFuncQuery);

$userStatement->execute([':userCode' => $userCode]);
$userResponse = $userStatement->fetch(PDO::FETCH_ASSOC);

if($userResponse === false)
{
    echo json_encode(array());
}
else
{
    $uFStatement->execute([':userCode' => $userCode]);
    $uFResponse = $uFStatement->fetchAll(PDO::FETCH_ASSOC);

    $userResponse["functions"] = $uFResponse;

    echo json_encode($userResponse);
}