export const saveToLocalStorage = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch(e) {
        console.error("Error saving to local storage:", e);
    }
};
  
export const getFromLocalStorage = async (key: string) => {
    const storedValue = await localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null;
};

export const removeFromLocalStorage = async (key: string) => {
    await localStorage.removeItem(key);
};

export const clearLocalStorage = async () => {
    await localStorage.clear();
};