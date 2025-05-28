USE cpu_term;

INSERT INTO users
            (ml_id, userCode, charName)
    VALUES  (-1, '333333', 'Test'),
            (161, '876353', 'Puck');

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
            (-1, 399, NULL),
            (161, 2, NULL),
            (161, 4, NULL),
            (161, 5, NULL),
            (161, 6, 51),
            (161, 11, 3),
            (161, 12, NULL),
            (161, 25, 22),
            (161, 271, 29),
            (161, 368, NULL),
            (161, 369, NULL),
            (161, 370, NULL),
            (161, 373, NULL),
            (161, 377, NULL),
            (161, 380, NULL),
            (161, 389, NULL);