INSERT INTO departments (name)  
VALUES ("Engineers"),
       ("Finance"),
       ("Legal"),
       ("Sales");

 INSERT INTO roles (department_id,title,salary)
VALUES (1,"Lead Engineer",200000),
       (1,"Software Engineer",110000),
       (2,"Account Manager",140000),
       (2,"Accountant",110000),
       (3,"Legal Team Lead",210000),
       (3,"Lawyer",190000),
       (4,"Sales Lead",90000),
       (4,"Salesperson",80000);


INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Ernest", "Hemingway", 1, null),
    ("Mark", "Twain", 2, 1),
    ("F. Scott", "Fitzgeralk", 3, null),
    ("Charles", "Dickens", 4, 2),
    ("Edgar Allen", "Poe", 3, null),
    ("Emily", "Dickenson", 1, 3),
    ("Nicholas", "Sparks", 2, null),
    ("Colleen", "Hoover", 4, 4);