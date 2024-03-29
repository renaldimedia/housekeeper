import 'dotenv/config'
import axios from 'axios'
import { encode, decode } from 'js-base64';


const allowedKey = process.env.THIS_API_KEY
const formPassword = function(pass){
    if(process.env.SYSTEM_IS_PRODUCTION == 1){
        let px = pass.replaceAll("|", " ");
        return px;
    }

    return pass;
}
const cfg = {
    discord : {
        apiKey : process.env.DISCORD_API_KEY,
        serverKey : process.env.DISCORD_SERVER_KEY
    },
    server :{
        apiKeyList: allowedKey.split('|'),
        port: process.env.THIS_PORT ? process.env.THIS_PORT : 3000 
    },
    web:{
        baseUrl: process.env.SYSTEM_URL,
        request: axios.create({
            baseURL: process.env.SYSTEM_URL,
            auth: {
                username: process.env.SYSTEM_USERNAME,
                password: formPassword(process.env.SYSTEM_PASSWORD)
            },
          })
    },
    interaction:{
        activatePackage: process.env.PACKAGE_ACTIVATION
    }
}

// export.default = config
export default cfg