import Head from "next/head";
import "../styles/globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { appWithTranslation } from "next-i18next";
import { JSX, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Provider, useDispatch } from "react-redux";
import { syncActiveUser } from "@/redux/features/authSlice";
import { store, useAppSelector } from "@/redux/store";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import { getQueryClient } from "@/utils/get-query-client";
import { migrateOldStorage } from "@/utils/multi-user-storage";

const MyApp = (props: AppProps) => {
  const [mount, setMount] = useState(false);
  const queryClient = getQueryClient();
  useEffect(() => {
    if (typeof window === "undefined") {
      migrateOldStorage();
    }
    setMount(true);
  }, []);
  const {
    Component,
    pageProps,
  }: { Component: NextApplicationPage; pageProps: any } = props;

  return mount ? (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,interactive-widget=resizes-content"
        />
        <meta name="description" content="Description" />
        <meta name="keywords" content="Keywords" />
        <title>Satlok Ashram</title>

        <link rel="manifest" href="/manifest.json" />
        <link
          href="/icons/SangatApp_7.png"
          rel="icon"
          type="image/png"
          sizes="16x16"
        />
        <link
          href="/icons/SangatApp_7.png"
          rel="icon"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/apple-icon.png"></link>
        <meta name="theme-color" content="#000000" />
      </Head>
      <Toaster
        position="top-right"
        containerClassName="mt-16"
        toastOptions={{
          success: {
            style: {
              fontWeight: "bold",
              color: "white",
              background: "green",
            },
          },
          error: {
            style: {
              fontWeight: "bold",
              color: "white",
              background: "red",
            },
          },
        }}
      />
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          {Component.requireAuth ? (
            <AuthProvider>
              {/* @ts-ignore */}
              <Component {...pageProps} />
            </AuthProvider>
          ) : (
            <>
              {/* @ts-ignore */}
              <Component {...pageProps} />
            </>
          )}
        </Provider>
      </QueryClientProvider>
    </>
  ) : null;
};

const AuthProvider = ({ children }: { children: any }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(syncActiveUser());
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user && window.location.pathname === "/login") {
      router.back();
    }
  }, [user, router]);

  return user ? children : null;
};

export default appWithTranslation(MyApp);
