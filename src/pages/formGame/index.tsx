import SearchSelectChampionship from "@/components/SearchSelectChampionship";
import SearchSelectTeam from "@/components/SearchSelectTeam";
import Spinner from "@/components/Spinner";
import { db, storage } from "@/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
}

interface Item {
  id: string;
  name: string;
  logo: string;
}

export default function FormNewMatche({ data }: { data: Modality }) {
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTeam1Score, setSelectedTeam1Score] = useState("");
  const [selectedTeam2Score, setSelectedTeam2Score] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [selectedFase, setSelectedFase] = useState("");
  const [selectedTeamOne, setSelectedTeamOne] = useState<Item | null>(null);
  const [selectedTeamTwo, setSelectedTeamTwo] = useState<Item | null>(null);
  const [selectedChampionship, setSelectedChampionship] = useState<Item | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [selectedTopScorer, setSelectedTopScorer] = useState("");
  const [selectedThreePointKing, setSelectedThreePointKing] = useState("");
  const [selectedMVP, setSelectedMVP] = useState("");

  const [isVolleyball, setIsVolleyball] = useState(false);
  const [setScores, setSetScores] = useState({ set1: "", set2: "", set3: "" });

  const [isUndefinedMatch, setIsUndefinedMatch] = useState("não"); // Campo para "Partida Indefinida"
  const [nextTeam1, setNextTeam1] = useState("");
  const [nextTeam2, setNextTeam2] = useState("");

  async function handleSubmit() {
    try {
      setIsLoading(true);
      const matcheRef = collection(db, "matches");

      const modalityRef = doc(db, "modalities", data.id);
      const championshipRef = doc(
        db,
        "championships",
        selectedChampionship?.id || ""
      );

      const newMatche = {
        championship: championshipRef,
        date: selectedDate,
        modality: modalityRef,
        venue: selectedVenue,
        time: selectedTime,
        topScorer: selectedTopScorer,
        mvp: selectedMVP,
        fase: selectedFase,
        isVolleyball,
        isUndefinedMatch,
        setScores: isVolleyball ? setScores : null,
      };

      if (isUndefinedMatch === "sim") {
        // @ts-ignore
        newMatche["next_team_1"] = nextTeam1;
        // @ts-ignore
        newMatche["next_team_2"] = nextTeam2;
      } else {
        const teamOneRef = doc(db, "teams", selectedTeamOne?.id || "");
        const teamTwoRef = doc(db, "teams", selectedTeamTwo?.id || "");
        // @ts-ignore
        newMatche["team_1"] = {
          score: selectedTeam1Score || "",
          team_id: teamOneRef,
        };
        // @ts-ignore
        newMatche["team_2"] = {
          score: selectedTeam2Score || "",
          team_id: teamTwoRef,
        };
      }

      const docRef = await addDoc(matcheRef, {
        ...newMatche,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (selectedFile) {
        const storageRef = ref(
          storage,
          `matches/${docRef.id}/${selectedFile.name}`
        );
        await uploadBytes(storageRef, selectedFile);
        const downloadURL = await getDownloadURL(storageRef);
        await setDoc(docRef, { fileURL: downloadURL }, { merge: true });
      }

      setIsLoading(false);
      setSelectedTime("");
      setSelectedDate("");
      setSelectedVenue("");
      setSelectedFase("");
      setSelectedTeamOne(null);
      setSelectedTeamTwo(null);
      setSelectedChampionship(null);
      setSelectedFile(null);
      setSelectedFileName("");
      setIsVolleyball(false);
      setSetScores({ set1: "", set2: "", set3: "" });
      setIsUndefinedMatch("não");
      setNextTeam1("");
      setNextTeam2("");
      toast.success("Jogo cadastrado com sucesso!");
      router.push("newGame?mdl=" + data.id);
      console.log("Novo jogo salvo com sucesso no Firestore!");
    } catch (error) {
      setIsLoading(false);
      toast.error("Erro ao cadastrar jogo!");
      console.error("Erro ao salvar o novo jogo:", error);
    }
  }

  const handleSelectTeamOne = (item: Item) => {
    setSelectedTeamOne(item);
  };

  const handleSelectTeamTwo = (item: Item) => {
    setSelectedTeamTwo(item);
  };

  const handleSelectChampionship = (item: Item) => {
    setSelectedChampionship(item);
  };

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setSelectedFileName(file?.name || "");
  }

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
            <h1 className={styles.title}>Jogos</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO JOGO</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Campeonato:</p>
            <SearchSelectChampionship onSelectItem={handleSelectChampionship} />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Partida Indefinida?</p>
            <select
              className={styles.field}
              value={isUndefinedMatch}
              onChange={(e) => setIsUndefinedMatch(e.target.value)}
            >
              <option value="não">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>

          {isUndefinedMatch === "sim" ? (
            <>
              <div className={styles.form}>
                <p className={styles.label}>Próximo Time 1</p>
                <input
                  className={styles.field}
                  type="text"
                  value={nextTeam1}
                  onChange={(e) => setNextTeam1(e.target.value)}
                />
              </div>
              <div className={styles.form}>
                <p className={styles.label}>Próximo Time 2</p>
                <input
                  className={styles.field}
                  type="text"
                  value={nextTeam2}
                  onChange={(e) => setNextTeam2(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.form}>
                <p className={styles.label}>Time 1:</p>
                <SearchSelectTeam onSelectItem={handleSelectTeamOne} />
              </div>
              <div className={styles.form}>
                <p className={styles.label}>Time 2:</p>
                <SearchSelectTeam onSelectItem={handleSelectTeamTwo} />
              </div>
            </>
          )}

          <div className={styles.form}>
            <p className={styles.label}>Cestinha</p>
            <input
              className={styles.field}
              type="text"
              value={selectedTopScorer}
              onChange={(e) => setSelectedTopScorer(e.target.value)}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Destaque da partida</p>
            <input
              className={styles.field}
              type="text"
              value={selectedMVP}
              onChange={(e) => setSelectedMVP(e.target.value)}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Data do Jogo</p>
            <input
              className={styles.field}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Horário do Jogo</p>
            <input
              className={styles.field}
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Local do Jogo</p>
            <input
              className={styles.field}
              type="text"
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Fase do Jogo</p>
            <input
              className={styles.field}
              type="text"
              value={selectedFase}
              onChange={(e) => setSelectedFase(e.target.value)}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Pontuação Time 1</p>
            <input
              className={styles.field}
              type="number"
              value={selectedTeam1Score.toString()}
              onChange={(e) => setSelectedTeam1Score(e.target.value)}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Pontuação Time 2</p>
            <input
              className={styles.field}
              type="number"
              value={selectedTeam2Score.toString()}
              onChange={(e) => setSelectedTeam2Score(e.target.value)}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Sets de Vôlei?</p>
            <select
              className={styles.field}
              value={isVolleyball ? "sim" : "não"}
              onChange={(e) => setIsVolleyball(e.target.value === "sim")}
            >
              <option value="não">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>

          {isVolleyball && (
            <>
              <div className={styles.form}>
                <p className={styles.label}>Placar Set 1</p>
                <input
                  className={styles.field}
                  type="text"
                  value={setScores.set1}
                  onChange={(e) =>
                    setSetScores({ ...setScores, set1: e.target.value })
                  }
                />
              </div>
              <div className={styles.form}>
                <p className={styles.label}>Placar Set 2</p>
                <input
                  className={styles.field}
                  type="text"
                  value={setScores.set2}
                  onChange={(e) =>
                    setSetScores({ ...setScores, set2: e.target.value })
                  }
                />
              </div>
              <div className={styles.form}>
                <p className={styles.label}>Placar Set 3</p>
                <input
                  className={styles.field}
                  type="text"
                  value={setScores.set3}
                  onChange={(e) =>
                    setSetScores({ ...setScores, set3: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <div className={styles.form}>
            <p className={styles.label}>PDF do Jogo</p>
            <input
              className={styles.fieldFile}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <button
          className={styles.save}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          SALVAR
        </button>
        <button className={styles.back} onClick={HandleBackButtonClick}>
          Voltar
        </button>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const { mdl } = query;
  console.log(mdl);

  return {
    props: {
      data: { id: mdl },
    },
  };
}
