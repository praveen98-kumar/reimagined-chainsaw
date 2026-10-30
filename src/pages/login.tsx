import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Form, Formik, type FormikValues } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
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

/* ---------- "Saffron & Ivory" look ---------- */

// Ivory card that holds each form
const cardClass =
  "relative mt-5 w-full space-y-4 rounded-[22px] border border-orange-200 bg-white p-5 " +
  "shadow-[0_10px_26px_rgba(154,52,18,0.14)]";

// Deep-orange gradient primary button (the "!" wins over the Button variant styles)
const primaryButtonClass =
  "mx-auto w-full !h-[52px] !rounded-[14px] !border-0 !text-lg !font-bold !text-white " +
  "!bg-gradient-to-r !from-[#c2410c] !to-[#9a3412] " +
  "!shadow-[0_6px_16px_rgba(154,52,18,0.3)]";

const linkClass =
  "text-[15px] font-semibold text-[#9a3412] hover:text-[#431407] hover:underline";

const AuthShell = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="min-h-screen w-full bg-[#fffaf0]">
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center overflow-hidden px-5 pb-8 pt-14">
      {/* saffron-to-gold curved banner */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[330px] rounded-b-[40px]"
        style={{
          background: "linear-gradient(160deg, #fdba74 0%, #fde68a 100%)",
        }}
      />
      <div className="relative h-[230px] w-[230px] shrink-0 overflow-hidden rounded-full border-[5px] border-white bg-white shadow-[0_0_0_6px_#f59e0b,0_14px_32px_rgba(154,52,18,0.3)]">
        {/* biome-ignore lint/performance/noImgElement: static login artwork */}
        <img
          src="/assets/images/loginScreen.jpg"
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: "center 8%" }}
        />
      </div>
      <div className="relative mt-6 text-center">
        <h1 className="text-[26px] font-bold text-[#431407]">{title}</h1>
        <p className="text-[15px] text-[#7c2d12]">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

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
          // Forgot-PIN / first-time verify_otp path (SAG-1378).
          // Backend issues a 10-min JWT so the follow-up /set_pin call
          // is authenticated. Persist it so the axios interceptor adds
          // Authorization: Bearer <token> on /set_pin.
          const pinResetToken = response?.data?.data?.token;
          if (pinResetToken) {
            localStorage.setItem("token", pinResetToken);
          }
          setIsPinSet(false);
          setLoginWithOtp(false);
          setUserId((response?.data?.data?.user_id as number) ?? undefined);
          return;
        }
        const userAlreadyExists = userExists(
          response.data.data[0].mobile_no,
          response.data.data[0].id,
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
              { duration: 3000, id: loginToastId },
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
            [...firstUserItem.role_level][i].roles.includes(p.role_id),
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
        { duration: 5000 },
      );
      // Clear the short-lived PIN-reset JWT (SAG-1378). User must now
      // log in fresh with their new PIN to get a full session token.
      localStorage.removeItem("token");
      setIsPinSet(true);
      setStartWithPin(true);
      setLoginWithOtp(false);
      const userObj = localStorage.getItem("user");
      if (userObj) {
        const puserObj = JSON.parse(userObj);
        puserObj.is_pin_set = true;
        localStorage.setItem("user", JSON.stringify(puserObj));
      }
      if (user) {
        user.is_pin_set = true;
      }
      // Stay on the Enter-PIN screen so the user signs in with their
      // new PIN. router.push("/") would bounce back to /login anyway
      // because there is no full session token yet.
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
    <>
      {loginWithOtp && (
        <AuthShell
          title={otpRequired ? "Verify OTP" : "Sevadar Login"}
          subtitle={
            otpRequired
              ? "Enter the 6-digit OTP sent to your mobile"
              : "Social Media Seva · Book Order Seva"
          }
        >
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
              <Form className={cardClass}>
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
                        String(e.target.value).replaceAll(/\s+/g, ""),
                      )
                    }
                  />
                )}
                <Button
                  variant="primary"
                  type="submit"
                  className={primaryButtonClass}
                  disabled={loading}
                  loading={loading}
                >
                  {forgotPinShow || otpRequired ? "Login" : "Get OTP"}
                </Button>
                <div className="flex w-full items-center justify-between pt-1">
                  {forgotPinShow && (
                    <button
                      type="button"
                      onClick={forgotPin}
                      className={linkClass}
                    >
                      Forgot Pin?
                    </button>
                  )}
                  <Link href={"/register"} className={`${linkClass} ml-auto`}>
                    Register
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </AuthShell>
      )}

      {!loginWithOtp && !isPinSet && (
        <AuthShell
          title={`Set ${authMethod === "username" ? "Password" : "Pin"}`}
          subtitle={
            authMethod === "username"
              ? "Create a password for your account"
              : "Create a 4-digit PIN for quick login"
          }
        >
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
              <Form className={cardClass}>
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
                  className={primaryButtonClass}
                  disabled={loading}
                  loading={loading}
                >
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        </AuthShell>
      )}

      {isPinSet && startWithPin && (
        <AuthShell
          title={`Enter ${authMethod === "username" ? "Password" : "Pin"}`}
          subtitle="Welcome back, Sevadar"
        >
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
              <Form className={cardClass}>
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
                  className={primaryButtonClass}
                  disabled={loading}
                  loading={loading}
                >
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </AuthShell>
      )}
    </>
  );
};

LoginForm.requireAuth = false;
export default LoginForm;
