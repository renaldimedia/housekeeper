import 'dotenv/config'
const allowedKey = process.env.THIS_API_KEY
const cfg = {
    discord : {
        apiKey : process.env.DISCORD_API_KEY,
        serverKey : process.env.DISCORD_SERVER_KEY
    },
    server :{
        apiKeyList: allowedKey.split('|'),
        port: process.env.THIS_PORT ? process.env.THIS_PORT : 3000 
    }
}

// export.default = config
export default cfg