import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [todayPrices, setTodayPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayPrices();
  }, []);

  const fetchTodayPrices = async () => {
    setLoading(true);
    let response = await fetch('http://203.252.147.202:9010/api/today-prices');
    let data = await response.json();
    if (!data || data.length === 0) {
      response = await fetch('http://203.252.147.202:9010/api/latest-prices');
      data = await response.json();
    }
    setTodayPrices(data);
    setLoading(false);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#F44336';
      default: return '#FF9800';
    }
  };

  const chartData = todayPrices.map(fish => ({
    name: fish.fish_name,
    price: fish.price_per_kg,
    avgWeight: (fish.weight_min + fish.weight_max) / 2
  }));

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🐟 오늘의 수산물 시세</h1>
        <p className="date">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>

      <div className="today-table-card">
        <h2 className="today-table-title">📋 오늘의 시세 내역</h2>
        <div className="today-table-wrapper">
          {todayPrices.length === 0 ? (
            <div className="no-data-msg">데이터가 없습니다.</div>
          ) : (
            <table className="today-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>가격 (만원/kg)</th>
                  <th>무게 범위</th>
                  <th>원산지</th>
                </tr>
              </thead>
              <tbody>
                {todayPrices.map((fish) => (
                  <tr key={fish.id}>
                    <td>{fish.date}</td>
                    <td>{fish.price_per_kg}</td>
                    <td>{fish.weight_min}-{fish.weight_max}kg</td>
                    <td>{fish.origin_country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <h3>총 어종</h3>
          <p className="stat-number">{todayPrices.length}종</p>
        </div>
        <div className="stat-card">
          <h3>평균 가격</h3>
          <p className="stat-number">
            {todayPrices.length > 0 ? (todayPrices.reduce((sum, fish) => sum + fish.price_per_kg, 0) / todayPrices.length).toFixed(1) : 0}만원/kg
          </p>
        </div>
        <div className="stat-card">
          <h3>최고가</h3>
          <p className="stat-number">
            {todayPrices.length > 0 ? Math.max(...todayPrices.map(fish => fish.price_per_kg)) : 0}만원/kg
          </p>
        </div>
      </div>

      <div className="price-overview">
        <h2>📊 주요 어종 시세</h2>
        <div className="price-cards">
          {todayPrices.map((fish) => (
            <div key={fish.id} className="price-card">
              <div className="fish-info">
                <h3>{fish.fish_name}</h3>
                <p className="origin">{fish.origin_country}</p>
              </div>
              <div className="price-info">
                <p className="price">{fish.price_per_kg}만원/kg</p>
                <p className="weight">{fish.weight_min}-{fish.weight_max}kg</p>
                <div className="price-change" style={{ color: getTrendColor(fish.trend) }}>
                  {getTrendIcon(fish.trend)} {fish.price_change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-section">
        <h2>📈 어종별 가격 비교</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}만원/kg`, '가격']} />
            <Legend />
            <Bar dataKey="price" fill="#8884d8" name="가격 (만원/kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="navigation-section">
        <Link to="/fish-prices" className="nav-button">
          🐠 어종별 상세 시세 보기
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 