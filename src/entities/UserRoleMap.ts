/*
    @id: This field serves as the unique identifier for each user-role mapping. It is annotated with the @PrimaryGeneratedColumn() decorator, indicating it is a primary key with auto-incrementing values.
    @user: This field represents the association with the User entity. It is annotated with @ManyToOne() decorator, indicating that many UserRoleMap entities can belong to a single User. It also uses the @JoinColumn() decorator to specify the foreign key column name as 'user_id'.
    @role: This field represents the association with the Role entity. It is annotated with @ManyToOne() decorator, indicating that many UserRoleMap entities can belong to a single Role. It also uses the @JoinColumn() decorator to specify the foreign key column name as 'role_id'.
*/

import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User"
import { Role } from "./Role"

@Entity()
export class UserRoleMap extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string 

    @ManyToOne(() => User, (user) => user.userRoleMaps, { onDelete: "NO ACTION", nullable: false })
    public user: User 

    @ManyToOne(() => Role, (role) => role.userRoleMaps, { onDelete: "NO ACTION", nullable: false })
    public role: Role 

    @ManyToOne(() => User, {nullable: true, onDelete: "NO ACTION"})
    @JoinColumn()
    updatedBy: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
