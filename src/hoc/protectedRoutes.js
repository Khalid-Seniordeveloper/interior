/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Image from "next/image";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "../styles/hoc.module.css";
import loadingImg from "../public/images/loading.gif";

const ProtectedRoute = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const token = getCookie("token");
    const userData = getCookie("userData");
    const [loading, setLoading] = useState(true);

    const publicRoutes = ["/", "/feature", "/login", "/signup", "/pricing"];
    const userRoutes = [
        "/dashboard",
        "/dashboard/chathistory",
        "/dashboard/pro",
        "/dashboard/setting",
        "/dashboard/chatbot/:id",
        "/widget",
        "/preview",
    ];

    useEffect(() => {
        if (!token) {
            if (publicRoutes.includes(pathname)) {
                setLoading(false);
                return;
            }
            router.replace("/");
            setLoading(false);
            return;
        }

        try {
            if (!userRoutes.includes(pathname)) {
                router.replace("/dashboard");
            }
        } catch (error) {
            router.replace("/");
        } finally {
            setLoading(false);
        }
    }, [router, token, userData, pathname, publicRoutes, userRoutes]);

    if (loading) {
        return (
            <div className={styles.loadContainer}>
                <div className={styles.imgContainer}>
                    <Image
                        src={loadingImg}
                        priority={true}
                        className={styles.img}
                        width={60}
                        height={60}
                        alt="Loading..."
                    />
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
