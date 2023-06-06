import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import styles from './SearchSelect.module.css';
import { db } from '@/firebase';

interface Item {
  id: string;
  name: string;
  logo: string;
}

interface SearchSelectProps {
  onSelectItem: (item: Item) => void;
}

const SearchSelectTeam = ({ onSelectItem }: SearchSelectProps) => {
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [placeholder, setPlaceholder] = useState('Pesquisar');

  const searchSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (searchSelectRef.current && !searchSelectRef.current.contains(event.target as Node)) {
      setSearchText('');
    }
  };

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchText(value);

    const playersCollection = collection(db, 'teams');

    const q =
      value.length === 0
        ? query(playersCollection)
        : query(playersCollection, where('name', '>=', value), where('name', '<=', value + '\uf8ff'));

    const querySnapshot = await getDocs(q);
    const results: Item[] = [];

    querySnapshot.forEach((doc) => {
      const item = {
        id: doc.id,
        name: doc.data().name,
        logo: doc.data().logo,
      };
      results.push(item);
    });

    setSearchResults(results);
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setSearchText('');
    onSelectItem(item);
  };

  const isItemSelected = (item: Item) => {
    return selectedItem && selectedItem.id === item.id;
  };

  const getSelectedItemsText = () => {
    return selectedItem ? selectedItem.name : '';
  };

  const handleReset = () => {
    setSelectedItem(null);
  };

  return (
    <div className={styles.searchSelect} ref={searchSelectRef}>
      <input
        className={styles.field}
        type="text"
        placeholder={selectedItem ? getSelectedItemsText() : 'Pesquisar'}
        value={searchText}
        onChange={handleSearch}
      />
      {searchResults.length > 0 && searchText.length > 0 ? (
        <ul className={styles.resultsList}>
          {searchResults.map((item) => (
            <li
              key={item.id}
              className={`${styles.resultItem} ${
                isItemSelected(item) ? styles.resultItemSelected : ''
              }`}
              onClick={() => handleSelectItem(item)}
            >
              <span className={styles.resultItemText}>
                <img src={item.logo} alt="" className={styles.avatarListResult} />
                {item.name}
              </span>
              {isItemSelected(item) ? (
                <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />
              ) : (
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`${styles.checkIcon} ${styles.emptyCheckIcon}`}
                />
              )}
            </li>
          ))}
        </ul>
          ) : searchResults.length === 0 && searchText.length > 0 ? (
          <p className={styles.noResultsText}>Nenhum resultado encontrado.</p>
          ) : null}
            {selectedItem && (
            <button className={styles.resetButton} onClick={handleReset}>
              Limpar
            </button>
          )}
        </div>
);
};

export default SearchSelectTeam;