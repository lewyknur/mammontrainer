import {useCallback, useEffect, useRef, useState} from 'react'
import './App.css'

const LVL = 1;

type Operation = {
    operationIdentifier: string,
    operationVerifier: (a: number, b: number) => number,
    operationGenerator: (level: number) => [number, number]
}

function App() {

    const operations: Operation[] = [
        {
            operationIdentifier: "+",
            operationVerifier: (a: number, b: number) => a + b,
            operationGenerator: (level: number) => [Math.floor(Math.random() * 10 * level), Math.floor(Math.random() * 10 * level)]
        },
        {
            operationIdentifier: "-",
            operationVerifier: (a: number, b: number) => a - b,
            operationGenerator: (level: number) => {
                const a = Math.floor(Math.random() * 10 * level),
                    b = Math.floor(Math.random() * 10 * level);
                return [a, b].sort((a, b) => b - a) as [number, number]
            }
        },
        {
            operationIdentifier: "*",
            operationVerifier: (a: number, b: number) => a * b,
            operationGenerator: (level: number) => [Math.floor(Math.random() * 10 * level), Math.floor(Math.random() * 10 * level)]
        },
        {
            operationIdentifier: "/",
            operationVerifier: (a: number, b: number) => a / b,
            operationGenerator: (level: number) => {
                const b = Math.floor(Math.random() * 10 * level) + 1,
                    a = b * Math.floor(Math.random() * 10);
                return [a, b]
            }
        }
    ];
    const genOperation = () => {
        return operations[Math.floor(Math.random() * operations.length)]
    }
    const [operation, setOperation] = useState<null | Operation>(null);
    const [numbers, setNumbers] = useState<null | [number, number]>(null)
    const [input, setInput] = useState("")
    const [started, setStarted] = useState(false)
    const [points, setPoints] = useState(0);
    const [lvl, setLvL] = useState(LVL);
    const [gameOverAt, setGameOverAt] = useState(-1);
    const [progressToGameOver, setProgressToGameOver] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [failCounter, setFailCounter] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const hs = parseInt(localStorage.getItem("highscore") ?? "0");
        const fails =  parseInt(localStorage.getItem("fails") ?? "0");

        if(hs !== 0)
            setHighScore(hs);
        if(fails !== 0)
        setFailCounter(fails);

        const keypress = () => {
            if(inputRef.current)
            {
                inputRef.current.focus();
            }
        }

        window.addEventListener("keypress", keypress);

        return () => {
            window.removeEventListener("keypress", keypress);
        }
    }, []);
    const reset = () => {
        const operation = genOperation();
        const numbers = operation.operationGenerator(lvl);
        setGameOverAt(new Date().getTime() + 5000);
        setOperation(operation);
        setNumbers(numbers);
    }
    const checkGameOver = useCallback(() => {
        if (started && gameOverAt !== -1) {
            if (new Date().getTime() >= gameOverAt) {
                setStarted(false);
                const storedPoints = localStorage.getItem("highscore") ?? "0";
                if(parseInt(storedPoints) < points)
                {
                    localStorage.setItem("highscore", points.toString());
                    setHighScore(points);
                    setFailCounter((fc) => {
                        const r = fc + 1;
                        localStorage.setItem("fails", r.toString());
                        return r;
                    } )
                }
            } else {
                setProgressToGameOver((gameOverAt - new Date().getTime()) / 5000);
            }
        }
    }, [started, gameOverAt]);
    const startGame = () => {
        setStarted(true);
        reset();
        setPoints(0);
    }
    useEffect(() => {
        if (!operation || !numbers) return

        if (parseInt(input) === operation.operationVerifier(numbers[0], numbers[1])) {
            setPoints((v) => v + 1)
            reset()
            setInput("")
        }
    }, [input]);

    useEffect(() => {
        if (points % 10 === 0 && points > 0) setLvL((v) => v + 1)
    }, [points]);

    useEffect(() => {
        reset();
        const i = setInterval(checkGameOver, 100);
        return () => {
            clearInterval(i)
        };
    }, [checkGameOver]);

    return (
        <>
            <div id={"logoContainer"}>
                <img style={{width: "16rem"}} src={"sigma.png"} alt={"Logo"}/>
            </div>
            <div id={"gameContainer"}>
                {started ? (<><p>Twój wynik: {points}</p>
                    <div style={{height: "1rem", width: `${100 * progressToGameOver}px`, backgroundColor: "red"}}></div>
                    <p>Twój LVL: {lvl}</p>
                    <p>{numbers?.[0]}{operation?.operationIdentifier}{numbers?.[1]}</p>
                    <input ref={inputRef} value={input} onChange={(event) => {
                        setInput(event.target.value)
                    }}></input></>) : <>
                    <h2>POWSTRZYMAJ DONOS</h2>
                    <h3>ROZWIĄZUJ OPERACJE MATEMATYCZNE ABY COFNĄC MIESZKAŃCA PŁOCKA OD KOMENDY</h3>
                    <p>Statystyki</p>
                    <p>Ocalone donosy: {points} (HIGH SCORE: {highScore})</p>
                    <p>Zjedzone makowce: {failCounter}</p>
                    <button onClick={startGame}>JAZDA!</button>
                </>}
            </div>
        </>
    )
}

export default App
