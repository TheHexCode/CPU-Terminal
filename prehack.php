<!DOCTYPE html>
<?php
    require 'resources/scripts/prehack/db/startPH.php';
?>
<html>
	<head>
		<title>PRE-HACKING</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta charset="UTF-8">
		<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"></script>
		<script type="text/javascript" src="/resources/scripts/terminal/classes/session.js"></script>
		<script type="text/javascript" src="/resources/scripts/terminal/classes/inventory.js"></script>
		<script type="text/javascript" src="/resources/scripts/terminal/classes/payload.js"></script>
		<script type="text/javascript" src="/resources/scripts/terminal/classes/timer.js"></script>
		<script type="text/javascript" src="/resources/scripts/terminal/classes/listener.js"></script>
		<script type="text/javascript" src="/resources/scripts/terminal/terminalInterface.js"></script>
		<script type="text/javascript" src="/resources/scripts/terminal/classes/gems.js" defer></script>
		<script type="text/javascript" src="/resources/scripts/terminal/classes/modal.js" defer></script>
		<script type="text/javascript" src="/resources/scripts/terminal/puzzles/reverse_mastermind/rev_mm.js"></script>
		<link rel="stylesheet" type="text/css" href="/resources/styles/rootstyle.css"/>
		<link rel="stylesheet" type="text/css" href="/resources/styles/termstyle.css"/>
	</head>
	<body>
		<div id="main">
			<div id="load" class="hidden">
				<svg id="hexLogo" width="209" height="229" xmlns="http://www.w3.org/2000/svg">
					<mask id="logoMask">
						<polygon points="105,10 195,62 195,167 105,219 15,167 15,62" fill="black" stroke="white" stroke-width="15" />
					</mask>

					<foreignObject x="0" y="0" width="209" height="229" mask="url(#logoMask)">
						<div id="logoBG"></div>
					</foreignObject>
				</svg>
			</div>
			<div id="stickyHeader">
				<div id="statusBar"></div>
                <div id="gemBar">
					<div id="gemContainer">
						<div class="gemPair">
							<span id="gem1"  class="gem <?php #echo $terminal->getAccessGem(1) ?>"></span>
							<span id="gem2"  class="gem <?php #echo $terminal->getAccessGem(2) ?>"></span>
						</div>
						<div class="gemPair">
							<span id="gem3"  class="gem <?php #echo $terminal->getAccessGem(3) ?>"></span>
							<span id="gem4"  class="gem <?php #echo $terminal->getAccessGem(4) ?>"></span>
						</div>
						<div class="gemPair">
							<span id="gem5"  class="gem <?php #echo $terminal->getAccessGem(5) ?>"></span>
							<span id="gem6"  class="gem <?php #echo $terminal->getAccessGem(6) ?>"></span>
						</div>
						<div class="gemPair">
							<span id="gem7"  class="gem <?php #echo $terminal->getAccessGem(7) ?>"></span>
							<span id="gem8"  class="gem <?php #echo $terminal->getAccessGem(8) ?>"></span>
						</div>
						<div class="gemPair">
							<span id="gem9"  class="gem <?php #echo $terminal->getAccessGem(9) ?>"></span>
							<span id="gem10" class="gem <?php #echo $terminal->getAccessGem(10)?>"></span>
						</div>
					</div>
					<div id="gemTens" class="dimmed">
						TENS
						<div class="lcdBox">
							<span class="dseg BG">x~~</span>
							<span id="gemTenTags" class="dseg FG"></span>
						</div>
					</div>
				</div>
			</div>
			<div class="infoBox">
				<div class="infoTitle">
                    <h3>PRE-HACKING PAGE FOR JOB:</h3>
                    <br/>
					<h2 id="termName">
						<?php echo $activeCodes["jobCode"]; ?>
					</h2>
				</div>
            </div>
        </div>
    </body>
</html>