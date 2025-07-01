const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 데이터베이스 연결 설정
const pool = new Pool({
    host: '203.252.147.202',
    database: 'fish',
    user: 'ntw',
    password: 'ntw0403',
    port: 5432,
});

// DB 연결 테스트
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully');
    }
});

// 오늘의 시세 조회 API
app.get('/api/today-prices', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const query = `
            SELECT 
                id,
                fish_name,
                price_per_kg,
                weight_min,
                weight_max,
                origin_country,
                date
            FROM fish_price_history 
            WHERE date = $1
            ORDER BY fish_name
        `;
        
        const result = await pool.query(query, [today]);
        
        // 가격 변화 계산을 위해 전일 데이터도 조회
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const yesterdayQuery = `
            SELECT fish_name, price_per_kg
            FROM fish_price_history 
            WHERE date = $1
        `;
        
        const yesterdayResult = await pool.query(yesterdayQuery, [yesterdayStr]);
        const yesterdayPrices = {};
        
        yesterdayResult.rows.forEach(row => {
            yesterdayPrices[row.fish_name] = row.price_per_kg;
        });
        
        // 가격 변화 계산
        const pricesWithChange = result.rows.map(row => {
            const yesterdayPrice = yesterdayPrices[row.fish_name];
            let priceChange = '0';
            let trend = 'stable';
            
            if (yesterdayPrice) {
                const change = row.price_per_kg - yesterdayPrice;
                priceChange = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
                trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
            }
            
            return {
                ...row,
                price_change: priceChange,
                trend: trend
            };
        });
        
        res.json(pricesWithChange);
    } catch (error) {
        console.error('Error fetching today prices:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 어종별 시세 조회 API
app.get('/api/fish-prices/:fishName', async (req, res) => {
    try {
        const { fishName } = req.params;
        const { days = 7 } = req.query;
        
        const query = `
            SELECT 
                id,
                fish_name,
                price_per_kg,
                weight_min,
                weight_max,
                origin_country,
                date
            FROM fish_price_history 
            WHERE fish_name = $1
            AND date >= CURRENT_DATE - INTERVAL '${days} days'
            ORDER BY date DESC
        `;
        
        const result = await pool.query(query, [fishName]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching fish prices:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 어종 목록 조회 API
app.get('/api/fish-list', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT fish_name
            FROM fish_price_history
            ORDER BY fish_name
        `;
        
        const result = await pool.query(query);
        const fishList = result.rows.map(row => row.fish_name);
        res.json(fishList);
    } catch (error) {
        console.error('Error fetching fish list:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 날짜별 시세 조회 API
app.get('/api/prices-by-date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        const query = `
            SELECT 
                id,
                fish_name,
                price_per_kg,
                weight_min,
                weight_max,
                origin_country,
                date
            FROM fish_price_history 
            WHERE date = $1
            ORDER BY fish_name
        `;
        
        const result = await pool.query(query, [date]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching prices by date:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 가장 최근 시세 조회 API
app.get('/api/latest-prices', async (req, res) => {
    try {
        // 오늘 날짜 데이터가 있으면 오늘 데이터, 없으면 가장 최근 날짜 데이터 반환
        const today = new Date().toISOString().split('T')[0];
        let query = `
            SELECT * FROM fish_price_history WHERE date = $1 ORDER BY fish_name
        `;
        let result = await pool.query(query, [today]);
        if (result.rows.length === 0) {
            // 오늘 데이터가 없으면 가장 최근 날짜 구하기
            const dateResult = await pool.query('SELECT date FROM fish_price_history ORDER BY date DESC LIMIT 1');
            if (dateResult.rows.length > 0) {
                const latestDate = dateResult.rows[0].date;
                query = `SELECT * FROM fish_price_history WHERE date = $1 ORDER BY fish_name`;
                result = await pool.query(query, [latestDate]);
            }
        }
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching latest prices:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 서버 상태 확인
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: '서버가 정상적으로 작동 중입니다.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 