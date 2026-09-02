"use client";

import { HelmetProvider } from "react-helmet-async";

export default function ClientProviders({ children }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}
