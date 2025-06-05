const express = require('express');
const cors = require('cors');
const path = require('path');

const { connectDb }=require('./orm')

const authRouter = require('./routes/auth')
const productRouter = require('./routes/product')
const uploadRouter = require('./routes/upload')
const categoryRouter = require('./routes/category')
const typeRouter = require('./routes/type')
const customerRouter = require('./routes/customer')
const settingRouter = require('./routes/setting')
const storeRouter = require('./routes/store')
const leadRouter = require('./routes/lead')
const contentRouter = require('./routes/contentFull')

const lightspeedCron = require('./utils/lightspeed-cron')

const app = express();


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter)
app.use('/product', productRouter)
app.use('/upload', uploadRouter)
app.use('/category', categoryRouter)
app.use('/type', typeRouter)
app.use('/customer',customerRouter)
app.use('/setting', settingRouter)
app.use('/store', storeRouter)
app.use('/lead', leadRouter)
app.use('/content', contentRouter)

app.get('/', (req, res) => res.json({ status: "ok - homePage" }));

app.use((err, req, res, next) => {
    res
        .status(err.statusCode || err.code || 500)
        .json({
            message: err.message || 'Unexpected',
            errorCode: err.errorCode ? err.errorCode : 0
        });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
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
