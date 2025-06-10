<!DOCTYPE html>
<?php
    require 'resources/scripts/terminal/db/startTerm.php';
?>
<html>
	<head>
		<title>TERMINAL</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta charset="UTF-8">
		<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"></script>
		<script type="text/javascript" src="resources/scripts/terminal/classes/session.js"></script>
		<script type="text/javascript" src="resources/scripts/terminal/classes/payload.js"></script>
		<script type="text/javascript" src="resources/scripts/terminal/classes/timer.js"></script>
		<script type="text/javascript" src="resources/scripts/terminal/classes/listener.js"></script>
		<script type="text/javascript" src="resources/scripts/terminal/terminalInterface.js"></script>
		<script type="text/javascript" src="resources/scripts/terminal/classes/gems.js" defer></script>
		<link rel="stylesheet" type="text/css" href="resources/styles/rootstyle.css"/>
		<link rel="stylesheet" type="text/css" href="resources/styles/termstyle.css"/>
	</head>
	<body>
		<div id="main"<?php echo $terminal->getMain() ?>>
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
			<div id="statusBar">
				<div id="itemStatus">
					<img id="petStatus" class="hidden" src=""/>
					<img id="shimStatus" class="hidden" src=""/>
				</div>
				<!-- CONNECTED USERS? -->
				<img id="serverStatus" src="resources/images/status/server_on.png"/>
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
					<div class="tagInterface">
						<div class="lcdBox blend">
							<span class="dseg BG">~~</span>
							<span id="reqTags" class="dseg FG">
								<?php echo str_pad($terminal->getTerminalAccessCost(),2,"0",STR_PAD_LEFT) ?>
							</span>
						</div>
					</div>
				</div>
				<div id="payloadBox" class="codeBox noPayload">
					<div id="payloadHeader" class="accessHeader">
						<span class="red backstroke" data-text="ERROR:">ERROR:</span><span class="backstroke" data-text="&nbsp;NO PAYLOAD FOUND">&nbsp;NO PAYLOAD FOUND</span>
					</div>
					<div id="payloadCodeHeader" class="codeHeader backstroke" data-text="ENTER PROFILE CODE">
						ENTER PROFILE CODE
					</div>
					<div id="payloadCodeRow" class="codeRow">
						<span class="dseg BG">~~~~~~</span>
						<input id="payloadCodeInput" type="number" class="codeInput dseg FG" size="6" max="999999" min="000000" minlength="6" maxlength="6" onkeydown="codeLimit(event)" onkeyup="activateCodeSubmit(event)"/>
					</div>
					<button id="payloadCodeSubmit" class="codeSubmit" onmouseUp="submitCode(event)" disabled>SUBMIT CODE</button>
					<span class="backstroke" data-text="OR">OR</span>
					<button id="payloadButton" onpointerup="window.open('./profile.php','_blank')">SETUP PAYLOAD PROFILE</button>
				</div>
				<div class="accessTagContainer">
					<div class="accessTagRow">
						<div class="accessBox">
							<div id="hackHeader" class="accessHeader">
								TAGS FROM HACKING FUNC:
							</div>
							<div class="tagInterface">
								<div class="lcdBox amber">
									<span class="dseg BG">~~</span>
									<span id="payTags" class="dseg FG">XX</span>
								</div>
							</div>
							<div id="hackDetails" class="tagDetails">
								<span>[HACKING:&nbsp;+XX]</span>
							</div>
						</div>
						<div class="accessBox blue">
							<div class="accessHeader">
								EXTRA TAGS?
							</div>
							<div class="tagInterface">
								<button class="extraButton" onMouseUp="updateTags(-1, Session.EXTRA)"><b>&minus;</b></button>
								<div class="lcdBox blue">
									<span id="extTagsBG" class="dseg BG">~~</span>
									<span id="extTags" class="dseg FG">XX</span>
								</div>
								<button class="extraButton" onMouseUp="updateTags(1, Session.EXTRA)">&plus;</button>
							</div>
							<div id="extraDetails" class="tagDetails">
							</div>
						</div>
					</div>
					<div id="roleTalentList" class="initItemList">
						<div id="disInit" class="initItem hidden">
							<div class="initHeader">DISSIMULATOR TALENT:</div>
							<div class="initGroup">
								<div class="initOption">
									<input type="radio" id="disOpt1" name="disRadio" value="plusHack" onclick="initRadio(this)">
									<label for="disOpt1">+1 HACKING</label>
								</div>
								<div class="initOption">
									<input type="radio" id="disOpt2" name="disRadio" value="k_HDS" onclick="initRadio(this)">
									<label for="disOpt2">KNOWLEDGE [Hacking &amp; DigiSec]</label>
								</div>
							</div>
						</div>
						<div id="polyInit" class="initItem hidden">
							<div class="initHeader">POLYMATH TALENT:</div>
							<div class="initGroup">
								<div class="initOption">
									<input type="radio" id="polyOpt1" name="polyRadio" value="alarmSense" onclick="initRadio(this)">
									<label for="polyOpt1">ALARM SENSE</label>
								</div>
								<div class="initOption">
									<input type="radio" id="polyOpt2" name="polyRadio" value="plusRepair" onclick="initRadio(this)">
									<label for="polyOpt2">+1 REPAIR</label>
								</div>
							</div>
						</div>
					</div>
					<div class="initItemList">
						<div id="cmm_init" class="initItem hidden">
							<div class="initHeader">CMM ARMS:</div>
							<div class="initOption">
								<input type="checkbox" id="cmm_opt" onclick="initCheck(this)">
								<label for="cmm_opt">Used Slip this Scene?</label>
							</div>
						</div>
						<div id="impl_clec_init" class="initItem hidden">
							<div class="initHeader">CLEC FINGERS:</div>
							<div class="initOption">
								<input type="checkbox" id="impl_clec_opt" onclick="initCheck(this)">
								<label for="impl_clec_opt">+1 HACKING (1/Sim)?</label>
							</div>
						</div>
						<li id="shim_0_init" class="initItem hidden">
							<div class="initHeader">SHIMMERSTICK [T0]:</div>
							<div class="initUses">USES LEFT: <span class="useSum"></span></div>
							<div class="initOption">
								<input type="checkbox" id="shim_0_opt" onclick="initCheck(this)">
								<label for="shim_0_opt">Apply to this Device?<span class="hasDeck hidden"><br/>(Can apply later)</span><span class="noDeck hidden"><br/>(This can be used in lieu of a Cyberdeck)</span></label>
							</div>
						</li>
						<li id="shim_1_init" class="initItem hidden">
							<div class="initHeader">SHIMMERSTICK [T1]:</div>
							<div class="initUses">USES LEFT: <span class="useSum"></span></div>
							<div class="initOption">
								<input type="checkbox" id="shim_1_opt" onclick="initCheck(this)">
								<label for="shim_1_opt">Apply to this Device?<span class="hasDeck hidden"><br/>(Can apply later)</span><span class="noDeck hidden"><br/>(This can be used in lieu of a Cyberdeck)</span></label>
							</div>
						</li>
						<li id="vigil_init" class="initItem hidden">
							<div class="initHeader">VIGIL:</div>
							<div class="initOption">
								<input type="checkbox" id="vigil_opt" onclick="initCheck(this)">
								<label for="vigil_opt">Consumed dose before Scene?</label>
							</div>
						</li>
						<div id="brad_init" class="initItem hidden">
							<div class="initHeader">BUDGET ACCESS REMOTE DRIVE:</div>
							<div class="initOption">
								<button onclick="initAction(this)">Set up for Remote Contractor?<span class="hasDeck hidden"><br/>(Can set up later)</span></button>
							</div>
						</div>
						<li id="impl_mags_init" class="initItem hidden">
							<div class="initHeader">CANOPIC JAR [MAGSWEEP]:</div>
							<div class="initOption">
								<button onclick="initAction(this)">Brick Device?</button>
							</div>
						</li>
					</div>
					<div class="accessSpacer"></div>
					<div class="accessBox">
						<div class="accessHeader">
							TAGS REMAINING AFTER ACCESS:
						</div>
						<div class="tagInterface">
							<div class="lcdBox blue">
								<span id="remTagBG" class="dseg BG">~~</span>
								<span id="remTags" class="dseg FG">XX</span>
							</div>
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
								<div id="masherBox" class="codeBox">
									<div id="masherCodeHeader" class="codeHeader">
										ENTER PROFILE CODE FOR BUTTON MASHER ASSISTANCE
									</div>
									<div id="masherCodeRow" class="codeRow">
										<span class="dseg BG">~~~~~~</span>
										<input id="masherCodeInput" type="number" class="codeInput dseg FG" size="6" max="999999" min="000000" minlength="6" maxlength="6" onkeydown="codeLimit(event)" onkeyup="activateBMCodeSubmit(event)"/>
									</div>
									<button id="masherCodeSubmit" class="codeSubmit" onmouseUp="submitBMCode(event)" disabled>SUBMIT CODE</button>
								</div>
							</div>
							<div id="filesContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">FILES</span>
								</div>
								<div class="subContModifierBox touchedBox hidden">
									<span class="subContModifierTitle">TOUCHED</span>
									<div class="subContModifierTouched">
										<span class="subContModifierIndicator touchedIndicator dimmed">TOUCHED</span>
									</div>
								</div>
								<div class="subContModifierBox repeatBox hidden">
									<span class="subContModifierTitle">REPEAT</span>
									<div class="subContModifierAM">
										<span class="subContModifierIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContModifierIndicator repeatIndicatorModify dimmed">MODIFY</span>
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
								<div class="subContModifierBox touchedBox hidden">
									<span class="subContModifierTitle">TOUCHED</span>
									<div class="subContModifierTouched">
										<span class="subContModifierIndicator touchedIndicator dimmed">TOUCHED</span>
									</div>
								</div>
								<div class="subContModifierBox repeatBox hidden">
									<span class="subContModifierTitle">REPEAT</span>
									<div class="subContModifierAM">
										<span class="subContModifierIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContModifierIndicator repeatIndicatorModify dimmed">MODIFY</span>
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
								<div class="subContModifierBox touchedBox hidden">
									<span class="subContModifierTitle">TOUCHED</span>
									<div class="subContModifierTouched">
										<span class="subContModifierIndicator touchedIndicator dimmed">TOUCHED</span>
									</div>
								</div>
								<div class="subContModifierBox repeatBox hidden">
									<span class="subContModifierTitle">REPEAT</span>
									<div class="subContModifierAM">
										<span class="subContModifierIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContModifierIndicator repeatIndicatorModify dimmed">MODIFY</span>
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
								<div class="subContModifierBox touchedBox hidden">
									<span class="subContModifierTitle">TOUCHED</span>
									<div class="subContModifierTouched">
										<span class="subContModifierIndicator touchedIndicator dimmed">TOUCHED</span>
									</div>
								</div>
								<div class="subContModifierBox repeatBox hidden">
									<span class="subContModifierTitle">REPEAT</span>
									<div class="subContModifierAM">
										<span class="subContModifierIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContModifierIndicator repeatIndicatorModify dimmed">MODIFY</span>
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
								<div class="subContModifierBox touchedBox hidden">
									<span class="subContModifierTitle">TOUCHED</span>
									<div class="subContModifierTouched">
										<span class="subContModifierIndicator touchedIndicator dimmed">TOUCHED</span>
									</div>
								</div>
								<div class="subContModifierBox repeatBox hidden">
									<span class="subContModifierTitle">REPEAT</span>
									<div class="subContModifierAM">
										<span class="subContModifierIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContModifierIndicator repeatIndicatorModify dimmed">MODIFY</span>
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
								<div class="subContModifierBox touchedBox hidden">
									<span class="subContModifierTitle">TOUCHED</span>
									<div class="subContModifierTouched">
										<span class="subContModifierIndicator touchedIndicator dimmed">TOUCHED</span>
									</div>
								</div>
								<div class="subContModifierBox repeatBox hidden">
									<span class="subContModifierTitle">REPEAT</span>
									<div class="subContModifierAM">
										<span class="subContModifierIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContModifierIndicator repeatIndicatorModify dimmed">MODIFY</span>
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
								<div class="subContModifierBox touchedBox hidden">
									<span class="subContModifierTitle">TOUCHED</span>
									<div class="subContModifierTouched">
										<span class="subContModifierIndicator touchedIndicator dimmed">TOUCHED</span>
									</div>
								</div>
								<div class="subContModifierBox repeatBox hidden">
									<span class="subContModifierTitle">REPEAT</span>
									<div class="subContModifierAM">
										<span class="subContModifierIndicator repeatIndicatorAccess dimmed">ACCESS</span>
										<span class="subContModifierIndicator repeatIndicatorModify dimmed">MODIFY</span>
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
										<li id="noActFuncs">
											<span class="actItem">
												<span class="actionName">NO ACTIVE FUNCTIONS</span>
											</span>
										</li>
										<li id="brickItem" class="hidden">
											<span class="actItem">
												<span class="actionName">BRICK</span>
												<button class="brickButton" data-enabled="true" data-cost="4" onclick="takeAction(this)">4 Tags</button>
											</span>
										</li>
										<li id="rigItem" class="hidden">
											<span class="actItem">
												<span class="actionName">RIGGED</span>
												<button class="rigButton" data-enabled="true" data-cost="6" onclick="takeAction(this)">6 Tags</button>
											</span>
										</li>
										<li id="rootItem" class="hidden">
											<span class="actItem">
												<span class="actionName">ROOT DEVICE</span>
												<button class="rootButton" data-enabled="true" data-cost="6" onclick="takeAction(this)">6 Tags</button>
											</span>
										</li>
										<li id="siphItem" class="hidden">
											<span class="actItem">
												<span class="actionName">SIPHON CHARGE</span>
												<button class="siphButton" data-enabled="true" data-cost="2" onclick="takeAction(this)">2 Tags</button>
											</span>
										</li>
										<hr id="actSeparator" class="hidden"/>
										<li id="pingItem" class="hidden">
											<span class="actItem">
												<span class="actionName">REFERSH PING FUNCTION</span>
												<button class="pingButton" data-enabled="true" data-cost="1" onclick="takeAction(this)">1 Tag</button>
											</span>
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
										<li id="noPassFuncs">
											<span class="actionName">NO PASSIVE FUNCTIONS</span>
										</li>
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
										<hr id="passSeparator" class="hidden"/>
										<li id="knowItem" class="hidden">
											KNOWLEDGE
											<ul>
											</ul>
										</li>
									</ul>
								</div>
							</div>
							<div id="itemContent" class="subContent">
								<div class="subContTitleRow">
									<span class="subContTitle">INVENTORY</span>
								</div>
								<div class="subContBody">
									<div id="noItems" class="itemCat">
										<ul>
											<li>
												NO ITEMS
											</li>
										</ul>
									</div>
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
				<div class="modalOverlay hidden"></div>
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