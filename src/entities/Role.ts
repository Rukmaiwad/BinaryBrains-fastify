
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, BaseEntity, UpdateDateColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"
import { Policy } from "./Policy"
import { UserRoleMap } from "./UserRoleMap"

@Entity()
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ unique: true })
    name: string

    @Column()
    description: string

    @OneToMany(() => UserRoleMap, (userRoleMap) => userRoleMap.role)
    public userRoleMaps!: UserRoleMap[]

    @OneToMany(() => Policy, (policy) => policy.role)
    public policies!: Policy[]

    @Column({
        type: "tinyint",
        default: 0,
    })
    isDeleted: boolean

    @ManyToOne(()=>User, {nullable: true, onDelete: "NO ACTION"})
    @JoinColumn()
    createdBy: User

    @ManyToOne(()=>User, {nullable: true, onDelete: "NO ACTION"})
    @JoinColumn()
    updatedBy: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
