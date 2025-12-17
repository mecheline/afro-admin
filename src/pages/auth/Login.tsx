import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "@/state/authSlice";
import { useLoginMutation } from "@/state/adminApi";

const Login: React.FC = () => {
  const d = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [login, { isLoading }] = useLoginMutation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      // Call your backend: POST /admin/api/auth/login
      const res = await login({ email, password }).unwrap();

      // Store token so RTK Query can reuse it in headers
      if (res.token) {
        localStorage.setItem("afro_admin_token", res.token);
      }

      // Put the real user (with role & permissions) into Redux
      d(setUser(res.user as any));

      // Go to the main admin area
      navigate("/scholars");
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
        "Login failed. Please check your email and password.";
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top brand bar with centered logo */}
      <div className="flex h-16 items-center justify-center">
        {/* replace src with your logo path */}
        <img
          src="/logo.svg"
          alt="afroscholars"
          className="h-7 w-auto"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Cardless centered form */}
      <div className="mx-auto mt-8 w-full max-w-md px-6">
        <h1 className="text-center text-3xl font-semibold text-gray-900">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Welcome back! Please enter your details.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="adedada@afroscholar.com"
              className="h-11 w-full rounded-xl border border-[#2F5BD1] bg-[#EEF4FF] px-4 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F5BD1]/60"
            />
          </div>

          {/* Password with eye toggle */}
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
                {/* simple eye icon */}
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

            {/* Forgot Password link centered */}
            <Link
              to={"/forgot-password"}
              className="mt-2 text-center text-sm font-medium text-[#2F5BD1]"
            >
              Reset Password?
            </Link>
          </div>

          {/* Error message */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="mx-auto mt-4 block h-11 w-full rounded-xl bg-[#2F5BD1] text-[15px] font-semibold text-white hover:bg-[#2F5BD1]/90 disabled:opacity-70"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
