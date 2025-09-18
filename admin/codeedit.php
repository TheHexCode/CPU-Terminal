<!DOCTYPE html>
<?php
    require('../resources/scripts/terminal/db/dbConnect.php');

    $codeQuery = "SELECT simCode, jobCode FROM {$dbName}.sim_active_codes";
    $codeStatement = $pdo->prepare($codeQuery);
    $codeStatement->execute();
    $codeResults = $codeStatement->fetch(PDO::FETCH_ASSOC);
?>
<html>
    <head>
        <meta charset="UTF-8">
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <link rel="stylesheet" type="text/css" href="../resources/styles/adminstyle.css"/>
    </head>
    <body>
        <h1>CPU TERMINAL >> EDIT CODES</h1>
        <div class="editContainer">
            <div class="editBox">
                <label for="simCode">SIM CODE</label>
                <input id="simCode" type="text" value="<?php echo $codeResults["simCode"]; ?>" />
            </div>
            <div class="editBox">
                <label for="jobCode">JOB CODE</label>
                <input id="jobCode" type="text" value="<?php echo $codeResults["jobCode"]; ?>" />
            </div>
        </div>
        <br/>
        <button onclick="submitNewCode(this)">SUBMIT</button>
    </body>
    <script>
        function submitNewCode(target)
        {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "scripts\\updateCodes.php",
                data:
                {
                    newSim: $("#simCode").val(),
                    newJob: $("#jobCode").val()
                }
            })
            .then(function()
            {
                window.location.href = 'dashboard.php';
            });
        }
    </script>
</html>