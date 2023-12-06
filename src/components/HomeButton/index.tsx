import Link from "next/link";
import styles from "./styles.module.css";

export default function homeButton() {
  return (
    <>
      <Link href={"/Sports"}>
        <div className={styles.button}>
          <img src="/home.svg" alt="" />
        </div>
      </Link>
    </>
  );
}
