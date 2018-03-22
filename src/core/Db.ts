import { Sequelize } from 'sequelize-typescript';

export class Db extends Sequelize{
    constructor(){
        super({
            database: 'some_db',
            dialect: 'sqlite',
            username: 'root',
            password: '',
            modelPaths: [__dirname + '/../models'],
            storage: './.sqlite',
            host: 'localhost'
        });
    }
}