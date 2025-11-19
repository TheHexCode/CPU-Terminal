-- Active: 1745412174410@@127.0.0.1@3306@dbiykpinec1m8s

USE dbiykpinec1m8s;

####################################################################################################
###
###     CPU >> GENERAL
###
####################################################################################################

CREATE TABLE cpu_orgs (
    id          INT     AUTO_INCREMENT,
    name        TEXT    NOT NULL,
    discovered  BOOLEAN NOT NULL,
    PRIMARY KEY (id)
)

CREATE TABLE ice_types (
    type    VARCHAR(255),
    PRIMARY KEY (type)
);

CREATE TABLE ice_tiers (
    id      INT             AUTO_INCREMENT,
    type    VARCHAR(255)    NOT NULL,
    tier    INT             NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (type)
        REFERENCES ice_types(type)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT ice_type_tier UNIQUE (type, tier)
)

CREATE TABLE ice_effects (
    tier_id  INT    NOT NULL,
    effect  TEXT    NOT NULL,
    FOREIGN KEY (tier_id)
        REFERENCES ice_tiers(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

####################################################################################################
###
###     SIM >> STUFF NEEDED FOR A PARTICULAR SIMULATION
###
####################################################################################################

CREATE TABLE sim_active_codes (
    simCode TEXT    NOT NULL,
	jobCode TEXT    NOT NULL
);

CREATE TABLE sim_terminals (
    id              INT     AUTO_INCREMENT,
    slug 		    TEXT    NOT NULL,
    jobCode 	    TEXT    NOT NULL,
    displayName     TEXT,
    access 		    INT		NOT NULL,
	state 		    TEXT    NOT NULL,
	stateData 	    INT,
    owner_id        INT,
	PRIMARY KEY (id),
    FOREIGN KEY (owner_id)
        REFERENCES cpu_orgs(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE sim_entries (
    id          INT     AUTO_INCREMENT,
    terminal_id INT     NOT NULL,
    icon        TEXT    NOT NULL, /* ('files','darkweb','cameras','locks','defenses','utilities') */
    path        TEXT    NOT NULL,
    type        TEXT    NOT NULL,
    access      INT,
    modify      INT,
    title       TEXT,
    contents    TEXT,
    state       TEXT,
    previous    TEXT,
    PRIMARY KEY (id),
    FOREIGN KEY (terminal_id)
        REFERENCES sim_terminals(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE sim_puzzles (
    id          INT     AUTO_INCREMENT,
    terminal_id INT     NOT NULL,
    puzzle_type TEXT    NOT NULL, /* ('free_rp', 'rev_mm', 'black_box') */
    cost        INT     NOT NULL,
    `repeat`    INT,              /* NULL = Non-Repeatable; <=0 = Infinite; >0 = Repeatable Up To # Of Times */
    know_reqs   TEXT,
    reward_type TEXT    NOT NULL, /* ('tags', 'item') */
    reward      TEXT,
    global      BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (terminal_id)
        REFERENCES sim_terminals(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE users (
    lm_id       INT     NOT NULL UNIQUE,
    userCode    TEXT    NOT NULL,
    charName    TEXT    NOT NULL,
    PRIMARY KEY (lm_id)
);

CREATE TABLE sim_access_logs (
    id          INT     AUTO_INCREMENT,
    terminal_id INT     NOT NULL,
    user_id     INT,
    mask        TEXT,
    reassignee  TEXT,
    state       TEXT    NOT NULL,
    tags        INT,
    PRIMARY KEY (id),
    FOREIGN KEY (terminal_id)
        REFERENCES sim_terminals(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (user_id)
        REFERENCES users(lm_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

####################################################################################################
###
###     ITEMS
###
####################################################################################################
/*
CREATE TABLE items (
    abbr        VARCHAR(50) NOT NULL UNIQUE,
    name        TEXT        NOT NULL,
    tier        INT,
    category    TEXT        NOT NULL,
    radio       TEXT,
    PRIMARY KEY (abbr)
);

CREATE TABLE item_effects (
    abbr        VARCHAR(50) NOT NULL UNIQUE,
    use_loc     TEXT        NOT NULL,
    req_type    TEXT,
    requirement TEXT,
    charges     INT,
    per_type    TEXT,
    notes       TEXT,
    PRIMARY KEY (abbr)
);

CREATE TABLE items_to_effects (
    item_abbr   VARCHAR(50) NOT NULL,
    effect_abbr VARCHAR(50) NOT NULL,
    FOREIGN KEY (item_abbr)
        REFERENCES items(abbr)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (effect_abbr)
        REFERENCES item_effects(abbr)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
*/
CREATE TABLE user_items (
    user_id         INT             NOT NULL,
    item            VARCHAR(255)    NOT NULL,
    tier            INT             NOT NULL,
    instance_key    VARCHAR(255),
    instance_value  VARCHAR(255),
    count           INT,
    CONSTRAINT userItem
        PRIMARY KEY (user_id, item, tier, instance_key, instance_value),
    FOREIGN KEY (user_id)
        REFERENCES users(lm_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE item_uses (
    user_id     INT             NOT NULL,
    effect      VARCHAR(255)    NOT NULL,
    simCode     TEXT            NOT NULL,
    jobCode     TEXT            NOT NULL,
    terminal_id INT             NOT NULL,
    FOREIGN KEY (user_id)
        REFERENCES users(lm_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (terminal_id)
        REFERENCES sim_terminals(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE sim_user_actions (
    id          INT         AUTO_INCREMENT,
    time        TIMESTAMP   NOT NULL,
    user_id     INT         NOT NULL,
    target_type TEXT        NOT NULL,
    target_id   TEXT        NOT NULL,
    action      TEXT        NOT NULL,
    newState    TEXT        NOT NULL,
    cost        INT         NOT NULL,
    global      BOOLEAN     NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES users(lm_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE sim_session_effects (
    terminal_id INT             NOT NULL,
    effect_name VARCHAR(255)    NOT NULL,
    CONSTRAINT session_effect
        PRIMARY KEY (terminal_id, effect_name),
    FOREIGN KEY (terminal_id)
        REFERENCES sim_terminals(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE sim_payload_effects (
    user_id         INT             NOT NULL,
    effect_name     VARCHAR(255)    NOT NULL,
    effect_values   VARCHAR(255),
    duration        VARCHAR(50),
    CONSTRAINT payload_effect
        PRIMARY KEY (user_id, effect_name, duration),
    FOREIGN KEY (user_id)
        REFERENCES users(lm_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

####################################################################################################
###
###     CPU >> LARPMANAGER
###
####################################################################################################

CREATE TABLE cpu_roles (
    id      INT     AUTO_INCREMENT,
    lm_id   INT     NOT NULL,
    name    TEXT    NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE cpu_paths (
    id      INT     AUTO_INCREMENT,
    role_id INT     NOT NULL,
    name    TEXT    NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id)
        REFERENCES cpu_roles(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE cpu_mods (
    id      INT     AUTO_INCREMENT,
    name    TEXT    NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE cpu_sources (
    id      INT     AUTO_INCREMENT,
    name    TEXT    NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE cpu_keywords (
    id      INT     AUTO_INCREMENT,
    name    TEXT    NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE cpu_proficiencies (
    id      INT     AUTO_INCREMENT,
    name    TEXT    NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE cpu_knowledges (
    id      INT     AUTO_INCREMENT,
    name    TEXT    NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE cpu_functions (
    id          INT     AUTO_INCREMENT,
    name        TEXT    NOT NULL,
    keyworded   BOOL    NOT NULL,
    type        TEXT    NOT NULL,
    hacking_cat TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE cpu_abilities (
    id      INT     AUTO_INCREMENT,
    lm_id   INT,
    role_id INT     NOT NULL,
    path_id INT,
    tier    INT     NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id)
        REFERENCES cpu_roles(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (path_id)
        REFERENCES cpu_paths(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE cpu_ability_functions (
    id              INT     AUTO_INCREMENT,
    ability_id      INT     NOT NULL,
    mod_id          INT,
    source_id       INT,
    func_id         INT     NOT NULL,
    keyword_id      INT,
    keyword_type    TEXT,
    keyword_choose  BOOL,
    `rank`          INT,
    PRIMARY KEY (id),
    FOREIGN KEY (ability_id)
        REFERENCES cpu_abilities(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (mod_id)
        REFERENCES cpu_mods(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (source_id)
        REFERENCES cpu_sources(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (func_id)
        REFERENCES cpu_functions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE user_abilities (
    user_id         INT     NOT NULL,
    ability_id      INT     NOT NULL,
    keyword_id      INT,
    CONSTRAINT userFunction
        PRIMARY KEY (user_id, ability_id),
    FOREIGN KEY (user_id)
        REFERENCES users(lm_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (ability_id)
        REFERENCES cpu_abilities(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);