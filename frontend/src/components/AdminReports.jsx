import { useState, useEffect } from 'react';

const AdminReports = () => {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [activeReport, setActiveReport] = useState('airline-bookings');

    const [startDate, setStartDate] = useState('2026-03-31');
    const [endDate, setEndDate] = useState('2026-04-04');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeReport === 'airline-bookings') {
            setLoading(true);
            fetch(`http://localhost:8000/api/reports/airline-bookings?start=${startDate}&end=${endDate}&sort=${sortOrder}`)
                .then(res => res.json())
                .then(results => {
                    const data = results.map(row => ({
                        name: `${row.airline_name} (${row.airline_code})`,
                        value: Number(row.total_bookings)
                    }));
                    setAnalyticsData(data);
                    setLoading(false);
                })
                .catch(() => {
                    setAnalyticsData([]);
                    setLoading(false);
                });
            return;
        }

        // Existing mock data for the other reports
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end - start;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) || 1;
        const multiplier = daysDiff > 0 ? daysDiff : 1;

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

        data.sort((a, b) => sortOrder === 'DESC' ? b.value - a.value : a.value - b.value);
        setAnalyticsData(data);
    }, [activeReport, startDate, endDate, sortOrder]);

    const totalValue = analyticsData.reduce((sum, row) => sum + row.value, 0);
    const maxVal = Math.max(...analyticsData.map(r => r.value), 1);

    const getColor = () => {
        if (activeReport === 'airport-revenue') return '#2e7d32';
        if (activeReport === 'airline-bookings') return '#cf102d';
        return '#cf102d';
    };

    const getLabel = () => {
        if (activeReport === 'airport-revenue') return 'Revenue';
        return 'Bookings';
    };

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', color: '#333' }}>

            {/* INPUT SECTION */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setActiveReport('airline-bookings')} style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: 'white', backgroundColor: activeReport === 'airline-bookings' ? '#cf102d' : '#666' }}>Airlines</button>
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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading report data...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>

                    {/* SUMMARY PANEL */}
                    <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', textAlign: 'left' }}>
                        <span style={{ fontSize: '10px', color: '#999', fontWeight: 'bold' }}>SYSTEM TOTAL</span>
                        <h2 style={{ margin: '5px 0 15px 0', color: getColor() }}>
                            {activeReport === 'airport-revenue' ? `$${totalValue.toLocaleString()}` : `${totalValue} ${getLabel()}`}
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
                                        backgroundColor: getColor(),
                                        height: `${(row.value / maxVal) * 100}%`,
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.3s ease-in-out',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        paddingTop: '5px',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        minHeight: row.value > 0 ? '20px' : '0'
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
            )}
        </div>
    );
};

export default AdminReports;
