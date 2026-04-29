import { useCountStore } from "../store/useCountStore";
import './BoxButton.css';

type BoxButtonProps = {
    title: string;
    description: string;
}

export default function BoxButton({ title, description }: BoxButtonProps) {
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