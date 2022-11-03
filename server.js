const inquirer = require("inquirer"); //inquirer package -npm i inquirer
const mysql = require('mysql2'); //mysql2package -npm i mysql2
const consoleTable = require('console.table') //package for npm i console.table
const dotenv = require('dotenv'); // npm i dotenv --save
const res = require("express/lib/response");

// Database Connection -------------------------------------------------------------------------------------------------------------------------------------------------------------
    const db = mysql.createConnection(
        {
        host: 'localhost',
        // MySQL username --USE DOTENV TO HIDE VARIABLES *TODO*
        user: '',
        //  Add MySQL password here --USE DOTENV TO HIDE VARIABLES *TODO*
        password: '',
        database: 'corporate_db'
        },
        console.log(`Connected to the company_db database.`)
    );
    db.connect((err) => {
        if (err) throw err;
        promptUser();
    });

//Inquirer Options to call functions with user input-------------------------------------------------------------------------------------------------------------------------------
    function promptUser() {
        inquirer.prompt([
            {
            type: 'list',
            message: "Big-Broth0r-Employee-Tracker V1.0.1: Select an option to interact with the database",
            name: 'questions',
            choices: ['View all departments','View all employees','View all roles','Add a department','Add a role','Add an employee','Update an employee role']
            },
        
        ])
        
            .then((response) => {
                
                if(response.questions == 'View all departments'){
                    viewallDepartments();
                }
                else if(response.questions == 'View all employees')
                {
                    viewallEmployees();
                }
                else if(response.questions == 'View all roles')
                {
                    viewallRoles();
                }
                else if(response.questions == 'Add a department')
                {
                    addDepartments();
                }
                else if(response.questions == 'Add a role')
                {
                    addRole();
                }
                else if(response.questions == 'Add an employee')
                {
                    addEmployee();
                }
                else {
                    updateRole();
                }

            // console.log(response);
            });
    }

//Functions that interact with database-------------------------------------------------------------------------------------------------------------

    // Displays a table of all departments with names and IDs (department specific IDs)
    function viewallDepartments(){
        const sql = `SELECT * FROM departments`;
        db.query(sql,(err,result)=>{
                if (err){
                    throw err
                }
                console.table(result);
                promptUser();
            })
        }
    
        // Displays all roles with job title, role id (job specific), department id (department employee belongs to) and salary
        function viewallRoles(){
            db.query(`SELECT * FROM roles`, function (err, results) {
                if (err) {
                    console.log(err);
                };
                console.table(results);
                promptUser();
            });
        };
    
        // Displays a table showing employees
        function viewallEmployees(){
            const sql = `SELECT * FROM employees`;
            db.query(sql,(err,result) => {
                if(err){
                    throw err
                }
                console.table(result);
                promptUser();
            })
        }
    
        //Prompts user to enter department name and adds department to database
        function addDepartments(){
            inquirer.prompt(
                [
                    {
                        message: 'Enter department name',
                        name: 'dept_name'
                    }
                ]
            ).then((answers) => {
                db.query(
                    'INSERT INTO departments (name) VALUES (?)',
                    [answers.dept_name],
                    (err, results) => {
                        if (err) throw err
                        console.log(results)
                        promptUser();
                    }
                );
            }
            );
        }
        //Prompts user to enter name, salary, and department for the role and adds role to the database
        function addRole(){
            db.query(
                `SELECT id AS value, name AS name FROM departments`, (err, departments) => {
                    if (err) console.log(err);
        
                    inquirer.prompt(
                        [
                            {
                                message: 'Enter role title',
                                name: 'title'
                            },
                            {
                                message: 'Enter salary amount',
                                name: 'salary'
                            },
                            {
                                message: 'Choose department',
                                type: 'rawlist',
                                name: 'dept',
                                choices: departments
                            },
                        ]
                    ).then((answers) => {
                        db.query(
                            'INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)',
                            [answers.title, answers.salary, answers.dept],
                            (err, results) => {
                                if (err) console.log(err);
                                console.log(answers);
                                promptUser();
                            }
                        );
                    }
                    )
                });
        }
    
        // Prompts user to enter employee's first name, last name, role and manager, then adds employee to the database
        function addEmployee () {
            db.query(
                `SELECT id AS value, title AS name FROM roles`, (err, roles) => {
                    if (err) console.log(err);
        
                    inquirer.prompt(
                        [
                            {
                                message: 'Enter first name',
                                name: 'first_name'
                            },
                            {
                                message: 'Enter last name',
                                name: 'last_name'
                            },
                            {
                                message: 'Choose role',
                                type: 'rawlist',
                                name: 'role',
                                choices: roles
                            },
                        ]
                    ).then((answers) => {
                        db.query(
                            'INSERT INTO employees (first_name, last_name, role_id) VALUES (?,?,?)',
                            [answers.first_name, answers.last_name, answers.role],
                            (err, results) => {
                                if (err) console.log(err);
                                console.log(answers);
                                promptUser();
                            }
                        );
                    }
                    )
                });
        }
    
        // Prompts user to select an employee to update role and add that information to the database
        function updateRole() {
            let roleResults;
            db.query(`SELECT id as value, title AS name FROM roles`, (err, roles) =>{
                if (err) {
                    console.log(err);
                    return;
                }
                roleResults = roles;
            });
            db.query(
                `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees`, (err, employees) => {
                    if (err) console.log(err);
                    inquirer.prompt(
                        [
                            {
                                message: 'Choose employee',
                                type: 'rawlist',
                                name: 'employees',
                                choices: employees
                            },
                            {
                                message: 'Choose new role',
                                type: 'rawlist',
                                name: 'role',
                                choices: roleResults
                            },
                        ]
                    ).then((answers) => {
                        var employeeName = answers.employees.split(' ');
                        var employeeFirstName = employeeName[0];
                        var employeeLastName = employeeName[employeeName.length - 1];
        
                        db.query(
                            'UPDATE employees SET role_id = ? WHERE first_name = ? AND last_name = ?',
                            [answers.role, employeeFirstName, employeeLastName],
                            (err, results) => {
                                if (err) console.log(err);
                                console.log(results);
                                promptUser();
                             });
                        })
                     })
        };