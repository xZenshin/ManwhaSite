interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
}

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function RatingInput({ value, onChange }: Props) {
  return (
    <div className="rating-input" role="radiogroup" aria-label="Rating out of 10">
      {SCORES.map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={value === score}
          className="rating-pip"
          data-filled={value !== null && score <= value}
          onClick={() => onChange(value === score ? null : score)}
        >
          {score}
        </button>
      ))}
      <button type="button" className="link-button" onClick={() => onChange(null)} disabled={value === null}>
        Clear
      </button>
    </div>
  );
}
