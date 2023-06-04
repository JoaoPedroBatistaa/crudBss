import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import 'firebase/storage';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-toastify';

interface Championship {
  id: string;
  name: string;
  logo?: File | string | null;
}

export default function EditChampionship() {
  const [championshipData, setChampionshipData] = useState<Championship>({
    id: '',
    name: '',
    logo: null,
  });

  const router = useRouter();
  const { id } = router.query;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setChampionshipData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    setChampionshipData((prevState) => ({ ...prevState, logo: file }));
  };

  useEffect(() => {
    const fetchChampionship = async () => {
      if (!id) {
        console.log('Championship ID is not defined.');
        return;
      }

      try {
        const championshipDoc = await getDoc(doc(db, 'championships', id as string));
        if (championshipDoc.exists()) {
          const championship = championshipDoc.data() as Championship;
          setChampionshipData(championship);
        } else {
          console.log('No championship exists with this ID.');
        }
      } catch (error) {
        console.error('Error fetching championship details: ', error);
      }
    };

    if (router.isReady) {
      fetchChampionship();
    }
  }, [router.isReady, id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      console.error('Error: Championship ID is not defined');
      toast.error('Error when updating championship.');
      return;
    }

    try {
      if (championshipData.logo instanceof File) {
        const storage = getStorage();
        const fileRef = ref(storage, `championships/${championshipData.logo.name}`);

        const uploadTask = uploadBytesResumable(fileRef, championshipData.logo);
        await uploadTask;

        const downloadURL = await getDownloadURL(fileRef);
        championshipData.logo = downloadURL as string;
      }

      await setDoc(doc(db, 'championships', id as string), championshipData);

      toast.success('Championship updated successfully!');
      router.push('/championships');
    } catch (error) {
      console.error('Error when updating championship: ', error);
      toast.error('Error when updating championship.');
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
            <h1 className={styles.title}>Editar Campeonato</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <p className={styles.label}>Nome do Campeonato</p>
              <input className={styles.field} type="text" value={championshipData.name} name="name" onChange={handleInputChange} />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Logo do Campeonato</p>
              <input className={styles.fieldFile} type="file" accept="image/*" onChange={handleLogoChange} />
            </div>

            <button type="submit" className={styles.save}>
              SALVAR
            </button>
          </form>

          <button className={styles.back} onClick={HandleBackButtonClick}>
            Voltar
          </button>
        </div>
      </div>
    </>
  );
}
