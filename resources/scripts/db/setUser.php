<?php

function generateCode(PDO $pdo)
{
    $code_query = $pdo->query("SELECT userCode FROM CPU_Terminal.dbo.users");

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
    $newCharQuery = "   INSERT INTO CPU_Terminal.dbo.users
                            (userCode, charName)
                        VALUES (:userCode, :charName)";

    $newCharStatement = $pdo->prepare($newCharQuery);

    $newCharStatement->execute([':userCode' => $newCode, ':charName' => $newCharName]);
    $newCharID = $pdo->lastInsertId();

    $newMLFuncIDQuery = "   SELECT ml_id
                            FROM CPU_Terminal.dbo.ml_functions
                            WHERE ml_name IN ( ?" . str_repeat(', ?', count($charSkills)-1) . " )";

    $newMLFuncIDStatement = $pdo->prepare($newMLFuncIDQuery);
    $newMLFuncIDStatement->execute($charSkills);
    $newMLFuncIDs = $newMLFuncIDStatement->fetchAll(PDO::FETCH_FUNC,function($mlFuncID){return $mlFuncID;});

    $userFuncArray = array();

    foreach($newMLFuncIDs as $mlfID)
    {
        array_push($userFuncArray,$newCharID,$mlfID);
    }

    $userFuncQuery = "  INSERT INTO CPU_Terminal.dbo.user_functions
                            (user_id, mlFunction_id)
                        VALUES ( ?,? " . str_repeat('), ( ?,? ',count($newMLFuncIDs)-1) .")";

    $userFuncStatement = $pdo->prepare($userFuncQuery);
    $userFuncStatement->execute($userFuncArray);
}

function updateUser(PDO $pdo, string $userID, array $mlFuncs)
{
    $dbFuncQuery = "SELECT DISTINCT ml_name
                    FROM CPU_Terminal.dbo.user_functions
                    INNER JOIN CPU_Terminal.dbo.ml_functions ON user_functions.mlFunction_id=ml_functions.ml_id
                    WHERE user_id = :userID
                    GROUP BY ml_name";

    $dbFuncStatement = $pdo->prepare($dbFuncQuery);
    $dbFuncStatement->execute([':userID' => $userID]);
    $dbFuncs = $dbFuncStatement->fetchAll(PDO::FETCH_FUNC,function($dbName){return $dbName;});

    if(count(array_intersect($dbFuncs,$mlFuncs)) !== count($mlFuncs))
    {
        $deleteQuery = "DELETE FROM CPU_Terminal.dbo.user_functions
                        WHERE user_id = :userID";

        $deleteStatement = $pdo->prepare($deleteQuery);
        $deleteStatement->execute([':userID' => $userID]);

        $newMLFuncIDQuery = "   SELECT ml_id
                                FROM CPU_Terminal.dbo.ml_functions
                                WHERE ml_name IN ( ?" . str_repeat(', ?', count($mlFuncs)-1) . " )";

        $newMLFuncIDStatement = $pdo->prepare($newMLFuncIDQuery);
        $newMLFuncIDStatement->execute($mlFuncs);
        $newMLFuncIDs = $newMLFuncIDStatement->fetchAll(PDO::FETCH_FUNC,function($mlFuncID){return $mlFuncID;});

        $userFuncArray = array();

        foreach($newMLFuncIDs as $mlfID)
        {
            array_push($userFuncArray,$userID,$mlfID);
        }

        $userFuncQuery = "  INSERT INTO CPU_Terminal.dbo.user_functions
                                (user_id, mlFunction_id)
                            VALUES ( ?,? " . str_repeat('), ( ?,? ',count($newMLFuncIDs)-1) .")";

        $userFuncStatement = $pdo->prepare($userFuncQuery);
        $userFuncStatement->execute($userFuncArray);
    }
}