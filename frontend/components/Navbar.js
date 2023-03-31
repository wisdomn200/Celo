import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
    return (
        <div className={styles.navbar}>
            <link href="/">Home</link>
            <link href="/create">Create Listing</link>

            <ConnectButton />
        </div>
    )
}