import { useCountStore } from 'repo1/useCountStore';
import './BoxButton2.css';

type BoxButton2Props = {
    title: string;
    description: string;
}

export default function BoxButton2({ title, description }: BoxButton2Props) {
    const { count, increment, decrement } = useCountStore();

    return (
        <div className="box-button">
            <h3
                className="text-title"
            >{title}</h3>
            <p
                className="text-description"
            >{description}</p>
            <button
            
                type="button"
                className="counter"
                onClick={increment}>Increment</button>
            <button
                type="button"
                className="counter"
                onClick={decrement}>Decrement</button>
            <p
                className="text-count"
            >Count: {count}</p>
        </div>
    )
}