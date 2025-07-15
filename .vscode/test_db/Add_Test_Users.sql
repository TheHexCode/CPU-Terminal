USE dbiykpinec1m8s;

INSERT INTO users
            (ml_id, userCode, charName)
    VALUES  (-1, '333333', 'Test'),
            (161, '876353', 'Puck');

INSERT INTO user_functions
            (user_id, function_id, keyword_id, keyword_type)
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
            (-1, 'cmm_coc', NULL),
            (-1, 'cmm_wid', NULL),
            (-1, 'copycat', NULL),
            (-1, 'phack_0', NULL),
            (-1, 'brad', NULL),
            (-1, 'beac', NULL),
            (-1, 'digi_pet', NULL),
            (-1, 'impl_mags', NULL),
            (-1, 'impl_clec', NULL),
            (-1, 'shim_0', 9),
            (-1, 'shim_1', 7),
            (-1, 'vigil', NULL),
            (161, 'deck_bud', NULL),
            (161, 'cmm_coc', NULL),
            (161, 'cmm_wid', NULL),
            (161, 'copycat', NULL),
            (161, 'phack_1', NULL),
            (161, 'brad', NULL),
            (161, 'beac', NULL),
            (161, 'digi_pet', NULL),
            (161, 'impl_mags', NULL),
            (161, 'impl_clec', NULL),
            (161, 'shim_0', 2),
            (161, 'shim_1', 1),
            (161, 'vigil', NULL);