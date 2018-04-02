import { Request, Response, NextFunction, Router, IRouterMatcher } from "express";
import * as Path from 'path';
import * as bcrypt from 'bcrypt';
import { ValidationError, ValidationErrorItem } from "sequelize";
import { BadRequestError, NotFoundError, ServerError } from "../utils/Error";
import { MyRequest } from "../utils";
import { User } from "../models";

export abstract class BaseController {
    /**
     * Singleton
     * 
     * @protected
     * @static
     * @type {BaseController}
     * @memberof BaseController
     */
    protected static instance: BaseController;

    /**
     * Base url of routes
     * 
     * @protected
     * @type {string}
     * @memberof BaseController
     */
    protected static baseUrl: string = '';

    /**
     * Routes of the controller
     * 
     * @protected
     * @type {IRoute[]}
     * @memberof BaseController
     */
    protected static routes: IRoute[] = [];

    protected req: MyRequest;
    protected res: Response;
    protected next: NextFunction;

    protected constructor() {}

    /* =============================================
     *              Static
     * ============================================= */ 

    /**
     * Init the controller and routes
     * 
     * @static
     * @param {Router} router 
     * @memberof BaseController
     */
    public static init(router: Router): void{
        
        this.configureRoute(router);

    }

    /**
     * Add routes of the controllers to the router
     * 
     * @private
     * @param {Router} router 
     * @memberof BaseController
     */
    private static configureRoute(router: Router){
        let controller:BaseController = new (<any>this)();
        let _router = router;

        for(let route of this.routes){
            let method = route.httpMethod || HttpMethod.ALL;

            let path = route.path;
            if(!route.root) path = Path.join(this.baseUrl, path);

            _router[method](path, (req, res, next) => { controller.call(route.action, req, res, next)});
        }
    }

    protected static pathJoin(...paths: string[]){
        return Path.join(this.baseUrl, ...paths);
    }

    /* =============================================
     *              Non-Static
     * ============================================= */ 

    public call(action: string, req: MyRequest, res: Response, next: NextFunction){
        this.req = req;
        this.res = res;
        this.next = next;

//TODO
this.setUser(1);
        let _this: any = this;
        _this[action]();
    }

    protected async render(view: string, options?: any){
        if(!options)
            options = {};
        
        options['app'] = {};

        //add user
        let user = await this.getUser();
        if(user)
            options['app']['user'] = user;

        //Add alert messages and delete from session
        let successes = this.req.session.alert ? this.req.session.alert.successes : undefined;
        let errors = this.req.session.alert ? this.req.session.alert.errors : undefined;
        options['app']['alert'] = {
            successes,
            errors
        }

        this.req.session.alert = {};
        await this.saveSession();
        
        
        this.res.render(view, options);
    }

    protected isBodyEmpty(): boolean{
        return this.req.body.constructor === Object && Object.keys(this.req.body).length === 0
    }

    protected handleValidationError(err: any): ValidationErrorItem[]{
        if (err instanceof ValidationError) {
            return (<ValidationError>err).errors;
        }
        else {
            this.next(err);
        }
    }

    /**
     * Return the logged user or null
     * 
     * @readonly
     * @protected
     * @type {User}
     * @memberof BaseController
     */
    protected async getUser(): Promise<User>{
        if(this.req.session && this.req.session.userId){
            if(this.res.locals.user)
                return this.res.locals.user;
            else{
                let user = await User.findById(this.req.session.userId);
                this.res.locals.user = user;
                return user;
            }
        }
        else
            return null;
    }

    /**
     * Set user as the logged user
     * 
     * @protected
     * @memberof BaseController
     */
    protected setUser(userOrId?: User|number){
        if(userOrId instanceof User)
            userOrId = userOrId.id;

        this.req.session.userId = userOrId;
        this.saveSession().catch((err) => {this.next(err)});
    }

    protected async checkAndSetUser(username: string, password: string): Promise<boolean>{
        let isOk = false;

        let user = await User.findOne({ where: { username: username } }).catch(this.next);
        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                this.setUser(user);
                isOk = true;
            }
        }

        return isOk;
    }

    protected saveSession(): Promise<any>{
        return new Promise((resolve, reject) => {
            this.req.session.save((err) => {
                if(!err){
                    resolve();
                }else{
                    reject(err);
                }
            })
        });
    }
}

export interface IRoute{
    httpMethod: HttpMethod;
    path: string;
    action: any;
    root?: boolean
}

export enum HttpMethod{
    ALL = "all",
    GET = "get",
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    DELETE = 'delete'
}