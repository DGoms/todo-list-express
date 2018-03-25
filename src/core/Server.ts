import * as express from 'express';
import * as bodyParser from 'body-parser';
import { HttpError, ServerError, NotFoundError, BadRequestError } from '../utils/Error';
import { BaseController, TodoController } from '../controller';
import { Todo, User } from '../models';

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

    /**
     * If the visitor need to be auth before enter on site
     * 
     * @type {boolean}
     * @memberof ServerOptions
     */
    readonly needUserAuth?: boolean
}
export class Server {
    /**
     * The server options
     * 
     * @type {ServerOptions}
     * @memberof Server
     */
    public options: ServerOptions

    /**
     * Represente express application of the server
     * 
     * @type {express.Application}
     * @memberof Server
     */
    public app: express.Application

    public static models: any[] = [
        Todo,
        User
    ]

    /**
     * lists of controllers whose routes we want to add
     * 
     * @static
     * @type {any[]} Array of controllers
     * @memberof Server
     */
    public static controllers: any[] = [
        TodoController
    ];

    constructor(options: ServerOptions = {}) {
        const defaults: ServerOptions = {
            port: 8080,
            needUserAuth: false,
        }

        this.options = { ...defaults, ...options }

        this.app = express()

        this.addInitialMiddlewares();

        let router = express.Router();
        this.addParamModels(router);
        this.addRoutingControllers(router);
        this.app.use(router);

        this.addFallbackMiddleware();
    }

    /**
     * Start the server with the port defined in ServerOptions or use the default port 8080
     * 
     * @memberof Server
     */
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

    private addRoutingControllers(router: express.Router) {
        for (let item of Server.controllers) {
            if (item.__proto__.name === BaseController.name)
                item.init(router);
        }
    }

    private addParamModels(router: express.Router) {
        for (let model of Server.models) {
            let modelName = model.name.toLowerCase();
            router.param(modelName, (req: any, res: express.Response, next: express.NextFunction, id) => {
                let _id = +id;
                if (_id != id) return next(new BadRequestError('Id should be a number'))

                model.scope('full').findOne(id).then((item: any) => {
                    if (!item) return next(new NotFoundError())
                    req[modelName] = item;
                    next();
                }).catch(next);
            });
        }
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

