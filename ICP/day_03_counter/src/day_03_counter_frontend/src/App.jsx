import { day_03_counter_backend } from '../../declarations/day_03_counter_backend';
import { useEffect, useState } from 'react';

const CounterApp = () => {
    const [counter, setCounter] = useState(0);

    const getCounterValue = async () => {
        const result = Number(await day_03_counter_backend.get_value());
        setCounter(result);
    };

    const increment = async () => {
        await day_03_counter_backend.increment();
        getCounterValue();
    };

    const decrement = async () => {
        await day_03_counter_backend.decrement();
        getCounterValue();
    };

    useEffect(() => {
        getCounterValue();
    }, []);

    return (
        <div>
            <h1>Counter App</h1>
            <p>Value: {counter}</p>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>
        </div>
    );
};

export default CounterApp;
