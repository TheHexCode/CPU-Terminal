<!DOCTYPE html>
<?php
    require('../resources/scripts/terminal/db/dbConnect.php');

    $jobQuery = "SELECT jobCode FROM {$dbName}.sim_active_codes";
    $jobStatement = $pdo->prepare($jobQuery);
    $jobStatement->execute();
    $jobCode = $jobStatement->fetch(PDO::FETCH_COLUMN);
?>
<html>
    <head>
        <meta charset="UTF-8">
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <link rel="stylesheet" type="text/css" href="../resources/styles/adminstyle.css"/>
    </head>
    <body>
        <h1>CPU TERMINAL >> EDIT JOBCODE</h1>
        <input id="jobCode" type="text" value="<?php echo $jobCode; ?>" />
        <button onclick="submitNewCode(this)">SUBMIT</button>
    </body>
    <script>
        function submitNewCode(target)
        {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "scripts\\updateCode.php",
                data:
                {
                    newCode: $("#jobCode").val()
                }
            })
            .then(function()
            {
                window.location.href = 'dashboard.php';
            });
        }
    </script>
</html>