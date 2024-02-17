import { useState } from 'react'
import './App.css'

function App() {
  const [maxIndex, setMaxIndex] = useState(0);
  const [coefficients, setCoefficients] = useState(Array(maxIndex + 1).fill(0));

  const handleCoefficientChange = (index:number, value:number|string) => {
    const newCoefficients = [...coefficients];
    newCoefficients[index] = Number(value);
    setCoefficients(newCoefficients);
  };

  const handleFactorise = async () => {
    try {
      const response = await fetch('https://polynomial.onrender.com/factorise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ poly:`${coefficients}` }), 
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const factor_root = document.getElementById("factor-root") as HTMLDivElement;
      factor_root.innerHTML = data;
    } catch (error) {
      console.error('There was a problem with your fetch operation:', error);
    }
  }

  const renderPolynomial = () => {
    const polynomialTerms = [];
  
    for (let i = 0; i <= maxIndex; i++) {
      polynomialTerms.push(
        <div key={i}>
          <input
            className='poly-coeff'
            type="number"
            value={coefficients[i]}
            onChange={(e) => handleCoefficientChange(i, e.target.value)}
          />
          {i === 0 ? '' : i===1 ? (
            <span dangerouslySetInnerHTML={{ __html: `x` }} />
          ):(
            <span dangerouslySetInnerHTML={{ __html: `x<sup>${i}</sup>` }} />
          )}
          {i !== maxIndex && '+'}
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
    <div className='flex-vertical'>
      <div className='title'>Factorize Your Polynomial</div>
      <div className='flex-horizontal'>
        {renderPolynomial()}
        <button onClick={handleIncreaseMaxIndex}>+</button>
        <button onClick={handleFactorise}>Factorise</button>
        <div id='factor-root'></div>
      </div>
    </div>
  );
}

export default App;