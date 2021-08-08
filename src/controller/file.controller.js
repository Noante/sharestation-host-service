const fs = require("fs").promises;

class FileController {

    constructor(socket){
        this.writeStreamFiles = this.writeStreamFiles.bind(this);
        this.getListFiles = this.getListFiles.bind(this);
        this.bufferArray = [];
        this.socket = socket;
    }

    async getListFiles(data){
        const listToSocket = await this.listFiles(data.path);
        this.socket.emit("client:listDir", {message: JSON.stringify(listToSocket)});
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

                this.socket.emit("client:listDir", {message: JSON.stringify(listToSocket)});
                break;
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