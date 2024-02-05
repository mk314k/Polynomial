import { useState } from 'react'
import './App.css'

function App() {
  const [maxIndex, setMaxIndex] = useState(0);
  const [coefficients, setCoefficients] = useState(Array(maxIndex + 1).fill(0));

  const handleCoefficientChange = (index, value) => {
    const newCoefficients = [...coefficients];
    newCoefficients[index] = Number(value);
    setCoefficients(newCoefficients);
  };

  const renderPolynomial = () => {
    const polynomialTerms = [];

    for (let i = 0; i <= maxIndex; i++) {
      polynomialTerms.push(
        <div key={i}>
          <input
            type="number"
            value={coefficients[i]}
            onChange={(e) => handleCoefficientChange(i, e.target.value)}
          />
          {i === 0 ? '1' : `x^${i}`} {i !== maxIndex && '+'}
        </div>
      );
    }

    return polynomialTerms;
  };

  const handleIncreaseMaxIndex = () => {
    setMaxIndex(maxIndex + 1);
    setCoefficients([...coefficients, 0]);
  };

  return (
    <div>
      {renderPolynomial()}
      <button onClick={handleIncreaseMaxIndex}>+</button>
    </div>
  );
}

export default App;