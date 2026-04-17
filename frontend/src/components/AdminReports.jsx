import React, { useState, useEffect } from 'react';

const AdminReports = () => {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [activeReport, setActiveReport] = useState('airport-revenue');
    
    // User Input Filters 
    const [startDate, setStartDate] = useState('2026-03-31');
    const [endDate, setEndDate] = useState('2026-04-04');
    const [sortOrder, setSortOrder] = useState('DESC');

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/reports/${activeReport}?start=${startDate}&end=${endDate}&sort=${sortOrder}`);
            const data = await response.json();
            setAnalyticsData(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch failed:", err);
            setAnalyticsData([]);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [activeReport, startDate, endDate, sortOrder]);

    const totalValue = analyticsData.reduce((sum, row) => 
        sum + parseFloat(row.total_revenue || row.total_bookings || 0), 0);

    const maxVal = analyticsData.length > 0 
        ? Math.max(...analyticsData.map(row => parseFloat(row.total_revenue || row.total_bookings || 1))) 
        : 1;

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', color: '#111' }}>
            {/* Control Panel */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setActiveReport('airport-revenue')} style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: 'white', backgroundColor: activeReport === 'airport-revenue' ? '#cf102d' : '#666' }}>Revenue</button>
                    <button onClick={() => setActiveReport('popular-routes')} style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: 'white', backgroundColor: activeReport === 'popular-routes' ? '#cf102d' : '#666' }}>Routes</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <label><b>From:</b></label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <label><b>To:</b></label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <label style={{ marginLeft: '10px' }}><b>Sort:</b></label>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="DESC">Highest First</option>
                        <option value="ASC">Lowest First</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* Breakdown Table */}
                <div style={{ background: '#fdfdfd', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: 'bold' }}>SUMMARY BREAKDOWN</p>
                    <h2 style={{ margin: '5px 0', color: activeReport === 'airport-revenue' ? '#1a6e3c' : '#1a1a2e' }}>
                        {activeReport === 'airport-revenue' ? `$${totalValue.toLocaleString()}` : `${totalValue} Bookings`}
                    </h2>
                    <hr />
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#666' }}>
                                    <th>Source</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '6px 0' }}>{row.airport_name || row.route_name}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            {activeReport === 'airport-revenue' ? `$${parseFloat(row.total_revenue).toLocaleString()}` : row.total_bookings}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '280px', background: '#fff', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                    {analyticsData.map((row, i) => (
                        <div key={i} 
                             title={row.airport_name || row.route_name}
                             style={{ 
                                flex: 1, 
                                backgroundColor: activeReport === 'airport-revenue' ? '#2e7d32' : '#cf102d', 
                                height: `${((parseFloat(row.total_revenue || row.total_bookings) || 0) / maxVal) * 100}%`, 
                                minHeight: '4px',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s ease'
                             }} 
                        />
                    ))}
                    {analyticsData.length === 0 && <p style={{ width: '100%', textAlign: 'center', color: '#999' }}>No data matching filters.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
