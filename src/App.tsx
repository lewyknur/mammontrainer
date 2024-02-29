import {useCallback, useEffect, useState} from 'react'
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
            <div id={"logoContainer"}></div>
            <img style={{width: "16rem"}} src={"sigma.png"} alt={"Logo"}/>
            {started ? (<><p>Twój wynik: {points}</p>
                <div style={{height: "1rem", width: `${100 * progressToGameOver}px`, backgroundColor: "red"}}></div>
                <p>Twój LVL: {lvl}</p>
                <p>{numbers?.[0]}{operation?.operationIdentifier}{numbers?.[1]}</p>
                <input value={input} onChange={(event) => {
                    setInput(event.target.value)
                }}></input></>) : <>
                <p>Twój wynik: {points}</p>
                <p>Twój LVL: {lvl}</p>
                <button onClick={startGame}>Start Game
                </button>
            </>}
        </>
    )
}

export default App
