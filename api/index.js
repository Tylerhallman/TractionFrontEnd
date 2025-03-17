const app = require("../app")

const {connectDb} = require("../orm");
const lightspeedCron = require("../utils/lightspeed-cron");

async function assertDatabaseConnectionOk() {
    console.log(`Checking database connection...`);
    try {
        await connectDb();
        console.log('Database connection OK!');
    } catch (error) {
        console.log('Unable to connect to the database:');
        process.exit(1);
    }
}

async function init() {
    await assertDatabaseConnectionOk();
    await lightspeedCron.synchronizeProducts();
}

init();

module.exports = app;