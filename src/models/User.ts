import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, HasMany, DefaultScope, Scopes, Unique, Length, AllowNull } from 'sequelize-typescript';
import { ValidationError, ValidationErrorItem } from "sequelize";
import * as bcrypt from 'bcrypt';
import { Todo } from './Todo';

@Table({
    tableName: 'users'
})
@Scopes({
    full: {
        include: [() => Todo]
    }
})
export class User extends Model<User>{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull(false)
    @Length({min: 5, max: 255, msg:"Username must be at least 5 characters"})
    @Unique
    @Column
    username: string;
    
    @Length({min: 5, max: 255, msg: "Password must be at least 5 characters"})
    @AllowNull(false)
    @Column
    get password(): string{
        return this.getDataValue('password');
    }

    set password(value: string){
        if(value){
            // if(value.length < 5)
            //     throw new ValidationError('password', [<ValidationErrorItem>new ValidationErrorItem("Password must be at least 5 characters")])

            let password = bcrypt.hashSync(value, 10);
            this.setDataValue('password', password);
        }
    }

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => Todo)
    todos: Todo[];


}