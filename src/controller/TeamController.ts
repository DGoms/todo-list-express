import { BaseController, IRoute, HttpMethod } from ".";
import { BadRequestError, ValidationErrorUtils } from "../utils";
import * as bcrypt from 'bcrypt';
import { User, Team } from "../models";
import { ValidationError, ValidationErrorItem } from "sequelize";
/**
 * 
 * 
 * @export
 * @class UserController
 * @extends {BaseController}
 */
export class TeamController extends BaseController {

    protected static baseUrl: string = '/team';
    protected static routes: IRoute[] = [
        { httpMethod: HttpMethod.GET, path: '/create', action: 'formCreate' },
        { httpMethod: HttpMethod.POST, path: '/', action: 'create' },
        { httpMethod: HttpMethod.GET, path: '/:team/add', action: 'formAddUser' },
        { httpMethod: HttpMethod.PUT, path: '/:team/:user', action: 'addUser' },
        { httpMethod: HttpMethod.DELETE, path: '/:team/:user', action: 'delUser' },
    ];

    public async create() {
        let team: Team = new Team(this.req.body);
        // let validError: ValidationError = await user.validate().catch((err) => {return err});//FIX: pb avec validate qui fait un save, wtf ? O_o
        let teamOrValidError: ValidationError|User = await team.save().catch((err) => {return err});

        if(teamOrValidError instanceof User){
            this.res.format({
                html: () => { this.res.redirect('/'); },
                json: () => { this.res.send({user: teamOrValidError}); }
            });
        }else{
            let validError: ValidationError = teamOrValidError;
            this.res.format({
                // html: () => { 
                //     if(this.isBodyEmpty()) validError.errors = undefined;
                //     this.render('user/register', { submit: "Register", user, errors: validError.errors }) 
                // },
                json: () => { this.next(new BadRequestError(ValidationErrorUtils.itemToString(validError.errors))) }
            });    
        }
    }
}