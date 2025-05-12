<?php

function generateCode(PDO $pdo, $dbName)
{
    $code_query = $pdo->query("SELECT userCode FROM {$dbName}.users");

    $codeList = $code_query->fetchAll(PDO::FETCH_COLUMN);

    $invalidCode = false;

    do
    {
        $newCode = array();

        for($i = 0; $i < 6; $i++)
        {
            array_push($newCode,rand(0,9));
        }

        if($codeList !== null)
        {
            //in $codeList
            if(in_array(implode($newCode),$codeList))
            {
                $invalidCode = true;
            }
            //All same
            else if(count(array_unique($newCode)) === 1)
            {
                $invalidCode = true;
            }
            //Palendrome
            else if(array_slice($newCode,0,3) === array_reverse(array_slice($newCode,3,3)))
            {
                $invalidCode = true;
            }
            //Repeat 2
            else if(implode(array_slice($newCode,0,2)) === implode(array_slice($newCode,2,2)) &&
                implode(array_slice($newCode,0,2)) === implode(array_slice($newCode,4,2)))
            {
                $invalidCode = true;
            }
            //Repeat 3
            else if(implode(array_slice($newCode,0,3)) === implode(array_slice($newCode,3,3)))
            {
                $invalidCode = true;
            }
            //Decrementing
            else if($newCode[0] === (($newCode[1] + 1) % 10))
            {
                if($newCode[1] === ((($newCode[2] + 1) % 10)) &&
                    $newCode[2] === ((($newCode[3] + 1) % 10)) &&
                    $newCode[3] === ((($newCode[4] + 1) % 10)) &&
                    $newCode[4] === ((($newCode[5] + 1) % 10)))
                {
                    $invalidCode = true;
                }
            }
            //Incrementing
            else if($newCode[0] === (($newCode[1] - 1) % 10))
            {
                if($newCode[1] === ((($newCode[2] + 9) % 10)) &&
                    $newCode[2] === ((($newCode[3] + 9) % 10)) &&
                    $newCode[3] === ((($newCode[4] + 9) % 10)) &&
                    $newCode[4] === ((($newCode[5] + 9) % 10)))
                {
                    $invalidCode = true;
                }
            }
        }
        
    } while($invalidCode);

    return implode($newCode);
}

function addUser(PDO $pdo, $dbName, int $newID, string $newCode, string $newCharName, array $charSkills)
{
    $newCharQuery = "   INSERT INTO {$dbName}.users
                            (ml_id, userCode, charName)
                        VALUES (:mlID, :userCode, :charName)";

    $newCharStatement = $pdo->prepare($newCharQuery);

    $newCharStatement->execute([':mlID' => $newID, ':userCode' => $newCode, ':charName' => $newCharName]);

    $newMLIDQuery = "   SELECT id
                        FROM {$dbName}.ml_functions
                        WHERE ml_name IN ( ?" . str_repeat(', ?', count($charSkills)-1) . " )";

    $newMLIDStatement = $pdo->prepare($newMLIDQuery);
    $newMLIDStatement->execute($charSkills);
    $newMLIDs = $newMLIDStatement->fetchAll(PDO::FETCH_COLUMN);

    $userFuncArray = array();

    foreach($newMLIDs as $mlID)
    {
        array_push($userFuncArray,$newID,$mlID);
    }

    $userFuncQuery = "  INSERT INTO {$dbName}.user_functions
                            (user_id, mlFunction_id)
                        VALUES ( ?,? " . str_repeat('), ( ?,? ',count($newMLIDs)-1) .")";

    $userFuncStatement = $pdo->prepare($userFuncQuery);
    $userFuncStatement->execute($userFuncArray);
}

function updateUser(PDO $pdo, $dbName, int $userID, String $charName, array $mlIDs)
{
    $dbNameQuery = "SELECT charName FROM {$dbName}.users
                    WHERE ml_id = :userID";

    $dbNameStatement = $pdo->prepare($dbNameQuery);
    $dbNameStatement->execute([':userID' => $userID]);

    $dbCharName = $dbNameStatement->fetch(PDO::FETCH_COLUMN);

    if($dbCharName !== $charName)
    {
        $updateNameQuery = "UPDATE {$dbName}.users
                            SET charName = :charName
                            WHERE ml_id = :userID";

        $updateNameStatement = $pdo->prepare($updateNameQuery);
        $updateNameStatement->execute([':charName' => $charName, ':userID' => $userID]);
    }

    $dbFuncQuery = "SELECT DISTINCT ml_name
                    FROM {$dbName}.user_functions
                    INNER JOIN {$dbName}.ml_functions ON user_functions.mlFunction_id=ml_functions.id
                    WHERE user_id = :userID
                    GROUP BY ml_name";

    $dbFuncStatement = $pdo->prepare($dbFuncQuery);
    $dbFuncStatement->execute([':userID' => $userID]);
    $dbFuncs = $dbFuncStatement->fetchAll(PDO::FETCH_COLUMN);

    if(count(array_intersect($dbFuncs,$mlIDs)) !== count($mlIDs))
    {
        $deleteQuery = "DELETE FROM {$dbName}.user_functions
                        WHERE user_id = :userID";

        $deleteStatement = $pdo->prepare($deleteQuery);
        $deleteStatement->execute([':userID' => $userID]);

        $newMLIDQuery = "   SELECT id
                                FROM {$dbName}.ml_functions
                                WHERE ml_name IN ( ?" . str_repeat(', ?', count($mlIDs)-1) . " )";

        $newMLIDStatement = $pdo->prepare($newMLIDQuery);
        $newMLIDStatement->execute($mlIDs);
        $newMLIDs = $newMLIDStatement->fetchAll(PDO::FETCH_COLUMN);

        $userFuncArray = array();

        foreach($newMLIDs as $mlID)
        {
            array_push($userFuncArray,$userID,$mlID);
        }

        $userFuncQuery = "  INSERT INTO {$dbName}.user_functions
                                (user_id, mlFunction_id)
                            VALUES ( ?,? " . str_repeat('), ( ?,? ',count($newMLIDs)-1) .")";

        $userFuncStatement = $pdo->prepare($userFuncQuery);
        $userFuncStatement->execute($userFuncArray);
    }
}