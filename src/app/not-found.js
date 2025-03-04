"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/notFound.module.css";
import notFound from "../public/images/404_error.png";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import ai from "./../public/images/ai.png";

const NotFound = () => {
    const [token, setToken] = useState(null);
    useEffect(() => {
        const token = getCookie("token");
        setToken(token);
    }, []);

    return (
        <>
            <div
                className="relative h-[calc(100vh)] flex flex-col items-center justify-center text-gray-900 px-6"
                style={{
                    backgroundImage: `url(${ai.src})`,
                    backgroundSize: "contain",
                    backgroundPosition: "right",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute inset-0 bg-white bg-opacity-60"></div>
                <div className={styles.container}>
                    <div className={styles.box}>
                        <h1 className={styles.heading}>Page Not Found</h1>
                        <p className="font-semibold text-xs sm:text-xs md:text-base text-black-600 bg-gradient-to-r from-[#0000] bg-clip-text px-6 md:px-12">
                            Explore the features on our platform. Join us now and enjoy the
                            experience.
                        </p>
                        <Image
                            src={notFound}
                            width={250}
                            height={250}
                            priority={true}
                            alt="email"
                        />
                        {token ? (
                            <button className={styles.button}>
                                <Link href="/dashboard">Go to Home Page</Link>
                            </button>
                        ) : (
                            <button className={styles.button}>
                                <Link href="/">Go to Home Page</Link>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFound;
