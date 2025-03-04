"use client";
import styles from "../../styles/footer.module.css";
import Link from "next/link";

const Footer = () => {
  return (
    <>
    <div className={styles.bg}>

    
      <div className={styles.socialHandle}>
        <div className={styles.shpart1}>
          <ul>
            <li>Get to Know Saylani</li>
            <li>About Saylani Microfinance</li>
            <li>Our Mission</li>
            <li>Success Stories</li>
            <li>Join Our Team</li>
          </ul>
          <ul>
            <li>Connect with Saylani</li>
            <li>Facebook</li>
            <li>Instagram</li>
            <li>Twitter</li>
            <li>LinkedIn</li>
            <li>YouTube</li>
          </ul>
          <ul>
            <li>Loan Services</li>
            <li>Small Business Loans</li>
            <li>Educational Loans</li>
            <li>Medical Assistance Loans</li>
            <li>Zero-Interest Loans</li>
          </ul>
          <ul>
            <li>Resources</li>
            <li>Financial Literacy</li>
            <li>Loan Application Guide</li>
            <li>Community Programs</li>
            <li>Volunteer Opportunities</li>
          </ul>
        </div>
        <div className={styles.shpart2}>
          <div className={styles.footlogo}>
            <button>
              <i className="fa-solid fa-globe"></i>
              English
              <i className="fa-solid fa-sort"></i>
            </button>
          </div>
          <div className={styles.locations}>
            <span>Pakistan</span>
            <span>USA</span>
            <span>Canada</span>
            <span>UK</span>
            <span>Germany</span>
            <span>Australia</span>
            <span>UAE</span>
            <span>India</span>
            <span>Malaysia</span>
            <span>South Africa</span>
          </div>
        </div>
      {/* Footer starts here */}
      <footer className={styles.footer}>
        <div className={styles.footerpart1}>
          <ul>
            <li>Empowerment</li>
            <li>Entrepreneur Support</li>
            <li>Community Impact</li>
          </ul>
          <ul>
            <li>Education</li>
            <li>Student Loans</li>
            <li>Scholarship Programs</li>
          </ul>
          <ul>
            <li>Health</li>
            <li>Medical Aid Loans</li>
            <li>Healthcare Support</li>
          </ul>
          <ul>
            <li>Partnerships</li>
            <li>Corporate Sponsorships</li>
            <li>Collaborative Programs</li>
          </ul>
          <ul>
            <li>Volunteer</li>
            <li>Join Our Cause</li>
            <li>Make an Impact</li>
          </ul>
          <ul>
            <li>Empowerment</li>
            <li>Entrepreneur Support</li>
            <li>Community Impact</li>
          </ul>
          <ul>
            <li>Partnerships</li>
            <li>Corporate Sponsorships</li>
            <li>Collaborative Programs</li>
          </ul>
          <ul>
            <li>Health</li>
            <li>Medical Aid Loans</li>
            <li>Healthcare Support</li>
          </ul>
        </div>

        <div className={styles.footerpart2}>
          <p>
            <Link href={"/terms"}>Terms of Use</Link>
            <Link href={"/privacy"}>Privacy Policy</Link>
            <Link href={"/loan-rules"}>Loan Guidelines</Link>
          </p>
          <p>&copy; 2024, Saylani Microfinance, All Rights Reserved</p>
        </div>
      </footer>
      </div>

      </div>
    </>
  );
};

export default Footer;
