import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import styles from './SearchSelect.module.css';

interface Item {
  id: string;
  name: string;
  photo: string;
}

interface SearchSelectProps {
  onSelectItems: (items: Item[]) => void;
}

const SearchSelect = ({ onSelectItems }: SearchSelectProps) => {
  const [searchText, setSearchText] = useState('');
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
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

    const db = getFirestore();
    const playersCollection = collection(db, 'players');
    const q = query(playersCollection, where('name', '>=', value), where('name', '<=', value + '\uf8ff'));

    const querySnapshot = await getDocs(q);
    const results: Item[] = [];

    querySnapshot.forEach((doc) => {
      const item = {
        id: doc.id,
        name: doc.data().name,
        photo: doc.data().photo
      };
      results.push(item);
    });

    setSearchResults(results);
  };

  const handleToggleItem = (item: Item) => {
    const isSelected = selectedItems.some((selected) => selected.id === item.id);
    let updatedItems: Item[];

    if (isSelected) {
      updatedItems = selectedItems.filter((selected) => selected.id !== item.id);
    } else {
      updatedItems = [...selectedItems, item];
    }

    setSelectedItems(updatedItems);
    onSelectItems(updatedItems);
  };

  const isItemSelected = (item: Item) => {
    return selectedItems.some((selected) => selected.id === item.id);
  };

  const getSelectedItemsText = () => {
    return selectedItems.map((item) => item.name).join(', ');
  };

  const handleReset = () => {
    setSearchText('');
    setPlaceholder('Pesquisar');
  };

  return (
    <div className={styles.searchSelect} ref={searchSelectRef}>
      <input
        className={styles.field}
        type="text"
        placeholder={selectedItems.length > 0 ? getSelectedItemsText() : 'Pesquisar'}
        value={searchText}
        onChange={handleSearch}
      />
      {searchResults.length > 0 && searchText.length > 0 && (
        <ul className={styles.resultsList}>
          {searchResults.map((item) => (
            <li
              key={item.id}
              className={`${styles.resultItem} ${
                isItemSelected(item) ? styles.resultItemSelected : ''
              }`}
              onClick={() => handleToggleItem(item)}>
              <span className={styles.resultItemText}>
            <img src={item.photo} alt="" className={styles.avatarListResult} />
            {item.name}
          </span>
          {isItemSelected(item) ? (
            <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />
          ) : (
            <FontAwesomeIcon icon={faCheck} className={`${styles.checkIcon} ${styles.emptyCheckIcon}`} />
          )}

        </li>
      ))}
    </ul>
  )}

  {/* {selectedItems.length > 0 && (
    <button className={styles.resetButton} onClick={handleReset}>
      Limpar
    </button>
  )} */}
</div>
);
};

export default SearchSelect;

