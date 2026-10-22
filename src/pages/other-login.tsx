import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useRouter } from "next/router";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import apiClient from "@/http/index";
import { login as reduxlogin, updateRole } from "@/redux/features/authSlice";
import { useAppDispatch } from "@/redux/store";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { RoleLevel } from "@/shared/interfaces/user";
import { userExists } from "@/utils/multi-user-storage";

const OtherLoginPage: NextApplicationPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const [deviceId, setDeviceId] = useState("");

  const getBrowserFingerPrint = useCallback(async () => {
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();
    setDeviceId(result ? result.visitorId : "");
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post("login_direct", {
        mobile_no: `+91${mobile}`,
        device_id: deviceId,
      });

      // Check if user already exists before login
      const userAlreadyExists = userExists(data.data.mobile_no, data.data.id);

      dispatch(reduxlogin([data.data]));

      // Show appropriate message based on user status
      const userName = data.data.disciple?.name || data.data.mobile_no;

      if (userAlreadyExists) {
        toast.success(`Welcome back, ${userName}!`);
      } else {
        toast.success(`${userName} logged in successfully!`);
      }
      const rolesList: RoleLevel[] = [];
      for (let i = 0; i < [...data.data.role_level].length; i += 1) {
        const item = [...data.data.permission].some((p) =>
          [...data.data.role_level][i].roles.includes(p.role_id),
        );
        if (item) {
          rolesList.push({
            group: [...data.data.role_level][i].group,
            roles: [...data.data.role_level][i].roles,
          });
        }
      }
      dispatch(updateRole(rolesList[0]));
      router.replace("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBrowserFingerPrint();
  }, [getBrowserFingerPrint]);

  const isInvalid =
    mobile.length !== 10 || !RegExp(/^[6-9]\d{9}$/).test(mobile);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Other Login",
      }}
    >
      <div className="flex items-start justify-center w-full min-h-svh p-4 sm:p:6">
        <form
          aria-disabled={loading}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-w-sm mt-32"
        >
          <div>
            <label htmlFor="mobile">Mobile Number</label>
            <Input
              id="mobile"
              name="mobile"
              value={mobile}
              onChange={(e) =>
                setMobile(String(e.target.value).replace(/[^0-9]/g, ""))
              }
              maxLength={10}
              inputMode="numeric"
              disabled={loading}
              type="tel"
              required
            />
          </div>
          <Button
            type="submit"
            loading={loading}
            disabled={isInvalid || loading}
          >
            Login
          </Button>
        </form>
      </div>
    </Layout>
  );
};

OtherLoginPage.requireAuth = true;

export default OtherLoginPage;
