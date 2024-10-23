import axios from "axios";

export const setWord = (prompt: string) => {
    const word = prompt.split("wordSet ")[1];

    if(!word)
        return "";

    return findWord(word);
};

const findWord = async (word: string) => {
    try {
        const response = await axios.post("http://127.0.0.1:5000/precise_word", {
            word: word,
        });
        
        return response.data

    } catch(e) {
        console.log(e);
    }
}