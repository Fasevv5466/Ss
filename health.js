// health.js - نظام فحص الصحة للإصدار 24
const express = require('express');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// إحصائيات النظام
function getSystemStats() {
    return {
        node: process.version,
        platform: os.platform(),
        arch: os.arch(),
        memory: {
            total: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
            free: Math.round(os.freemem() / 1024 / 1024) + 'MB',
            used: process.memoryUsage()
        },
        uptime: process.uptime(),
        cpus: os.cpus().length
    };
}

// فحص الخدمات
async function checkServices() {
    const checks = {
        database: await checkDatabase(),
        filesystem: await checkFilesystem(),
        memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024,
        api: true
    };
    
    return {
        status: Object.values(checks).every(v => v) ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString()
    };
}

async function checkDatabase() {
    try {
        const dbPath = path.join(__dirname, 'includes/database/data.sqlite');
        return await fs.pathExists(dbPath);
    } catch {
        return false;
    }
}

async function checkFilesystem() {
    try {
        const requiredDirs = [
            'systems',
            'script/commands/data',
            'script/commands/cache'
        ];
        
        for (const dir of requiredDirs) {
            if (!await fs.pathExists(path.join(__dirname, dir))) {
                await fs.ensureDir(path.join(__dirname, dir));
            }
        }
        return true;
    } catch {
        return false;
    }
}

// الروابط
app.get('/', (req, res) => {
    res.json({
        name: 'KIRA Supreme v24',
        version: '24.11.0',
        status: 'online',
        endpoints: ['/health', '/stats', '/services']
    });
});

app.get('/health', async (req, res) => {
    const health = await checkServices();
    res.json(health);
});

app.get('/stats', (req, res) => {
    res.json(getSystemStats());
});

app.get('/services', (req, res) => {
    res.json({
        mentions: global.mentionSystem ? 'active' : 'inactive',
        commands: global.client?.commands?.size || 0,
        events: global.client?.events?.size || 0,
        threads: global.data?.allThreadID?.length || 0,
        users: global.data?.allUserID?.length || 0
    });
});

// فقط إذا لم يكن هناك سيرفر Express في index.js
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ Health check server running on port ${PORT}`);
    });
}

module.exports = { getSystemStats, checkServices };
