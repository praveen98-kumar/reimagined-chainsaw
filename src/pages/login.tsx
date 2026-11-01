import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { motion } from "framer-motion";
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

const cardClass =
  "mx-4 w-[calc(100%-2rem)] space-y-5 rounded-[28px] border border-white bg-white/90 p-5 shadow-[0_20px_40px_-20px_rgba(76,29,149,0.35)]";

// Portrait is cropped out of the existing login artwork.
const PORTRAIT_SRC = "/assets/images/loginScreen.jpg";

// Keyboard height is ignored below this (a small dip is just the browser
// chrome, e.g. the mobile URL bar, not the on-screen keyboard).
const KEYBOARD_MIN_INSET = 120;
// Inset at which the banner reaches its fully collapsed state.
const KEYBOARD_MAX_INSET = 320;

// Banner geometry. The banner shrinks towards these values while the keyboard
// is open so the form stays above it. The top edge stays pinned and only the
// bottoms move up, so the banner shrinks from bottom to top.
const PORTRAIT_SIZE = 224; // size-56
const PORTRAIT_COLLAPSED_SIZE = 80;
const BANNER_PADDING_BOTTOM = 48; // pb-12
const BANNER_PADDING_COLLAPSED = 8;
const TITLE_MARGIN = 24; // my-6
const TITLE_MARGIN_COLLAPSED = 10;
const TITLE_COLLAPSE_RATIO = 0.6; // 0.6 => 40% of the title size remains

/**
 * Tracks the on-screen keyboard through the VisualViewport API.
 *
 * Returns `collapse` (0..1, how far the banner should shrink) plus the current
 * visual viewport `height`, which the page uses to size itself so the browser
 * never has to scroll the page up when the keyboard opens.
 */
const useKeyboardViewport = () => {
  const [state, setState] = useState({ collapse: 0, height: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    // On touch devices the keyboard shrinks the viewport, so track its full
    // height over time to measure the inset. On desktop a window resize shrinks
    // everything together, so only a real keyboard inset counts.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let fullHeight = vv ? vv.height : window.innerHeight;
    let frame = 0;

    const measure = () => {
      const current = vv ? vv.height : window.innerHeight;
      // Pinch-zoom shrinks the visual viewport too; ignore it.
      if (vv && vv.scale > 1.01) {
        setState({ collapse: 0, height: fullHeight });
        return;
      }
      if (current > fullHeight) {
        fullHeight = current;
      }
      const inset = isTouch
        ? fullHeight - current
        : window.innerHeight - current;
      setState({
        collapse:
          inset > KEYBOARD_MIN_INSET
            ? Math.min(inset / KEYBOARD_MAX_INSET, 1)
            : 0,
        height: current,
      });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return state;
};

const heroSpring = { type: "spring", stiffness: 260, damping: 30 } as const;

const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const BrandHero = ({ collapse }: { collapse: number }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleHeight, setTitleHeight] = useState(0);

  // Measured once: `height` is animated below, so re-measuring on resize would
  // read the already-shrunk value.
  useEffect(() => {
    setTitleHeight(titleRef.current?.offsetHeight ?? 0);
  }, []);

  const titleScale = 1 - TITLE_COLLAPSE_RATIO * collapse;
  const portraitSize = lerp(PORTRAIT_SIZE, PORTRAIT_COLLAPSED_SIZE, collapse);

  return (
    <>
      <motion.div
        className="w-full flex justify-center pt-10 pb-12 rounded-b-[50%_60px] bg-linear-to-br from-blue-200/70 via-violet-200/60 to-pink-200/80"
        initial={false}
        animate={{
          paddingBottom: lerp(
            BANNER_PADDING_BOTTOM,
            BANNER_PADDING_COLLAPSED,
            collapse,
          ),
        }}
        transition={heroSpring}
      >
        <motion.div
          className="size-56 rounded-full p-1.5 bg-linear-to-b from-brand-900 to-brand-700 shadow-[0_20px_40px_-12px_rgba(76,29,149,0.5)]"
          initial={false}
          animate={{ width: portraitSize, height: portraitSize }}
          transition={heroSpring}
        >
          <div
            className="size-full rounded-full bg-white bg-no-repeat"
            style={{
              backgroundImage: `url(${PORTRAIT_SRC})`,
              backgroundSize: "200%",
              backgroundPosition: "86% 54%",
            }}
          />
        </motion.div>
      </motion.div>
      <motion.h1
        ref={titleRef}
        className="my-6 font-serif text-4xl font-bold text-brand-title"
        initial={false}
        animate={{
          height: titleHeight ? titleHeight * titleScale : "auto",
          scale: titleScale,
          marginBottom: lerp(
            TITLE_MARGIN,
            TITLE_MARGIN_COLLAPSED,
            collapse,
          ),
        }}
        style={{ transformOrigin: "top center" }}
        transition={heroSpring}
      >
        Satlok Ashram
      </motion.h1>
    </>
  );
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
  const { collapse: keyboardCollapse, height: viewportHeight } =
    useKeyboardViewport();

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
      <div
        className="fixed inset-x-0 top-0 mx-auto flex  h-(--app-height) overflow-hidden w-full max-w-md flex-col items-center overflow-clip bg-app-gradient"
        // style={viewportHeight ? { height: viewportHeight } : undefined}
      >
        <BrandHero collapse={keyboardCollapse} />

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
                  <label className="flex items-center gap-3 rounded-full bg-slate-50 px-5 py-3.5 shadow-[inset_0_2px_6px_rgba(15,23,42,0.08)] focus-within:ring-2 focus-within:ring-violet-300">
                    <Phone className="size-5 shrink-0 text-brand-900" />
                    <input
                      name="username"
                      required
                      autoFocus
                      inputMode="tel"
                      value={values.username}
                      placeholder="Enter your mobile number"
                      className="w-full bg-transparent text-lg text-gray-700 placeholder-gray-500 outline-none"
                      onChange={(e) =>
                        setFieldValue(
                          "username",
                          String(e.target.value).replaceAll(/\s+/g, ""),
                        )
                      }
                    />
                  </label>
                )}
                <Button
                  variant="gradient"
                  type="submit"
                  className="mx-auto w-2/3"
                  disabled={loading}
                  loading={loading}
                >
                  {forgotPinShow || otpRequired ? "Login" : "Get OTP"}
                </Button>
                <div className="flex w-full px-1 justify-between items-center font-semibold text-blue-900">
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
                toast.error("Enter pin");
                setSubmitting(false);
              } else {
                setPin(values);
              }
            }}
          >
            {({ values, setFieldValue }) => (
              <Form className={cardClass}>
                <p className="text-lg font-bold text-center text-brand-ink">
                  Set {authMethod === "username" ? "Password" : "Pin"}
                </p>

                {authMethod === "username" ? (
                  <Input
                    name="pin"
                    type="password"
                    value={values.pin}
                    placeholder="Enter password..."
                    required={authMethod === "username"}
                    className="h-12 rounded-full bg-slate-50 px-5"
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
                  className="mx-auto w-2/3"
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
              <Form className={cardClass}>
                <p className="text-lg font-bold text-center text-brand-ink">
                  Enter {authMethod === "username" ? "Password" : "Pin"}
                </p>

                {authMethod === "username" ? (
                  <Input
                    name="pin"
                    type="password"
                    value={values.pin}
                    placeholder="Enter password..."
                    required={authMethod === "username"}
                    className="h-12 rounded-full bg-slate-50 px-5"
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
                  className="mx-auto w-2/3"
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
