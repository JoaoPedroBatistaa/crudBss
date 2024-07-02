import PhotoUpload from "@/components/PhotoUpload";
import SearchSelectTeam from "@/components/SearchSelectTable";
import Spinner from "@/components/Spinner";
import {
  addDoc,
  collection,
  db,
  getDownloadURL,
  ref,
  storage,
} from "@/firebase";
import { uploadBytes } from "firebase/storage";
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

interface YearlyPlacing {
  year: string;
  firstPlace: Item | null;
  secondPlace: Item | null;
  thirdPlace: Item | null;
}

export default function AddHistoricChampion() {
  const [title, setTitle] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [yearlyPlacings, setYearlyPlacings] = useState<YearlyPlacing[]>([
    { year: "", firstPlace: null, secondPlace: null, thirdPlace: null },
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

  const handleYearlyPlacingChange = (
    index: number,
    field: keyof YearlyPlacing,
    value: string | Item | null
  ) => {
    const updatedPlacings = [...yearlyPlacings];
    // @ts-ignore
    updatedPlacings[index][field] = value;
    setYearlyPlacings(updatedPlacings);
  };

  const addYearlyPlacingField = () => {
    setYearlyPlacings([
      ...yearlyPlacings,
      { year: "", firstPlace: null, secondPlace: null, thirdPlace: null },
    ]);
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
        yearlyPlacings: yearlyPlacings.map((placing) => ({
          year: placing.year,
          firstPlace: placing.firstPlace
            ? {
                name: placing.firstPlace.name,
                logo: placing.firstPlace.logo,
              }
            : null,
          secondPlace: placing.secondPlace
            ? {
                name: placing.secondPlace.name,
                logo: placing.secondPlace.logo,
              }
            : null,
          thirdPlace: placing.thirdPlace
            ? {
                name: placing.thirdPlace.name,
                logo: placing.thirdPlace.logo,
              }
            : null,
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

            {yearlyPlacings.map((placing, index) => (
              <div key={index} className={styles.yearlyPlacingFields}>
                <div className={styles.form}>
                  <p className={styles.label}>Ano</p>
                  <input
                    className={styles.field}
                    type="text"
                    value={placing.year}
                    onChange={(e) =>
                      handleYearlyPlacingChange(index, "year", e.target.value)
                    }
                  />
                </div>

                <div className={styles.form}>
                  <h2 className={styles.label}>Primeiro Colocado</h2>
                  <SearchSelectTeam
                    onSelectItem={(team: Item) =>
                      handleYearlyPlacingChange(index, "firstPlace", team)
                    }
                  />
                </div>

                <div className={styles.form}>
                  <h2 className={styles.label}>Segundo Colocado</h2>
                  <SearchSelectTeam
                    onSelectItem={(team: Item) =>
                      handleYearlyPlacingChange(index, "secondPlace", team)
                    }
                  />
                </div>

                <div className={styles.form}>
                  <h2 className={styles.label}>Terceiro Colocado</h2>
                  <SearchSelectTeam
                    onSelectItem={(team: Item) =>
                      handleYearlyPlacingChange(index, "thirdPlace", team)
                    }
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addYearlyPlacingField}
              className={styles.newPlayer}
            >
              Adicionar Ano
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
