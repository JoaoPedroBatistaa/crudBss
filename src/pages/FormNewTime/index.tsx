import { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from './styles.module.css';
import { useRouter } from 'next/router';
import PhotoUpload from '@/components/PhotoUpload';
import SearchSelect from '@/components/SearchSelect';
import { db, storage } from '@/firebase';
import { GetServerSidePropsContext } from 'next';
import { toast } from 'react-toastify';
import Spinner from '@/components/Spinner';


interface Modality{
  id:string
}
interface Item {
  id: string;
  name: string;
  photo: string;
}

interface Team {
  logo: string;
  modality: string;
  name: string;
  squad: Item[];
}

export default function FormNewTime({ data }: { data: Modality }) {
  const [teamName, setTeamName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limparSelected, setLimparSelected] = useState(false);
   const [searchText, setSearchText] = useState('');
    const [placeholder, setPlaceholder] = useState('Pesquisar');


  const router = useRouter();

  useEffect(() => {
    resetForm();
  }, [data]);

  function HandleBackButtonClick() {
    router.back();
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSelectItems = (items: Item[]) => {
    setSelectedItems(items);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Upload da imagem para o Firebase Storage (se necessário)
      let imageUrl = '';
      if (selectedFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `logos/${selectedFile.name}`);
        const fileSnapshot = await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(fileSnapshot.ref);
      }

      // Obter a referência da modalidade
      const modalityRef = doc(db, 'modalities', data.id);

      // Obter as referências dos jogadores na squad
      const squadRefs = selectedItems.map((item) => doc(db, 'players', item.id));

      // Criando o objeto do time com as referências
      const newTeam: Team = {
        logo: imageUrl,
        modality: modalityRef.path, // <- Adapte de acordo com a estrutura da sua coleção 'modalities'
        name: teamName,
        squad: squadRefs.map((ref) => ref.path), // <- Adapte de acordo com a estrutura da sua coleção 'players'
      };

      // Adicionando o novo time à coleção 'teams'
      const docRef = await addDoc(collection(db, 'teams'), {
        ...newTeam,
        createdAt: serverTimestamp(),
      });

      console.log('Time cadastrado com sucesso! ID:', docRef.id);
      toast.success('Time cadastrado com sucesso')

      setIsLoading(false);
      resetForm();
      router.push("newTeam?mdl="+data.id)
} catch (error) {
  console.error('Erro ao cadastrar o time:', error);
  toast.error('Erro ao cadastrar o time');
  setIsLoading(false);
}
};

 const handleResetSearch = () => {
    // Lógica para resetar a pesquisa ou realizar outras ações necessárias
       setSearchText('');
    setPlaceholder('Pesquisar');
  };

const resetForm = () => {
setTeamName('');
setSelectedFile(null);
setPreviewImage(null);
setSelectedItems([]);
handleResetSearch()
};

return (
  isLoading ? <Spinner />:
<>

  <div className={styles.Container}>
    <div className={styles.Card}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Times</h1>
        <div className={styles.new}>
          <p className={styles.newTitle}>NOVO TIME</p>
          <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.form}>
          <p className={styles.label}>Nome do Time</p>
          <input
            className={styles.field}
            type="text"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
          />
        </div>

        <div className={styles.form}>
          {previewImage && (
            <div className={styles.previewContainer}>
              <img className={styles.previewImage} src={previewImage} alt="Preview" />
            </div>
          )}
          <p className={styles.label}>Logo</p>
          <div className={styles.uploadContainer}>
            <PhotoUpload onChange={handleFileChange} />
          </div>
        </div>

        <div className={styles.form}>
          <p className={styles.label}>Elenco</p>
          <SearchSelect onSelectItems={handleSelectItems} onResetSearch={handleResetSearch} />
        </div>

        <button className={styles.save} type="submit" disabled={isLoading}>
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

export async function getServerSideProps(context:GetServerSidePropsContext) {
  const { query } = context;
  const {mdl} = query;
  console.log(mdl)

  return {
    props: {
      data:{id:mdl}
    },
  };
}
