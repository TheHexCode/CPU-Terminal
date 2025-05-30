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