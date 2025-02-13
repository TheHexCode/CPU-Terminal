<!DOCTYPE html>
<html>
    <body>
        <?php
            $pdo = new PDO('mysql:host=localhost;dbname=CPU_Terminal', '','');
            $term_query = $pdo->query("SELECT * FROM CPU_Terminal.dbo.terminals"); #WHERE slug = slug AND job = job");
            $terminal = $term_query->fetch(PDO::FETCH_ASSOC);

            echo $terminal['name'];
        ?>
    </body>
</html>