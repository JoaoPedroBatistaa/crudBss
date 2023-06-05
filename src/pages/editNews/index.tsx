import styles from './styles.module.css';
import { useRouter } from 'next/router';
import 'firebase/storage';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-toastify';

interface News {
  id: string;
  image: string;
  title: string;
  description: string;
  date: string;
}

export default function EditNews() {
  const router = useRouter();
  const { id } = router.query;

  const [newsData, setNewsData] = useState({
    title: '',
    image: null,
    description: '',
    date: '',
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewsData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    setNewsData((prevState) => ({ ...prevState, [name]: file }));
  };

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) {
        console.log('News ID is not defined.');
        return;
      }

      try {
        const newsDoc = await getDoc(doc(db, 'news', id as string));
        if (newsDoc.exists()) {
          const news = newsDoc.data();
          setNewsData(news);
        } else {
          console.log('No news exists with this ID.');
        }
      } catch (error) {
        console.error('Error fetching news details: ', error);
      }
    };

    if (router.isReady) {
      fetchNews();
    }
  }, [router.isReady, id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      console.error('Error: News ID is not defined');
      toast.error('Error when updating news.');
      return;
    }

    try {
      if (newsData.image instanceof File) {
        const storage = getStorage();
        const fileRef = ref(storage, `news/${newsData.image.name}`);

        const uploadTask = uploadBytesResumable(fileRef, newsData.image);
        await uploadTask;

        const downloadURL = await getDownloadURL(fileRef);
        newsData.image = downloadURL as string;
      }

      await setDoc(doc(db, 'news', id as string), newsData);

      toast.success('News updated successfully!');
    } catch (error) {
      console.error('Error when updating news: ', error);
      toast.error('Error when updating news.');
    }
  };

  function HandleBackButtonClick() {
    window.history.back();
  }

  return (
    <>
      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Editar Notícia</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <p className={styles.label}>Manchete</p>
              <input
                className={styles.field}
                type="text"
                name="title"
                value={newsData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Foto</p>
              <input
                className={styles.fieldFile}
                type="file"
                accept="image/*"
                name="image"
                onChange={handleImageChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Descrição</p>
              <input
                className={styles.field}
                type="text"
                name="description"
                value={newsData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Data</p>
              <input
                className={styles.field}
                type="date"
                name="date"
                value={newsData.date}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className={styles.save}>
              SALVAR
            </button>
          </form>
        </div>

        <button className={styles.back} onClick={HandleBackButtonClick}>
          Voltar
        </button>
      </div>
    </>
  );
}
