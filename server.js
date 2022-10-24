// Import and require mysql2
import inquirer from "inquirer";
import { createConnection } from "mysql2";
import "console.table";
import * as dotenv from "dotenv";
dotenv.config();

// Main menu questions
const questions = [
  {
    type: "list",
    name: "choice",
    message: "What would you like to do?",
    choices: [
      "View All Departments",
      "View All Roles",
      "View All Employees",
      "Add Department",
      "Add Role",
      "Add Employee",
      "Update Employee Role",
      "Remove Employee",
      "Quit",
    ],
  },
];

// Connect to database
const db = createConnection({
  host: "localhost",
  // MySQL username,
  user: "root",
  // MySQL password
  password: process.env.password,
  database: "company",
});

// function to show all departments
const showDepartments = () => {
  db.promise()
    .query("SELECT * FROM departments;")
    .then(([rows, fields]) => {
      console.table(rows);
      showOptions();
    });
};
// function to show all roles
const showRoles = () => {
  db.promise()
    .query(
      "SELECT title AS Title, roles.id AS ID, salary AS Salary, departments.name AS Department FROM roles INNER JOIN departments ON roles.department_id = departments.id"
    )
    .then(([rows, fields]) => {
      console.table(rows);
      showOptions();
    });
};
// Show employees query
const showEmployees = () => {
  db.promise()
    .query(
      `SELECT employees.id AS ID,
				 CONCAT(first_name, ' ', last_name) AS Name, 
				 roles.title AS Title, 
				 roles.salary as Salary, 
				 departments.name as Department
				 employees.manager_id
			 FROM employees 
			 LEFT JOIN roles ON employees.role_id = roles.id 
			 LEFT JOIN departments on departments.id = roles.department_id`
    )
    .then(([rows, fields]) => {
      console.table(rows);
      showOptions();
    });
};

// function to add department
const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "newDepartment",
        message: "New department name:",
      },
    ])
    .then(({ newDepartment }) => {
      const params = newDepartment;
      const query = `INSERT INTO departments (name)
		VALUES (?)`;

      if (newDepartment) {
        db.query(query, params, (err, result) => {
          if (err) {
            console.error(err);
          }
          return showOptions();
        });
        showOptions();
      } else {
        // \x1b[41m and [0m change the console color to red and then back to normal
        console.error(`\x1b[41m`, "Error: Name cannot be blank.", `\x1b[0m`);
        showOptions();
      }
    });
};
// function to add role
const addRole = () => {
  //Get list of departments
  const departments = () =>
    db
      .promise()
      .query("SELECT * FROM departments;")
      .then(([rows, fields]) => {
        return rows;
      })
      .then((data) => {
        return data;
      });

  departments()
    .then(
      //prompt for new dept info
      inquirer
        .prompt([
          {
            type: "input",
            name: "newRoleTitle",
            message: "New role name:",
          },
          {
            type: "input",
            name: "newRoleSalary",
            message: "New role's salary:",
          },
          {
            type: "list",
            name: "newRoleDepartment",
            message: "Which department is this roll in?",
            choices: departments,
          },
        ])
        .then((answers) => {
          //save answers to array
          let params = [
            answers.newRoleTitle,
            answers.newRoleSalary,
            answers.newRoleDepartment,
          ];
          //insert query
          const query = `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`;

          //answers !false
          if (answers.newRoleTitle && answers.newRoleSalary) {
            //get dept query & id
            const deptQuery = `SELECT id FROM departments WHERE departments.name = ?`;
            const department = params[2];
            //get dept id
            db.promise()
              .query(deptQuery, department, (err, result) => {
                if (err) {
                  console.error(err);
                }
                return result;
              })
              .then(([rows, fields]) => {
                //return intended id
                return rows[0].id;
              })
              .then((data) =>
                //add to db
                db
                  .promise()
                  .query(query, [params[0], params[1], data], (err, result) => {
                    if (err) {
                      console.error(err);
                    }
                    return;
                  })
                  .catch((err) => console.error(err))
              )
              .catch((err) => console.error(err))
              .finally(() => showOptions());
          } else {
            // \x1b[41m and [0m change the console color to red and then back to normal
            console.error(
              `\x1b[41m`,
              "Error: Title or Salary cannot be blank.",
              `\x1b[0m`
            );
            showOptions();
          }
        })
    )
    .catch((err) => console.error(err));
};
// role db query
const getRoles = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT id, title FROM roles;`, (err, data) => {
      if (err) {
        console.error(err);
      }
      resolve(data);
    });
  }).catch((err) => console.error(err));
};

const getManagers = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * from employees WHERE manager_id IS NULL`,
      (err, data) => {
        if (err) {
          console.error(err);
        }
        resolve(data);
      }
    );
  }).catch((err) => console.error(err));
};
// function to add employee
const addEmployee = async () => {
  //get roles from db
  let roles = await getRoles();
  //change roles to array of [id, title]
  roles = roles.map((data) => {
    return data.title;
  });
  //get managers (ie employees where manager id = null)
  let managers = await getManagers();
  //change managers to first_name last_name
  managers = managers.map((data) => {
    return data.first_name + " " + data.last_name;
  });
  //Add "None Option"
  managers.push("None");
  //Prompt questions
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "Enter first name:",
      },
      {
        type: "input",
        name: "lastName",
        message: "Enter last name:",
      },
      {
        type: "list",
        name: "role",
        message: "Choose role:",
        choices: roles, // get roles from db
      },
      {
        type: "list",
        name: "manager",
        message: "Choose manager:",
        choices: managers, // get list of employees where manager = null
      },
    ])
    .then((answers) => {
      const params = [
        answers.firstName,
        answers.lastName,
        answers.role,
        answers.manager,
      ];
      //If no manager, set to NULL
      if (params[3] == "None") {
        params[3] = "NULL";
        return params;
      }
      return params;
    })
    // Change role title to role id
    .then((params) => {
      const roleName = params[2];
      const queryRole = `SELECT id, title, department_id FROM roles WHERE title = ?`;
      return new Promise((resolve, reject) =>
        db.query(queryRole, roleName, (err, result) => {
          if (err) {
            console.error(err);
          }
          const resultArray = result;
          params.splice(2, 1, resultArray[0].id, resultArray[0].department_id);
          return resolve(params);
        })
      );
    })
    //change manager name to manager id
    .then((params) => {
      const managerName = params[4];
      const queryManager = `SELECT id, CONCAT(first_name, ' ', last_name) FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?`;
      return new Promise((resolve, reject) =>
        db.query(queryManager, managerName, (err, result) => {
          if (err) {
            console.error(err);
          }
          params.pop();
          params.push(result);
          params[4] = params[4][0].id;
          return resolve(params);
        })
      );
    })
    // insert data into db
    .then((data) => {
      const params = data;
      const query = `INSERT INTO employees (first_name, last_name, role_id, department_id, manager_id) VALUES (?,?,?,?,?)`;
      db.promise().query(query, params, (err, result) => {
        if (err) {
          console.error(err);
        }
        return;
      });
    })
    .catch((err) => console.error(err))
    .finally(() => showOptions());
};
// TODO: Add function to update employee role
// select an employee to update and their new role and this information is updated in the database

