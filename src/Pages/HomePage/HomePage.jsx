//===================================================================================//
// Imports
import { Link } from "react-router"

import styles from "./HomePage.module.css";
//===================================================================================//
// Variables
//===================================================================================//
// Functions
//===================================================================================//
// Router
//===================================================================================//
// Element
function HomePage() {

  return (
    <div id={styles.Wrapper}>
      <div id={styles.TriangleWrapper}>
        <div id={styles.Triangle}></div>
      </div>

      <div id={styles.Bar}>
        <div id={styles.Logo}>Balsam</div>
        <div id={styles.Buttons}>
          <Link to={'/login'}><button id={styles.LoginBtn} className={styles.Btn}>Login</button></Link>
          <Link to={'/signup'}><button id={styles.SignupBtn} className={styles.Btn}>Sign up</button></Link>
        </div>
      </div>

      <div id={styles.Words}>
        <div className={styles.WordsBig}>Your Dream <span id={styles.ColorfulWord}>Pharmacy</span></div>
        <div className={styles.WordsBig}>A Few Clicks Away</div>
        <br></br>
        <div id={styles.WordsSmall}>Enjoy an AI powered environment for organizing your pharmacy work</div>
      </div>

      <img src="src\assets\iPad.png" id={styles.Image}></img>
    </div>
  )
}
//===================================================================================//
// Export
export default HomePage
//===================================================================================//