<!DOCTYPE html>
<?php
    require('..\\resources\\scripts\\db\\dbConnect.php');

    $activeQuery = "SELECT * FROM cpu_term.activeJob";
    $activeStatement = $pdo->prepare($activeQuery);
    $activeStatement->execute();
    $activeCodes = $activeStatement->fetch(PDO::FETCH_ASSOC);

    $termsQuery = " SELECT jobCode, slug FROM cpu_term.terminals";
    $termsStatement = $pdo->prepare($termsQuery);
    $termsStatement->execute();
    $termsList = $termsStatement->fetchAll(PDO::FETCH_COLUMN|PDO::FETCH_GROUP);

    //echo var_dump($termsList);
?>
<html>
    <head>
        <meta charset="UTF-8">
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <link rel="stylesheet" type="text/css" href="../resources/styles/adminstyle.css"/>
        <script type="text/javascript" src="scripts/dashboard.js"></script>
    </head>
    <body>
        <h1>CPU TERMINAL ADMIN DASHBOARD</h1>
        <div id="dashHeader">
            <div id="dashCodes">
                <div class="dashCodeBox">
                    <h2>CURRENT SIM:</h2>
                    <span class="dashCode"><?php echo $activeCodes["simCode"]; ?></span>
                </div>
                <div class="dashCodeBox">
                    <h2>ACTIVE JOBCODE:</h2>
                    <span class="dashCode"><?php echo $activeCodes["jobCode"]; ?></span>
                </div>
            </div>
            <div class="dashCodeBox">
                <h2>CURRENTLY ACTIVE TERMINALS:</h2>
                <ul id="termList">
                    <?php
                        $termString = "";

                        foreach($termsList[$activeCodes["jobCode"]] as $termSlug)
                        {
                            $termString .= "<li>" . strtoupper($termSlug) . "</li>";
                        }

                        echo $termString;
                    ?>
                </ul>
            </div>
            <a href="codeedit.php">EDIT ACTIVE CODES</a>
        </div>
        <hr/>
        <form id="editForm">
            <h2>EDIT TERMINAL:</h2>
            <div>
                <label for="jobSelect">Job Code:</label>
                <select id="jobSelect" name="jobCode" required onchange="jobCodeChange()">
                    <option disabled selected>-- SELECT JOB CODE --</option>
                    <?php
                        $codeString = "";

                        foreach(array_keys($termsList) as $termCode)
                        {
                            $codeString .= "<option value='" . $termCode . "'>" . strtoupper($termCode) . "</option>";
                        }

                        echo $codeString;
                    ?>
                </select>
            </div>
            <div>
                <label for="slugSelect">Terminal:</label>
                <select id="slugSelect" name="slug" disabled required onchange="slugChange(this)">
                    <?php
                        $termsString = "";

                        foreach(array_keys($termsList) as $jobCode)
                        {
                            $termsString .= "<optgroup data-code='" . $jobCode . "' disabled>";

                            foreach($termsList[$jobCode] as $termSlug)
                            {
                                $termsString .= "<option value='" . $termSlug . "'>" . strtoupper($termSlug) . "</option>";
                            }

                            $termsString .= "</optgroup>";
                        }

                        echo $termsString;
                    ?>
                </select>
            </div>
            <button id="editTermButton" type="submit" disabled formaction="./termedit.php" method="get">Edit Terminal</button>
        </form>
        <hr/>
        <div>
            <a href="termedit.php">CREATE TERMINAL</a>
        </div>
    </body>
</html>