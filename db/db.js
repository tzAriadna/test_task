const sqlite3 = require('sqlite3').verbose();

// Создаем подключение к базе данных
const db = new sqlite3.Database('./db/users.db', (err) => {
  if (err) {
    console.error('Ошибка при открытии базы данных', err.message);
  } else {
    console.log('Подключение к базе данных успешно установлено');
    // Создаем таблицы, если они не существуют
    db.run(`CREATE TABLE IF NOT EXISTS identity_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentSeries INTEGER,
      documentNumber INTEGER,
      documentIssueDate DATE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS employments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      companyName TEXT,
      companyPhone TEXT,
      companyAddress TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lastName TEXT,
        firstName TEXT,
        patronymic TEXT,
        dateOfBirth DATE,
        phoneNumber TEXT UNIQUE,
        password TEXT,
        identityDocumentId INTEGER,
        employmentId INTEGER,
        authorizationKey TEXT,
        FOREIGN KEY (identityDocumentId) REFERENCES identity_documents(id),
        FOREIGN KEY (employmentId) REFERENCES employments(id)
      )`);
  }
});

// Функция для сохранения объекта IdentityDocument в базу данных
function saveIdentityDocument(identityDocument) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO identity_documents (documentSeries, documentNumber, documentIssueDate) VALUES (?, ?, ?)`;
    db.run(sql, [identityDocument.documentSeries, identityDocument.documentNumber, identityDocument.documentIssueDate], function(err) {
      if (err) {
        console.error('Ошибка при выполнении запроса:', err.message);
        reject(err);
      } else {
        // Возвращаем ID только что сохраненной записи
        resolve(this.lastID);
      }
    });
  });
}

// Функция для сохранения объекта Employment в базу данных
function saveEmployment(employment) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO employments (companyName, companyPhone, companyAddress) VALUES (?, ?, ?)`;
    db.run(sql, [employment.companyName, employment.companyPhone, employment.companyAddress], function(err) {
      if (err) {
        console.error('Ошибка при выполнении запроса:', err.message);
        reject(err);
      } else {
        // Возвращаем ID только что сохраненной записи
        resolve(this.lastID);
      }
    });
  });
}

// Функция для сохранения объекта Person в базу данных
async function savePerson(person) {
  try {
    const identityDocumentId = await saveIdentityDocument(person.identityDocument);
    const employmentId = await saveEmployment(person.employment);

    const sql = `INSERT INTO users (lastName, firstName, patronymic, dateOfBirth, phoneNumber, password, identityDocumentId, employmentId, authorizationKey) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await new Promise((resolve, reject) => {
      db.run(sql, [person.lastName, person.firstName, person.patronymic, person.dateOfBirth, person.phoneNumber, person.password, identityDocumentId, employmentId, person.authorizationKey], function(err) {
        if (err) {
          console.error('Ошибка при выполнении запроса:', err.message);
          reject(err);
        } else {
          // Возвращаем ID только что сохраненной записи
          resolve(this.lastID);
        }
      });
    });
  } catch (err) {
    throw err;
  }
}


// Функция для получения пользователей из базы данных
async function getUsersFromDB() {
  const sql = 'SELECT * FROM users';
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    return rows;
  } catch (err) {
    throw err;
  }
}


module.exports = { savePerson, getUsersFromDB };
