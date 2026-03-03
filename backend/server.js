const http = require('http');
const mysql = require('mysql2');

// 1. Database Connection
// Replace these with your actual database credentials
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password', // Put your real password here
    database: 'cosc3380_project' // Put your real DB name here
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// 2. Create the Server
const server = http.createServer((req, res) => {

    // --- CORS HEADERS (Crucial for React connection) ---
    // Since you aren't using the 'cors' package, you must set these headers manually.
    // This allows your frontend (running on a different port) to talk to this backend.
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Content-Type', 'application/json');

    // Handle "Preflight" requests (Browser checking if it's safe to connect)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- ROUTES ---

    // Route 1: GET all users
    // Frontend fetches this via: fetch('http://localhost:8000/users')
    if (req.url === '/users' && req.method === 'GET') {
        const sql = 'SELECT * FROM users'; // Replace "users" with your table name
        
        db.query(sql, (err, results) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            } else {
                res.writeHead(200);
                res.end(JSON.stringify(results));
            }
        });
    }

    // Route 2: POST a new user (Handling data from Frontend)
    // Frontend sends data via POST method
    else if (req.url === '/add-user' && req.method === 'POST') {
        let body = '';

        // Raw Node requires us to collect data "chunks"
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const parsedData = JSON.parse(body);
            const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
            
            db.query(sql, [parsedData.name, parsedData.email], (err, result) => {
                if (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: err.message }));
                } else {
                    res.writeHead(201);
                    res.end(JSON.stringify({ message: 'User added!', id: result.insertId }));
                }
            });
        });
    }

    // 404 Not Found (For any URL that doesn't match above)
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

// 3. Start the Server
const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});