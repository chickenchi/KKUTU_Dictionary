import axios from "axios";
import { getDoumChar } from "../../../components/functions/GetDoumChar";

export const getInitialMaxScore = (prompt: string) => {
    const [word, chain] = prompt.split("iniMS ")[1].split(" ")

    let initialList: string[];

    if (getDoumChar(word) !== "failed") {
        initialList = [word, getDoumChar(word)];
    } else {
        initialList = [word, word];
    }

    if(!word) return "";

    return findWord(initialList, chain ? parseInt(chain) : 1);
};

const findWord = async (initialList: string[], chain: number) => {
    try {
        const response = await axios.post("http://127.0.0.1:5000/initial_max_score", {
            word: initialList,
            chain: chain,
        });
        
        return response.data

    } catch(e) {
        console.log(e);
    }
}