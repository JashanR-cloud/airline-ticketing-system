import { useState, useEffect } from "react";

// Recharts components for building the graph
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";


// MAIN COMPONENT
const AdminReports = ({API}) => {

    // STATE MANAGEMENT

    // Stores processed data for the chart
    const [analyticsData, setAnalyticsData] = useState([]);

    // Which report is currently active
    const [activeReport, setActiveReport] = useState("airline-bookings");

    // Date filters
    const [startDate, setStartDate] = useState("2026-03-31");
    const [endDate, setEndDate] = useState("2026-04-04");

    // Sorting option
    const [sortOrder, setSortOrder] = useState("DESC");

    // Loading state for UX feedback
    const [loading, setLoading] = useState(false);

    // Controls how many bars are shown at once
    const [resultLimit, setResultLimit] = useState(10);

    // Controls whether to show the highest or lowest values
    const [resultMode, setResultMode] = useState("top");

    const pieColors = [
        "#fe0c0c",
        "#ffb347",
        "#5900ff",
        "#479400",
        "#90008c",
        "#5bd3ff",
        "#fcf805",
        "#bffff3",
        "#ffffff",
        "#000000",
    ];

    // Create the subset of data the user wants to view
    const visibleData =
        resultMode === "top"
            ? analyticsData.slice(0, resultLimit)
            : [...analyticsData].reverse().slice(0, resultLimit);


    // FETCH DATA FROM BACKEND
    useEffect(() => {
        setLoading(true);

        // Determine endpoint based on selected report
        let endpoint = "";
        if (activeReport === "airline-bookings") endpoint = "airline-bookings";
        else if (activeReport === "airport-revenue") endpoint = "airport-revenue";
        else endpoint = "popular-routes";

        // Fetch data
        fetch(`${API}/api/reports/${endpoint}?start=${startDate}&end=${endDate}&sort=${sortOrder}`)
            .then((res) => res.json())
            .then((results) => {

                // Transform backend data into { name, value }
                let data = [];

                if (activeReport === "airline-bookings") {
                    data = results.map(row => ({
                        name: `${row.airline_name} (${row.airline_code})`,
                        value: Number(row.total_bookings)
                    }));
                }
                else if (activeReport === "airport-revenue") {
                    data = results.map(row => ({
                        name: row.airport_name,
                        value: Number(row.total_revenue)
                    }));
                }
                else {
                    data = results.map(row => ({
                        name: row.route_name,
                        value: Number(row.total_bookings)
                    }));
                }

                setAnalyticsData(data);
                setLoading(false);
            })
            .catch(() => {
                setAnalyticsData([]);
                setLoading(false);
            });

    }, [activeReport, startDate, endDate, sortOrder]);


    // DERIVED VALUES

    // Total value across all rows
    const totalValue = analyticsData.reduce((sum, row) => sum + row.value, 0);

    // Label helper
    const getLabel = () => {
        if (activeReport === "airport-revenue") return "Revenue";
        return "Bookings";
    };

    // Format values for display
    const formatValue = (value) => {
        if (activeReport === "airport-revenue") return `$${value.toLocaleString()}`;
        return value.toLocaleString();
    };


    // COMPONENT UI
    return (
        <div
            className="result-card"
            style={{
                padding: "24px",
                borderRadius: "24px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                backdropFilter: "blur(14px)",
                color: "white",
            }}
        >

            {/* HEADER SECTION */}
            <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "28px", marginBottom: "6px" }}>
                    Admin Analytics
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)" }}>
                    View system-wide performance metrics
                </p>
            </div>


            {/* FILTER / CONTROL PANEL*/}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    padding: "18px",
                    borderRadius: "18px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    marginBottom: "24px",
                }}
            >

                {/* REPORT TYPE BUTTONS */}
                <div style={{ display: "flex", gap: "10px" }}>
                    {["airline-bookings", "airport-revenue", "popular-routes"].map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveReport(type)}
                            style={{
                                padding: "10px 16px",
                                borderRadius: "999px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "700",
                                background:
                                    activeReport === type
                                        ? "linear-gradient(135deg, #ff8a3d, #ffb347)"
                                        : "rgba(255,255,255,0.1)",
                                color: activeReport === type ? "#1f1400" : "white",
                            }}
                        >
                            {type === "airline-bookings" && "Airlines"}
                            {type === "airport-revenue" && "Revenue"}
                            {type === "popular-routes" && "Routes"}
                        </button>
                    ))}
                </div>

                {/* DATE + SORT CONTROLS */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginLeft: "auto" }}>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="DESC">Highest First</option>
                        <option value="ASC">Lowest First</option>
                    </select>


                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "13px", fontWeight: "700", color: "rgba(255,255,255,0.88)" }}>
                                Count
                            </label>
                            <select
                                value={resultLimit}
                                onChange={(e) => setResultLimit(Number(e.target.value))}
                                style={{
                                    background: "rgb(32, 30, 30)",
                                    color: "#ffff",
                                    border: "1px solid rgba(255, 255, 255, 0.22)",
                                    borderRadius: "14px",
                                    padding: "12px 14px",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                            >
                                <option value={5} style={{ color: "#ffffff" }}>5</option>
                                <option value={10} style={{ color: "#ffffff" }}>10</option>
                                <option value={15} style={{ color: "#ffffff" }}>15</option>
                                <option value={20} style={{ color: "#ffffff" }}>20</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>


            {/* LOADING / EMPTY STATES*/}
            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    Loading report data...
                </div>
            ) : analyticsData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    No data found.
                </div>
            ) : (

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Top row: Total info + Pie chart */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "300px 1fr",
                            gap: "24px",
                        }}
                    >
                        {/* SUMMARY PANEL */}
                        <div
                            style={{
                                padding: "20px",
                                borderRadius: "20px",
                                background: "rgba(0, 0, 0, 0.07)",
                                border: "1px solid rgba(255,255,255,0.14)",
                            }}
                        >
                            <h3>Total</h3>
                            <h2 style={{ marginBottom: "16px" }}>
                                {activeReport === "airport-revenue"
                                    ? formatValue(totalValue)
                                    : `${totalValue} ${getLabel()}`}
                            </h2>

                            {visibleData.map((row, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "8px",
                                        gap: "10px",
                                    }}
                                >
                                    <span style={{ color: "rgba(255,255,255,0.78)" }}>{row.name}</span>
                                    <strong>{formatValue(row.value)}</strong>
                                </div>
                            ))}
                        </div>

                        {/* PIE CHART PANEL */}
                        <div
                            style={{
                                padding: "20px",
                                borderRadius: "20px",
                                background: "rgba(0, 0, 0, 0.07)",
                                border: "1px solid rgba(255,255,255,0.14)",
                                height: "380px",
                            }}
                        >

                            <h3
                                style={{
                                    color: "white",
                                    marginBottom: "14px",
                                    fontSize: "20px",
                                    fontWeight: "600",
                                }}
                            >
                                Distribution Breakdown
                            </h3>

                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={visibleData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        innerRadius={55}
                                        paddingAngle={3}
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {visibleData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={pieColors[index % pieColors.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: "#1a2332",
                                            border: "1px solid rgba(255,255,255,0.2)",
                                            borderRadius: "10px",
                                            color: "white",
                                        }}
                                        formatter={(value) =>
                                            activeReport === "airport-revenue"
                                                ? `$${value.toLocaleString()}`
                                                : value.toLocaleString()
                                        }
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar chart panel */}
                    <div
                        style={{
                            padding: "20px",
                            borderRadius: "20px",
                            background: "rgba(0, 0, 0, 0.07)",
                            border: "1px solid rgba(255,255,255,0.14)",
                            height: "420px",
                        }}
                    >

                        <h3
                            style={{
                                color: "white",
                                marginBottom: "14px",
                                fontSize: "20px",
                                fontWeight: "600",
                            }}
                        >
                            Performance Comparison
                        </h3>
                        
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={visibleData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 70 }}
                            >
                                <XAxis
                                    dataKey="name"
                                    stroke="rgba(255,255,255,0.7)"
                                    tick={{ fontSize: 11 }}
                                    interval={0}
                                    angle={-20}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis stroke="rgba(255,255,255,0.7)" />
                                <Tooltip
                                    contentStyle={{
                                        background: "#1a2332",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        borderRadius: "10px",
                                        color: "white",
                                    }}
                                    formatter={(value) =>
                                        activeReport === "airport-revenue"
                                            ? `$${value.toLocaleString()}`
                                            : value.toLocaleString()
                                    }
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#ff8a3d"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;