import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
    tableName: 'todos'
})
export class Todo extends Model<Todo>{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    message: string;

    @Column
    completion: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}