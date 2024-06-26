import PhotoUpload from "@/components/PhotoUpload";
import SearchSelectTeam from "@/components/SearchSelectTable";
import Spinner from "@/components/Spinner";
import { addDoc, collection, db, storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import HomeButton from "../../components/HomeButton";
import styles from "./styles.module.css";

interface Item {
  id: string;
  name: string;
  logo: string;
}

interface Champion {
  time: Item | null;
  year: string;
}

export default function AddHistoricChampion() {
  const [title, setTitle] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [champions, setChampions] = useState<Champion[]>([
    { time: null, year: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleLogoChange = (file: File | null) => {
    setLogo(file);
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

  const handleChampionChange = (
    index: number,
    field: keyof Champion,
    value: string | Item | null
  ) => {
    const updatedChampions = [...champions];
    updatedChampions[index][field] = value;
    setChampions(updatedChampions);
  };

  const addChampionField = () => {
    setChampions([...champions, { time: null, year: "" }]);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let logoDownloadURL = null;
      if (logo) {
        const storageRef = ref(storage, `historic/${logo.name}`);
        const uploadTask = await uploadBytes(storageRef, logo);
        logoDownloadURL = await getDownloadURL(uploadTask.ref);
      }

      const dataToSave = {
        title,
        logo: logoDownloadURL,
        champions: champions.map((champion) => ({
          time: champion.time?.name,
          year: champion.year,
        })),
      };

      await addDoc(collection(db, "historic"), dataToSave);

      toast.success("Histórico de campeões salvo com sucesso!");
      router.push("/newHistoric"); // Altere o caminho conforme necessário
    } catch (error) {
      console.error("Erro ao salvar histórico de campeões: ", error);
      toast.error("Erro ao salvar histórico de campeões.");
    } finally {
      setIsLoading(false);
    }
  };

  function HandleBackButtonClick() {
    window.history.back();
  }

  return isLoading ? (
    <Spinner />
  ) : (
    <>
      <HomeButton />

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Adicionar Histórico de Campeões</h1>
          </div>

          <form>
            <div className={styles.form}>
              <p className={styles.label}>Título do Campeonato</p>
              <input
                className={styles.field}
                type="text"
                value={title}
                onChange={handleTitleChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Logo do Campeonato</p>
              {previewImage && (
                <div className={styles.previewContainer}>
                  <img
                    className={styles.previewImage}
                    src={previewImage}
                    alt="Preview"
                  />
                </div>
              )}
              <PhotoUpload onChange={handleLogoChange} />
            </div>

            {champions.map((champion, index) => (
              <div key={index} className={styles.championFields}>
                <div className={styles.form}>
                  <p className={styles.label}>Time</p>
                  <SearchSelectTeam
                    onSelectItem={(team: Item) =>
                      handleChampionChange(index, "time", team)
                    }
                  />
                </div>

                <div className={styles.form}>
                  <p className={styles.label}>Ano</p>
                  <input
                    className={styles.field}
                    type="text"
                    value={champion.year}
                    onChange={(e) =>
                      handleChampionChange(index, "year", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addChampionField}
              className={styles.newPlayer}
            >
              Adicionar Campeão
            </button>
          </form>

          <button onClick={handleSave} className={styles.save}>
            SALVAR
          </button>
        </div>
        <button className={styles.back} onClick={HandleBackButtonClick}>
          Voltar
        </button>
      </div>
    </>
  );
}
