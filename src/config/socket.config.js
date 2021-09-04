const io = require("socket.io-client");

class SocketConfig {

    constructor(){
        this.URL = "http://localhost:3004";
        this.socket = io.connect(this.URL, { 
            reconnection: true 
        });
    }

}

module.exports = new SocketConfig();