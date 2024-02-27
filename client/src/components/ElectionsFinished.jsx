import { useEffect, useState } from "react";
import { initializeProvider } from "../util/contract";
import "./ElectionsFinished.css";

export default () => {
    const [winners, setWinners] = useState([]);

    async function getWinners() {
        const contract = await initializeProvider();
        const winners = await contract.getWinners();
        setWinners(winners);
    }

    useEffect(() => {
        getWinners();
    }, []);

    return (
        <div>
            <h2>The Elections have fininshed and the winner is:</h2>
            {
                winners.map(winner => (
                    <>
                    <div className="list-divider" />
                    <div className="list-content">
                        <div>
                            <div className="title">{winner.title}</div>
                            <div className="address">{winner._address}</div>
                            <div className="party">{winner.party}</div>
                        </div>
                        <div className="list-item-trail">
                            <div className="logo">
                                {winner.logo && <img src={winner.logo} alt='candidate-logo.img' />}
                            </div>
                        </div>
                    </div>
                    </>
                ))
            }
        </div>
    );
};