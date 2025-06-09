const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const scores = {}; // { "3/1": { total: 123, users: { "192.168.1.5": 12 } } }

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/click', (req, res) => {
    const { classroom, ip } = req.body;
    if (!classroom || !ip) return res.status(400).send('Missing classroom or ip');

    if (!scores[classroom]) {
        scores[classroom] = { total: 0, users: {} };
    }

    scores[classroom].total++;
    scores[classroom].users[ip] = (scores[classroom].users[ip] || 0) + 1;

    res.sendStatus(200);
});

app.get('/score/:classroom/:ip', (req, res) => {
    const { classroom, ip } = req.params;
    const classData = scores[classroom] || { total: 0, users: {} };
    const userScore = classData.users[ip] || 0;
    res.json({ total: classData.total, user: userScore });
});

app.get('/leaderboard', (req, res) => {
    const leaderboard = Object.entries(scores)
        .map(([classroom, data]) => ({ classroom, score: data.total }))
        .sort((a, b) => b.score - a.score);

    res.json(leaderboard);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
