import * as express from 'express'

export class Router{
    private router: express.Router;

    public static getRouter(){
        return new Router().router;
    }

    constructor(){
        this.router = express.Router();

        this.router.all('/', function (req, res) {
            res.redirect('/todos');
        })
        
        this.router.use(require('../controller/todo').prefixUrl, require('../controller/todo'))
        
    }

    
}