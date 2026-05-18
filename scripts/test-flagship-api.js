const http = require('http');

http.get('http://localhost:3000/api/flagship', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("=== API Response /api/flagship ===");
        console.log(data);
        process.exit(0);
    });
}).on('error', (err) => {
    console.error("Error fetching API:", err.message);
    process.exit(1);
});
