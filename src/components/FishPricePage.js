import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './FishPricePage.css';

const FishPricePage = () => {
  const [selectedFish, setSelectedFish] = useState('');
  const [fishData, setFishData] = useState([]);
  const [fishList, setFishList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFishList();
  }, []);

  useEffect(() => {
    if (selectedFish) fetchFishData();
  }, [selectedFish]);

  const fetchFishList = async () => {
    try {
      const response = await fetch('http://203.252.147.202:9010/api/fish-list');
      if (response.ok) {
        const data = await response.json();
        setFishList(data);
        if (data.length > 0) setSelectedFish(data[0]);
      } else {
        setFishList([]);
      }
    } catch (error) {
      setFishList([]);
    }
  };

  const fetchFishData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://203.252.147.202:9010/api/fish-prices/${encodeURIComponent(selectedFish)}?days=7`);
      if (response.ok) {
        const data = await response.json();
        setFishData(data.length > 0 ? data : []);
      } else {
        setFishData([]);
      }
      setLoading(false);
    } catch (error) {
      setFishData([]);
      setLoading(false);
    }
  };

  const priceChartData = fishData.map(fish => ({
    date: fish.date,
    price: fish.price_per_kg,
    weight: (fish.weight_min + fish.weight_max) / 2
  }));

  const latestPrice = fishData[fishData.length - 1];

  return (
    <div className="fish-price-container">
      <div className="fish-price-header">
        <div className="header-top">
          <Link to="/" className="back-button">← 대시보드로 돌아가기</Link>
          <h1>🐟 어종별 상세 시세</h1>
        </div>
        <div className="selectors">
          <div className="selector">
            <label htmlFor="fish-select">어종 선택:</label>
            <select id="fish-select" value={selectedFish} onChange={e => setSelectedFish(e.target.value)}>
              {fishList.map(fish => (
                <option key={fish} value={fish}>{fish}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {latestPrice && (
        <div className="latest-price-section">
          <h2>📊 {selectedFish} 최근 시세</h2>
          <div className="price-cards">
            <div className="price-card">
              <h3>현재 가격</h3>
              <p className="price">{latestPrice.price_per_kg}만원/kg</p>
            </div>
            <div className="price-card">
              <h3>무게 범위</h3>
              <p className="weight">{latestPrice.weight_min}-{latestPrice.weight_max}kg</p>
            </div>
            <div className="price-card">
              <h3>원산지</h3>
              <p className="origin">{latestPrice.origin_country}</p>
            </div>
          </div>
        </div>
      )}

      <div className="charts-section">
        <div className="chart-container">
          <h2>{selectedFish} 시세 변화 (최근 7일)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={priceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#8884d8" name="가격 (만원/kg)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h2>{selectedFish} 무게 변화</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={priceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="weight" fill="#82ca9d" name="평균 무게 (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="fish-list-section">
        <h2>📋 {selectedFish} 상세 시세 내역</h2>
        <div className="fish-table">
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>가격 (만원/kg)</th>
                <th>무게 범위</th>
                <th>원산지</th>
              </tr>
            </thead>
            <tbody>
              {fishData.map((fish) => (
                <tr key={fish.id}>
                  <td>{fish.date}</td>
                  <td>{fish.price_per_kg}</td>
                  <td>{fish.weight_min}-{fish.weight_max}kg</td>
                  <td>{fish.origin_country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FishPricePage; 