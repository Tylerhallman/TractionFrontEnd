const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');

const { connectDb }=require('./orm/index')


const authRouter = require('./routes/auth')
const productRouter = require('./routes/product')
const uploadRouter = require('./routes/upload')
const categoryRouter = require('./routes/category')
const collectionRouter = require('./routes/collection')
const customerRouter = require('./routes/customer')
const settingRouter = require('./routes/setting')
const storeRouter = require('./routes/store')

const lightspeedCron = require('./utils/lightspeed-cron')

const app = express();
app.set('views', path.join(__dirname, 'views'));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));


app.use('/auth', authRouter)
app.use('/product', productRouter)
app.use('/upload', uploadRouter)
app.use('/category', categoryRouter)
app.use('/collection', collectionRouter)
app.use('/customer',customerRouter)
app.use('/setting', settingRouter)
app.use('/store', storeRouter)



app.use('/', (req, res) => res.json({ status: "ok - homePage" }));

app.use((err, req, res, next) => {
    res
        .status(err.statusCode || err.code || 500)
        .json({
            message: err.message || 'Unexpected',
            errorCode: err.errorCode ? err.errorCode : 0
        });
});

;
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
