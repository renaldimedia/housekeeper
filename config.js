import 'dotenv/config'
const cfg = {
    discord : {
        apiKey : process.env.DISCORD_API_KEY,
        serverKey : process.env.DISCORD_SERVER_KEY
    }
}

// export.default = config
export default cfg