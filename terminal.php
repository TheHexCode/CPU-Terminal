<!DOCTYPE html>
<?php
    require 'resources\\scripts\\db\\startTerm.php';
?>
<html>
	<head>
		<title>TERMINAL</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0"> <!--content="width=271; height=695">--> <!--904x2316; 271x695-->
		<meta charset="UTF-8">
		<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
		<!--<script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
		<link rel="stylesheet" href="https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css">
		<script src="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>-->
		<script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"></script>
		<script type="text/javascript" src="resources/scripts/classes/session.js"></script>
		<script type="text/javascript" src="resources/scripts/classes/payload.js"></script>
		<script type="text/javascript" src="resources/scripts/classes/timer.js"></script>
		<script type="text/javascript" src="resources/scripts/terminalInterface.js"></script>
		<script type="text/javascript" src="resources/scripts/classes/gems.js" defer></script>
		<link rel="stylesheet" type="text/css" href="resources/styles/termstyle.css"/>
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
			<div id="gemBar">
				<div id="gemContainer">
					<div class="gemPair">
						<span id="gem1"  class="gem <?php echo $terminal->getAccessGem(1) ?>"></span>
						<span id="gem2"  class="gem <?php echo $terminal->getAccessGem(2) ?>"></span>
					</div>
					<div class="gemPair">
						<span id="gem3"  class="gem <?php echo $terminal->getAccessGem(3) ?>"></span>
						<span id="gem4"  class="gem <?php echo $terminal->getAccessGem(4) ?>"></span>
					</div>
					<div class="gemPair">
						<span id="gem5"  class="gem <?php echo $terminal->getAccessGem(5) ?>"></span>
						<span id="gem6"  class="gem <?php echo $terminal->getAccessGem(6) ?>"></span>
					</div>
					<div class="gemPair">
						<span id="gem7"  class="gem <?php echo $terminal->getAccessGem(7) ?>"></span>
						<span id="gem8"  class="gem <?php echo $terminal->getAccessGem(8) ?>"></span>
					</div>
					<div class="gemPair">
						<span id="gem9"  class="gem <?php echo $terminal->getAccessGem(9) ?>"></span>
						<span id="gem10" class="gem <?php echo $terminal->getAccessGem(10)?>"></span>
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
				<div id="rigged" class="hidden"><img src="resources/images/actions/rigged.png"/></div>
				<h2 id="termName">
					<?php echo $terminal->getTerminalName() ?>
				</h2>
				<!--
				<div id="status">>> CRACKING TERMINAL</div> <!-- ">> " + 18 CHARS --><!--
				
					<div id="ppContainer">
						<button id="playPause" onMouseUp="pauseTimer()"><img src="resources\images\playpause\pause.png"></button>
					</div>
					
				-->
			</div>
			<div id="accessZone" class="zoneBox">
				<div class="accessBox">
					<div class="accessHeader">TAGS REQUIRED TO ACCESS TERMINAL:</div>
					<div class="lcdBox blend">
						<span class="dseg BG">~~</span>
						<span id="reqTags" class="dseg FG">
							<?php echo str_pad($terminal->getTerminalAccessCost(),2,"0",STR_PAD_LEFT) ?>
						</span>
					</div>
				</div>
				<div id="payloadBox" class="noPayload">
					<div id="payloadHeader" class="accessHeader">
						<span class="red">ERROR:</span><span>&nbsp;NO PAYLOAD FOUND</span>
					</div>
					<div id="payloadCodeHeader">
						ENTER PROFILE CODE
					</div>
					<div id="payloadCodeRow">
						<span class="dseg BG">~~~~~~</span>
						<input id="payloadCodeInput" type="number" class="dseg FG" size="6" max="999999" min="000000" minlength="6" maxlength="6" onkeydown="codeLimit(event)" onkeyup="activateCodeSubmit(this)"/>
					</div>
					<button id="payloadCodeSubmit" onmouseUp="submitCode(event)" disabled>SUBMIT CODE</button>
					<span>OR</span>
					<button id="payloadButton" onpointerup="window.open('./profile.php','_blank')">SETUP PAYLOAD PROFILE</button>
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
							<div id="hackDetails" class="payDetails">
								<span>[HACKING: +XX]</span>
							</div>
						</div>
						<div class="accessBox">
							<div class="accessHeader">
								EXTRA TAGS?
							</div>
							<div class="tagInterface">
								<button class="extraButton" onMouseUp="updateExtraTags(-1)"><b>-</b></button>
								<div class="lcdBox blue">
									<span class="dseg BG">~~</span>
									<span id="extTags" class="dseg FG">XX</span>
								</div>
								<button class="extraButton" onMouseUp="updateExtraTags(1)">+</button>
							</div>
						</div>
					</div>
					<ul class="accessList">
						<li id="disItem" class="hidden"><input type="checkbox" id="disCheck" onchange="preCheck(this)"/><label for="disCheck">&nbsp;DISSIMULATOR: +1 HACKING?</label></li>
						<li id="cmmItem" class="hidden"><input type="checkbox" id="cmmCheck" onchange="preCheck(this)"/><label for="cmmCheck">&nbsp;CMM ARMS: Used Slip this Scene?</label></li>
						<li id="shmItem" class="hidden"><input type="checkbox" id="shmCheck" onchange="preCheck(this)"/><label for="shmCheck">&nbsp;CONSUMABLE: Using Shimmerstick?</label></li>
					</ul>
					<div class="accessBox">
						<div class="accessHeader">
							TAGS REMAINING AFTER ACCESS:
						</div>
						<div class="lcdBox blue">
							<span id="remTagBG" class="dseg BG">~~</span>
							<span id="remTags" class="dseg FG">XX</span>
						</div>
					</div>
				</div>
				<button id="terminalButton" onpointerup="accessTerminal(null)">Standby...</button>
			</div>
			<div id="hackZone" class="zoneBox">
				<div id="hackTabContainer">
					<button class="hackTab active" onpointerup="openTab(this,'termBody')">TERMINAL</button>
					<button class="hackTab" onpointerup="openTab(this,'deckBody')">CYBERDECK</button>
				</div>
				<div id="hackBox">
					<div class="hackSpacer"></div>
					<div id="termBody" class="hackBody active">
						<div class="subTabCol">
							<div id="termSubTabs" class="subTabInset">
								<button class="subTab active" onpointerup="openSubTab(this,'logContent')">
									<img src="resources/images/subtabs/log.png" onerror="this.onerror=null;this.src='https://placehold.co/30'"/>
								</button>
								<?php echo $terminal->setupSubTabButtons() ?>
							</div>
							<div id="termSubFill" class="subFill"></div>
						</div>
						<div id="termContentContainer" class="subContentContainer">
							<div id="logContent" class="subContent active">
								<div class="subContTitleRow">
									<span class="subContTitle">ACCESS LOG</span>
								</div>
								<div class="subContBody">
									<ul id="logList">
										<?php echo $terminal->setupLogEntries() ?>
									</ul>
								</div>
							</div>
							<div id="filesContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">FILES</span>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("files") ?>
								</div>
							</div>
							<div id="darkwebContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">DARK WEB FILES</span>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("darkweb") ?>
								</div>
							</div>
							<div id="camerasContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">CAMERAS</span>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("cameras") ?>
								</div>
							</div>
							<div id="locksContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">LOCKS</span>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("locks") ?>
								</div>
							</div>
							<div id="defensesContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">AUTOMATED DEFENSIVE SYSTEMS</span>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("defenses") ?>
								</div>
							</div>
							<div id="utilitiesContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">UTILITY SYSTEMS</span>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("utilities") ?>
								</div>
							</div>
							<div id="puzzlesContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">PUZZLES</span>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("puzzles") ?>
								</div>
							</div>
						</div>
					</div>
					<div id="deckBody" class="hackBody">
						<div id="deckContentContainer" class="subContentContainer">
							<!--Filled in by setupTerminalPage();-->
						</div>
						<div class="subTabCol">
							<div id="deckSubTabs" class="subTabInset">
								<button class="subTab active" onpointerup="openSubTab(this,'actContent')">
									<img src="resources/images/subtabs/active.png" onerror="this.onerror=null;this.src='https://placehold.co/30'">
								</button>
								<button class="subTab inactive" onpointerup="openSubTab(this,'passContent')">
									<img src="resources/images/subtabs/passive.png" onerror="this.onerror=null;this.src='https://placehold.co/30'">
								</button>
								<button class="subTab inactive" onpointerup="openSubTab(this,'itemContent')">
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
				<span>© CPU Larp 2025</span>
				<?php echo $terminal->sendInitialEntries(); ?>
			</footer>
		</div>
		<div id="modalBG">
			<div id="actionModal" class="modalBox">
				<div class="modalHeaderRow">
					<span class="modalHeaderText"></span>
					<span class="modalClose" onpointerup="closeModal(event)" onkeyup="closeModal(event)">&times;</span>
				</div>
				<div class="modalBody">
					<div class="modalBodyTimer" class="hidden">
						<div id="timerContainer">
							<div id="timerLCD" class="lcdBox amber">
								<div class="mmss">
									<span class="dseg BG">~~ ~~</span>
									<span class="dseg FG">00:00</span>
								</div>
								<div class="hundsec">
									<span class="dseg BG">~~</span>
									<span class="dseg FG">00</span>
								</div>
							</div>
						</div>
					</div>
					<div class="modalBodyText">
					</div>
				</div>
				<div class="modalButtonRow" data-mode="none">
				</div>
			</div>
		</div>
	</body>
</html>