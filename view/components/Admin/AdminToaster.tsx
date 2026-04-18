"use client";

import { ToastContainer } from "react-toastify";

import "react-toastify/ReactToastify.css";

export function AdminToaster() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={8000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      className="!z-[100000]"
      toastClassName="!rounded-xl !border !border-zinc-600/90 !bg-zinc-900 !text-sm !leading-snug !text-zinc-100"
    />
  );
}
