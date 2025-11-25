//===================================================================================//
// Imports
import { Link } from "react-router"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"

import styles from "./LoginPage.module.css"

const API_URL = "https://balsam-beta-backend-production-aa55.up.railway.app";
//===================================================================================//
//
// LOGIN FUNCTION
//
export async function LoginAccount(email, password, navigate) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // credentials removed because frontend sets cookie manually
    body: JSON.stringify({ Email: email, Password: password })
  });

  const data = await response.json();
  console.log("LOGIN RESPONSE:", data);

  if (!response.ok || !data.success) {
    throw new Error("Invalid login");
  }

  // save in localStorage and cookie manually
  localStorage.setItem("userId", data.id);
  document.cookie = `userId=${data.id}; path=/; max-age=${60 * 60 * 24 * 30}`;

  navigate("/storage");
}

//
// AUTO LOGIN
//
export async function AutoLogin(navigate) {
  const userId = getCookie("userId");
  if (!userId) return false;

  const response = await fetch(`${API_URL}/auth/auto-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idCookie: userId })
  });

  const data = await response.json();
  console.log("AUTO LOGIN RESPONSE:", data);

  if (!data.success) return false;

  localStorage.setItem("userId", data.id);
  navigate("/storage");
  return true;
}

//
// COOKIE READER
//
function getCookie(name) {
  const cookies = document.cookie.split("; ").map(c => c.split("="));
  const cookie = cookies.find(([key]) => key === name);
  return cookie ? cookie[1] : null;
}
//===================================================================================//
//
// COMPONENT
//
function LoginPage() {
  const [Email, EmailChanger] = useState("");
  const [Password, PasswordChanger] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    AutoLogin(navigate);
  }, [navigate]);

  return (
    <div id={styles.Wrapper}>
      <img
        id={styles.Image}
        src="src/assets/Close-up of a scientist& x27;s gloved hand holding a test tube stock image.png"
      />

      <div id={styles.Fields}>
        <a href="/">Balsam</a>

        <div id={styles.SmallerFields}>
          <div id={styles.BigText}>Login</div>
          <button id={styles.GoogleBtn}>Or login with Google</button>

          <div id={styles.InputWrapper}>
            <input
              id={styles.Email}
              type="email"
              className={styles.Inpts}
              placeholder="Email"
              onChange={(e) => EmailChanger(e.target.value)}
            />

            <input
              id={styles.Password}
              type="password"
              className={styles.Inpts}
              placeholder="Password"
              onChange={(e) => PasswordChanger(e.target.value)}
            />

            <button
              id={styles.LoginAccountBtn}
              onClick={() => LoginAccount(Email, Password, navigate)}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
//===================================================================================//
// Export
export default LoginPage;

//===================================================================================//

