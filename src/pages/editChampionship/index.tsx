import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import 'firebase/storage';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-toastify';

import SearchSelectTeam from '@/components/SearchSelectTable';


interface Championship {
  id: string;
  name: string;
  logo?: File | string | null;
  criterion: string;
  description?: string;
  dataMatrix: TableData[];
  count: number; // Adicione esta linha
}


interface Item {
  id: string;
  name: string;
  logo: string;
}

type TableData = {
  time: string;
  position: string;
  victories: string;
  logo: string;  // Adicione esta linha
};



export default function EditChampionship() {
  const [championshipData, setChampionshipData] = useState<Championship>({
    id: '',
    name: '',
    logo: null,
    criterion: "",
    description: "",
    dataMatrix: [],
    count: 0 // Adicione esta linha para inicializar dataMatrix como um array vazio
  });


  const [selectedTeamOne, setSelectedTeamOne] = useState<Item | null>(null);


  const router = useRouter();
  const { id } = router.query;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setChampionshipData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setChampionshipData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
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
          setDataMatrix(championship.dataMatrix || []);
          setCount(championship.count || 0);
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
      toast.error('Erro ao atualizar o campeonato.');
      return;
    }

    try {
      let updatedChampionshipData = { ...championshipData, dataMatrix, count };

      if (updatedChampionshipData.logo instanceof File) {
        const storage = getStorage();
        const fileRef = ref(storage, `championships/${updatedChampionshipData.logo.name}`);

        const uploadTask = uploadBytesResumable(fileRef, updatedChampionshipData.logo);
        await uploadTask;

        const downloadURL = await getDownloadURL(fileRef);
        updatedChampionshipData.logo = downloadURL as string;
      }

      await setDoc(doc(db, 'championships', id as string), updatedChampionshipData);

      toast.success('Campeonato atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar o campeonato: ', error);
      toast.error('Erro ao atualizar o campeonato.');
    }
  };


  function HandleBackButtonClick() {
    window.history.back();
  }

  const handleSelectTeamOne = (item: Item) => {
    setSelectedTeamOne(item);
  };

  const [count, setCount] = useState(0);
  const [dataMatrix, setDataMatrix] = useState<TableData[]>([]);

  const handleInputTableChange = (e: { target: HTMLInputElement; }) => {
    const input = e.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      setCount(value);
    }
  };

  const handleTableInputChange = (index: number, type: keyof TableData, e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMatrix = [...dataMatrix];
    if (!updatedMatrix[index]) {
      updatedMatrix[index] = { time: '', position: '', victories: '', logo: '' };
    }
    updatedMatrix[index][type] = e.target.value;
    setDataMatrix(updatedMatrix);
  };

  console.log(dataMatrix);

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

            <div className={styles.form}>
              <p className={styles.label}>Critério do Campeonato</p>
              <select
                className={styles.field}
                name="criterion"
                value={championshipData.criterion}
                onChange={handleSelectChange}
              >
                <option value="">Selecione um critério</option>
                <option value="critério1">Critério 1</option>
                <option value="critério2">Critério 2</option>
                <option value="critério3">Critério 3</option>
              </select>
            </div>


            <div className={styles.form}>
              <p className={styles.label}>Descrição do Campeonato</p>
              <textarea
                className={styles.field}
                value={championshipData.description}
                name="description"
                onChange={handleTextAreaChange}
              />
            </div>


            <div className={styles.form}>
              <div className={styles.headTable}>
                <p className={styles.label}>Tabela do Campeonato - "insira o Nº posições"</p>
                <input
                  value={championshipData.count}

                  type="text"
                  id='positions'
                  className={styles.position}
                  pattern="\d*"
                  onInput={(e) => {
                    const input = e.currentTarget as HTMLInputElement;
                    const value = parseInt(input.value);
                    if (!isNaN(value)) {
                      setCount(value);
                    }
                  }}
                />
              </div>

              {/* Aqui começamos a renderização condicional */}
              {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={styles.table}>
                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>Posição</p>
                    <input
                      type="text"
                      className={styles.position}
                      pattern="\d*"
                      value={dataMatrix[index]?.position || ''}
                      onChange={(e) => handleTableInputChange(index, 'position', e)}
                    />
                  </div>

                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>Vitórias</p>
                    <input
                      type="text"
                      className={styles.position}
                      pattern="\d*"
                      value={dataMatrix[index]?.victories || ''}
                      onChange={(e) => handleTableInputChange(index, 'victories', e)}
                    />
                  </div>

                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>
                      Time {dataMatrix[index]?.time ? `(${dataMatrix[index]?.time})` : ''}
                    </p>

                    <SearchSelectTeam
                      initialValue={dataMatrix[index]?.time}

                      onSelectItem={(team: Item) => {
                        const updatedMatrix = [...dataMatrix];
                        if (!updatedMatrix[index]) {
                          updatedMatrix[index] = { time: '', position: '', victories: '', logo: '' };
                        }
                        updatedMatrix[index].time = team.name;
                        updatedMatrix[index].logo = team.logo;
                        setDataMatrix(updatedMatrix);
                      }} />
                  </div>
                </div>
              ))}
            </div>


            <button type="submit" className={styles.save}>
              SALVAR
            </button>
          </form>

          <button className={styles.back} onClick={HandleBackButtonClick}>
            Voltar
          </button>
        </div >
      </div >
    </>
  );
}
