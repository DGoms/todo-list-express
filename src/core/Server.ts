import * as express from 'express'
import * as bodyParser from 'body-parser';
import {HttpError, ServerError, NotFoundError} from '../utils/Error';
import { MyRouter } from './Router';

export class Server{
    private app: express.Express;
    private port: number;

    constructor(port?: number){
        this.app = express();
        this.port = port || 8080;

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        this.app.set('view engine', 'twig')
        this.app.set('views', __dirname + '/../views/')

        this.app.use(MyRouter.getRouter());

        this.app.use((req, res, next) => {
            throw new NotFoundError()
        })

        this.app.use(this.onError);
        
    }

    public start(){
        this.app.listen(this.port, () => {
            console.log(`http://localhost:${this.port}`);
        })
    }

    private onError(error: any, req: express.Request, res: express.Response, next: express.NextFunction){
        if (!(error instanceof HttpError)) {
            console.error(error)
            error = new ServerError()
        }
    
        return res.status(error.status || 500).json({ error })
    }
    
}

