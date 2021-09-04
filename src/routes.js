const FileController = require("./controller/file.controller");

module.exports = (socket) => {
    const fileController = new FileController(socket);

    socket.on("host:listDir", fileController.getListFiles);
    socket.on("host:uploadFile", fileController.writeStreamFiles);
    socket.on("host:downloadFile", fileController.uploadToClient);
}