import React, { useState } from 'react';
import styles from './styles.module.css';
import Header from '../Header';
import Head from 'next/head';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'teste@gmail.com' && password === '123') {
      // Executa a navegação para a página "/Sports"
      window.location.href = '/Sports';
    } else {
      alert('Email ou senha incorretos!');
    }
  }

  return (
    <>
      <Header></Header>

      <div className={styles.Container}>
        <div className={styles.Card}>

          <h1 className={styles.title}>Login</h1>

          <div className={styles.form}>
            <p className={styles.label}>Email</p>
            <input className={styles.field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Senha</p>
            <input className={styles.field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button className={styles.login} onClick={handleLogin}>Login</button>

        </div>
      </div>
    </>
  )
}
