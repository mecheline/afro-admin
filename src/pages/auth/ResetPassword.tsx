import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResetPasswordMutation } from "@/state/adminApi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const errMsg =
    localError ||
    (error as any)?.data?.message ||
    (error as any)?.error ||
    null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!token) return setLocalError("Reset token is missing.");
    if (password.length < 6)
      return setLocalError("Password must be at least 6 characters.");
    if (password !== confirm) return setLocalError("Passwords do not match.");

    await resetPassword({ token, password }).unwrap();
    navigate("/", { replace: true }); // back to login
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-16 items-center justify-center">
        <img src="/logo.svg" alt="afroscholars" className="h-7 w-auto" />
      </div>

      <div className="mx-auto mt-10 w-full max-w-md px-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Set new password
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter a new password for your account.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              New Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter new password"
              className="h-11 w-full rounded-xl border border-[#2F5BD1] bg-[#EEF4FF] px-4 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F5BD1]/60"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Confirm Password
            </label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              placeholder="Confirm password"
              className="h-11 w-full rounded-xl border border-[#2F5BD1] bg-[#EEF4FF] px-4 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F5BD1]/60"
            />
          </div>

          {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-xl bg-[#2F5BD1] text-[15px] font-semibold text-white hover:bg-[#2F5BD1]/90 disabled:opacity-70"
          >
            {isLoading ? "Updating..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
