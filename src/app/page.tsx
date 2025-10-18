'use client'
import {Spinner} from "@/components/ui/spinner";
import {useMeQuery} from "@/entities/user/model/meQuery";
import {useRouter} from "next/navigation";

export  default  function Home() {

    const {data: me} = useMeQuery()
    const router = useRouter()
    console.log(me)
    if (me){
        router.replace('/admin/survey')
    }else  {
        router.replace('/login')
    }
  return (
    <div className="font-sans flex justify-center items-center  min-h-screen ">
      <Spinner className={"size-32 mt-"} />
    </div>
  );
}
