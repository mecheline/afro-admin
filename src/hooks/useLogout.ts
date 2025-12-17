import * as React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setUser } from "@/state/authSlice";
import { adminApi } from "@/state/adminApi";
import { persistor } from "@/state/store";

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return React.useCallback(async () => {
    try {
      // 1) Clear token used by RTK Query/baseQuery
      localStorage.removeItem("afro_admin_token");

      // 2) Clear user from Redux
      dispatch(setUser(null));

      // 3) Clear RTK Query cache (important for protected data)
      dispatch(adminApi.util.resetApiState());

      // 4) Clear persisted Redux (so refresh doesn't restore old auth)
      await persistor.purge();
    } finally {
      // 5) Go back to login
      navigate("/", { replace: true });
    }
  }, [dispatch, navigate]);
}
