import {Server} from './core/Server';
import {Db} from './core/Db';
import { User, Todo, Team } from './models';
import { TodoStatus } from './utils';

let server = new Server();
let db = new Db();
db.sync().then(async () => {
    
    // await dataTest();
    server.start();
});

async function dataTest(): Promise<any>{
    let promises: any[] = []

    let team = new Team({name: "Texas Ranger"});
    await team.save();

    let user = new User({username: "tototo", password: "tototo", teamId: team.id});
    await user.save();

    let user2 = new User({username: "user 2", password: "tototo", teamId: team.id});
    await user2.save();

    let todo1 = new Todo({message: "1 faire checkbox", completion: TodoStatus.DONE, userId: user.id});
    promises.push(todo1.save());

    let todo2 = new Todo({message: "2 bfthbfthdbf", completion: TodoStatus.TODO, userId: user2.id});
    promises.push(todo2.save());

    let todo3 = new Todo({message: "3 svgsrgvrdgvd", completion: TodoStatus.IN_PROGRESS, userId: user2.id});
    promises.push(todo3.save());

    let todo4 = new Todo({message: "4 gsrsvgdrgd", completion: TodoStatus.TODO, userId: user.id});
    promises.push(todo4.save());

    let todo5 = new Todo({message: "5 dsvgdrgd", completion: TodoStatus.DONE, userId: user.id});
    promises.push(todo5.save());

    await Promise.all(promises);
}
