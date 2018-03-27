import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, HasMany, DefaultScope, Scopes, Unique } from 'sequelize-typescript';
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

    @Unique
    @Column
    username: string;

    @Column
    get password(): string{
        return this.getDataValue('password');
    }

    set password(value: string){
        this.setDataValue('password', bcrypt.hashSync(value, 10));
    }

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => Todo)
    todos: Todo[];


}