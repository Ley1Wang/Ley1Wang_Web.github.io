USE school;
DROP TABLE student;
CREATE TABLE student (
    sid INT PRIMARY KEY,
    sname VARCHAR(20) NOT NULL,
    height DECIMAL(5,2)
);

DESC student;

INSERT INTO student VALUES
(1001,'Tom',175.50),
(1002,'Jerry',168.00),
(1003,'Alice',162.80);

SELECT * FROM student;

SELECT * FROM student
WHERE height > 170;

SELECT sid,sname
FROM student;

UPDATE student
SET height = 180.00
WHERE sid = 1001;

SELECT * FROM student;

DELETE FROM student
WHERE sid = 1002;

SELECT * FROM student;

INSERT INTO student VALUES
(1004,'David',172.50);

SELECT * FROM student;