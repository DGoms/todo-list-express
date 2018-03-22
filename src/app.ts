import {Server} from './core/Server';
import {Db} from './core/Db';

let server = new Server();
let db = new Db();
db.sync().then(() => {
    server.start();
});
