import React from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from "@/state/adminApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPassword({ email }).unwrap();
    setDone(true);
  };

  const errMsg = (error as any)?.data?.message || (error as any)?.error || null;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-16 items-center justify-center">
        <img src="/logo.svg" alt="afroscholars" className="h-7 w-auto" />
      </div>

      <div className="mx-auto mt-10 w-full max-w-md px-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm font-medium text-[#2F5BD1]"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold text-gray-900">Reset password</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email and we’ll send you a reset link.
        </p>

        {done ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            If the email exists, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@company.com"
                className="h-11 w-full rounded-xl border border-[#2F5BD1] bg-[#EEF4FF] px-4 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F5BD1]/60"
              />
            </div>

            {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-[#2F5BD1] text-[15px] font-semibold text-white hover:bg-[#2F5BD1]/90 disabled:opacity-70"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