const updateRole = async () => {
  db.promise()
    .query("SELECT * FROM employees;")
    .then(([row, fields]) => {
      const choices = row.map(({ id, first_name, last_name }) => {
        return {
          name: `${first_name} ${last_name}`,
          value: id,
        };
      });
      inquirer
        .prompt([
          {
            type: "list",
            name: "employeeId",
            message: "Which employee would you like to update?",
            choices: choices,
          },
        ])
        .then(({ employeeId }) => {
          employeeId = employeeId;
          db.promise()
            .query("SELECT * FROM roles")
            .then(([row, fields]) => {
              const roleChoices = row.map(({ id, title }) => {
                return { name: title, value: id };
              });
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "role",
                    message: "What is the new role?",
                    choices: roleChoices,
                  },
                ])
                .then(({ role }) => {
                  db.query(
                    `UPDATE employees SET role_id = ? WHERE id = ?`,
                    [role, employeeId],
                    (err, result) => {
                      if (err) {
                        console.error(err);
                      }
                      showOptions();
                    }
                  );
                });
            });
        });
    });
};

// Delete Employee from db
const deleteEmployee = () => {
  db.promise()
    .query("SELECT * FROM employees")
    .then(([row, fields]) => {
      const choices = row.map(({ id, first_name, last_name }) => {
        return {
          name: `${first_name} ${last_name}`,
          value: id,
        };
      });

      inquirer
        .prompt([
          {
            type: "list",
            name: "employeeId",
            message: "Which employee would you like to remove?",
            choices: choices,
          },
        ])
        .then(({ employeeId }) => {
          db.query(
            `DELETE FROM employees WHERE id = ?`,
            employeeId,
            (err, result) => {
              if (err) {
                console.error(err);
              }
              showOptions();
            }
          );
        });
    });
};

// Show options && initial questions
const showOptions = () => {
  inquirer.prompt(questions).then(({ choice }) => {
    switch (choice) {
      case "View All Departments":
        showDepartments();
        break;
      case "View All Roles":
        showRoles();
        break;
      case "View All Employees":
        showEmployees();
        break;
      case "Add Department":
        addDepartment();
        break;
      case "Add Role":
        addRole();
        break;
      case "Add Employee":
        addEmployee();
        break;
      case "Update Employee Role":
        updateRole();
        break;
      case "Remove Employee":
        deleteEmployee();
        break;
      case "Quit":
        process.exit();
    }
  });
};

showOptions();