/*
    @id: This field serves as the unique identifier for each scope. It is annotated with the @PrimaryGeneratedColumn() decorator, indicating it is a primary key with auto-incrementing values.
    @name: This field represents the name of the scope. It is annotated with the @Column({ unique: true }) decorator, which specifies that the values in this column should be unique.
    @description: This field provides a description or additional information about the scope. It is annotated with the @Column() decorator, indicating it is a regular column.
*/

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, JoinColumn } from "typeorm"
import { Policy } from "./Policy"
import { User } from "./User"

@Entity()
export class Scope extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string 

    @Column({ unique: true })
    name: string 

    @Column()
    description: string 

    @OneToMany(() => Policy, (policy) => policy.scope)
    public policies!: Policy[]

    @Column({
        type: "tinyint",
        default: 0,
    })
    isDeleted: boolean

    @ManyToOne(() => User, {nullable: true, onDelete: "NO ACTION"})
    @JoinColumn()
    createdBy: User
    
    @ManyToOne(() => User, {nullable: true, onDelete: "NO ACTION"})
    @JoinColumn()
    updatedBy: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
