const mysql = require('mysql2/promise');

// --- 1. CONFIGURATION ---
// Replace these with your HOSTED Database details
const dbConfig = {
    host: 'my-mysql.mysql.svc.cluster.local', 
    user: 'root',                          
    password: 'swarsetu@aaryatilak',     
    port: 3306,                            
    multipleStatements: true // Allows running multiple SQL commands at once
};

const dbName = 'swarsetu1';

// --- 2. SQL COMMANDS ---
const createTablesSql = `
    CREATE DATABASE IF NOT EXISTS ${dbName};
    USE ${dbName};

    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Songs Table (With Image & Category)
    CREATE TABLE IF NOT EXISTS songs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        category VARCHAR(50) DEFAULT 'New Release',
        filename VARCHAR(255) NOT NULL,
        image_filename VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Likes Table
    CREATE TABLE IF NOT EXISTS user_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        song_id INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (user_id, song_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
`;

// --- 3. EXECUTION FUNCTION ---
async function setup() {
    console.log("🔌 Connecting to MySQL...");
    let connection;

    try {
        // Connect to the server (without specifying database yet)
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });

        console.log("✅ Connected! Initializing Tables...");
        
        // Run the SQL
        await connection.query(createTablesSql);
        
        console.log("🚀 SUCCESS: Database 'swarsetu1' and all tables created!");
        console.log("   - Users Table: OK");
        console.log("   - Songs Table: OK");
        console.log("   - Likes Table: OK");

    } catch (error) {
        console.error("❌ ERROR:", error.message);
    } finally {
        if (connection) await connection.end();
    }
}

// Run the setup
setup();