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
		<!--<script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
		<link rel="stylesheet" href="https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css">-->
		<script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"></script>
		<script type="text/javascript" src="resources/scripts/font/fontManip.js"></script>
		<script type="text/javascript" src="resources/scripts/profile/profileInterface.js"></script>
        <link rel="stylesheet" type="text/css" href="resources/styles/rootstyle.css"/>
		<link rel="stylesheet" type="text/css" href="resources/styles/prostyle.css"/>
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
			<div class="mlLoginBox">
				<h2>MYLARP LOGIN</h2>
                <form id="mlLogin" autocomplete="off" onSubmit="mlLogin(event)">
                    <div class="mlLoginRow">
                        <label for="mlEmail">myLarp Email:</label>
                        <input type="email" id="mlEmail" form="mlLoginForm" onkeyup="mlEnter(event)" required></input>
                    </div>
                    <div class="mlLoginRow">
                        <label for="mlPass">myLarp Password:</label>
                        <input type="password" id="mlPass" form="mlLoginForm" onkeyup="mlEnter(event)" required></input>
                    </div>
                    <button type="submit" form="mlLogin">Log in to myLarp</button>
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
					<!-- NEW FUNCTIONS --
					<hr/>
					<div class="infoRole">
						<label for="primaryRole">Primary Role:</label>
						<select id="primaryRole" onchange="roleChange()">
							<option value="none">-Select-</option>
							<?php //echo getRoleSelect(); ?>
							<option value="other">Other</option>
						</select>
					</div>
					<div class="infoRole">
						<label for="secondaryRole">Secondary Role:</label>
						<select id="secondaryRole" onchange="roleChange()">
							<option value="none">-Select-</option>
							<?php //echo getRoleSelect(); ?>
							<option value="other">Other</option>
						</select>
					</div>-->
				</div>
				<div class="zoneBox">
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