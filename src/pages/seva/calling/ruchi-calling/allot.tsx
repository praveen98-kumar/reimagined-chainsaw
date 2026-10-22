import UserAllotCard from "@/components/card/userAllotCard";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { User } from "@/shared/interfaces/user";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const Allot = () => {
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const [users, setUsers] = useState<User[]>([]);

  const getUserlist = useCallback(async () => {
    try {
      const { data } = await apiClient.get("users", {
        params: {
          district_id:
            active_permission?.region[active_region_index].district_id,
          seva_type: "miss_call",
        },
      });
      setUsers(data.data.result);
    } catch (error) {
      console.error(error);
    }
  }, []);
  useEffect(() => {
    getUserlist();
  }, [getUserlist]);

  const onAllott = async (id: number) => {
    try {
      await apiClient.post("miss_call", { user_id: id });
      getUserlist();
    } catch (e: any) {
      toast.error(e.resposne.data.error);
      console.error(e);
    }
  };

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Allott Jyada Calling Seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {/* <Formik
          initialValues={{
            search: "",
          }}
          onSubmit={(values) => {}}
        >
          {({}) => (
            <Form>
              <TextInput name="search" placeholder="Search" Icon={BiSearch} />
              <Button type="submit">Search</Button>
            </Form>
          )}
        </Formik> */}
        {users.map((u, i) => (
          <UserAllotCard key={i} onAllot={onAllott} user={u} type="allot" />
        ))}
      </div>
    </Layout>
  );
};

export default Allot;
