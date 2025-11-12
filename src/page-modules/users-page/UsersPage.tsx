'use client'
import {useGetUsers} from "@/entities/user/model/allUsersQuery";
import {DataTable} from "@/entities/user/ui";
import {columns} from "@/entities/user/ui/columns";

export default  function UsersPage() {
    const {data: users} = useGetUsers();
    console.log(users)

    return (
        <div className={" container text-black mx-auto"}>
            {
                users?.length > 0 ? (
                    <DataTable columns={columns} data={users} />
                ) : ('')
            }

        </div>
    )
}