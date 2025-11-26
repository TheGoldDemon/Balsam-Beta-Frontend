//===================================================================================//
// Imports
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useState } from "react";

import styles from "./SignupPage.module.css";

const API_URL = "https://balsam-beta-backend.onrender.com";
//===================================================================================//
// API Function
async function CreateAccount(data) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || "Failed to create account");
  }

  return json.id;
}
//===================================================================================//
// Component
function SignupPage() {
  const navigate = useNavigate();

  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [RepeatPassword, setRepeatPassword] = useState("");
  const [TOSCheck, setTOSCheck] = useState(false);

  const [ErrorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    setErrorMsg("");

    if (Password !== RepeatPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (!TOSCheck) {
      setErrorMsg("You must accept Terms of Service");
      return;
    }

    try {
      const id = await CreateAccount({
        FirstName,
        LastName,
        Email,
        Password,
        BirthDate: new Date().toISOString(),
        Gender: "Male",
        PhoneNumber: "07738502768"
      });

      // Save ID
      localStorage.setItem("userId", id);
      document.cookie = `userId=${id}; path=/; max-age=${60 * 60 * 24 * 30}`;

      navigate("/storage");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div id={styles.Wrapper}>
      <img
        id={styles.Image}
        src="src/assets/Close-up of a scientist& x27;s gloved hand holding a test tube stock image.png"
      />

      <div id={styles.Fields}>
        <a href="/">Balsam</a>

        <div id={styles.SmallerFields}>
          <div id={styles.BigText}>Create account</div>
          <button id={styles.GoogleBtn}>Or login with Google</button>

          {ErrorMsg && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              {ErrorMsg}
            </div>
          )}

          <div id={styles.InputWrapper}>
            <div id={styles.TextWrapper}>
              <input
                id={styles.FirstName}
                type="text"
                className={styles.Inpts}
                placeholder="First name"
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                id={styles.LastName}
                type="text"
                className={styles.Inpts}
                placeholder="Last name"
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <input
              id={styles.Email}
              type="email"
              className={styles.Inpts}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              id={styles.Password}
              type="password"
              className={styles.Inpts}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              id={styles.RepeatPassword}
              type="password"
              className={styles.Inpts}
              placeholder="Repeat password"
              onChange={(e) => setRepeatPassword(e.target.value)}
            />

            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                id={styles.TOS}
                type="checkbox"
                onChange={(e) => setTOSCheck(e.target.checked)}
              />
              <span>I accept Terms of Service</span>
            </label>

            <button id={styles.CreateAccount} onClick={handleSubmit}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
//===================================================================================//
// Export
export default SignupPage;
//===================================================================================//

