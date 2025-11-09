

import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToOne, Unique } from "typeorm"
import { User } from "./User"
import { Scope } from "./Scope"
import { Resource } from "./Resource"
import { Permission } from "./Permission"
import { Role } from "./Role"


@Entity()
@Unique("policy_table_unique_constraints",["role","permission","resource","scope"])
export class Policy extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string 

    @ManyToOne(() => Role, (role) => role.policies, { onDelete: "NO ACTION" })
    role: Role 

    @ManyToOne(() => Permission, (permission) => permission.policies, { onDelete: "NO ACTION" })
    permission: Permission 

    @ManyToOne(() => Resource, (resource) => resource.policies, { onDelete: "NO ACTION" })
    resource: Resource 

    @ManyToOne(() => Scope, (scope) => scope.policies, { onDelete: "NO ACTION" })
    scope: Scope 

    @Column({
        type: "tinyint",
        default: 0,
    })
    isDeleted: boolean

    @ManyToOne(() => User, {onDelete: "NO ACTION", nullable: true})
    @JoinColumn()
    createdBy: User 
    
    @ManyToOne(() => User, {onDelete: "NO ACTION", nullable: true})
    @JoinColumn()
    updatedBy: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
