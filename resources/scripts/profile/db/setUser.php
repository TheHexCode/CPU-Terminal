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

    $userFuncArray = array();

    foreach($charSkills as $skill)
    {
        $mlFuncQuery = "SELECT id, cav_type, cav_id
                            FROM ml_functions
                            WHERE ml_name = :skillName";

        $mlFuncStatement = $pdo->prepare($mlFuncQuery);
        $mlFuncStatement->execute([':skillName' => $skill->name]);

        $mlFunc = $mlFuncStatement->fetch(PDO::FETCH_ASSOC);

        if($mlFunc["cav_type"] === "choice")
        {
            $skillCav = substr($skill->cav, strpos($skill->cav,":")+1, strpos($skill->cav,";") - strpos($skill->cav,":") - 1);

            $cavQuery = "   SELECT id
                                FROM cpu_caviats
                                WHERE ml_name = :cavML";
            
            $cavStatement = $pdo->prepare($cavQuery);
            $cavStatement->execute([':cavML' => $skillCav]);

            $cavID = $cavStatement->fetch(PDO::FETCH_COLUMN);
        }
        else
        {
            $cavID = NULL;
        }

        array_push($userFuncArray,$newID, $mlFunc["id"], $cavID);
    }

    $userFuncQuery = "  INSERT INTO {$dbName}.user_functions
                            (user_id, mlFunction_id, cav_id)
                        VALUES ( ?,?,? " . str_repeat('), ( ?,?,? ',count($charSkills)-1) . ")";

    $userFuncStatement = $pdo->prepare($userFuncQuery);
    $userFuncStatement->execute($userFuncArray);
}

function updateUser(PDO $pdo, $dbName, int $userID, String $charName, array $charSkills)
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

    
    $deleteQuery = "DELETE FROM {$dbName}.user_functions
                    WHERE user_id = :userID";

    $deleteStatement = $pdo->prepare($deleteQuery);
    $deleteStatement->execute([':userID' => $userID]);

    $userFuncArray = array();

    foreach($charSkills as $skill)
    {
        $mlFuncQuery = "SELECT id, cav_type, cav_id
                            FROM ml_functions
                            WHERE ml_name = :skillName";

        $mlFuncStatement = $pdo->prepare($mlFuncQuery);
        $mlFuncStatement->execute([':skillName' => $skill->name]);

        $mlFunc = $mlFuncStatement->fetch(PDO::FETCH_ASSOC);

        if($mlFunc["cav_type"] === "choice")
        {
            $skillCav = substr($skill->cav, strpos($skill->cav,":")+1, strpos($skill->cav,";") - strpos($skill->cav,":") - 1);

            $cavQuery = "   SELECT id
                                FROM cpu_caviats
                                WHERE ml_name = :cavML";
            
            $cavStatement = $pdo->prepare($cavQuery);
            $cavStatement->execute([':cavML' => $skillCav]);

            $cavID = $cavStatement->fetch(PDO::FETCH_COLUMN);
        }
        else
        {
            $cavID = NULL;
        }

        array_push($userFuncArray,$userID, $mlFunc["id"], $cavID);
    }

    $userFuncQuery = "  INSERT INTO {$dbName}.user_functions
                            (user_id, mlFunction_id, cav_id)
                        VALUES ( ?,?,? " . str_repeat('), ( ?,?,? ',count($charSkills)-1) . ")";

    $userFuncStatement = $pdo->prepare($userFuncQuery);
    $userFuncStatement->execute($userFuncArray);
}