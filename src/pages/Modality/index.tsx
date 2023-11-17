import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import styles from "./styles.module.css";

async function getCollectionData(sport: string) {
  console.log("Iniciando getCollectionData com sport: ", sport); // Log para verificar o valor de sport

  const collectionRef = collection(db, "modalities");
  const sportRef = await getSportReference(sport);

  if (!sportRef) {
    toast.success("Esporte não encontrado!");
    return;
  }

  console.log("sportRef-- buscar modalidades: ", sportRef); // Log para verificar sportRef

  const q = query(collection(db, "modalities"), where("sport", "==", sportRef));
  const querySnapshot = await getDocs(q);

  const documents = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const jsonSerializableData = JSON.parse(JSON.stringify(data));
    return {
      id: doc.id,
      ...jsonSerializableData,
    };
  });

  console.log("Documentos retornados pela query: ", documents); // Log para verificar os documentos retornados

  return documents;
}

async function getSportReference(sportId: string) {
  console.log("Iniciando getSportReference com sportId: ", sportId); // Log para verificar o sportId

  const sportsCollection = "sports";
  const sportRef = doc(db, sportsCollection, sportId);
  const sportDoc = await getDoc(sportRef);

  if (sportDoc.exists()) {
    console.log(
      "Sucesso ao buscar esportes - Documento encontrado: ",
      sportDoc.data()
    ); // Log para confirmar que o documento foi encontrado
    return sportRef;
  } else {
    console.log("Esporte não encontrado para o ID: ", sportId); // Log para indicar que o documento não foi encontrado
    toast.error("Esporte não encontrado!");
    return null;
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const { sport } = query;

  let sportString: string = "";
  if (typeof sport === "string") {
    sportString = sport;
  } else if (Array.isArray(sport)) {
    sportString = sport.join(",");
  }

  // Use o parâmetro de query para buscar os dados
  const data = await getCollectionData(sportString);

  return {
    props: {
      data,
    },
  };
}

interface Modality {
  id: string;
  name: string;
  gender: string;
}

export default function Modality({ data }: { data: [Modality] }) {
  const router = useRouter();
  const { query } = router;

  function HandleBackButtonClick() {
    window.history.back();
  }

  return (
    <>
      <div className={styles.Container}>
        <div className={styles.Card}>
          <h1 className={styles.title}>Modalidades</h1>

          {data.map((item) => (
            <Link
              href={{ pathname: "/Categories", query: { mdl: item.id } }}
              key={item.id}
            >
              <div className={styles.modality}>
                <img
                  className={styles.modalityIcon}
                  src={
                    item.gender == "Masculino"
                      ? "./assets/masc.png"
                      : "./assets/fem.png"
                  }
                  alt=""
                />

                <h1 className={styles.modalityName}>{item.name}</h1>
              </div>
            </Link>
          ))}
        </div>

        <button className={styles.back} onClick={HandleBackButtonClick}>
          Voltar
        </button>
      </div>
    </>
  );
}
