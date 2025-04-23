<?php

function generateCode(PDO $pdo)
{
    $code_query = $pdo->query("SELECT userCode FROM cpu_term.users");

    $codeList = $code_query->fetchAll(PDO::FETCH_NUM)[0];

    $invalidCode = false;

    do
    {
        $newCode = array();

        for($i = 0; $i < 6; $i++)
        {
            array_push($newCode,rand(0,9));
        }
        
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
        
    } while($invalidCode);

    return implode($newCode);
}

function addUser(PDO $pdo, string $newCode, string $newCharName, array $charSkills)
{
    $newCharQuery = "   INSERT INTO cpu_term.users
                            (userCode, charName)
                        VALUES (:userCode, :charName)";

    $newCharStatement = $pdo->prepare($newCharQuery);

    $newCharStatement->execute([':userCode' => $newCode, ':charName' => $newCharName]);
    $newCharID = $pdo->lastInsertId();

    $newMLIDQuery = "   SELECT id
                        FROM cpu_term.ml_functions
                        WHERE ml_name IN ( ?" . str_repeat(', ?', count($charSkills)-1) . " )";

    $newMLIDStatement = $pdo->prepare($newMLIDQuery);
    $newMLIDStatement->execute($charSkills);
    $newMLIDs = $newMLIDStatement->fetchAll(PDO::FETCH_FUNC,function($mlID){return $mlID;});

    $userFuncArray = array();

    foreach($newMLIDs as $mlID)
    {
        array_push($userFuncArray,$newCharID,$mlID);
    }

    $userFuncQuery = "  INSERT INTO cpu_term.user_functions
                            (user_id, mlFunction_id)
                        VALUES ( ?,? " . str_repeat('), ( ?,? ',count($newMLIDs)-1) .")";

    $userFuncStatement = $pdo->prepare($userFuncQuery);
    $userFuncStatement->execute($userFuncArray);
}

function updateUser(PDO $pdo, string $userID, array $mlIDs)
{
    $dbFuncQuery = "SELECT DISTINCT ml_name
                    FROM cpu_term.user_functions
                    INNER JOIN cpu_term.ml_functions ON user_functions.mlFunction_id=ml_functions.id
                    WHERE user_id = :userID
                    GROUP BY ml_name";

    $dbFuncStatement = $pdo->prepare($dbFuncQuery);
    $dbFuncStatement->execute([':userID' => $userID]);
    $dbFuncs = $dbFuncStatement->fetchAll(PDO::FETCH_FUNC,function($dbName){return $dbName;});

    if(count(array_intersect($dbFuncs,$mlIDs)) !== count($mlIDs))
    {
        $deleteQuery = "DELETE FROM cpu_term.user_functions
                        WHERE user_id = :userID";

        $deleteStatement = $pdo->prepare($deleteQuery);
        $deleteStatement->execute([':userID' => $userID]);

        $newMLIDQuery = "   SELECT id
                                FROM cpu_term.ml_functions
                                WHERE ml_name IN ( ?" . str_repeat(', ?', count($mlIDs)-1) . " )";

        $newMLIDStatement = $pdo->prepare($newMLIDQuery);
        $newMLIDStatement->execute($mlIDs);
        $newMLIDs = $newMLIDStatement->fetchAll(PDO::FETCH_FUNC,function($mlID){return $mlID;});

        $userFuncArray = array();

        foreach($newMLIDs as $mlID)
        {
            array_push($userFuncArray,$userID,$mlID);
        }

        $userFuncQuery = "  INSERT INTO cpu_term.user_functions
                                (user_id, mlFunction_id)
                            VALUES ( ?,? " . str_repeat('), ( ?,? ',count($newMLIDs)-1) .")";

        $userFuncStatement = $pdo->prepare($userFuncQuery);
        $userFuncStatement->execute($userFuncArray);
    }
}