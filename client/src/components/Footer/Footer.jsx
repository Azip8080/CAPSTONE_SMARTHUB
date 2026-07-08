import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import SDGIMG from "../../assets/438-4388580_un-sustainable-development-goals-circle-hd-png-download-removebg-preview.png";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        <div className={styles.brand}>
          <img src={SDGIMG} alt="SDG Logo" className={styles.logo} />
          <p className={styles.brandName}>SDG Smart Hub</p>
          <p className={styles.brandDesc}>
            A digital platform connecting communities with sustainable projects,
            events, and educational resources in the City of Manila.
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialBtn} aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="#" className={styles.socialBtn} aria-label="Twitter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            <a href="#" className={styles.socialBtn} aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>

        <div className={styles.about}>
          <p className={styles.colTitle}>About</p>
          <p className={styles.aboutText}>
            A capstone project by students of Universidad de Manila, College of
            Computing Studies, in partnership with the City of Manila.
          </p>
        </div>

      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} SDG Smart Hub — Sustainable Development City of Manila. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.bottomLink}>Privacy Policy</a>
            <a href="#" className={styles.bottomLink}>Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;