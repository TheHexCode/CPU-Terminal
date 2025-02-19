<!DOCTYPE html>
<html>
    <body>
        <?php
            include('E:\Personal\Projects\CPU\dbConfig\dbConfig.php');

            $idSlug = $_GET["id"];
            $activeJob = "ABC1234";

            $pdo = new PDO('sqlsrv:Server='.DBHOST.',1433;Database='.DBNAME, DBUSER,DBPWD);
            $term_query = $pdo->query("SELECT * FROM CPU_Terminal.dbo.terminals WHERE CONVERT(varchar,slug) = '$idSlug' AND CONVERT(varchar,job) = '$activeJob'");
            $terminal = $term_query->fetch(PDO::FETCH_ASSOC);

            $entry_query = $pdo->query("SELECT * FROM CPU_Terminal.dbo.entries WHERE terminal_id={$terminal['id']}");
            $entries = $entry_query->fetchAll(PDO::FETCH_ASSOC);

            foreach($entries as $entry)
            {
                echo implode($entry);
            }
        ?>
    </body>
</html>