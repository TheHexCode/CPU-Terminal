USE dbiykpinec1m8s;

INSERT INTO users
            (ml_id, userCode, charName)
    VALUES  (-1, '333333', 'Test');

INSERT INTO user_functions
            (user_id, mlFunction_id, cav_id)
    VALUES  (-1, 180, NULL),
            (-1, 190, NULL),
            (-1, 176, NULL),
            (-1, 199, NULL),
            (-1, 368, NULL),
            (-1, 370, NULL),
            (-1, 376, NULL),
            (-1, 377, NULL),
            (-1, 380, NULL),
            (-1, 389, NULL),
            (-1, 391, NULL),
            (-1, 392, NULL),
            (-1, 394, NULL),
            (-1, 398, NULL),
            (-1, 399, NULL);

# 2.0RC TEST FUNCTIONS #
INSERT INTO user_functions
            (user_id, mlFunction_id, cav_id)
    VALUES  (-1, 624, NULL),
            (-1, 625, NULL),
            (-1, 626, NULL),
            (-1, 627, NULL),
            (-1, 628, NULL);
# END TEST FUNCTIONS #

INSERT INTO user_items
            (user_id, item_abbr, count)
    VALUES  (-1, 'deck_mm', NULL),
            (-1, 'cmm', NULL),
            (-1, 'cmm', NULL),
            (-1, 'copycat', NULL),
            (-1, 'phack1', NULL),
            (-1, 'brad', NULL),
            (-1, 'beac', NULL),
            (-1, 'digipet', NULL),
            (-1, 'impl_mags', NULL),
            (-1, 'impl_clec', NULL),
            (-1, 'shim0', 9),
            (-1, 'shim1', 7),
            (-1, 'vigl0', NULL),
            (-1, 'vigl1', NULL),
            (161, 'deck_bud', NULL),
            (161, 'cmm', NULL),
            (161, 'cmm', NULL),
            (161, 'copycat', NULL),
            (161, 'phack1', NULL),
            (161, 'brad', NULL),
            (161, 'beac', NULL),
            (161, 'digipet', NULL),
            (161, 'impl_mags', NULL),
            (161, 'impl_clec', NULL),
            (161, 'shim0', 2),
            (161, 'shim1', 1),
            (161, 'vigl0', NULL),
            (161, 'vigl1', NULL);