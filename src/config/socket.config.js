const io = require("socket.io-client");

class SocketConfig {

    constructor(){
        this.URL = "http://ec2-18-221-36-179.us-east-2.compute.amazonaws.com:3004";
        this.socket = io.connect(this.URL, { 
            reconnection: true 
        });
    }

}

module.exports = new SocketConfig();