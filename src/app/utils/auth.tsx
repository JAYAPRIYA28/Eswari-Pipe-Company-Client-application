import {
  createClient
} from "@supabase/supabase-js";

const API_URL =
  "https://eswari-pipe-company-server-application.onrender.com";

// const API_URL = "http://localhost:3000";

// SUPABASE
const supabaseUrl =
  "https://fjubpeowqjzgpwiaujwo.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdWJwZW93cWp6Z3B3aWF1andvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjU3ODMsImV4cCI6MjA4OTc0MTc4M30.WUPU6Uq0I1seHwJj88gUfEPCMe6HycRyOK-B0t4wbyk";

export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  );

export interface User {
  id: string;
  email: string;

  user_metadata: {
    name?: string;

    role?: "admin" | "user";
  };
}

export const authService = {

  // ─────────────────────────────────────────────
  // SIGNUP
  // ─────────────────────────────────────────────
  async signup(
    email: string,
    password: string,
    name: string,
    role: "admin" | "user" = "user"
  ) {

    const response =
      await fetch(
        `${API_URL}/auth/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
            name,
            role,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "Signup failed"
      );

    }

    return data;
  },

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  async login(
    email: string,
    password: string
  ) {

    const response =
      await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "Login failed"
      );

    }

    localStorage.setItem(
      "access_token",
      data.session.access_token
    );

    return data;
  },

  // ─────────────────────────────────────────────
  // GOOGLE LOGIN
  // ─────────────────────────────────────────────
  async loginWithGoogle() {

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo:
            "https://eswari-pipe-company-client-applicat.vercel.app",
        },
      });

    if (error) {

      throw new Error(
        error.message
      );

    }
  },

  // ─────────────────────────────────────────────
  // HANDLE GOOGLE SESSION
  // ─────────────────────────────────────────────
 // ─────────────────────────────────────────────
// HANDLE GOOGLE SESSION
// ─────────────────────────────────────────────
async handleOAuthLogin() {

  // GET SESSION FROM SUPABASE
  const {
    data,
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  const session = data.session;

  if (!session) {
    return null;
  }

  // SAVE TOKEN
  localStorage.setItem(
    "access_token",
    session.access_token
  );

  // SEND TOKEN TO BACKEND
  // BACKEND WILL:
  // 1. CHECK ADMIN EMAIL
  // 2. UPDATE ROLE
  // 3. RETURN USER
  const response = await fetch(
    `${API_URL}/auth/oauth-user`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "OAuth failed"
    );
  }

  return result.user;
},

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  async logout() {

    localStorage.removeItem(
      "access_token"
    );

    await supabase.auth.signOut();

    await fetch(
      `${API_URL}/auth/logout`,
      {
        method: "POST",
      }
    );
  },

  // ─────────────────────────────────────────────
  // GET CURRENT USER
  // ─────────────────────────────────────────────
  async getCurrentUser():
    Promise<User | null> {

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      return null;
    }

    const response =
      await fetch(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    if (!response.ok) {
      return null;
    }

    const data =
      await response.json();

    return data.user;
  },

  // ─────────────────────────────────────────────
  // ACCESS TOKEN
  // ─────────────────────────────────────────────
  async getAccessToken():
    Promise<string | null> {

    return localStorage.getItem(
      "access_token"
    );
  },
};