USE dbiykpinec1m8s;

INSERT INTO users
            (ml_id, userCode, charName)
    VALUES  (-1, '333333', 'Test'),
            (161, '876353', 'Puck');

INSERT INTO user_functions
            (user_id, function_id, keyword_id, keyword_type)
    VALUES  (-1, 5, NULL, NULL),
            (-1, 10, 11, 'knowledge'),
            (-1, 13, NULL, NULL),
            (-1, 126, NULL, NULL),
            (-1, 205, NULL, NULL),
            (-1, 207, NULL, NULL),
            (-1, 214, NULL, NULL),
            (-1, 215, NULL, NULL),
            (-1, 217, NULL, NULL),
            (-1, 219, NULL, NULL),
            (-1, 224, 5, 'knowledge'),
            (-1, 230, NULL, NULL),
            (-1, 232, NULL, NULL),
            (-1, 233, NULL, NULL),
            (-1, 236, NULL, NULL),
            (-1, 239, NULL, NULL),
            (-1, 241, NULL, NULL),
            (-1, 287, NULL, NULL),
            (-1, 293, NULL, NULL),
            (-1, 430, NULL, NULL),
            (-1, 438, 12, 'keyword'),
            (-1, 442, NULL, NULL),
            (-1, 450, NULL, NULL);

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