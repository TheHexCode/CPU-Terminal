<!DOCTYPE html>
<?php
    require 'resources\\scripts\\db\\startProfile.php';
?>
<html>
	<head>
		<title>PAYLOAD PROFILE</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
		<script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
		<link rel="stylesheet" href="https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css">
		<script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"></script>
		<script type="text/javascript" src="resources/scripts/profileInterface.js"></script>
		<link rel="stylesheet" type="text/css" href="resources/styles/prostyle.css"/>
	</head>
	<body>
        <div id="main">
			<h1>PAYLOAD CUSTOMIZATION</h1>
			<div class="infoBox">
				<h2>PAYLOAD PREVIEW</h2>
				<div class="infoGrid">
					<div class="infoName">
						<label for="handle">Character Name/Handle:<span class="red">*</span></label>
						<input type="text" id="handle" form="statsForm" maxlength="15" required></input>
					</div>
					<div id="maskName" class="infoName dimmed">
						<label for="mask">Default Mask:</label>
						<input type="text" id="mask" form="statsForm" placeholder="Leave blank for anonymous log entry" maxlength="15" disabled></input>
					</div>
					<div class="infoRole">
						<label for="primaryRole">Primary Role:</label>
						<select id="primaryRole" onchange="roleChange()">
							<option value="none">-Select-</option>
							<?php echo fillRoleSelection($profileResponse); ?>
							<option value="other">Other</option>
						</select>
					</div>
					<div class="infoRole">
						<label for="secondaryRole">Secondary Role:</label>
						<select id="secondaryRole" onchange="roleChange()">
							<option value="none">-Select-</option>
							<?php echo fillRoleSelection($profileResponse); ?>
							<option value="other">Other</option>
						</select>
					</div>
				</div>
			</div>
            <div class="zoneBox">
				<div id="profTabContainer">
					<div class="tabSubContainer frontRow">
						<button class="profTab active" onclick="openTab(this,'stndTab')">STANDARD</button>
						<button id="priButton" class="profTab" onclick="openTab(this,'priTab')">PRIMARY</button>
					</div>
					<div class="tabSubContainer backRow">
						<button id="secButton" class="profTab" onclick="openTab(this,'secTab')">SECONDARY</button>
						<button class="profTab" onclick="openTab(this,'itemsTab')">ITEMS</button>
					</div>
				</div>
				<div id="stndTab" class="profContent"><!-- STANDARD-->
					<?php echo fillProfileTab("STANDARD", $profileResponse); ?>
				</div>
				<div id="priTab" class="profContent hidden"><!-- PRIMARY -->
					<section class="checkGroup" data-role="none">
						<h2>NO PRIMARY ROLE SELECTED</h2>
						<p>Please select a <em>Primary_Role</em> in the dropdown above, even if it's <em>Other</em>.</p>
                    </section>
                    <section class="checkGroup hidden" data-role="other">
						<h2>OTHER PRIMARY ROLE SELECTED</h2>
						<p>Your <em>Primary_Role</em> is not one which provides any hacking benefits. If you have a <em>Secondary_Role</em>, make sure to select them in the dropdown above, or utilize the <em>Standard_Role</em> for your payload.</p>
					</section>
                    <?php echo fillProfileTab("PRIMARY", $profileResponse); ?>
                </div>
                <div id="secTab" class="profContent hidden"><!--SECONDARY-->
                    <section class="checkGroup" data-role="none">
						<h2>NO SECONDARY ROLE SELECTED</h2>
						<p>If you have a <em>Secondary_Role</em>, please select it in the dropdown above. Otherwise, if you do not have a <em>Secondary_Role</em>, this text is what you should expect to see.</p>
                    </section>
                    <section class="checkGroup hidden" data-role="other">
						<h2>OTHER SECONDARY ROLE SELECTED</h2>
						<p>Your <em>Secondary_Role</em> is not one which provides any hacking benefits. You'll have to rely on your <em>Primary_Role</em> or the <em>Standard_Role</em> for your payload.</p>
					</section>
                    <?php echo fillProfileTab("SECONDARY", $profileResponse); ?>
                </div>
                <div id="itemsTab" class="profContent hidden"><!--  ITEMS  -->
					<section class="check">
						<h2>CYBERDECKS</h2>
						<div class="radio">
							<input type="radio" id="item_deck_budget_radio" name="item_deck" data-item="deck_budget" form="statsForm" onclick="toggleRadio(this)">
							<label for="item_deck_budget_radio">Budget Cyberdeck</label>
						</div>
						<div class="radio">
							<input type="radio" id="item_deck_crdspider_radio" name="item_deck" data-item="deck_crdspider" form="statsForm" onclick="toggleRadio(this)">
							<label for="item_deck_crdspider_radio">CRD Spider Cyberdeck</label>
						</div>
						<div class="radio">
							<input type="radio" id="item_deck_mmconsole_radio" name="item_deck" data-item="deck_mmconsole" form="statsForm" onclick="toggleRadio(this)">
							<label for="item_deck_mmconsole_radio">MM Console</label>
						</div>
						<div class="radio">
							<input type="radio" id="item_deck_johnnyst_radio" name="item_deck" data-item="deck_johnnyspecialtouch" form="statsForm" onclick="toggleRadio(this)">
							<label for="item_deck_johnnyst_radio">Johnny's Special Touch</label>
						</div>
						<div class="radio">
							<input type="radio" id="item_deck_fkddc17_radio" name="item_deck" data-item="deck_fkddc17" form="statsForm" onclick="toggleRadio(this)">
							<label for="item_deck_fkddc17_radio">FKD DC-17</label>
						</div>
					</section>
					<section class="checkGroup">
						<h2>WEAPONS/SHIELDS</h2>
						<div class="check">
							<input type="checkbox" id="item_arms_cmmwidow_check" form="statsForm" data-item="arms_cmmwidow">
							<label for="item_arms_cmmwidow_check">CMM Widow [1HR]</label>
						</div>
						<div class="check">
							<input type="checkbox" id="item_arms_cmmcocoon_check" form="statsForm" data-item="arms_cmmcocoon">
							<label for="item_arms_cmmcocoon_check">CMM Cocoon [SmSh]</label>
						</div>
					</section>
					<section class="checkGroup">
						<h2>CUSTOMIZATIONS</h2>
						<div class="check">
							<input type="checkbox" id="item_cust_copycat_check" form="statsForm" data-item="cust_copycat">
							<label for="item_cust_copycat_check">Copycat</label>
						</div>
						<div class="radio">
							<input type="radio" id="item_cust_pockhack_0_radio" name="item_cust_pockhack" form="statsForm" data-item="cust_pockethacker_t0" onclick="toggleRadio(this)">
							<label for="item_cust_pockhack_0_radio">Pocket Hacker [Tier 0]</label>
						</div>
						<div class="radio">
							<input type="radio" id="item_cust_pockhack_1_radio" name="item_cust_pockhack" form="statsForm" data-item="cust_pockethacker_t1" onclick="toggleRadio(this)">
							<label for="item_cust_pockhack_1_radio">Pocket Hacker [Tier 1]</label>
						</div>
					</section>
					<section class="checkGroup">
						<h2>UTILITY ITEMS</h2>
						<div class="check">
							<input type="checkbox" id="item_util_csbeacon_check" form="statsForm" data-item="util_ciphersyncbeacon">
							<label for="item_util_csbeacon_check">CipherSync Beacon</label>
						</div>
						<!--<div class="check">
							<input type="checkbox" id="item_util_nerdsg_check" form="statsForm"> <!--data-item="util_nerdsafetyglasses">--><!--
							<label for="item_util_nerdsg_check">Nerd's Safety Glasses</label>
						</div>-->
						<div class="check">
							<input type="checkbox" id="item_util_pguh9k_check" form="statsForm" data-item="util_powerglove_uh9k">
							<label for="item_util_pguh9k_check">Power Glove [Ultra-Hacking 9000]</label>
						</div>
						<div class="radio">
							<input type="radio" id="item_util_shimstck_0_radio" name="item_util_shimstck" form="statsForm" data-item="util_shimmerstick_t0" onclick="toggleRadio(this)">
							<label for="item_util_shimstck_0_radio">Shimmerstick [Tier 0]</label>
						</div>
						<div class="radio">
							<input type="radio" id="item_util_shimstck_1_radio" name="item_util_shimstck" form="statsForm" data-item="util_shimmerstick_t1" onclick="toggleRadio(this)">
							<label for="item_util_shimstck_1_radio">Shimmerstick [Tier 1]</label>
						</div>
					</section>
				</div>
            </div>
            <div id="saveBar">
				<span id="saveText" class="hidden">SAVED!</span>
				<div class="spacer"></div>
				<form id="statsForm" onsubmit="statSubmit(event)">
					<button type="submit" form="statsForm">SAVE PAYLOAD DATA TO PROFILE</button>
				</form>
			</div>
			<div id="spacer"></div>
			<button onclick="testML()">Test myLarp API</button>
			<footer>
				<span>© CPU Larp 2025</span>
			</footer>
        </div>
    </body>
</html>