import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import lodash from 'lodash'


const prisma = new PrismaClient()




function problem1() {
  return prisma.$queryRaw`select firstName, lastName, income from Customer where income <= 60000 and income >= 50000 order by income desc, lastName asc, firstName asc LIMIT 10;`
}

function problem2() {
  return prisma.$queryRaw`SELECT e.sin, b.branchName, e.salary,
           CAST(m.salary - e.salary AS CHAR) AS \`Salary Diff\`
    FROM Employee e
    JOIN Branch b ON e.branchNumber = b.branchNumber
    JOIN Employee m ON b.managerSIN = m.sin
    WHERE b.branchName IN ('London', 'Berlin')
    ORDER BY (m.salary - e.salary) DESC
    LIMIT 10;`
}

function problem3() {
  return prisma.$queryRaw`SELECT c.firstName, c.lastName, c.income
    FROM Customer c
    WHERE NOT EXISTS (
      SELECT 1
      FROM Customer b
      WHERE b.lastName = 'Butler'
        AND c.income < 2 * b.income
    )
    ORDER BY c.lastName ASC, c.firstName ASC
    LIMIT 10;`
}

function problem4() {
  return prisma.$queryRaw`SELECT c.customerID, c.income,
           a.accNumber, a.branchNumber
    FROM Customer c
    JOIN Owns o ON c.customerID = o.customerID
    JOIN Account a ON o.accNumber = a.accNumber
    WHERE c.income > 80000
      AND EXISTS (
        SELECT 1
        FROM Owns o2
        JOIN Account a2 ON o2.accNumber = a2.accNumber
        JOIN Branch b2 ON a2.branchNumber = b2.branchNumber
        WHERE o2.customerID = c.customerID
          AND b2.branchName = 'London'
      )
      AND EXISTS (
        SELECT 1
        FROM Owns o3
        JOIN Account a3 ON o3.accNumber = a3.accNumber
        JOIN Branch b3 ON a3.branchNumber = b3.branchNumber
        WHERE o3.customerID = c.customerID
          AND b3.branchName = 'Latveria'
      )
    ORDER BY c.customerID ASC, a.accNumber ASC
    LIMIT 10;`
}

function problem5() {
  return prisma.$queryRaw`SELECT o.customerID, a.type,
           a.accNumber, a.balance
    FROM Owns o
    JOIN Account a ON o.accNumber = a.accNumber
    WHERE a.type IN ('BUS', 'SAV')
    ORDER BY o.customerID ASC, a.type ASC, a.accNumber ASC
    LIMIT 10;`
}

function problem6() {
  return prisma.$queryRaw`SELECT b.branchName, a.accNumber, a.balance
    FROM Account a
    JOIN Branch b ON a.branchNumber = b.branchNumber
    JOIN Employee e ON b.managerSIN = e.sin
    WHERE e.firstName = 'Phillip'
      AND e.lastName = 'Edwards'
      AND a.balance > 100000
    ORDER BY a.accNumber ASC
    LIMIT 10;`
}

function problem7() {
  return prisma.$queryRaw`SELECT DISTINCT o.customerID
    FROM Owns o
    JOIN Account a ON o.accNumber = a.accNumber
    JOIN Branch b ON a.branchNumber = b.branchNumber
    WHERE b.branchName = 'New York'
      AND NOT EXISTS (
        SELECT 1
        FROM Owns o2
        JOIN Account a2 ON o2.accNumber = a2.accNumber
        JOIN Branch b2 ON a2.branchNumber = b2.branchNumber
        WHERE o2.customerID = o.customerID
          AND b2.branchName = 'London'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM Owns o3
        JOIN Owns co ON o3.accNumber = co.accNumber
        WHERE o3.customerID = o.customerID
          AND co.customerID <> o.customerID
          AND EXISTS (
            SELECT 1
            FROM Owns o4
            JOIN Account a4 ON o4.accNumber = a4.accNumber
            JOIN Branch b4 ON a4.branchNumber = b4.branchNumber
            WHERE o4.customerID = co.customerID
              AND b4.branchName = 'London'
          )
      )
    ORDER BY o.customerID ASC
    LIMIT 10;`
}

function problem8() {
  return prisma.$queryRaw`SELECT e.sin, e.firstName, e.lastName,
           e.salary, b.branchName
    FROM Employee e
    LEFT OUTER JOIN Branch b ON e.sin = b.managerSIN
    WHERE e.salary > 50000
    ORDER BY b.branchName DESC, e.firstName ASC
    LIMIT 10;`
}

