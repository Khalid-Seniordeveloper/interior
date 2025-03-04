"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import logo from "../../public/images/logo.svg";
import styles from "../../styles/navbar.module.css";
import { usePathname, useRouter } from "next/navigation";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path) => pathname === path;

  const handleMenuItemClick = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest("nav")) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""} ${menuOpen ? styles.menuOpen : ""}`}>
        <input
          type="checkbox"
          id="click"
          className={styles.navCheckbox}
          checked={menuOpen}
          onChange={() => setMenuOpen(!menuOpen)}
        />
        <label htmlFor="click" className={styles.menuBtn}>
          <i className="fas fa-bars"></i>
          <div>
            <Link href="/">
              <Image
                src={logo}
                width={200}
                height={200}
                priority={true}
                alt="saylaniLogo"
              />
            </Link>
          </div>
        </label>
        <ul className={`${styles.navItems} ${menuOpen ? styles.menuOpen : ""}`}>
          <li
            className={`${styles.navItem} ${
              isActive("/") ? styles.active : ""
            }`}
            onClick={handleMenuItemClick}
          >
            <Link href="/">Home</Link>
          </li>
          <li
            className={`${styles.navItem} ${
              isActive("/feature") ? styles.active : ""
            }`}
            onClick={handleMenuItemClick}
          >
            <Link href="/feature">Feature</Link>
          </li>
          <li
            className={`${styles.navItem} ${
              isActive("/pricing") ? styles.active : ""
            }`}
            onClick={handleMenuItemClick}
          >
            <Link href="/pricing">Pricing</Link>
          </li>
          <li className={styles.navItem}>
            <button
              className={`${styles.btnLogin}`}
              onClick={() => {
                router.push("/signup");
              }}
            >
              Start Free Trial
            </button>
          </li>
          <li className={styles.navItem}>
            <button
              className={`${styles.btnSignup}`}
              onClick={() => {
                router.push("/signup");
              }}
            >
              SignUp
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
