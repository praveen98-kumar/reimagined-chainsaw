import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Form, Formik, type FormikValues } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import Button from "@/components/Button";
import OtpInput from "@/components/input/OtpInput";
import TextInput from "@/components/input/TextInput";
import { Input } from "@/components/ui/input";
import apiClient from "@/http/index";
import {
  login as reduxlogin,
  setActiveUser,
  updateRole,
} from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { RoleLevel } from "@/shared/interfaces/user";
import {
  getUsersCount,
  MAX_USERS,
  userExists,
} from "@/utils/multi-user-storage";

export const schema = Yup.object({
  username: Yup.string()
    .required("Mobile number is required.")
    .min(10, "Mobile Number must be 10 digit number")
    .max(10, "Mobile Number must be 10 digit number"),
});
export const pin_schema = Yup.object({
  pin: Yup.string()
    .required("Pin is Required.")
    .min(4, "Pin must be 4 digit number"),
});

const detectLoginMethod = (input: string) => {
  const isMobile = /^\d{10}$/.test(input);
  return isMobile ? "mobile" : "username";
};

const LoginForm: NextApplicationPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [otpRequired, setNeedOtp] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string>("");
  const [authMethod, setAuthMethod] = useState<string>("mobile");
  const [isPinSet, setIsPinSet] = useState<boolean>(false);
  const [loginWithOtp, setLoginWithOtp] = useState<boolean>(false);
  const [startWithPin, setStartWithPin] = useState<boolean>(false);
  const [forgotPinFlow, setForgotPinFlow] = useState<boolean>(false);
  const [forgotPinShow, setForgotPinShow] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");

  const getBrowserFingerPrint = useCallback(async () => {
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();
    setDeviceId(result ? result.visitorId : "");
  }, []);

  useEffect(() => {
    getBrowserFingerPrint().then();
  }, [getBrowserFingerPrint]);

  const onSubmit = async (values: FormikValues) => {
    values.device_id = deviceId;
    const method = detectLoginMethod(values.username);
    const usersCountBefore = getUsersCount();
    setAuthMethod(method);
    try {
      const data = { ...values };
      data.username =
        method === "mobile"
          ? `+91${
              values.username || username || user?.mobile_no.replace("+91", "")
            }`
          : values.username || username;

      if (forgotPinFlow) {
        data.forgot_pin = forgotPinFlow;
      } else if (!values.login_otp && !values.pin) {
        data.check_login = true;
      } else if (values.login_otp) {
        data.verify_otp = true;
      }
      setUsername(values.username);
      setLoading(true);
      const response = await apiClient.post("login", data);
      if (response.data?.message == "Invalid Pin") {
        toast.success(response.data?.message);
      } else if (response.data?.message == "Enter pin.") {
        setLoginWithOtp(false);
        setIsPinSet(true);
        setStartWithPin(true);
      } else if (response.data?.message == "Otp sent successfully.") {
        toast.success(response.data?.message);
        setNeedOtp(true);
        setLoginWithOtp(true);
        setStartWithPin(false);
      } else {
        if (response?.data?.data?.is_pin_set === false) {
          setIsPinSet(false);
          setLoginWithOtp(false);
          setUserId((response?.data?.data?.user_id as number) ?? undefined);
          return;
        }
        const userAlreadyExists = userExists(
          response.data.data[0].mobile_no,
          response.data.data[0].id
        );
        dispatch(reduxlogin(response.data.data));

        const usersCountAfter = getUsersCount();
        const userName =
          response.data.data[0].disciple?.name ||
          response.data.data[0].mobile_no;

        const loginToastId = "login-success";
        toast.dismiss(loginToastId);
        if (userAlreadyExists) {
          toast.success(`Welcome back, ${userName}!`, { id: loginToastId });
        } else {
          if (
            usersCountBefore >= MAX_USERS &&
            usersCountAfter < usersCountBefore
          ) {
            toast.success(
              `${userName} added. Maximum ${MAX_USERS} users reached. Oldest user removed.`,
              { duration: 3000, id: loginToastId }
            );
          } else {
            toast.success(`${userName} logged in successfully!`, {
              id: loginToastId,
            });
          }
        }

        const firstUserDiscipleId = response?.data?.data[0]?.disciple_id;

        dispatch(setActiveUser(firstUserDiscipleId));

        const rolesList: RoleLevel[] = [];
        const firstUserItem = response.data.data[0];
        for (let i = 0; i < [...firstUserItem.role_level].length; i += 1) {
          const item = [...firstUserItem.permission].some((p) =>
            [...firstUserItem.role_level][i].roles.includes(p.role_id)
          );
          if (item) {
            rolesList.push({
              group: [...firstUserItem.role_level][i].group,
              roles: [...firstUserItem.role_level][i].roles,
            });
          }
        }
        dispatch(updateRole(rolesList[0]));

        if (loginWithOtp) {
          setLoginWithOtp(false);
          setStartWithPin(true);
        }

        if ("pin" in values) {
          router.push("/");
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error);
    } finally {
      setLoading(false);
      if (forgotPinFlow) {
        setForgotPinFlow(false);
        localStorage.removeItem("forgot_pin");
      }
    }
  };

  const setPin = async (values: FormikValues) => {
    setLoading(true);
    try {
      const response = await apiClient.post("set_pin", {
        ...values,
        user_id: userId,
      });
      toast.success(
        `${response.data?.message}, please enter your pin to login.`,
        { duration: 5000 }
      );
      setIsPinSet(true);
      setStartWithPin(true);
      const userObj = localStorage.getItem("user");
      let puserObj = null;
      if (userObj) {
        puserObj = JSON.parse(userObj);
      }
      puserObj.is_pin_set = true;
      localStorage.setItem("user", JSON.stringify(puserObj));
      if (user) {
        user.is_pin_set = true;
      }
      // setClaimPinSet(false);
      router.push("/");
    } catch (e: any) {
      toast.error(e?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const forgotPin = () => {
    localStorage.clear();
    localStorage.setItem("forgot_pin", "1");
    setForgotPinFlow(true);
    setLoginWithOtp(true);
    setStartWithPin(false);
    setIsPinSet(false);
    setForgotPinShow(false);
  };

  useEffect(() => {
    const forgotPinSet: string | null = localStorage.getItem("forgot_pin");
    if (forgotPinSet && forgotPinSet == "1") {
      setForgotPinFlow(true);
    }

    if (user) {
      if (user.is_pin_set) {
        setLoginWithOtp(true);
        setStartWithPin(false);
      } else {
        setLoginWithOtp(true);
        setStartWithPin(false);
        setIsPinSet(false);
      }
    } else {
      setLoginWithOtp(true);
    }
  }, [router.isReady]);

  return (
    <div className="h-screen">
      <div
        className="min-h-screen bg-fixed w-full mx-auto max-w-md flex flex-col items-center"
        style={{
          backgroundImage: `url(/assets/images/loginScreen.jpg)`,
          backgroundSize: "contain",
          backgroundPositionY: "top",
          backgroundPositionX: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {loginWithOtp && (
          <Formik
            initialValues={{ username: "", login_otp: "", device_id: "local" }}
            onSubmit={(values, { setSubmitting }) => {
              if (otpRequired && values.login_otp.length != 6) {
                toast.error("Enter OTP");
                setSubmitting(false);
              } else {
                onSubmit(values);
              }
            }}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ values, setFieldValue }) => (
              <Form className="space-y-4 mt-96 w-full p-4">
                {otpRequired ? (
                  <OtpInput
                    value={values.login_otp}
                    onChange={(e) => setFieldValue("login_otp", e)}
                    autoFocus
                    secure
                    numInput={6}
                  />
                ) : (
                  <TextInput
                    name="username"
                    required
                    autoFocus
                    placeholder="Enter your mobile number"
                    onChange={(e) =>
                      setFieldValue(
                        "username",
                        String(e.target.value).replaceAll(/\s+/g, "")
                      )
                    }
                  />
                )}
                <Button
                  variant="primary"
                  type="submit"
                  className="mx-auto w-1/2"
                  disabled={loading}
                  loading={loading}
                >
                  {forgotPinShow || otpRequired ? "Login" : "Get OTP"}
                </Button>
                <div className="flex w-full pt-6 px-4 justify-center items-center">
                  {forgotPinShow && (
                    <span onClick={forgotPin}>Forgot Pin?</span>
                  )}
                  <Link href={"/register"} className={"ml-10"}>
                    <span className="hover:underline">Register</span>
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        )}

        {!loginWithOtp && !isPinSet && (
          <Formik
            initialValues={{ pin: "" }}
            onSubmit={(values, { setSubmitting }) => {
              if (authMethod === "mobile" && values.pin.length != 4) {
                toast.error("Enter pin");
                setSubmitting(false);
              } else {
                setPin(values);
              }
            }}
          >
            {({ values, setFieldValue }) => (
              <Form className="space-y-4 mt-96 p-4 w-full ">
                <div>
                  <p className="font-bold text-center">
                    Set {authMethod === "username" ? "Password" : "Pin"}
                  </p>
                </div>

                {authMethod === "username" ? (
                  <Input
                    name="pin"
                    type="password"
                    value={values.pin}
                    placeholder="Enter password..."
                    required={authMethod === "username"}
                    onChange={(e) => setFieldValue("pin", e.target.value)}
                  />
                ) : (
                  <OtpInput
                    value={values.pin}
                    onChange={(e) => setFieldValue("pin", e)}
                    autoFocus={false}
                    numInput={4}
                    secure
                  />
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="mx-auto w-1/2"
                  disabled={loading}
                  loading={loading}
                >
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        )}

        {isPinSet && startWithPin && (
          <Formik
            initialValues={{
              pin: "",
              username: username,
              device_id: "local",
            }}
            onSubmit={(values, { setSubmitting }) => {
              if (authMethod === "mobile" && values.pin.length != 4) {
                toast.error("Enter pin");
                setSubmitting(false);
              } else {
                onSubmit(values);
              }
            }}
          >
            {({ values, setFieldValue }) => (
              <Form className="space-y-4 mt-96 w-full p-4">
                <div>
                  <p className="font-bold text-center">
                    Enter {authMethod === "username" ? "Password" : "Pin"}
                  </p>
                </div>

                {authMethod === "username" ? (
                  <Input
                    name="pin"
                    type="password"
                    value={values.pin}
                    placeholder="Enter password..."
                    required={authMethod === "username"}
                    onChange={(e) => setFieldValue("pin", e.target.value)}
                  />
                ) : (
                  <OtpInput
                    value={values.pin}
                    onChange={(e) => setFieldValue("pin", e)}
                    autoFocus
                    numInput={4}
                    secure
                  />
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="mx-auto w-1/2"
                  disabled={loading}
                  loading={loading}
                >
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

LoginForm.requireAuth = false;
export default LoginForm;
