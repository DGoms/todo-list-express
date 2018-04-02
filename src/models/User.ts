import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, HasMany, DefaultScope, Scopes, Unique, Length, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ValidationError, ValidationErrorItem } from "sequelize";
import * as bcrypt from 'bcrypt';
import { Todo, Team } from '../models';

@Table({
    tableName: 'users'
})
@Scopes({
    full: {
        include: [() => Todo, () => Team]
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
    @Column({
        validate: {
            notEmpty: {
                msg: 'The username is required.'
            }
        }
    })
    username: string;
    
    @Length({min: 5, max: 255, msg: "Password must be at least 5 characters"})
    @AllowNull(false)
    @Column({
        validate: {
            notEmpty: {
                msg: 'The password is required.'
            }
        }
    })
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

    @ForeignKey(() => Team)
    @Column({allowNull: true})
    teamId: number;
    
    @BelongsTo(() => Team)
    team: Team;
}