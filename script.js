// script.js

// --- Глобальные переменные и утилиты ---
const APP_KEY = 'belmail_data';
let emails = [];
let currentFolder = 'inbox';

// --- Инициализация почтового ящика ---
function initializeMailbox() {
    const storedEmails = localStorage.getItem(APP_KEY);
    if (storedEmails) {
        emails = JSON.parse(storedEmails);
    } else {
        // Если данных нет, создаем демо-письма
        emails = [
            { id: 1, from: 'no-reply@service.com', to: 'brsm@belmail.com', subject: 'Добро пожаловать в BelMail!', body: 'Мы рады приветствовать вас в нашем инновационном почтовом сервисе. Исследуйте возможности ИИ-помощника и наслаждайтесь чистым inbox.', timestamp: new Date().toISOString(), folder: 'inbox', read: false },
            { id: 2, from: 'friend@example.com', to: 'brsm@belmail.com', subject: 'Встреча завтра', body: 'Привет! Убедись, что ты помнишь о нашей встрече в 15:00 в кофейне. Жду!', timestamp: new Date(Date.now() - 86400000).toISOString(), folder: 'inbox', read: true },
            { id: 3, from: 'brsm@belmail.com', to: 'colleague@work.com', subject: 'Отчет по проекту', body: 'Коллега, во вложении отчет за прошлую неделю. Все готово к презентации.', timestamp: new Date(Date.now() - 172800000).toISOString(), folder: 'sent', read: true },
            { id: 4, from: 'spam@fake.com', to: 'brsm@belmail.com', subject: 'Вы выиграли миллион!', body: 'Поздравляем! Нажмите сюда, чтобы получить свой приз...', timestamp: new Date(Date.now() - 259200000).toISOString(), folder: 'spam', read: false }
        ];
        saveEmails();
    }
}

function saveEmails() {
    localStorage.setItem(APP_KEY, JSON.stringify(emails));
}

// --- Логика для mail.html ---
document.addEventListener('DOMContentLoaded', () => {
    // Этот код выполняется только на mail.html
    if (document.getElementById('mainApp')) {
        initializeMailbox();
        setupInitialLoader();
        setupEventListeners();
        renderEmails(currentFolder);
    }
});

function setupInitialLoader() {
    const loader = document.getElementById('initialLoader');
    const welcome = document.getElementById('welcomeMessage');
    const app = document.getElementById('mainApp');

    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            welcome.style.display = 'block';
            setTimeout(() => {
                welcome.style.display = 'none';
                app.style.display = 'flex';
            }, 2000);
        }, 500);
    }, 5000);
}

function setupEventListeners() {
    // Кнопки папок
    document.querySelectorAll('.folder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.folder-btn.active').classList.remove('active');
            e.target.classList.add('active');
            currentFolder = e.target.dataset.folder;
            showEmailList();
            renderEmails(currentFolder);
        });
    });

    // Кнопка "Назад"
    document.getElementById('backToList').addEventListener('click', showEmailList);

    // Модальное окно для написания
    const composeModal = document.getElementById('composeModal');
    const composeWithAI = document.getElementById('composeWithAI');
    const composeNormal = document.getElementById('composeNormal');
    const closeBtn = composeModal.querySelector('.close');
    const composeForm = document.getElementById('composeForm');
    let isAICompose = false;

    composeWithAI.addEventListener('click', () => {
        isAICompose = true;
        document.getElementById('composeTitle').innerText = 'Написать письмо с ИИ';
        composeModal.style.display = 'block';
    });

    composeNormal.addEventListener('click', () => {
        isAICompose = false;
        document.getElementById('composeTitle').innerText = 'Новое письмо';
        composeModal.style.display = 'block';
    });

    closeBtn.onclick = () => composeModal.style.display = 'none';
    window.onclick = (event) => { if (event.target == composeModal) composeModal.style.display = 'none'; };
    
    // Логика ИИ-подсказки
    document.getElementById('composeSubject').addEventListener('input', (e) => {
        if (isAICompose) {
            const aiSuggestion = document.getElementById('aiSuggestion');
            // Простая симуляция работы ИИ
            if (e.target.value.length > 3) {
                aiSuggestion.innerText = `ИИ-предложение для "${e.target.value}": "Добрый день! Пишу вам по поводу ${e.target.value.toLowerCase()}. Хотел бы обсудить детали..."`;
                aiSuggestion.style.display = 'block';
            } else {
                aiSuggestion.style.display = 'none';
            }
        }
    });


    composeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEmail = {
            id: Date.now(),
            from: 'brsm@belmail.com',
            to: document.getElementById('composeTo').value,
            subject: document.getElementById('composeSubject').value,
            body: document.getElementById('composeBody').value,
            timestamp: new Date().toISOString(),
            folder: 'sent',
            read: true
        };
        emails.push(newEmail);
        saveEmails();
        composeForm.reset();
        composeModal.style.display = 'none';
        document.getElementById('aiSuggestion').style.display = 'none';
        
        // Показываем уведомление об успехе
        alert('Письмо успешно отправлено!');
        
        // Если мы в папке "Отправленные", обновляем список
        if (currentFolder === 'sent') {
            renderEmails(currentFolder);
        }
    });
}

function renderEmails(folder) {
    const container = document.getElementById('emailListContainer');
    container.innerHTML = '';
    const filteredEmails = folder === 'inbox' ? emails : emails.filter(e => e.folder === folder);

    if (filteredEmails.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">В этой папке нет писем.</p>';
        return;
    }

    filteredEmails.forEach(email => {
        const item = document.createElement('div');
        item.className = 'email-item';
        item.innerHTML = `
            <h4>${email.subject}</h4>
            <p><strong>От:</strong> ${email.from} | <strong>Кому:</strong> ${email.to}</p>
            <p>${email.body.substring(0, 100)}...</p>
        `;
        item.addEventListener('click', () => openEmail(email.id));
        container.appendChild(item);
    });
}

function openEmail(id) {
    const email = emails.find(e => e.id === id);
    if (!email) return;

    email.read = true; // Помечаем как прочитанное
    saveEmails();

    const viewContainer = document.getElementById('emailViewContainer');
    const content = document.getElementById('emailContent');
    
    content.innerHTML = `
        <h2>${email.subject}</h2>
        <div class="meta">
            <p><strong>От:</strong> ${email.from}</p>
            <p><strong>Кому:</strong> ${email.to}</p>
            <p><strong>Дата:</strong> ${new Date(email.timestamp).toLocaleString()}</p>
        </div>
        <div class="body">
            ${email.body.replace(/\n/g, '<br>')}
        </div>
    `;
    
    document.getElementById('emailListContainer').style.display = 'none';
    viewContainer.style.display = 'block';
}

function showEmailList() {
    document.getElementById('emailListContainer').style.display = 'grid';
    document.getElementById('emailViewContainer').style.display = 'none';
}