const sql = require('mssql');

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'DuLichWebsite',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    requestTimeout: 30000
};

let pool = null;

async function connectDB() {
    try {
        if (pool) {
            console.log('Đã kết nối đến database');
            return pool;
        }
        
        pool = await sql.connect(config);
        console.log('✅ Kết nối SQL Server thành công');
        console.log(`📊 Database: ${config.database} trên ${config.server}`);
        return pool;
    } catch (err) {
        console.error('❌ Lỗi kết nối database:', err.message);
        
        // Retry connection after 5 seconds
        console.log('⏳ Đang thử kết nối lại sau 5 giây...');
        setTimeout(connectDB, 5000);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await sql.close();
        console.log('Đã đóng kết nối database');
        process.exit(0);
    } catch (err) {
        console.error('Lỗi khi đóng kết nối:', err);
        process.exit(1);
    }
});

module.exports = { sql, connectDB };