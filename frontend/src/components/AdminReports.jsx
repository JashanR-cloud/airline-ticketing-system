import React, { useState, useEffect } from 'react';

const AdminReports = () => {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [activeReport, setActiveReport] = useState('airport-revenue');
    
    // Initializing with your specific test dates, but these change via the <input>
    const [startDate, setStartDate] = useState('2026-03-31');
    const [endDate, setEndDate] = useState('2026-04-04');
    const [sortOrder, setSortOrder] = useState('DESC');

    useEffect(() => {
        // 1. Calculate the actual number of days in the range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end - start;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) || 1; 

        // 2. Multiplier: If start/end are same, multiplier is 1. If 10 days apart, multiplier is 10.
        const multiplier = daysDiff > 0 ? daysDiff : 1;

        // 3. Generate data dynamically based on the multiplier
        let data = [];
        if (activeReport === 'airport-revenue') {
            data = [
                { name: "Houston (IAH)", value: 2500 * multiplier },
                { name: "London (LHR)", value: 2100 * multiplier },
                { name: "Paris (CDG)", value: 1700 * multiplier },
                { name: "Tokyo (NRT)", value: 1300 * multiplier },
                { name: "New York (JFK)", value: 950 * multiplier }
            ];
        } else {
            data = [
                { name: "IAH → LHR", value: Math.floor(8 * multiplier) },
                { name: "JFK → CDG", value: Math.floor(6 * multiplier) },
                { name: "LHR → NRT", value: Math.floor(4 * multiplier) },
                { name: "CDG → IAH", value: Math.floor(3 * multiplier) }
            ];
        }

        // 4. Apply the Sort Order the Admin selected
        data.sort((a, b) => sortOrder === 'DESC' ? b.value - a.value : a.value - b.value);
        
        setAnalyticsData(data);
    }, [activeReport, startDate, endDate, sortOrder]); // Re-runs every time ANY input changes

    const totalValue = analyticsData.reduce((sum, row) => sum + row.value, 0);
    const maxVal = Math.max(...analyticsData.map(r => r.value), 1);

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', color: '#333' }}>
            
            {/* INPUT SECTION */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setActiveReport('airport-revenue')} style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: 'white', backgroundColor: activeReport === 'airport-revenue' ? '#cf102d' : '#666' }}>Revenue</button>
                    <button onClick={() => setActiveReport('popular-routes')} style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: 'white', backgroundColor: activeReport === 'popular-routes' ? '#cf102d' : '#666' }}>Routes</button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <label><b>From:</b></label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <label><b>To:</b></label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <label><b>Sort:</b></label>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="DESC">Highest First</option>
                        <option value="ASC">Lowest First</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
                
                {/* SUMMARY PANEL */}
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', textAlign: 'left' }}>
                    <span style={{ fontSize: '10px', color: '#999', fontWeight: 'bold' }}>SYSTEM TOTAL</span>
                    <h2 style={{ margin: '5px 0 15px 0', color: activeReport === 'airport-revenue' ? '#2e7d32' : '#cf102d' }}>
                        {activeReport === 'airport-revenue' ? `$${totalValue.toLocaleString()}` : `${totalValue} Bookings`}
                    </h2>
                    <table style={{ width: '100%', fontSize: '12px' }}>
                        <tbody>
                            {analyticsData.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '8px 0' }}>{row.name}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                        {activeReport === 'airport-revenue' ? `$${row.value.toLocaleString()}` : row.value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* VISUAL CHART AREA */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '300px', padding: '20px 40px', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}>
                    {analyticsData.map((row, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                <div style={{ 
                                    backgroundColor: activeReport === 'airport-revenue' ? '#2e7d32' : '#cf102d', 
                                    height: `${(row.value / maxVal) * 100}%`, 
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.3s ease-in-out',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                    paddingTop: '5px',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    {activeReport === 'airport-revenue' ? `$${Math.round(row.value/1000)}k` : row.value}
                                </div>
                            </div>
                            <div style={{ fontSize: '10px', marginTop: '10px', textAlign: 'center', fontWeight: 'bold', color: '#555' }}>
                                {row.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
