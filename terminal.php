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
		<link rel="stylesheet" type="text/css" href="resources/styles/rootstyle.css"/>
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
				<div class="infoTitle">
					<img id="rigged" class="hidden" src="resources/images/actions/rigged.png"/>
					<h2 id="termName">
						<?php echo $terminal->getTerminalName() ?>
					</h2>
				</div>
				<div id="rootStatus" class="hidden">>> ROOTING TERMINAL</div>
				<div id="rootingTimer" class="timerContainer hidden">
					<div class="lcdBox">
						<div class="mmss">
							<span class="dseg BG">~~ ~~</span>
							<span class="dseg FG"></span>
						</div>
						<div class="hundsec">
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
								<span>[HACKING:&nbsp;+XX]</span>
							</div>
						</div>
						<div class="accessBox">
							<div class="accessHeader">
								EXTRA TAGS?
							</div>
							<div class="tagInterface">
								<button class="extraButton" onMouseUp="updateTags(-1, Session.EXTRA)"><b>-</b></button>
								<div class="lcdBox blue">
									<span id="extTagsBG" class="dseg BG">~~</span>
									<span id="extTags" class="dseg FG">XX</span>
								</div>
								<button class="extraButton" onMouseUp="updateTags(1, Session.EXTRA)">+</button>
							</div>
						</div>
					</div>
					<ul class="initItemList">
						<li id="disInit" class="initItem hidden">
							<input type="checkbox" id="disCheck" data-effect="dis" onchange="initCheck(this)"/>
							<label for="disCheck">
								<span class="initName">DISSIMULATOR:</span>
								<span class="initAbil">&nbsp;+1 HACKING?</span>
							</label>
						</li>
						<li id="cmmInit" data-id="1" class="initItem hidden">
							<input type="checkbox" id="cmmCheck" data-effect="[1,4]" onchange="initCheck(this)"/>
							<label for="cmmCheck">
								<span class="initName">CMM ARMS:</span>
								<span class="initAbil">&nbsp;Used Slip this Scene?</span>
							</label>
						</li>
						<li id="witEInit" data-id="2" class="initItem hidden">
							<input type="checkbox" id="witECheck" data-effect="2" onchange="initCheck(this)"/>
							<label for="witECheck">
								<span class="initName">WINTON WIT:</span>
								<span class="initAbil">&nbsp;Activated Embolden?</span>
							</label>
						</li>
						<li id="witIInit" data-id="2" class="initItem hidden">
							<input type="checkbox" id="witICheck" data-effect="3" onchange="initCheck(this)"/>
							<label for="witICheck">
								<span class="initName">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;</span>
								<span class="initAbil">&nbsp;Activated Inspire?</span>
							</label>
						</li>
						<li id="bradInit" data-id="8" class="initItem hidden">
							<input type="checkbox" id="bradCheck" data-effect="9" onchange="initCheck(this)"/>
							<label for="bradCheck">
								<span class="initName">REMOTE ACCESS DRIVE:</span>
								<span class="initAbil">&nbsp;Enable Remote Hacking?</span>
							</label>
						</li>
						<li id="shm0Init" data-id="18" class="initItem hidden">
							<input type="checkbox" id="shm0Check" data-effect="19" onchange="initCheck(this)"/>
							<label for="shm0Check">
								<span class="initName">CONSUMABLE:</span>
								<span class="initAbil">&nbsp;Using Shimmerstick T0?</span>
							</label>
						</li>
						<li id="shm1Init" data-id="19" class="initItem hidden">
							<input type="checkbox" id="shm1Check" data-effect="20" onchange="initCheck(this)"/>
							<label for="shm1Check">
								<span class="initName">CONSUMABLE:</span>
								<span class="initAbil">&nbsp;Using Shimmerstick T1?</span>
							</label>
						</li>
						<li id="viglInit" data-id="20" class="initItem hidden">
							<input type="checkbox" id="viglCheck" data-effect="21" onchange="initCheck(this)"/>
							<label for="viglCheck">
								<span class="initName">CONSUMABLE:</span>
								<span class="initAbil">&nbsp;Using Vigil?</span>
							</label>
						</li>
						<li id="clecInit" data-id="21" class="initItem hidden">
							<input type="checkbox" id="clecCheck" data-effect="22" onchange="initCheck(this)"/>
							<label for="clecCheck">
								<span class="initName">CLEC FINGERS:</span>
								<span class="initAbil">&nbsp;+1 Hacking (1/Sim)?</span>
							</label>
						</li>
						<li id="magInit" data-id="22" class="initItem hidden">
							<input type="checkbox" id="magCheck" data-effect="23" onchange="initCheck(this)"/>
							<label for="magCheck">
								<span class="initName">MAGSWEEP:</span>
								<span class="initAbil">&nbsp;Brick Device (1/Sim)?</span>
							</label>
						</li>
					</ul>
					<div class="accessSpacer"></div>
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
				<div id="termAccessTimer" class="timerContainer">
					<div class="lcdBox">
						<div class="mmss">
							<span class="dseg BG">~~ ~~</span>
							<span class="dseg FG">00:30</span>
						</div>
						<div class="hundsec">
							<span class="dseg BG">~~</span>
							<span class="dseg FG">00</span>
						</div>
					</div>
				</div>
				<button id="terminalButton" class="noPayload" onpointerup="accessTerminal(event)" disabled="">Please Submit Code...</button>
			</div>
			<div id="hackZone" class="zoneBox hidden">
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
								<div class="subContRepeatBox hidden">
									<span class="subContRepeatTitle">REPEAT</span>
									<div class="subContRepeatAM">
										<span class="subContRepeatIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContRepeatIndicator repeatIndicatorModify dimmed">MODIFY</span>
									</div>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("files") ?>
								</div>
							</div>
							<div id="darkwebContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">DARK WEB FILES</span>
								</div>
								<div class="subContRepeatBox hidden">
									<span class="subContRepeatTitle">REPEAT</span>
									<div class="subContRepeatAM">
										<span class="subContRepeatIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContRepeatIndicator repeatIndicatorModify dimmed">MODIFY</span>
									</div>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("darkweb") ?>
								</div>
							</div>
							<div id="camerasContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">CAMERAS</span>
								</div>
								<div class="subContRepeatBox hidden">
									<span class="subContRepeatTitle">REPEAT</span>
									<div class="subContRepeatAM">
										<span class="subContRepeatIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContRepeatIndicator repeatIndicatorModify dimmed">MODIFY</span>
									</div>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("cameras") ?>
								</div>
							</div>
							<div id="locksContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">LOCKS</span>
								</div>
								<div class="subContRepeatBox hidden">
									<span class="subContRepeatTitle">REPEAT</span>
									<div class="subContRepeatAM">
										<span class="subContRepeatIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContRepeatIndicator repeatIndicatorModify dimmed">MODIFY</span>
									</div>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("locks") ?>
								</div>
							</div>
							<div id="defensesContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">AUTOMATED DEFENSIVE SYSTEMS</span>
								</div>
								<div class="subContRepeatBox hidden">
									<span class="subContRepeatTitle">REPEAT</span>
									<div class="subContRepeatAM">
										<span class="subContRepeatIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContRepeatIndicator repeatIndicatorModify dimmed">MODIFY</span>
									</div>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("defenses") ?>
								</div>
							</div>
							<div id="utilitiesContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">UTILITY SYSTEMS</span>
								</div>
								<div class="subContRepeatBox hidden">
									<span class="subContRepeatTitle">REPEAT</span>
									<div class="subContRepeatAM">
										<span class="subContRepeatIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContRepeatIndicator repeatIndicatorModify dimmed">MODIFY</span>
									</div>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("utilities") ?>
								</div>
							</div>
							<div id="puzzlesContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">PUZZLES</span>
								</div>
								<div class="subContRepeatBox hidden">
									<span class="subContRepeatTitle">REPEAT</span>
									<div class="subContRepeatAM">
										<span class="subContRepeatIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContRepeatIndicator repeatIndicatorModify dimmed">MODIFY</span>
									</div>
								</div>
								<div class="subContBody">
									<?php echo $terminal->setupIconEntries("puzzles") ?>
								</div>
							</div>
						</div>
					</div>
					<div id="deckBody" class="hackBody">
						<div id="deckContentContainer" class="subContentContainer">
							<div id="actContent" class="subContent active">
								<div class="subContTitleRow">
									<span class="subContTitle">ACTIVE FUNCTIONS</span>
								</div>
								<div class="subContBody">
									<ul id="actList">
										<li id="brickItem" class="actItem hidden">
											<span class="actionName">BRICK</span>
											<button class="brickButton" data-enabled="true" data-cost="4" onclick="takeAction(this)">4 Tags</button>
										</li>
										<li id="rigItem" class="actItem hidden">
											<span class="actionName">RIGGED</span>
											<button class="rigButton" data-enabled="true" data-cost="6" onclick="takeAction(this)">6 Tags</button>
										</li>
										<li id="rootItem" class="actItem hidden">
											<span class="actionName">ROOT DEVICE</span>
											<button class="rootButton" data-enabled="true" data-cost="6" onclick="takeAction(this)">6 Tags</button>
										</li>
									</ul>
								</div>
							</div>
							<div id="passContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">PASSIVE FUNCTIONS</span>
								</div>
								<div class="subContBody">
									<ul id="passList">
										<li id="alarmItem" class="hidden">
											ALARM SENSE
										</li>
										<li id="bdItem" class="hidden">
											BACK DOOR
										</li>
										<li id="dwmItem" class="hidden">
											DARK WEB MERCHANT
										</li>
										<li id="dwoItem" class="hidden">
											DARK WEB OPERATOR
										</li>
										<li id="repeatItem" class="hidden">
											REPEAT
										</li>
									</ul>
								</div>
							</div>
							<div id="itemContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">INVENTORY</span>
								</div>
								<div class="subContBody">
									<div class="itemCat hidden" data-cat="deck">
										<h4>CYBERDECK</h4>
										<ul class="itemList">
										</ul>
									</div>
									<div class="itemCat hidden" data-cat="arms">
										<h4>WEAPONS / SHIELDS</h4>
										<ul class="itemList">
										</ul>
									</div>
									<div class="itemCat hidden" data-cat="cust">
										<h4>CUSTOMIZATIONS</h4>
										<ul class="itemList">
										</ul>
									</div>
									<div class="itemCat hidden" data-cat="util">
										<h4>UTILITY ITEMS</h4>
										<ul class="itemList">
										</ul>
									</div>
									<div class="itemCat hidden" data-cat="cons">
										<h4>CONSUMABLES</h4>
										<ul class="itemList">
										</ul>
									</div>
									<div class="itemCat hidden" data-cat="impl">
										<h4>IMPLANTS</h4>
										<ul class="itemList">
										</ul>
									</div>
								</div>
							</div>
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
				<span>&copy; CPU Larp <?php echo date("Y"); ?></span>
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
					<div id="modalBodyTimer"class="timerContainer hidden">
						<div class="lcdBox">
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
					<div class="modalBodyText">
					</div>
				</div>
				<div class="modalButtonRow" data-mode="none">
				</div>
			</div>
		</div>
	</body>
</html>