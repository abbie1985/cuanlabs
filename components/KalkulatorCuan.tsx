
import React, { useState, useEffect, useCallback } from 'react';

interface KalkulatorInput {
  initialInvestment: string;
  monthlyInvestment: string;
  annualRoiPercent: string;
  durationYears: string;
}

interface KalkulatorOutput {
  totalInvested: number;
  totalProfit: number;
  finalValue: number;
}

const KalkulatorCuan: React.FC<{ isExclusive?: boolean }> = ({ isExclusive = false }) => {
  const [input, setInput] = useState<KalkulatorInput>({
    initialInvestment: '1000000',
    monthlyInvestment: '500000',
    annualRoiPercent: '10',
    durationYears: '5',
  });
  const [output, setOutput] = useState<KalkulatorOutput | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow only numbers and a single decimal point for ROI
    const isValid = name === 'annualRoiPercent' ? /^\d*\.?\d*$/.test(value) : /^\d*$/.test(value);
    if (isValid) {
      setInput(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateCuan = useCallback(() => {
    const initial = parseFloat(input.initialInvestment);
    const monthly = parseFloat(input.monthlyInvestment);
    const roi = parseFloat(input.annualRoiPercent) / 100;
    const years = parseInt(input.durationYears, 10);

    if (isNaN(initial) || isNaN(monthly) || isNaN(roi) || isNaN(years)) {
      setError('Semua input harus diisi dengan angka yang valid.');
      setOutput(null);
      return;
    }
    if (initial < 0 || monthly < 0 || roi < 0 || years <= 0) {
      setError('Input tidak boleh negatif dan durasi harus lebih dari 0 tahun.');
      setOutput(null);
      return;
    }
    setError('');

    const monthlyRoi = roi / 12;
    const numMonths = years * 12;

    let futureValue = initial;
    for (let i = 0; i < numMonths; i++) {
      if (i > 0 || initial === 0) { // Don't add monthly for the first month if initial already covers it. Or if no initial.
         futureValue += monthly;
      } else if ( i === 0 && initial > 0 && monthly > 0) { // If initial exists, first month's contrib is added before compounding
         futureValue += monthly; 
      }
      futureValue *= (1 + monthlyRoi);
    }
    
    // Simpler calculation: sum of FV of initial investment and FV of series of monthly investments
    let fvInitial = initial * Math.pow(1 + monthlyRoi, numMonths);
    let fvMonthly = 0;
    if (monthlyRoi > 0) {
        fvMonthly = monthly * ((Math.pow(1 + monthlyRoi, numMonths) - 1) / monthlyRoi);
    } else { // Handle 0% ROI case for monthly contributions
        fvMonthly = monthly * numMonths;
    }
    const finalVal = fvInitial + fvMonthly;


    const totalInvested = initial + (monthly * numMonths);
    const totalProfit = finalVal - totalInvested;

    setOutput({
      totalInvested: Math.round(totalInvested),
      totalProfit: Math.round(totalProfit),
      finalValue: Math.round(finalVal),
    });
  }, [input]);

  useEffect(() => {
    calculateCuan();
  }, [calculateCuan]);
  
  const formatCurrency = (value: number) => {
    return `Rp${value.toLocaleString('id-ID')}`;
  };

  return (
    <div className={`p-6 md:p-8 rounded-xl shadow-2xl ${isExclusive ? 'bg-gradient-to-br from-primary-dark to-primary' : 'bg-white'}`}>
      <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-center ${isExclusive ? 'text-white' : 'text-primary'}`}>
        {isExclusive ? 'Kalkulator Cuan Eksklusif Member' : 'Kalkulator Cuan Interaktif'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="initialInvestment" className={`block text-sm font-medium mb-1 ${isExclusive ? 'text-sky-100' : 'text-gray-700'}`}>Modal Awal (Rp)</label>
          <input type="text" name="initialInvestment" id="initialInvestment" value={input.initialInvestment} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label htmlFor="monthlyInvestment" className={`block text-sm font-medium mb-1 ${isExclusive ? 'text-sky-100' : 'text-gray-700'}`}>Investasi Bulanan (Rp)</label>
          <input type="text" name="monthlyInvestment" id="monthlyInvestment" value={input.monthlyInvestment} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label htmlFor="annualRoiPercent" className={`block text-sm font-medium mb-1 ${isExclusive ? 'text-sky-100' : 'text-gray-700'}`}>Estimasi ROI Tahunan (%)</label>
          <input type="text" name="annualRoiPercent" id="annualRoiPercent" value={input.annualRoiPercent} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label htmlFor="durationYears" className={`block text-sm font-medium mb-1 ${isExclusive ? 'text-sky-100' : 'text-gray-700'}`}>Durasi Investasi (Tahun)</label>
          <input type="text" name="durationYears" id="durationYears" value={input.durationYears} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
        </div>
      </div>

      {error && <p className="text-red-500 text-center mb-4 bg-red-100 p-3 rounded-lg">{error}</p>}

      {output && !error && (
        <div className={`mt-8 p-6 rounded-lg ${isExclusive ? 'bg-primary-dark/50' : 'bg-sky-50'}`}>
          <h3 className={`text-xl font-semibold mb-4 text-center ${isExclusive ? 'text-white' : 'text-primary'}`}>Hasil Perhitungan:</h3>
          <div className="space-y-3">
            <div className={`flex justify-between p-3 rounded-md ${isExclusive ? 'bg-sky-700 text-white' : 'bg-gray-100'}`}>
              <span className="font-medium">Total Modal Diinvestasikan:</span>
              <span className="font-bold">{formatCurrency(output.totalInvested)}</span>
            </div>
            <div className={`flex justify-between p-3 rounded-md ${isExclusive ? 'bg-sky-700 text-white' : 'bg-green-100 text-green-700'}`}>
              <span className="font-medium">Total Keuntungan Estimasi:</span>
              <span className="font-bold text-accent">{formatCurrency(output.totalProfit)}</span>
            </div>
            <div className={`flex justify-between p-3 rounded-md text-lg ${isExclusive ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
              <span className="font-semibold">Nilai Akhir Investasi Estimasi:</span>
              <span className="font-bold">{formatCurrency(output.finalValue)}</span>
            </div>
          </div>
        </div>
      )}
      {isExclusive && <p className="text-sm text-sky-200 mt-4 text-center">Nikmati fitur kalkulator lebih canggih sebagai member Premium!</p>}
    </div>
  );
};

export default KalkulatorCuan;
