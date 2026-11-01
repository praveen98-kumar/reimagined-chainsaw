import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { Form, Formik, type FormikValues } from "formik";
import { Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import Button from "@/components/Button";
import OtpInput from "@/components/input/OtpInput";
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
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useKeyboardOpen } from "@/hooks/useKeyboardOpen";

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

// Measurements below are taken from the design (public/new_ui/login.png,
// a 2x mock-up of a 390px wide screen).
const cardClass =
  "mx-6 w-[calc(100%-3rem)] rounded-[28px] border border-white bg-[linear-gradient(to_bottom,#fff_90%,#f0f2f6)] px-4 pt-5 pb-3.5 shadow-[0_20px_44px_-20px_rgba(76,29,149,0.35)]";
const cardHeadingClass = "mb-4 text-center text-lg font-bold text-brand-ink";
const fieldClass =
  "flex h-14 w-full items-center gap-3 rounded-full bg-[#f7f6f9] px-[19px] shadow-[inset_0_2px_5px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.9)] focus-within:ring-2 focus-within:ring-violet-300";
const passwordFieldClass =
  "h-14 rounded-full border-0 bg-[#f7f6f9] px-5 text-[17px] shadow-[inset_0_2px_5px_rgba(15,23,42,0.08)] focus-visible:ring-2 focus-visible:ring-violet-300";
// Fixed 184x54 pill as in the design (not a % of the card), horizontal
// #2b0f6a -> #480d5e with a light top rim and a slightly darker bottom.
const submitClass =
  "mx-auto mt-4 h-[54px] w-46 max-w-full px-0 py-0 text-xl bg-[linear-gradient(180deg,transparent_65%,rgba(0,0,0,0.14)),linear-gradient(90deg,#2b0f6a,#480d5e)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_0_0_1px_rgba(255,255,255,0.12),0_14px_26px_-10px_rgba(43,15,106,0.65)]";

const PORTRAIT_SRC = "/assets/images/login-portrait.webp";

// Hero geometry, expanded -> collapsed. While the keyboard is open the hero
// shrinks from the bottom up so the form sits above the keyboard.
const PORTRAIT_SIZE = 234; // incl. the 7px ring
const PORTRAIT_COLLAPSED_SIZE = 84;
const BANNER_PADDING_TOP = 40;
const BANNER_PADDING_TOP_COLLAPSED = 16;
const BANNER_PADDING_BOTTOM = 39; // banner is 313px tall at the centre
const BANNER_PADDING_BOTTOM_COLLAPSED = 12;
const TITLE_MARGIN_TOP = 8;
const TITLE_MARGIN_TOP_COLLAPSED = 8;
const TITLE_MARGIN_BOTTOM = 18;
const TITLE_MARGIN_BOTTOM_COLLAPSED = 12;
const TITLE_COLLAPSED_SCALE = 0.6;

// Critically damped (no overshoot), roughly the length of the mobile keyboard
// slide. Springs also carry velocity when retargeted, so a quick open/close
// reverses smoothly instead of snapping.
const heroSpring = { type: "spring", visualDuration: 0.32, bounce: 0 } as const;

/**
 * Brand banner + title that collapse while the keyboard is open.
 *
 * Everything is driven by a single `progress` value (0 = expanded,
 * 1 = collapsed) so all parts move in lockstep. Sizes change through
 * `scale` (GPU-composited) rather than width/height, and negative margins
 * pull the following content up by the amount each element visually shrank.
 */
const BrandHero = ({ collapsed }: { collapsed: boolean }) => {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // Layout height is unaffected by `scale`, so one measurement stays valid.
  const titleHeight = useRef(0);

  useEffect(() => {
    titleHeight.current = titleRef.current?.offsetHeight ?? 0;
  }, []);

  useEffect(() => {
    const controls = animate(
      progress,
      collapsed ? 1 : 0,
      reduceMotion ? { duration: 0 } : heroSpring,
    );
    return () => controls.stop();
  }, [collapsed, progress, reduceMotion]);

  const bannerPaddingTop = useTransform(
    progress,
    [0, 1],
    [BANNER_PADDING_TOP, BANNER_PADDING_TOP_COLLAPSED],
  );
  const bannerPaddingBottom = useTransform(
    progress,
    [0, 1],
    [BANNER_PADDING_BOTTOM, BANNER_PADDING_BOTTOM_COLLAPSED],
  );
  const portraitScale = useTransform(
    progress,
    [0, 1],
    [1, PORTRAIT_COLLAPSED_SIZE / PORTRAIT_SIZE],
  );
  const portraitMarginBottom = useTransform(
    progress,
    [0, 1],
    [0, PORTRAIT_COLLAPSED_SIZE - PORTRAIT_SIZE],
  );
  const titleScale = useTransform(progress, [0, 1], [1, TITLE_COLLAPSED_SCALE]);
  const titleMarginTop = useTransform(
    progress,
    [0, 1],
    [TITLE_MARGIN_TOP, TITLE_MARGIN_TOP_COLLAPSED],
  );
  const titleMarginBottom = useTransform(
    progress,
    (p) =>
      TITLE_MARGIN_BOTTOM +
      (TITLE_MARGIN_BOTTOM_COLLAPSED - TITLE_MARGIN_BOTTOM) * p -
      titleHeight.current * (1 - TITLE_COLLAPSED_SCALE) * p,
  );

  return (
    <>
      <motion.div
        className="flex w-full shrink-0 justify-center rounded-b-[50%_40px] bg-[linear-gradient(160deg,#c1dafe_0%,#d3d7fe_30%,#dfd5fc_50%,#ead2f4_70%,#f4d0ed_90%,#f7cfeb_100%)]"
        style={{
          paddingTop: bannerPaddingTop,
          paddingBottom: bannerPaddingBottom,
        }}
      >
        <motion.div
          className="size-[234px] shrink-0 rounded-full bg-linear-to-b from-brand-900 to-brand-700 p-[7px] shadow-[0_12px_32px_0_rgba(170,90,100,0.4)] will-change-transform"
          style={{
            scale: portraitScale,
            originY: 0,
            marginBottom: portraitMarginBottom,
          }}
        >
          <img
            src={PORTRAIT_SRC}
            alt="Sant Rampal Ji Maharaj"
            width={220}
            height={220}
            draggable={false}
            className="size-full rounded-full bg-white object-cover"
          />
        </motion.div>
      </motion.div>
      <motion.h1
        ref={titleRef}
        className="shrink-0 font-serif text-[30px] leading-9 font-bold text-brand-title will-change-transform"
        style={{
          scale: titleScale,
          originY: 0,
          marginTop: titleMarginTop,
          marginBottom: titleMarginBottom,
        }}
      >
        Satlok Ashram
      </motion.h1>
    </>
  );
};

