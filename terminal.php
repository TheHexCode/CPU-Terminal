<!DOCTYPE html>

<?php

phpInfo();

#$termID = $_POST["termID"];

$termID = $_GET["id"];

$termJSON = getcwd() . "\\Data\\" . $termID . "\\terminal.json";

if(file_exists($termJSON))
{
    echo file_get_contents($termJSON);
}

echo $termID;

?>

<html>
	<head>
		<title>TERMINAL</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0"> <!--content="width=271; height=695">--> <!--904x2316; 271x695-->
		<meta charset="UTF-8"> 
		<link rel="stylesheet" type="text/css" href="resources/styles/termstyle.css"/>
		<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
		<script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
		<link rel="stylesheet" href="https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css">
		<script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"></script>
		<script type="text/javascript" src="resources/scripts/termdata.js"></script>
	</head>
	<body>
		<div id="main">
			<div id="gemBar">
				<div id="gemContainer">
					<div class="gemPair">
						<span id="gem1"  class="gem clear"></span>
						<span id="gem2"  class="gem clear"></span>
					</div>
					<div class="gemPair">
						<span id="gem3"  class="gem clear"></span>
						<span id="gem4"  class="gem clear"></span>
					</div>
					<div class="gemPair">
						<span id="gem5"  class="gem clear"></span>
						<span id="gem6"  class="gem clear"></span>
					</div>
					<div class="gemPair">
						<span id="gem7"  class="gem clear"></span>
						<span id="gem8"  class="gem clear"></span>
					</div>
					<div class="gemPair">
						<span id="gem9"  class="gem clear"></span>
						<span id="gem10" class="gem clear"></span>
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
			<div class="infoBox">
				<h2>TERMINAL: DORM</h2>
				<div id="status">>> CRACKING TERMINAL</div> <!-- ">> " + 18 CHARS -->
				<div id="timerContainer">
					<div id="ppContainer">
						<button id="playPause" onMouseUp="pauseTimer()"><img src="Resources\Images\PlayPause\Pause.png"></button>
					</div>
					<div id="timerLCD" class="lcdBox amber">
						<div id="mmss">
							<span class="dseg BG">~~ ~~</span>
							<span class="dseg FG">00:30</span>
						</div>
						<div id="hundsec">
							<span class="dseg BG">~~</span>
							<span class="dseg FG">00</span>
						</div>
					</div>
				</div>
			</div>
			<div id="accessZone" class="zoneBox">
				<div class="accessBox">
					<div class="accessHeader">TAGS REQUIRED TO ACCESS TERMINAL:</div>
					<div class="lcdBox blend">
						<span class="dseg BG">~~</span>
						<span id="reqTags" class="dseg FG"></span>
					</div>
				</div>
				<div class="accessBox">
					<div id="payloadHeader" class="accessHeader">
						<span class="red">ERROR:</span><span>&nbsp;NO PAYLOAD FOUND</span>
					</div>
					<button id="payloadButton" onclick="window.open('./profile.html','_blank')">SETUP PAYLOAD PROFILE</button>
				</div>
				<div class="accessTagBox">
					<div class="accessTagRow">
						<div class="accessBox">
							<div class="accessHeader">
								TAGS FROM PAYLOAD:
							</div>
							<div class="lcdBox amber">
								<span class="dseg BG">~~</span>
								<span id="payTags" class="dseg FG">XX</span>
							</div>
							<div id="hackDetails" class="payDetails">[HACKING: +XX]</div>
							<div id="rexDetails" class="payDetails">[REM. EXP.: +02]</div>
						</div>
						<div class="accessBox">
							<div class="accessHeader">
								EXTRA TAGS?
							</div>
							<div class="tagInterface">
								<button onMouseUp="extraTags(-1)">-</button>
								<div class="lcdBox blue">
									<span class="dseg BG">~~</span>
									<span id="extTags" class="dseg FG">00</span>
								</div>
								<button onMouseUp="extraTags(1)">+</button>
							</div>
						</div>
					</div>
					<div class="accessBox">
						<div class="accessHeader">
							TAGS REMAINING AFTER ACCESS:
						</div>
						<div class="lcdBox blue">
							<span id="remTagBG" class="dseg BG">~~</span>
							<span id="remTags" class="dseg FG">XX</span>
						</div>
					</div>
					<!--
					<svg xmlns="http://www.w3.org/2000/svg">
						<filter id="filter">
							<feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="5" seed="5"/>
							<feColorMatrix values="1 0 0 0 0
												   1 0 0 0 0
												   1 0 0 0 0
												   0 0 0 0 1"/>
						</filter>
						<rect width="100%" height="100%" filter="url(#filter)"/>
					</svg>
					-->
					<button id="terminalButton" onclick="accessTerminal()" disabled>Standby...</button>
				</div>
			</div>
			<div id="hackZone" class="zoneBox">
				<div id="hackTabContainer">
					<button class="hackTab active" onclick="openTab(event,'termBody')">TERMINAL</button>
					<button class="hackTab" onclick="openTab(event,'deckBody')">CYBERDECK</button>
				</div>
				<div id="hackBox">
					<div class="hackSpacer"></div>
					<div id="termBody" class="hackBody active">
						<div class="subTabCol">
							<div id="termSubTabs" class="subTabInset">
								<!--Filled in by setupTerminalPage();-->
							</div>
							<div id="termSubFill" class="subFill"></div>
						</div>
						<div id="termContentContainer" class="subContentContainer">
							<!--Filled in by setupTerminalPage();-->
						</div>
					</div>
					<div id="deckBody" class="hackBody">
						<div id="deckContentContainer" class="subContentContainer">
							<!--Filled in by setupTerminalPage();-->
						</div>
						<div class="subTabCol">
							<div id="deckSubTabs" class="subTabInset">
								<button class="subTab active" onclick="openSubTab(event,'actContent')">
									<img src="resources/images/subtabs/active.png" onerror="this.onerror=null;this.src='https://placehold.co/30'">
								</button>
								<button class="subTab inactive" onclick="openSubTab(event,'passContent')">
									<img src="resources/images/subtabs/passive.png" onerror="this.onerror=null;this.src='https://placehold.co/30'">
								</button>
								<button class="subTab inactive" onclick="openSubTab(event,'itemContent')">
									<img src="resources/images/subtabs/items.png" onerror="this.onerror=null;this.src='https://placehold.co/30'">
								</button>
							</div>
							<div id="deckSubFill" class="subFill"></div>
						</div>
					</div>
					<div class="hackSpacer"></div>
				</div>
			</div>
			<footer>
				CPU DISCLAIMER
			</footer>
		</div>
		<div id="popup" class="hidden"></div>
	</body>
</html>