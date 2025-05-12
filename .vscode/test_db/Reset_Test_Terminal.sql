UPDATE sim_active_codes
	SET jobCode = 'ABC1234';

INSERT INTO sim_terminals
           (slug, jobCode, displayName, access, state, stateData)
     VALUES
           ('test', 'ABC1234', 'Test Terminal', 2, 'active', NULL);

 -- SET @TermID = 1;
SET @TermID = LAST_INSERT_ID();

INSERT INTO sim_access_logs
           (terminal_id, user_id, mask, reassignee, state)
     VALUES
           (@TermID, NULL, 'WYV3RN', NULL, 'initial'),
		   (@TermID, NULL, 'Z1GZ4G', NULL, 'initial');

INSERT INTO sim_entries
           (terminal_id, icon, path, type, access, modify, title, contents, state)
     VALUES
		   (@TermID,'files','0','entry',0,1,'Paydata','10 Credits','initial'),
		   (@TermID,'files','1','trap',1,2,NULL,'["3 Strikes to Torso!"]','initial'),
		   (@TermID,'files','2','entry',2,3,'Mission Data','Mission Data #1/3','initial'),
		   (@TermID,'files','3','ice',NULL,3,'SNITCHES 2','["ALARM","FEAR 30s","MARKED"]','initial'),
		   (@TermID,'files','3-0','entry',1,2,'Mission Data','Mission Data #2/3','initial'),
		   (@TermID,'files','3-1','ice',NULL,2,'WATCHER 1','["ALARM"]','initial'),
		   (@TermID,'files','3-1-0','entry',1,2,'Paydata','100 Credits','initial'),
		   (@TermID,'files','3-2','entry',2,3,'Paydata','15 Credits','initial'),
		   (@TermID,'darkweb','0','entry',3,4,'Paydata','20 Credits','initial'),
		   (@TermID,'darkweb','1','entry',4,5,'Mission Data','Mission Data #3/3','initial'),
		   (@TermID,'cameras','0','entry',0,1,'Test Camera',NULL,'initial'),
		   (@TermID,'locks','0','entry',0,1,'Test Lock',NULL,'initial'),
		   (@TermID,'defenses','0','entry',0,1,'Test ADS',NULL,'initial'),
		   (@TermID,'utilities','0','power',0,1,'Test Power',NULL,'initial'),
		   (@TermID,'utilities','1','alarm',0,1,'Test Alarm',NULL,'initial');