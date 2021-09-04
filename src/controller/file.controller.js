const fs = require("fs").promises;
const fsSync = require("fs");
const mime = require("mime");

class FileController {

    constructor(socket){
        this.writeStreamFiles = this.writeStreamFiles.bind(this);
        this.getListFiles = this.getListFiles.bind(this);
        this.uploadToClient = this.uploadToClient.bind(this);
        this.bufferArray = [];
        this.socket = socket;
    }

    async getListFiles(data){
        const listToSocket = await this.listFiles(data.path);
        this.socket.emit("client:listDir", {
            message: listToSocket,
            to: data.from
        });
    }

    async writeStreamFiles(data){
        switch (data.status) {
            case "init": 
                this.bufferArray = []; 
                break;
            case "in progress": 
                this.bufferArray.push(data.buffer); 
                break;
            case "end":
                const buffer = Buffer.concat(this.bufferArray);

                await fs.writeFile(data.path + data.filename, buffer);

                console.log(`Writing done`);
                const listToSocket = await this.listFiles(data.path);

                this.socket.emit("client:listDir", {
                    message: listToSocket,
                    to: data.from
                });
                break;
        }
    }

    async uploadToClient(data){
        try {
            const streamReader = fsSync.createReadStream(data.path + data.filename);

            let fileLength = 0;
            let chunkLength = 0;
            let progressLength = 0;
    
            streamReader.on("data", chunk => {

                fileLength = streamReader.readableLength;
                chunkLength = chunk.length / 1024
                progressLength = progressLength + (chunkLength / 1024)

                this.socket.emit("client:downloadFile", {
                    status: "in_progress",
                    chunk,
                    chunkLength,
                    progressLength,
                    to: data.from
                });
    
                console.log("Recebido " + parseFloat(progressLength.toFixed(2)) 
                          + "MB no total. Pedaço do dado de " + parseFloat(chunkLength.toFixed(2)) + "KB");
    
            })
    
            streamReader.on("end", ()=>{
                this.socket.emit("client:downloadFile", {
                    status: "end",
                    filename: data.filename,
                    type: mime.getType(data.path),
                    to: data.from
                });
                console.log("\nTransferência concluída.");
            })
            
        } catch (error) {
            console.log("Ocorreu um erro ao enviar arquivo");
            console.log(error.message);
            this.socket.emit("client:downloadFile", {
                status: "error",
                error: error.message,
                to: data.from
            });
        }
    }

    async listFiles (path) {
        const listDirent = await fs.readdir(path, {withFileTypes: true});
        const listToSocket = [];
    
        listDirent.forEach(dirent => {
            listToSocket.push({
                name: dirent.name,
                isDir: dirent.isDirectory()
            })
        });
    
        return listToSocket;
    }
}

module.exports = FileController;