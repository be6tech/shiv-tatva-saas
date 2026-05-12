"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import * as React from "react";

export function ReduxProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Provider store={store}>{children}</Provider>;
}

