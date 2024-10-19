export default () => ({
    port: process.env.PORT,
    jwt_secret: process.env.JWT_SECRET,
    host_db: process.env.HOST_DB,
    port_db: process.env.PORT_DB,
    username_db: process.env.USERNAME_DB,
    password_db: process.env.PASSWORD_DB,
    name_db: process.env.NAME_DB,
    aws_region: process.env.AWS_REGION,
    aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
    aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
})