import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, HasMany, DefaultScope, Scopes, Unique, Length, AllowNull } from 'sequelize-typescript';
import { ValidationError, ValidationErrorItem } from "sequelize";
import * as bcrypt from 'bcrypt';
import { User, Todo } from '../models';

@Table({
    tableName: 'teams'
})
@Scopes({
    full: {
        include: [() => User]
    }
})
export class Team extends Model<Team>{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull(false)
    @Length({min: 5, max: 255, msg:"Name must be at least 5 characters"})
    @Unique
    @Column({
        validate: {
            notEmpty: {
                msg: 'The team name is required.'
            }
        }
    })
    name: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => User)
    users: User[];


}