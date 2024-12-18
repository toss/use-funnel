import { ReactNode, useState } from 'react';

export const StartDate = ({ startDate, onNext }: { startDate?: string; onNext: (startDate: string) => void }) => {
  const [date, setDate] = useState(startDate ?? '');

  return (
    <div>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={() => onNext(date)}>overlay next</button>
    </div>
  );
};
