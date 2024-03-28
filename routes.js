const express = require('express');
const router = express.Router();
const { savePerson, getUsersFromDB } = require('./db/db');
const generateKey = require('./utils/keyGenerator');
const Person = require('./models/Person');
const IdentityDocument = require('./models/IdentityDocument');
const Employment = require('./models/Employment');

router.post('/user/register', async (req, res) => {
    const { 
        lastName, 
        firstName, 
        patronymic, 
        dateOfBirth, 
        phoneNumber, 
        password, 
        companyName, 
        companyPhone, 
        companyAddress, 
        documentSeries, 
        documentNumber, 
        documentIssueDate 
    } = req.body;

    try {
        const users = await getUsersFromDB();
        
        // Проверка, что пользователь не зарегистрирован с таким номером телефона
        const existingUser = users.find(user => user.phoneNumber === phoneNumber);
        if (existingUser) {
            return res.status(400).json({ error: `Пользователь с таким номером уже существует` });
        }

        // Генерируем ключ для авторизации
        const authorizationKey = generateKey(10);

        // Создаем объекты IdentityDocument, Employment и Person
        const identityDocument = new IdentityDocument(documentSeries, documentNumber, documentIssueDate);
        const employment = new Employment(companyName, companyPhone, companyAddress);
        const user = new Person(lastName, firstName, patronymic, dateOfBirth, phoneNumber, password, employment, identityDocument, authorizationKey);

        // Добавляем пользователя в базу данных
        await savePerson(user);
        
        console.log("Пользователь успешно зарегистрирован:", user);
        res.status(200).json({ message: 'Пользователь успешно зарегистрирован', user });
    } catch (err) {
        console.error('Ошибка при регистрации пользователя:', err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


router.post('/user/login', async (req, res) => {
    const { login, password } = req.body;

    try {
        // Получаем пользователей из базы данных
        const users = await getUsersFromDB();

        // Поиск пользователя в базе данных
        const user = users.find(user => user.phoneNumber === login && user.password === password);
        if (user) {
            console.log("Пользователь успешно авторизовался ");
            res.status(200).json({ message: 'Пользователь успешно авторизовался' , authorizationKey: user.authorizationKey });
        } else {
            console.log("Пользователь не найден или введенные данные некорректны");
            res.status(403).json({ error: 'Пользователь не найден или введенные данные некорректны' });
        }
    } catch (err) {
        console.error("Ошибка сервера:", err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


module.exports = router;
