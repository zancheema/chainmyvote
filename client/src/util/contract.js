import ChainMyVote from '../contracts/ChainMyVote.json';
import { ethers } from 'ethers';

export async function initializeProvider() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(ChainMyVote.networks[5777].address, ChainMyVote.abi, signer);
}