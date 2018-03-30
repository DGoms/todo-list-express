import { BaseController, IRoute, HttpMethod } from ".";
import { BadRequestError } from "../utils";

/**
 * 
 * 
 * @export
 * @class DefaultController
 * @extends {BaseController}
 */
export class DefaultController extends BaseController{

    protected static routes: IRoute[] = [
        {httpMethod: HttpMethod.ALL, path: '*', action: 'checkLogin'},
        {httpMethod: HttpMethod.ALL, path: '/', action: 'redirectTodos'},
    ]
    
    public async checkLogin(){
        if(await this.getUser() || this.req.path == '/login' || this.req.path == '/register'){
            this.next();
        }
        else{
            this.res.format({
                html: () => {this.res.redirect('/login');},
                json: async () => {
                    let authorization = this.req.header('authorization');
                    if(authorization){
                        let userPass: string[] = authorization.split(':');
                        if(userPass.length == 2){
                            if(await this.checkAndSetUser(userPass[0], userPass[1]))
                                this.next();
                        }
                    }

                    this.next(new BadRequestError('User not found, use header Authorization username:password'))
                }
            });
            
        }
    }

    public async redirectTodos(){
        this.res.redirect('/todos');
    }
}