import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"
import { Policy } from "./Policy"


@Entity()
export class Permission extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ unique: true })
    name: string

    @Column()
    description: string

    @OneToMany(() => Policy, (policy) => policy.permission)
    public policies!: Policy[]

    @Column({
        type: "tinyint",
        default: 0,
    })
    isDeleted: boolean

    @ManyToOne(()=> User, {nullable: true, onDelete: "NO ACTION"})
    @JoinColumn()
    createdBy: User
    
    @ManyToOne(()=> User, {nullable: true, onDelete: "NO ACTION"})
    @JoinColumn()
    updatedBy: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
