import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, HasMany, DefaultScope, Scopes } from 'sequelize-typescript';
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

    @Column
    username: string;

    @Column
    password: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => Todo)
    todos: Todo[];
}