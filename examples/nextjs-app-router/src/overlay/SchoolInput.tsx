import { useState } from 'react';

interface Props {
  onNext: (school: string) => void;
}

export function SchoolInput({ onNext }: Props) {
  const [school, setSchool] = useState('A');
  return (
    <div>
      <h2>Select Your School</h2>
      <input type="radio" value={'A'} checked={school === 'A'} onChange={(e) => setSchool(e.target.value)} />
      <input type="radio" value={'B'} checked={school === 'B'} onChange={(e) => setSchool(e.target.value)} />
      <input type="radio" value={'C'} checked={school === 'C'} onChange={(e) => setSchool(e.target.value)} />
      <button onClick={() => onNext(school)}>school next</button>
    </div>
  );
}
