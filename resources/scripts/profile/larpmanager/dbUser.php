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

function addDBUser(PDO $pdo, $dbName, string $newID, string $newCode, string $newCharName, array $charAbils)
{
    $newCharQuery = "   INSERT INTO {$dbName}.users
                            (lm_id, userCode, charName)
                        VALUES (:lmID, :userCode, :charName)";

    $newCharStatement = $pdo->prepare($newCharQuery);
    $newCharStatement->execute([':lmID' => $newID, ':userCode' => $newCode, ':charName' => $newCharName]);

    $reviseQuery = "SELECT lm_id FROM {$dbName}.cpu_abilities
                    WHERE lm_id IN ( ?" . str_repeat(',?', count($charAbils)-1) . " )";

    $reviseStatement = $pdo->prepare($reviseQuery);
    $reviseStatement->execute($charAbils);
    $revisedCharAbils = $reviseStatement->fetchAll(PDO::FETCH_COLUMN);

    $userAbilArray = array();

    foreach($revisedCharAbils as $abilityID)
    {
        array_push($userAbilArray, $newID, $abilityID);
    }

    $userAbilQuery = "  INSERT INTO {$dbName}.user_abilities
                            (user_id, ability_lmid)
                        VALUES ( ?,? " . str_repeat('), ( ?,? ',count($revisedCharAbils)-1) . ")";

    $userAbilStatement = $pdo->prepare($userAbilQuery);
    $userAbilStatement->execute($userAbilArray);
}

function updateDBUser(PDO $pdo, $dbName, string $userID, String $charName, array $charAbils)
{
    $dbNameQuery = "SELECT charName FROM {$dbName}.users
                    WHERE lm_id = :userID";

    $dbNameStatement = $pdo->prepare($dbNameQuery);
    $dbNameStatement->execute([':userID' => $userID]);

    $dbCharName = $dbNameStatement->fetch(PDO::FETCH_COLUMN);

    if($dbCharName !== $charName)
    {
        $updateNameQuery = "UPDATE {$dbName}.users
                            SET charName = :charName
                            WHERE lm_id = :userID";

        $updateNameStatement = $pdo->prepare($updateNameQuery);
        $updateNameStatement->execute([':charName' => $charName, ':userID' => $userID]);
    }

    $deleteQuery = "DELETE FROM {$dbName}.user_abilities
                    WHERE user_id = :userID";

    $deleteStatement = $pdo->prepare($deleteQuery);
    $deleteStatement->execute([':userID' => $userID]);

    $reviseQuery = "SELECT lm_id FROM {$dbName}.cpu_abilities
                    WHERE lm_id IN ( ?" . str_repeat(',?', count($charAbils)-1) . " )";

    $reviseStatement = $pdo->prepare($reviseQuery);
    $reviseStatement->execute($charAbils);
    $revisedCharAbils = $reviseStatement->fetchAll(PDO::FETCH_COLUMN);

    $userAbilArray = array();

    foreach($revisedCharAbils as $abilityID)
    {
        array_push($userAbilArray, $userID, $abilityID);
    }

    $userAbilQuery = "  INSERT INTO {$dbName}.user_abilities
                            (user_id, ability_lmid)
                        VALUES ( ?,? " . str_repeat('), ( ?,? ',count($revisedCharAbils)-1) . ")";

    $userAbilStatement = $pdo->prepare($userAbilQuery);
    $userAbilStatement->execute($userAbilArray);
}