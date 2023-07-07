import styles from './styles.module.css';
import Image from 'next/image';

import Logo from '../../assets/logo.png';
export default function Header() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.Logo}>
          <img className={styles.logoIcon} src='./assets/brenda.png' alt="Logo" ></img>
        </div>
      </header>
    </>
  )
}