function problem9() {
  return prisma.$queryRaw`SELECT e.sin, e.firstName, e.lastName, e.salary,
           (
             SELECT b.branchName
             FROM Branch b
             WHERE b.managerSIN = e.sin
           ) AS branchName
    FROM Employee e
    WHERE e.salary > 50000
    ORDER BY branchName DESC, e.firstName ASC
    LIMIT 10;`
}

function problem10() {
  return prisma.$queryRaw`SELECT c.customerID, c.firstName,
           c.lastName, c.income
    FROM Customer c
    WHERE c.income > 5000
      AND NOT EXISTS (
        SELECT 1
        FROM Customer h
        JOIN Owns ho ON h.customerID = ho.customerID
        JOIN Account ha ON ho.accNumber = ha.accNumber
        WHERE h.firstName = 'Helen'
          AND h.lastName = 'Morgan'
          AND NOT EXISTS (
            SELECT 1
            FROM Owns o
            JOIN Account a ON o.accNumber = a.accNumber
            WHERE o.customerID = c.customerID
              AND a.branchNumber = ha.branchNumber
          )
      )
    ORDER BY c.income DESC
    LIMIT 10;`
}

function problem11() {
  return prisma.$queryRaw`SELECT e.sin, e.firstName, e.lastName, e.salary
    FROM Employee e
    JOIN Branch b ON e.branchNumber = b.branchNumber
    WHERE b.branchName = 'Berlin'
      AND e.salary = (
        SELECT MIN(e2.salary)
        FROM Employee e2
        JOIN Branch b2 ON e2.branchNumber = b2.branchNumber
        WHERE b2.branchName = 'Berlin'
      )
    ORDER BY e.sin ASC
    LIMIT 10;`
}

function problem14() {
  return prisma.$queryRaw`SELECT CAST(SUM(e.salary) AS CHAR) AS \`sum of employees salaries\`
    FROM Employee e
    JOIN Branch b ON e.branchNumber = b.branchNumber
    WHERE b.branchName = 'Moscow'
    LIMIT 10;`
}

function problem15() {
  return prisma.$queryRaw`SELECT c.customerID, c.firstName, c.lastName
    FROM Customer c
    JOIN Owns o ON c.customerID = o.customerID
    JOIN Account a ON o.accNumber = a.accNumber
    GROUP BY c.customerID, c.firstName, c.lastName
    HAVING COUNT(DISTINCT a.branchNumber) = 4
    ORDER BY c.lastName ASC, c.firstName ASC
    LIMIT 10;`
}


function problem17() {
  return prisma.$queryRaw`SELECT c.customerID, c.firstName, c.lastName, c.income,
           CAST(AVG(a.balance) AS DOUBLE) AS \`average account balance\`
    FROM Customer c
    JOIN Owns o ON c.customerID = o.customerID
    JOIN Account a ON o.accNumber = a.accNumber
    WHERE c.lastName LIKE 'S%e%'
    GROUP BY c.customerID, c.firstName, c.lastName, c.income
    HAVING COUNT(DISTINCT a.accNumber) >= 3
    ORDER BY c.customerID ASC
    LIMIT 10;`
}

function problem18() {
  return prisma.$queryRaw`SELECT a.accNumber, a.balance,
           CAST(SUM(t.amount) AS DOUBLE) AS \`sum of transaction amounts\`
    FROM Account a
    JOIN Branch b ON a.branchNumber = b.branchNumber
    JOIN Transactions t ON a.accNumber = t.accNumber
    WHERE b.branchName = 'Berlin'
    GROUP BY a.accNumber, a.balance
    HAVING COUNT(*) >= 10
    ORDER BY \`sum of transaction amounts\` ASC
    LIMIT 10;`
}

const ProblemList = [
  problem1, problem2, problem3, problem4, problem5, problem6, problem7, problem8, problem9, problem10,
  problem11, problem14, problem15, problem17, problem18
]


async function main() {
  for (let i = 0; i < ProblemList.length; i++) {
    const result = await ProblemList[i]()
    const answer =  JSON.parse(fs.readFileSync(`${ProblemList[i].name}.json`,'utf-8'));
    lodash.isEqual(result, answer) ? console.log(`${ProblemList[i].name}: Correct`) : console.log(`${ProblemList[i].name}: Incorrect`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })