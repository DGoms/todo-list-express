import {Server} from './core/Server';
import {Db} from './core/Db';
import { User, Todo } from './models';

let server = new Server();
let db = new Db();
db.sync().then(async () => {
    let user = new User({username: "tototo", password: "tototo"});
    await user.save();
    
    server.start();
});
