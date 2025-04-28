<!DOCTYPE html>
<html>
    <body>
        <h1>CPU TERMINAL ADMIN DASHBOARD</h1>
        <div>
            <h2>CURRENT SIM:</h2>
            <ul>
                <li>MAY25</li>
            </ul>
            <h2>ACTIVE JOBCODE:</h2>
            <ul>
                <li>ABC1234</li>
            </ul>
            <h2>CURRENTLY ACTIVE TERMINALS:</h2>
            <ul>
                <li>TEST</li>
            </ul>
            <a href="codeedit.php">EDIT ACTIVE CODES</a>
        </div>
        <hr/>
        <form id="editForm">
            <h2>EDIT TERMINAL:</h2>
            <!--
            <div>
                <label for="simSelect">Sim Code:</label>
                <select id="simSelect" name="simSelect" disabled>
                    <option disabled selected>-- SELECT SIM CODE --</option>
                    <option>MAY25</option>
                    <option>JUN25</option>
                </select>
            </div>
            -->
            <div>
                <label for="jobSelect">Job Code:</label>
                <select id="jobSelect" name="jobSelect" required>
                    <option disabled selected>-- SELECT JOB CODE --</option>
                    <option>ABC1234</option>
                    <option>DEF5678</option>
                </select>
            </div>
            <div>
                <label for="slugSelect">Terminal:</label>
                <select id="slugSelect" name="slugSelect" disabled required>
                </select>
            </div>
            <button type="submit" disabled>Edit Terminal</button>
        </form>
        <hr/>
        <div>
            <a href="termedit.php">CREATE TERMINAL</a>
        </div>
    </body>
</html>