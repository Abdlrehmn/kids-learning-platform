/** Shared right/wrong feedback row with a next or retry action. */
export default function GameFeedback({ feedback, onNext, onRetry, isCorrect }: { feedback: string; onNext: () => void; onRetry: () => void; isCorrect: boolean }) {
  return <div className={`game-feedback ${isCorrect ? "is-right" : "is-wrong"}`} role="status"><span>{feedback}</span>{isCorrect ? <button type="button" className="games-primary" onClick={onNext}>Next round →</button> : <button type="button" className="games-secondary" onClick={onRetry}>Try again</button>}</div>;
}
