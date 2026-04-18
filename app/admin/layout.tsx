import type { ReactNode } from "react";

import { AdminToaster } from "view/components/Admin/AdminToaster";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AdminToaster />
    </>
  );
}
