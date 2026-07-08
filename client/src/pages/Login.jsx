import styles from './Login.module.css'
import { Link } from "react-router-dom";

function Login() {
  return (
        <div className={styles.mainPage}>
            <div className={styles.logoContainer}></div>
            <div className={styles.loginContainer}>
                <div className={styles.greetingsContainer}>
                    <h3 className={styles.helloText}>Hello!</h3>
                    <h1 className={styles.goodText}>Good Day!</h1>
                </div>
                <div>
                <section className={styles.formContainer}>
                    <form className={styles.form}>
                        <div>
                        <input type='email' placeholder='email'></input>
                        <input type='password' placeholder='password'></input>
                        </div>

                        <div>
                        <Link to='/#' className={styles.forgotButton}>Forgot Password?</Link>
                        </div>

                        <div>
                        <button type='submit' className={styles.submitButton}>Log-in</button>
                        <Link to='/#'>Create Account</Link>
                        </div>
                    </form>
                </section>
                </div>
            </div>
        </div>
  );
}

export default Login;