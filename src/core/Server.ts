import * as express from 'express';
import * as bodyParser from 'body-parser';
import { HttpError, ServerError, NotFoundError, BadRequestError } from '../utils/Error';
import { MyRouter } from './Router';
import { BaseController, TodoController } from '../controller';
import { Todo } from '../models/Todo';
import { User } from '../models/User';

/**
 * Les options de lancement du serveur
 * 
 * @interface ServerOptions
 */
interface ServerOptions {
    /**
     * Le port sur lequel le serveur devra se lancer (8080 par défaut)
     * 
     * @readonly
     * @type {number}
     */
    readonly port?: number
}
export class Server {
    /**
   * Les options qui ont été définies pour ce serveur
   * 
   * @type {ServerOptions}
   * @memberof Server
   */
    public options: ServerOptions

    /**
     * Représente l'application Express du serveur
     * 
     * @type {express.Application}
     * @memberof Server
     */
    public app: express.Application

    public controllers: BaseController[] = [];

    constructor(options: ServerOptions = {}) {
        const defaults: ServerOptions = {
            port: 8080,
        }

        this.options = { ...defaults, ...options }

        this.app = express()

        this.addInitialMiddlewares();
        this.addParams();
        this.addRouting();
        this.addFallbackMiddleware();
    }

    public start() {
        this.app.listen(this.options.port, () => {
            console.log(`http://localhost:${this.options.port}`);
        })
    }

    private addInitialMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        this.app.set('view engine', 'twig')
        this.app.set('views', __dirname + '/../views/')
    }

    private addRouting() {
        let router = express.Router();
        this.controllers.push(TodoController.init(router));

        this.app.use(router);

    }

    private addParams() {
        let models = [
            Todo,
            User
        ];

        // for (let model of models) {
        //     let modelName = model.name.toLowerCase();
        //     this.app.param(modelName, (req: any, res: express.Response, next: express.NextFunction, id) => {
        //         let _id = +id;
        //         if (_id != id) return next(new BadRequestError('Id should be a number'))

        //         model.findById(id).then((item: any) => {
        //             if (!item) return next(new NotFoundError())
        //             req[modelName] = item;
        //             next();
        //         }).catch(next);
        //     });
        // }
        this.app.param('todo', function (req, res, next, id) {
            console.log('CALLED ONLY ONCE');
            next();
          });
            this.app.param('todo', (req: any, res: express.Response, next: express.NextFunction, id) => {
                let _id = +id;
                if (_id != id) return next(new BadRequestError('Id should be a number'))

                Todo.findById(id).then((item: any) => {
                    if (!item) return next(new NotFoundError())
                    req.todo = item;
                    next();
                }).catch(next);
            });
    }

    private addFallbackMiddleware() {
        this.app.use(this.onNotFound)
        this.app.use(this.onError);
    }

    private onNotFound(req: express.Request, res: express.Response) {
        throw new NotFoundError()
    }

    private onError(error: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!(error instanceof HttpError)) {
            console.error(error)
            error = new ServerError()
        }

        return res.status(error.status || 500).json({ error })
    }

}

