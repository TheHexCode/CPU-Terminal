<!DOCTYPE html>
<?php
    require 'resources/scripts/profile/db/startProfile.php';
?>
<html>
	<head>
		<title>PAYLOAD PROFILE</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"></script>
		<script type="text/javascript" src="/resources/scripts/font/fontManip.js"></script>
		<script type="text/javascript" src="/resources/scripts/profile/profileInterface.js"></script>
        <link rel="stylesheet" type="text/css" href="/resources/styles/rootstyle.css"/>
		<link rel="stylesheet" type="text/css" href="/resources/styles/prostyle.css"/>
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
			<h1>PAYLOAD CUSTOMIZATION</h1>
			<div class="lmLoginBox">
				<h2>CPU LARPMANAGER LOGIN</h2>
                <form id="lmLogin" autocomplete="off" onSubmit="lmLogin(event)">
                    <div class="lmLoginRow">
                        <label for="lmEmail">Email:</label>
                        <input type="email" id="lmEmail" form="lmLoginForm" onkeyup="lmEnter(event)" required></input>
                    </div>
                    <div class="lmLoginRow">
                        <label for="lmPass">Password:</label>
                        <input type="password" id="lmPass" form="lmLoginForm" onkeyup="lmEnter(event)" required></input>
                    </div>
                    <button type="submit" form="lmLogin">Log in to CPU LarpManager</button>
                </form>
			</div>
			<div class="postLogon hidden"> <!--hidden-->
				<div class="zoneBox">
					<div id="payloadCharHeader">
						SELECTED CHARACTER:
					</div>
					<div id="payloadCharName">
					</div>
					<div id="payloadCodeHeader">
						PAYLOAD CODE:
					</div>
					<div id="payloadCodeRow">
						<span class="dseg BG">~~~~~~</span>
						<span class="dseg FG"></span>
					</div>
				</div>
				<div class="zoneBox">
					<!-- myLarp Functions
					<h2 id="skillBoxHeader">
						FUNCTIONS FROM MYLARP PROFILE:
					</h2>
					<div id="skillTypes">
						<div id="initialHeader" class="skillTypeHeader hidden">
							>> PRE-ACCESS FUNCTIONS
						</div>
						<ul id="initialList" class="skillTypeList hidden">
						</ul>
						<div id="activeHeader" class="skillTypeHeader hidden">
							>> ACTIVE FUNCTIONS
						</div>
						<ul id="activeList" class="skillTypeList hidden">
						</ul>
						<div id="passiveHeader" class="skillTypeHeader hidden">
							>> PASSIVE FUNCTIONS
						</div>
						<ul id="passiveList" class="skillTypeList hidden">
						</ul>
					</div>
					-->
					<!-- SELF REPORT FUNCTIONS -->
					<?php echo getOriginRadios($roleArray); ?>
					<script id="tempScript">$("#origin1").prop("data-active",true);$("#tempScript").remove();</script>
					<hr/>
					<div class="infoRole">
						<label for="roleSelect">Role:</label>
						<select id="roleSelect" onchange="changeRole(this)">
							<?php echo getRoleSelect($roleArray); ?>
						</select>
						<label for="pathSelect">Path:</label>
						<select id="pathSelect" onchange="changePath(this)" disabled>
							<option value="" selected>--</option>
							<?php echo getPathSelect($pathArray); ?>
						</select>
					</div>
					<hr/>
					<?php echo fillRoleSection($roleArray, $pathArray, $sourceArray, $modArray, $funcArray, $keywordArray, $profArray, $profChoiceArray, $knowArray, $entryArray, $entryFuncArray); ?>
				</div>
				<div id="itemBox" class="zoneBox">
					<?php echo getItemsTab(); ?>
				</div>
				<div id="saveBar">
					<span id="saveText" class="hidden">SAVED!</span>
					<div class="spacer"></div>
					<form id="statsForm" onsubmit="statSubmit(event)">
						<button type="submit" form="statsForm">SAVE PAYLOAD DATA TO PROFILE</button>
					</form>
				</div>
			</div>
			<footer>
				<span>&copy; CPU Larp <?php echo date("Y"); ?></span>
			</footer>
        </div>
        <div id="modalBG">
			<div id="charSelectModal" class="modalBox">
				<div class="modalHeaderRow">
					<span class="modalHeaderText"></span>
					<span class="modalClose" onpointerup="closeModal(event)" onkeyup="closeModal(event)">&#xf1398;</span>
				</div>
				<div class="modalBody">
					<div class="modalBodyText">
					</div>
				</div>
			</div>
		</div>
    </body>
</html>