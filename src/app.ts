import {Server} from './core/Server';
import {Db} from './core/Db';
import { User, Todo } from './models';
import { TodoStatus } from './utils';

let server = new Server();
let db = new Db();
db.sync().then(async () => {
    let user = new User({username: "tototo", password: "tototo"});
    await user.save();

    let todo1 = new Todo({message: "1 faire checkbox", completion: TodoStatus.DONE, userId: user.id});
    await todo1.save();

    let todo2 = new Todo({message: "2 bfthbfthdbf", completion: TodoStatus.TODO, userId: user.id});
    await todo2.save();

    let todo3 = new Todo({message: "3 svgsrgvrdgvd", completion: TodoStatus.IN_PROGRESS, userId: user.id});
    await todo3.save();

    let todo4 = new Todo({message: "4 gsrsvgdrgd", completion: TodoStatus.TODO, userId: user.id});
    await todo4.save();

    let todo5 = new Todo({message: "5 dsvgdrgd", completion: TodoStatus.DONE, userId: user.id});
    await todo5.save();
    
    server.start();
});
