"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import {
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useUploadAdminAvatarMutation,
  useRemoveAdminAvatarMutation,
} from "@/state/adminApi";
import { setUser, type User } from "@/state/authSlice";
import type { RootState } from "@/state/store"; // adjust path if needed

export default function AdminSettingsPage() {
  const d = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [activeTab, setActiveTab] = useState<"profile" | "notifications">(
    "profile"
  );

  const [form, setForm] = useState({ fullName: "", phoneNumber: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading, isFetching } = useGetAdminSettingsQuery();
  const [updateSettings, { isLoading: updating }] =
    useUpdateAdminSettingsMutation();
  const [uploadAvatar, { isLoading: uploadingAvatar }] =
    useUploadAdminAvatarMutation();
  const [removeAvatar, { isLoading: removingAvatar }] =
    useRemoveAdminAvatarMutation();

  const loading = isLoading || isFetching;
  const saving = updating || uploadingAvatar;

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName ?? "",
        phoneNumber: data.phoneNumber ?? "",
      });
      setAvatarUrl(data.avatarUrl ?? null);
    }
  }, [data]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    // local preview
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await removeAvatar().unwrap();
      setAvatarUrl(null);
      setAvatarFile(null);

      // 🔁 update Redux so header reacts immediately
      if (currentUser) {
        const updated: User = {
          ...currentUser,
          avatarUrl: res.avatarUrl ?? "",
        };
        d(setUser(updated));
      }
    } catch (e) {
      console.error(e);
      toast.error("Unable to remove avatar.");
    }
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      // 1. Update name + phone
      const settingsRes = await updateSettings(form).unwrap();

      if (currentUser) {
        const updated: User = {
          ...currentUser,
          name: settingsRes.fullName,
          phone: settingsRes.phoneNumber,
        };
        d(setUser(updated));
      }

      // 2. If user picked a new avatar, upload it and update Redux
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);

        const avatarRes = await uploadAvatar(fd).unwrap();
        setAvatarFile(null);
        setAvatarUrl(avatarRes.avatarUrl); // use real URL from backend

        if (currentUser) {
          const updated: User = {
            ...currentUser,
            avatarUrl: avatarRes.avatarUrl,
          };
          d(setUser(updated)); // 🔁 this makes the header image update
        }
      }

      toast.success("Changes saved");
    } catch (e) {
      console.error(e);
      toast.error("Unable to save changes.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F7FB] px-8 py-8">
      <div className="flex gap-12">
        {/* Left tabs */}
        <aside className="w-56">
          <div className="rounded-xl bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex w-full items-center justify-between px-5 py-4 text-sm ${
                activeTab === "profile"
                  ? "border-l-2 border-[#3056D3] bg-[#F3F6FD] font-medium text-[#3056D3]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`flex w-full items-center justify-between px-5 py-4 text-sm ${
                activeTab === "notifications"
                  ? "border-l-2 border-[#3056D3] bg-[#F3F6FD] font-medium text-[#3056D3]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>Notifications</span>
            </button>
          </div>
        </aside>

        {/* Right content */}
        <section className="flex-1">
          <div className="mx-auto max-w-xl rounded-xl border border-gray-100 bg-white px-10 py-8 shadow-sm">
            {activeTab === "profile" && (
              <form onSubmit={handleSubmit}>
                <h2 className="text-base font-semibold text-gray-900">
                  Personal Info
                </h2>

                {/* Avatar */}
                <div className="mt-6">
                  <p className="text-sm text-gray-700">Avatar</p>
                  <div className="mt-4 flex items-center gap-6">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-400"
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        "Add"
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="rounded-md bg-[#3056D3] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2443aa]"
                        disabled={loading || removingAvatar}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="rounded-md border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        disabled={loading || removingAvatar}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div className="mt-8">
                  <label className="block text-sm text-gray-700">
                    Full Name{" "}
                    <span className="text-xs text-gray-400">
                      (Visible to outlets)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#3056D3] focus:ring-1 focus:ring-[#3056D3]"
                    placeholder="Your full name"
                    disabled={loading}
                  />
                </div>

                {/* Phone */}
                <div className="mt-6">
                  <label className="block text-sm text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-2 flex w-full items-stretch overflow-hidden rounded-md border border-gray-200 bg-white">
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          phoneNumber: e.target.value,
                        }))
                      }
                      className="flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                      placeholder="000-0000-0000"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || loading}
                    className="rounded-md bg-[#3056D3] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2443aa] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "notifications" && (
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Notifications
                </h2>
                <p className="mt-4 text-sm text-gray-500">
                  Notification preferences will go here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
