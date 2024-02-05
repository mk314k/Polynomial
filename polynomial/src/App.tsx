import { useState } from 'react'
import './App.css'

function App() {
  const [result, setResult] = useState<number | null>(null);

  const handleAddition = async () => {
    console.log(result);
    const response = await fetch('https://polynomial.onrender.com/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ num1: 5, num2: 3 }), // Change numbers as needed
    });
    const data = await response.json();
    console.log(response);
    setResult(data.result);
  };

  return (
    <div>
      <button onClick={handleAddition}>Add</button>
      {result && <p>Result: {result}</p>}
    </div>
  );
}

export default App;

// function App() {
//   const [maxIndex, setMaxIndex] = useState(0);
//   const [coefficients, setCoefficients] = useState(Array(maxIndex + 1).fill(0));

//   const handleCoefficientChange = (index:number, value:number|string) => {
//     const newCoefficients = [...coefficients];
//     newCoefficients[index] = Number(value);
//     setCoefficients(newCoefficients);
//   };

//   const renderPolynomial = () => {
//     const polynomialTerms = [];

//     for (let i = 0; i <= maxIndex; i++) {
//       polynomialTerms.push(
//         <div key={i}>
//           <input
//             type="number"
//             value={coefficients[i]}
//             onChange={(e) => handleCoefficientChange(i, e.target.value)}
//           />
//           {i === 0 ? '' : `x^${i}`} {i !== maxIndex && '+'}
//         </div>
//       );
//     }

//     return polynomialTerms;
//   };

//   const handleIncreaseMaxIndex = () => {
//     setMaxIndex(maxIndex + 1);
//     setCoefficients([...coefficients, 0]);
//   };

//   return (
//     <div>
//       {renderPolynomial()}
//       <button onClick={handleIncreaseMaxIndex}>+</button>
//     </div>
//   );
// }

// export default App;