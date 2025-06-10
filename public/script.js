const startBtn = document.getElementById('start-button');
const charTable = document.getElementById('character-table');
const gameDiv = document.getElementById('game');
const charSelectDiv = document.getElementById('character-select');
const currentCharEl = document.getElementById('currentCharacter');
const emoji = document.getElementById('emoji');
const userScoreEl = document.getElementById('userScore');
const charScoreEl = document.getElementById('charScore');
const leaderboardBody = document.querySelector('#leaderboard tbody');

let character = '';
let userIP = '';
let userScore = 0;
let charScore = 0;

async function getIP() {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
}

startBtn.addEventListener('click', async () => {
    character = charTable.value;
    if (!character) {
        Swal.fire({
            icon: 'warning',
            title: 'ห้ามเป็นกลาง',
            text: 'เลือกตัวละครเดี๋ยวนี้เลยครับ',
            confirmButtonColor: '#f27474',
            confirmButtonText: 'เข้าใจแล้ว'
        });
        return;
    }

    userIP = await getIP();

    currentCharEl.textContent = character;
    charSelectDiv.style.display = 'none';
    gameDiv.style.display = 'block';
});

emoji.addEventListener('click', async () => {
    if (!character || !userIP) return;

    try {
        await new Audio('pop.mp3').play();
    } catch (e) {
        console.warn('เสียงยังไม่สามารถเล่นได้:', e);
    }

    userScore++;
    userScoreEl.textContent = userScore;

    fetch('/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, ip: userIP })
    });
});

setInterval(() => {
    if (!character || !userIP) return;

    fetch(`/score/${encodeURIComponent(character)}/${encodeURIComponent(userIP)}`)
        .then(res => res.json())
        .then(data => {
            userScore = data.user;
            charScore = data.total;
            userScoreEl.textContent = userScore;
            charScoreEl.textContent = charScore;
        });

    fetch('/leaderboard')
        .then(res => res.json())
        .then(data => {
            leaderboardBody.innerHTML = '';
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${row.character}</td><td>${row.score}</td>`;
                leaderboardBody.appendChild(tr);
            });
        });
}, 1000);
