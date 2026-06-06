import { useEffect } from "react";
import { useNavigate } from "react-router";

export function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const accessToken =
      params.get("access_token");

    if (accessToken) {

      localStorage.setItem(
        "access_token",
        accessToken
      );

      navigate("/user/dashboard");

    } else {

      navigate("/login");

    }

  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-medium">
        Logging you in...
      </p>
    </div>
  );
}