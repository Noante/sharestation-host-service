const config = require("./src/config/socket.config");
const routes = require("./src/routes");

config.socket.auth = { username: "clientNode1" };
routes(config.socket);

console.log("Escutando as rotas host do socket");