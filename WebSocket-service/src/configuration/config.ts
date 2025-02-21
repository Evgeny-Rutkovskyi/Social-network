export default () => ({
    mongo_db_url: process.env.MONGO_DB_URL,
    port: process.env.PORT,
    rmq_url: process.env.RMQ_URL,
    queue_name: process.env.QUEUE_NAME,
    jwt_secret: process.env.JWT_SECRET
})