const defaultData = {
  fid: "1234",
  text: "CIA", 
  url: "https://cia.gov", 
  comments: "The Agency."
},
storeName = "dps5393-hw3-data";

const readLocalStorage = () => {
  let allValues = null;
  try{
    allValues = JSON.parse(localStorage.getItem(storeName)) || defaultData;
  }catch(err){
    console.log(`Problem with JSON.parse() and ${storeName} !`);
    throw err;
  }
  return allValues;
};

const writeLocalStorage = (allValues) => {
  localStorage.setItem(storeName, JSON.stringify(allValues));
};

//  PUBLIC
export const clearLocalStorage = () => writeLocalStorage(defaultData);

export const getFavorites = () => readLocalStorage().favorites;

export const setFavorites = (favoritesArray) => {
  const allValues = readLocalStorage();
  allValues.favorites = favoritesArray;
  writeLocalStorage(allValues);
};

export const clearFavorites = () => {
  const allValues = readLocalStorage();
  allValues.favorites = [];
  writeLocalStorage(allValues);
};
