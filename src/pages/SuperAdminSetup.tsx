// src/pages/SuperAdminSetup.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setUser } from "@/state/authSlice";
import { useRegisterSuperAdminMutation } from "@/state/adminApi";

const SuperAdminSetup: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("superadmin@afroscholar.com");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [registerSuperAdmin, { isLoading }] = useRegisterSuperAdminMutation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Name, email and password are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await registerSuperAdmin({
        name,
        email,
        phone: phone || undefined,
        password,
      }).unwrap();

      // Save token for subsequent authenticated requests
      if (res.token) {
        localStorage.setItem("afro_admin_token", res.token);
      }

      // Put user in Redux
      dispatch(setUser(res.user as any));

      // Redirect into the app
      navigate("/scholars");
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
        "Could not register super admin. Maybe it is already initialized.";
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top brand bar with centered logo */}
      <div className="flex h-16 items-center justify-center">
        <img
          src="/logo.svg"
          alt="afroscholars"
          className="h-7 w-auto"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Centered form */}
      <div className="mx-auto mt-8 w-full max-w-md px-6">
        <h1 className="text-center text-3xl font-semibold text-gray-900">
          Setup Super Admin
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Create the first Super Admin account for this AfroScholars admin
          portal.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {/* Full name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="e.g. Jane Super Admin"
              className="h-11 w-full rounded-xl border border-[#2F5BD1] bg-[#EEF4FF] px-4 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F5BD1]/60"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="superadmin@afroscholar.com"
              className="h-11 w-full rounded-xl border border-[#2F5BD1] bg-[#EEF4FF] px-4 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F5BD1]/60"
            />
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Phone Number (optional)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="080..."
              className="h-11 w-full rounded-xl border border-[#2F5BD1] bg-[#EEF4FF] px-4 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F5BD1]/60"
            />
          </div>

          {/* Password + confirm with eye toggle */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Password
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Enter password"
                className="h-11 w-full rounded-xl border border-[#2F5BD1] bg-[#EEF4FF] px-4 pr-12 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F5BD1]/60"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#2F5BD1] text-[#2F5BD1]"
                aria-label="Toggle password visibility"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Confirm Password
            </label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={show ? "text" : "password"}
              placeholder="Re-enter password"
              className="h-11 w-full rounded-xl border border-[#2F5BD1] bg-[#EEF4FF] px-4 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F5BD1]/60"
            />
          </div>

          {/* Error message */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="mx-auto mt-4 block h-11 w-full rounded-xl bg-[#2F5BD1] text-[15px] font-semibold text-white hover:bg-[#2F5BD1]/90 disabled:opacity-70"
          >
            {isLoading ? "Creating Super Admin..." : "Create Super Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminSetup;
