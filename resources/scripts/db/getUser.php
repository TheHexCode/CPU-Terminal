<?php

include('E:/Personal/Projects/CPU/dbConfig/dbConfig.php');

$userCode = $_POST["userCode"];

$pdo = new PDO('sqlsrv:Server='.DBHOST.',1433;Database='.DBNAME, DBUSER,DBPWD);

$userQuery = 'SELECT users.id,true_name,mask,pRoles.name AS priRole,sRoles.name AS secRole
              FROM CPU_Terminal.dbo.users
              INNER JOIN CPU_Terminal.dbo.roles AS pRoles ON users.priRole=pRoles.id
			  INNER JOIN CPU_Terminal.dbo.roles AS sRoles ON users.secRole=sRoles.id
              WHERE user_code = :userCode';

$userFuncQuery = 'SELECT functions.name, functions.ranked, rank, type
                  FROM CPU_Terminal.dbo.user_functions
                  INNER JOIN CPU_Terminal.dbo.functions ON user_functions.function_id=functions.id
                  WHERE user_code = :userCode';

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