const startBtn = document.getElementById('start-button');
const classroomTable = document.getElementById('classroom-table');
const gameDiv = document.getElementById('game');
const classroomSelectDiv = document.getElementById('classroom-select');
const currentClassroomEl = document.getElementById('currentClassroom');
const emoji = document.getElementById('emoji');
const userScoreEl = document.getElementById('userScore');
const classScoreEl = document.getElementById('classScore');
const leaderboardBody = document.querySelector('#leaderboard tbody');

let classroom = '';
let userIP = '';
let userScore = 0;
let classScore = 0;

async function getIP() {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
}

startBtn.addEventListener('click', async () => {
    classroom = classroomTable.value;
    if (!classroom) {
        alert("กรุณาเลือกฝ่ายด้วยครับ");
        return;
    }

    userIP = await getIP();

    currentClassroomEl.textContent = classroom;
    classroomSelectDiv.style.display = 'none';
    gameDiv.style.display = 'block';
});

emoji.addEventListener('click', async () => {
    if (!classroom || !userIP) return;

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
        body: JSON.stringify({ classroom, ip: userIP })
    });
});

setInterval(() => {
    if (!classroom || !userIP) return;

    fetch(`/score/${encodeURIComponent(classroom)}/${encodeURIComponent(userIP)}`)
        .then(res => res.json())
        .then(data => {
            userScore = data.user;
            classScore = data.total;
            userScoreEl.textContent = userScore;
            classScoreEl.textContent = classScore;
        });

    fetch('/leaderboard')
        .then(res => res.json())
        .then(data => {
            leaderboardBody.innerHTML = '';
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${row.classroom}</td><td>${row.score}</td>`;
                leaderboardBody.appendChild(tr);
            });
        });
}, 1000);
