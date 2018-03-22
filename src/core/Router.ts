import { Router } from 'express'
import { TodoController } from '../controller/TodoController';

export class MyRouter {
    private router: Router;

    public static getRouter() {
        return new MyRouter().router;
    }

    constructor() {
        this.router = Router();

        this.router.all('/', function (req, res) {
            res.redirect('/todos');
        })

        this.router.use(TodoController.baseUrl, this.todoRouter());

    }

    private todoRouter(): Router {
        let router = Router();
        let todo = new TodoController();

        return router
            .get('/', todo.index)
            .post('/', todo.create)
            .all('/:todoId', todo.parseId)
            .get('/:todoId', todo.show)
            .patch('/:todoId', todo.update)
            .delete('/:todoId', todo.delete)
    }


}