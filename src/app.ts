import {Server} from './core/Server';
import {Db} from './core/Db';
import { User, Todo } from './models';

let server = new Server();
let db = new Db();
db.sync().then(async () => {
    let user = new User();
    await user.save();

    let todo1 = new Todo();
    todo1.message = "à faire";
    todo1.completion = "done";
    todo1.user = user;
    await todo1.save();

    server.start();
});