const FALLBACK_ERROR = "Something went wrong. Please try again.";

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
  const keyboardOpen = useKeyboardOpen();
  const showError = (text?: string) => toast.error(text || FALLBACK_ERROR);

  const getBrowserFingerPrint = useCallback(async () => {
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();
    setDeviceId(result ? result.visitorId : "");
  }, []);

  useEffect(() => {
    getBrowserFingerPrint().then();
  }, [getBrowserFingerPrint]);

  useKeyboardInset();
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
        showError(response.data?.message);
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

        const removedOldestUser =
          !userAlreadyExists &&
          usersCountBefore >= MAX_USERS &&
          usersCountAfter < usersCountBefore;
        // One id so a repeated login replaces the toast instead of stacking.
        const loginToastId = "login-success";
        toast.dismiss(loginToastId);
        toast.success(
          userAlreadyExists
            ? `Welcome back, ${userName}!`
            : removedOldestUser
              ? `${userName} added. Maximum ${MAX_USERS} users reached. Oldest user removed.`
              : `${userName} logged in successfully!`,
          { id: loginToastId, duration: removedOldestUser ? 5000 : 3000 },
        );

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
      showError(e?.response?.data?.error);
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
      showError(e?.response?.data?.error);
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
    <div className="fixed inset-x-0 top-0 mx-auto flex h-(--app-height) w-full max-w-md flex-col items-center overflow-hidden">
      {/* The page shrinks with the keyboard, so the gradient lives on a
          full-height layer behind it; otherwise its bottom-anchored glow
          would jump every time the keyboard opens or closes. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-lvh bg-app-gradient"
      />
      <BrandHero collapsed={keyboardOpen} />

      {loginWithOtp && (
        <Formik
          initialValues={{ username: "", login_otp: "", device_id: "local" }}
          onSubmit={(values, { setSubmitting }) => {
            if (otpRequired && values.login_otp.length != 6) {
              showError("Please enter the 6 digit OTP.");
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
                <>
                  <p className={cardHeadingClass}>Enter OTP</p>
                  <OtpInput
                    value={values.login_otp}
                    onChange={(e) => setFieldValue("login_otp", e)}
                    autoFocus
                    secure
                    numInput={6}
                  />
                </>
              ) : (
                <label className={fieldClass}>
                  <Phone
                    className="size-[18px] shrink-0 text-brand-900"
                    strokeWidth={1.75}
                  />
                  <input
                    name="username"
                    required
                    autoFocus
                    inputMode="text"
                    autoComplete="username"
                    value={values.username}
                    placeholder="Enter your mobile number"
                    className="w-full min-w-0 bg-transparent text-[17px] text-gray-800 placeholder:text-gray-500 outline-none"
                    onChange={(e) => {
                      setFieldValue(
                        "username",
                        String(e.target.value).replaceAll(/\s+/g, ""),
                      );
                    }}
                  />
                </label>
              )}
              <Button
                variant="gradient"
                type="submit"
                className={submitClass}
                disabled={loading}
                loading={loading}
              >
                {forgotPinShow || otpRequired ? "Login" : "Get OTP"}
              </Button>
              <div className="mt-[18px] flex w-full items-center justify-between px-0.5 text-base font-bold text-blue-900">
                {forgotPinShow ? (
                  <button
                    type="button"
                    onClick={forgotPin}
                    className="hover:underline"
                  >
                    Forgot Pin?
                  </button>
                ) : (
                  <span />
                )}
                <Link href={"/register"} className="hover:underline">
                  Register
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
              showError("Please enter your 4 digit PIN.");
              setSubmitting(false);
            } else {
              setPin(values);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className={cardClass}>
              <p className={cardHeadingClass}>
                Set {authMethod === "username" ? "Password" : "Pin"}
              </p>

              {authMethod === "username" ? (
                <Input
                  name="pin"
                  type="password"
                  value={values.pin}
                  autoFocus
                  placeholder="Enter password..."
                  required={authMethod === "username"}
                  className={passwordFieldClass}
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
                variant="gradient"
                type="submit"
                className={submitClass}
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
              showError("Please enter your 4 digit PIN.");
              setSubmitting(false);
            } else {
              onSubmit(values);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className={cardClass}>
              <p className={cardHeadingClass}>
                Enter {authMethod === "username" ? "Password" : "Pin"}
              </p>

              {authMethod === "username" ? (
                <Input
                  name="pin"
                  type="password"
                  value={values.pin}
                  autoFocus
                  placeholder="Enter password..."
                  required={authMethod === "username"}
                  className={passwordFieldClass}
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
                variant="gradient"
                type="submit"
                className={submitClass}
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
  );
};

LoginForm.requireAuth = false;
export default LoginForm;
