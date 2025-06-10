const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const scoreSchema = new mongoose.Schema({
    character: String,
    ip: String,
    count: { type: Number, default: 0 }
});

const Score = mongoose.model('Score', scoreSchema);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/click', async (req, res) => {
    const { character, ip } = req.body;
    if (!character || !ip) return res.status(400).send('Missing character or ip');

    const result = await Score.findOneAndUpdate(
        { character, ip },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
    );

    res.sendStatus(200);
});

app.get('/score/:character/:ip', async (req, res) => {
    const { character, ip } = req.params;

    const userData = await Score.findOne({ character, ip });
    const charData = await Score.aggregate([
        { $match: { character } },
        { $group: { _id: null, total: { $sum: '$count' } } }
    ]);

    res.json({
        total: charData[0]?.total || 0,
        user: userData?.count || 0
    });
});

app.get('/leaderboard', async (req, res) => {
    const charTotals = await Score.aggregate([
        {
            $group: {
                _id: '$character',
                score: { $sum: '$count' }
            }
        },
        { $sort: { score: -1 } }
    ]);

    res.json(
        charTotals.map(item => ({
            character: item._id,
            score: item.score
        }))
    );
});

app.listen(port, () => {
    console.log(`Server running at https://localhost:${port}`);
});
