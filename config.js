import 'dotenv/config'
const allowedKey = process.env.THIS_API_KEY
const cfg = {
    discord : {
        apiKey : process.env.DISCORD_API_KEY,
        serverKey : process.env.DISCORD_SERVER_KEY
    },
    server :{
        apiKeyList: allowedKey.split('|')
    }
}

// export.default = config
export default cfg