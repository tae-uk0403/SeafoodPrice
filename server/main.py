from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
import os
from typing import List, Dict, Any
from datetime import date, timedelta

app = FastAPI()

# CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 연결 정보
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "203.252.147.202"),
    "database": os.getenv("DB_NAME", "fish"),
    "user": os.getenv("DB_USER", "ntw"),
    "password": os.getenv("DB_PASSWORD", "ntw0403"),
    "port": os.getenv("DB_PORT", "5432"),
}

async def get_pool():
    if not hasattr(app.state, "pool"):
        app.state.pool = await asyncpg.create_pool(**DB_CONFIG)
    return app.state.pool

@app.on_event("shutdown")
async def shutdown():
    if hasattr(app.state, "pool"):
        await app.state.pool.close()

# 오늘의 시세 조회
@app.get("/api/today-prices")
async def today_prices():
    pool = await get_pool()
    today = date.today().isoformat()
    query = """
        SELECT id, fish_name, price_per_kg, weight_min, weight_max, origin_country, date
        FROM fish_price_history
        WHERE date = $1
        ORDER BY fish_name
    """
    rows = await pool.fetch(query, today)
    # 가격 변화 계산 (전일 대비)
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    y_query = "SELECT fish_name, price_per_kg FROM fish_price_history WHERE date = $1"
    y_rows = await pool.fetch(y_query, yesterday)
    y_map = {r["fish_name"]: r["price_per_kg"] for r in y_rows}
    result = []
    for row in rows:
        y_price = y_map.get(row["fish_name"])
        price_change = "0"
        trend = "stable"
        if y_price is not None:
            diff = row["price_per_kg"] - y_price
            price_change = f"+{diff:.1f}" if diff > 0 else f"{diff:.1f}"
            trend = "up" if diff > 0 else ("down" if diff < 0 else "stable")
        result.append({**dict(row), "price_change": price_change, "trend": trend})
    return result

# 가장 최근 시세 조회
@app.get("/api/latest-prices")
async def latest_prices():
    pool = await get_pool()
    today = date.today().isoformat()
    query = "SELECT * FROM fish_price_history WHERE date = $1 ORDER BY fish_name"
    rows = await pool.fetch(query, today)
    if not rows:
        date_row = await pool.fetchrow("SELECT date FROM fish_price_history ORDER BY date DESC LIMIT 1")
        if date_row:
            latest_date = date_row["date"]
            rows = await pool.fetch("SELECT * FROM fish_price_history WHERE date = $1 ORDER BY fish_name", latest_date)
    return [dict(row) for row in rows]

# 어종별 시세 조회
@app.get("/api/fish-prices/{fish_name}")
async def fish_prices(fish_name: str, days: int = 7):
    pool = await get_pool()
    query = """
        SELECT id, fish_name, price_per_kg, weight_min, weight_max, origin_country, date
        FROM fish_price_history
        WHERE fish_name = $1
        AND date >= CURRENT_DATE - INTERVAL '%s days'
        ORDER BY date DESC
    """ % days
    rows = await pool.fetch(query, fish_name)
    return [dict(row) for row in rows]

# 어종 목록 조회
@app.get("/api/fish-list")
async def fish_list():
    pool = await get_pool()
    query = "SELECT DISTINCT fish_name FROM fish_price_history ORDER BY fish_name"
    rows = await pool.fetch(query)
    return [row["fish_name"] for row in rows]

# 날짜별 시세 조회
@app.get("/api/prices-by-date/{date_str}")
async def prices_by_date(date_str: str):
    pool = await get_pool()
    query = """
        SELECT id, fish_name, price_per_kg, weight_min, weight_max, origin_country, date
        FROM fish_price_history
        WHERE date = $1
        ORDER BY fish_name
    """
    rows = await pool.fetch(query, date_str)
    return [dict(row) for row in rows]

# 서버 상태 확인
@app.get("/api/health")
async def health():
    return {"status": "OK", "message": "서버가 정상적으로 작동 중입니다."} 