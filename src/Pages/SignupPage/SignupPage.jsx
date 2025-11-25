//===================================================================================//
// Imports
import { Link } from "react-router"
import { useNavigate } from "react-router"
import { useState } from "react"

import styles from "./SignupPage.module.css"

const API_URL = "https://balsam-beta-backend-production-aa55.up.railway.app";
//===================================================================================//
// Functions
async function CreateAccount(
  FirstName, LastName, Email, Password, RepeatPassword, TOSCheck, navigate
) {
  if (Password !== RepeatPassword) {
    throw Error("Passwords do not match!");
  }

  if (!TOSCheck) {
    throw Error("You must accept Terms of Service");
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // credentials removed because frontend sets cookie manually
    body: JSON.stringify({
      FirstName,
      LastName,
      Email,
      Password,
      BirthDate: new Date().toISOString(),
      Gender: "Male",
      PhoneNumber: "07738502768"
    })
  });

  const data = await response.json();
  console.log("REGISTER RESPONSE:", data);

  if (!response.ok || !data.success) {
    throw new Error("Failed to create account");
  }

  // save in localStorage and set cookie manually
  localStorage.setItem("userId", data.id);
  document.cookie = `userId=${data.id}; path=/; max-age=${60 * 60 * 24 * 30}`;

  navigate("/storage");
}
//===================================================================================//
// Element
function SignupPage() {
  const [FirstName, FirstNameChanger] = useState("");
  const [LastName, LastNameChanger] = useState("");
  const [Email, EmailChanger] = useState("");
  const [Password, PasswordChanger] = useState("");
  const [RepeatPassword, RepeatPasswordChanger] = useState("");
  const [TOSCheck, TOSCheckChanger] = useState(false);

  const navigate = useNavigate();

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

          <div id={styles.InputWrapper}>
            <div id={styles.TextWrapper}>
              <input
                id={styles.FirstName}
                type="text"
                className={styles.Inpts}
                placeholder="First name"
                onChange={(e) => FirstNameChanger(e.target.value)}
              />
              <input
                id={styles.LastName}
                type="text"
                className={styles.Inpts}
                placeholder="Last name"
                onChange={(e) => LastNameChanger(e.target.value)}
              />
            </div>

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

            <input
              id={styles.RepeatPassword}
              type="password"
              className={styles.Inpts}
              placeholder="Repeat password"
              onChange={(e) => RepeatPasswordChanger(e.target.value)}
            />

            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                id={styles.TOS}
                type="checkbox"
                onChange={(e) => TOSCheckChanger(e.target.checked)}
              />
              <span>I accept Terms of Service</span>
            </label>

            <button
              id={styles.CreateAccount}
              onClick={() => {
                CreateAccount(
                  FirstName,
                  LastName,
                  Email,
                  Password,
                  RepeatPassword,
                  TOSCheck,
                  navigate
                );
              }}
            >
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

