INSERT INTO departments (name)  
VALUES ("Engineering"),
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
VALUES ("John", "Doe", 1, null),
    ("Jim", "Jones", 2, 1),
    ("Israel", "Rodriguez", 3, null),
    ("Tupac", "Shakur", 4, 2),
    ("Sharkesha", "Singh", 4, null),
    ("Deebo", "Bronson", 3, 3),
    ("Ghostface", "Killah", 3, null),
    ("Eazy", "Ee", 2, 4);