import { useTranslation } from "react-i18next";

export function SecurityHeader() {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-panel border-b border-stroke text-xs py-2 px-4 flex flex-wrap justify-between items-center z-50">
      <div className="flex items-center space-x-2 mx-auto sm:mx-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-medium text-slate-600 dark:text-slate-300">
          {t("auth.security_header.secure_environment")}
        </span>
        <span className="font-mono text-content-title font-bold select-all flex items-center bg-surface-base px-2 py-0.5 rounded border border-stroke">
          <svg
            className="w-3.5 h-3.5 text-emerald-500 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          https://rmtech.com
        </span>
      </div>
      <div className="hidden sm:flex items-center space-x-4 text-slate-500 dark:text-slate-400">
        <span className="flex items-center">
          <svg
            className="w-3.5 h-3.5 text-emerald-500 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          {t("auth.security_header.ssl_active")}
        </span>
        <span className="flex items-center">
          <svg
            className="w-3.5 h-3.5 text-emerald-500 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {t("auth.security_header.encrypted_auth")}
        </span>
      </div>
    </div>
  );
}
