
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import {
  CalculatorMode,
  HargaJualInputs, HargaJualOutputs,
  OmsetLabaInputs, OmsetLabaOutputs,
  BEPInputs, BEPOutputs,
  KomisiInputs, KomisiOutputs,
  DiskonInputs, DiskonOutputs
} from '../types'; // Assuming types are defined here or in a relevant types file

const initialHargaJualInputs: HargaJualInputs = {
  modalBeliProduk: '100000',
  biayaAdminMarketplacePersen: '5',
  biayaIklanPersenDariHJ: '10',
  biayaPackingRp: '2000',
  ongkirDitanggungPenjualRp: '0',
  komisiResellerPersenDariHJ: '0',
  marginKeuntunganPersenDariHJ: '30',
};

const initialOmsetLabaInputs: OmsetLabaInputs = {
  targetPenjualanUnit: '100',
  hargaJualPerUnit: '150000',
  modalPerUnit: '80000',
  biayaAdminMarketplacePersen: '5',
  totalBiayaIklanRp: '500000',
  biayaPackingPerUnitRp: '2000',
};

const initialBEPInputs: BEPInputs = {
  totalBiayaTetapRp: '5000000',
  hargaJualPerUnit: '150000',
  modalPerUnit: '80000',
  biayaVariabelLainPersenDariHJ: '5', // e.g. marketplace fee
  biayaVariabelLainPerUnitRp: '2000', // e.g. packing
};

const initialKomisiInputs: KomisiInputs = {
  hargaModalProdukSupplier: '70000',
  hargaJualKeKonsumen: '150000',
  komisiDropshipperPersenDariProfitSeller: '20',
};

const initialDiskonInputs: DiskonInputs = {
  hargaJualNormal: '150000',
  modalPerUnit: '80000',
  biayaVariabelLainPersenDariHJ: '5', // e.g. admin fee from selling price
  persentaseDiskon: '10',
};


const KalkulatorCuan: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CalculatorMode>('hargaJual');
  const [copiedLink, setCopiedLink] = useState(false);

  // States for each calculator mode
  const [hargaJualInputs, setHargaJualInputs] = useState<HargaJualInputs>(initialHargaJualInputs);
  const [hargaJualOutputs, setHargaJualOutputs] = useState<HargaJualOutputs | null>(null);

  const [omsetLabaInputs, setOmsetLabaInputs] = useState<OmsetLabaInputs>(initialOmsetLabaInputs);
  const [omsetLabaOutputs, setOmsetLabaOutputs] = useState<OmsetLabaOutputs | null>(null);

  const [bepInputs, setBepInputs] = useState<BEPInputs>(initialBEPInputs);
  const [bepOutputs, setBepOutputs] = useState<BEPOutputs | null>(null);

  const [komisiInputs, setKomisiInputs] = useState<KomisiInputs>(initialKomisiInputs);
  const [komisiOutputs, setKomisiOutputs] = useState<KomisiOutputs | null>(null);

  const [diskonInputs, setDiskonInputs] = useState<DiskonInputs>(initialDiskonInputs);
  const [diskonOutputs, setDiskonOutputs] = useState<DiskonOutputs | null>(null);
  
  const parseNumericInput = (value: string, allowDecimal: boolean = false): number => {
    if (!value) return 0;
    const cleanedValue = allowDecimal ? value.replace(/[^0-9.]/g, '') : value.replace(/[^0-9]/g, '');
    const number = parseFloat(cleanedValue);
    return isNaN(number) ? 0 : number;
  };

  const handleInputChange = (mode: CalculatorMode, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const allowDecimal = name.includes('Persen') || name.includes('annualRoi'); // Example, adjust as needed

    const updateState = (setter: React.Dispatch<React.SetStateAction<any>>, prevInputs: any) => {
      // Basic validation for numeric fields: allow only numbers and optionally one decimal point
      const isNumericField = !['targetAudience', 'writingStyle', 'topic'].includes(name) && // Exclude text fields
                             (e.target.type === 'number' || e.target.type === 'text' && !isNaN(parseNumericInput(value, allowDecimal)));
      
      let processedValue = value;
      if (isNumericField) {
        // Regex to allow numbers, and a single decimal point if allowDecimal is true
        const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
        if (!regex.test(value)) {
            // If invalid, try to keep the valid part or revert. For simplicity, just don't update if totally invalid.
            // Or, keep the previous valid numeric string. Here, we'll allow it to be set and calculations will handle NaN.
            // A better way is to parse and format it back, or prevent invalid chars.
            // For now, let calculations handle NaN/0 from parseNumericInput.
        }
      }
      setter({ ...prevInputs, [name]: processedValue });
    };


    switch (mode) {
      case 'hargaJual':
        updateState(setHargaJualInputs, hargaJualInputs);
        break;
      case 'omsetLaba':
        updateState(setOmsetLabaInputs, omsetLabaInputs);
        break;
      case 'bep':
        updateState(setBepInputs, bepInputs);
        break;
      case 'komisi':
        updateState(setKomisiInputs, komisiInputs);
        break;
      case 'diskon':
        updateState(setDiskonInputs, diskonInputs);
        break;
    }
  };
  
  // --- Calculation Logic ---
  const calculateHargaJual = useCallback(() => {
    const modal = parseNumericInput(hargaJualInputs.modalBeliProduk);
    const adminFeePercent = parseNumericInput(hargaJualInputs.biayaAdminMarketplacePersen, true) / 100;
    const adCostPercent = parseNumericInput(hargaJualInputs.biayaIklanPersenDariHJ, true) / 100;
    const packingCost = parseNumericInput(hargaJualInputs.biayaPackingRp);
    const shippingCost = parseNumericInput(hargaJualInputs.ongkirDitanggungPenjualRp);
    const resellerCommissionPercent = parseNumericInput(hargaJualInputs.komisiResellerPersenDariHJ, true) / 100;
    const profitMarginPercent = parseNumericInput(hargaJualInputs.marginKeuntunganPersenDariHJ, true) / 100;

    const totalFixedCostsPerUnit = modal + packingCost + shippingCost;
    const totalPercentageCostsFromHJ = adminFeePercent + adCostPercent + resellerCommissionPercent + profitMarginPercent;
    
    if (totalPercentageCostsFromHJ >= 1) {
      setHargaJualOutputs({ 
        hargaJualIdeal: 0, 
        profitPerProduk: 0,
        totalBiayaPersenPerProduk: totalPercentageCostsFromHJ * 100,
        totalBiayaTetapPerProduk: totalFixedCostsPerUnit,
        peringatan: "Total persentase biaya dan margin dari Harga Jual >= 100%. Tidak mungkin mencapai profit." 
      });
      return;
    }

    const hargaJual = totalFixedCostsPerUnit / (1 - totalPercentageCostsFromHJ);
    const profit = hargaJual * profitMarginPercent;
    
    setHargaJualOutputs({
      hargaJualIdeal: hargaJual > 0 && isFinite(hargaJual) ? Math.round(hargaJual) : 0,
      profitPerProduk: profit > 0 && isFinite(profit) ? Math.round(profit) : 0,
      totalBiayaPersenPerProduk: totalPercentageCostsFromHJ * 100,
      totalBiayaTetapPerProduk: totalFixedCostsPerUnit,
      peringatan: hargaJual <=0 || profit <=0 ? "Margin profit negatif atau nol dengan input saat ini." : undefined,
    });
  }, [hargaJualInputs]);

  const calculateOmsetLaba = useCallback(() => {
    const units = parseNumericInput(omsetLabaInputs.targetPenjualanUnit);
    const price = parseNumericInput(omsetLabaInputs.hargaJualPerUnit);
    const costPerUnit = parseNumericInput(omsetLabaInputs.modalPerUnit);
    const adminFeePercent = parseNumericInput(omsetLabaInputs.biayaAdminMarketplacePersen, true) / 100;
    const totalAdSpend = parseNumericInput(omsetLabaInputs.totalBiayaIklanRp);
    const packingPerUnit = parseNumericInput(omsetLabaInputs.biayaPackingPerUnitRp);

    const omsetKotor = units * price;
    const totalBiayaAdmin = adminFeePercent * omsetKotor;
    const totalModalProduk = units * costPerUnit;
    const totalBiayaPacking = units * packingPerUnit;
    const totalPotonganBiaya = totalBiayaAdmin + totalModalProduk + totalBiayaPacking + totalAdSpend;
    const estimasiLabaBersih = omsetKotor - totalPotonganBiaya;

    setOmsetLabaOutputs({
      omsetKotor: Math.round(omsetKotor),
      totalBiayaAdmin: Math.round(totalBiayaAdmin),
      totalModalProduk: Math.round(totalModalProduk),
      totalBiayaPacking: Math.round(totalBiayaPacking),
      totalPotonganBiaya: Math.round(totalPotonganBiaya),
      estimasiLabaBersih: Math.round(estimasiLabaBersih),
      peringatan: estimasiLabaBersih <= 0 ? "Estimasi laba bersih negatif atau nol." : undefined,
    });
  }, [omsetLabaInputs]);

  const calculateBEP = useCallback(() => {
    const fixedCosts = parseNumericInput(bepInputs.totalBiayaTetapRp);
    const price = parseNumericInput(bepInputs.hargaJualPerUnit);
    const costPerUnit = parseNumericInput(bepInputs.modalPerUnit);
    const varCostPercent = parseNumericInput(bepInputs.biayaVariabelLainPersenDariHJ, true) / 100;
    const varCostRp = parseNumericInput(bepInputs.biayaVariabelLainPerUnitRp);

    const totalVariableCostPerUnit = costPerUnit + (varCostPercent * price) + varCostRp;
    const contributionMarginPerUnit = price - totalVariableCostPerUnit;

    if (contributionMarginPerUnit <= 0) {
      setBepOutputs({ 
        bepUnit: 0, 
        bepRupiah: 0,
        marginKontribusiPerUnit: Math.round(contributionMarginPerUnit),
        peringatan: "Margin kontribusi per unit negatif atau nol. BEP tidak dapat dicapai (harga jual terlalu rendah atau biaya variabel terlalu tinggi)." 
      });
      return;
    }
    
    const bepUnit = fixedCosts / contributionMarginPerUnit;
    const bepRupiah = bepUnit * price;

    setBepOutputs({
      bepUnit: Math.ceil(bepUnit), // Round up for units
      bepRupiah: Math.round(bepRupiah),
      marginKontribusiPerUnit: Math.round(contributionMarginPerUnit),
      peringatan: undefined,
    });
  }, [bepInputs]);

  const calculateKomisi = useCallback(() => {
    const modalSupplier = parseNumericInput(komisiInputs.hargaModalProdukSupplier);
    const hargaJual = parseNumericInput(komisiInputs.hargaJualKeKonsumen);
    const komisiDsPercent = parseNumericInput(komisiInputs.komisiDropshipperPersenDariProfitSeller, true) / 100;

    const profitKotorSeller = hargaJual - modalSupplier;
    const komisiDropshipperRp = komisiDsPercent * profitKotorSeller;
    const profitBersihSeller = profitKotorSeller - komisiDropshipperRp;

    setKomisiOutputs({
      profitKotorSeller: Math.round(profitKotorSeller),
      komisiDropshipperRp: Math.round(komisiDropshipperRp),
      profitBersihSeller: Math.round(profitBersihSeller),
      peringatan: profitBersihSeller < 0 ? "Profit bersih seller negatif." : (profitKotorSeller < 0 ? "Profit kotor negatif (harga jual < modal)." : undefined),
    });
  }, [komisiInputs]);

  const calculateDiskon = useCallback(() => {
    const hargaNormal = parseNumericInput(diskonInputs.hargaJualNormal);
    const modal = parseNumericInput(diskonInputs.modalPerUnit);
    const varCostPercent = parseNumericInput(diskonInputs.biayaVariabelLainPersenDariHJ, true) / 100;
    const diskonPercent = parseNumericInput(diskonInputs.persentaseDiskon, true) / 100;

    const hargaSetelahDiskon = hargaNormal * (1 - diskonPercent);
    const biayaVariabelSetelahDiskon = modal + (varCostPercent * hargaSetelahDiskon);
    const profitSetelahDiskon = hargaSetelahDiskon - biayaVariabelSetelahDiskon;

    setDiskonOutputs({
      hargaJualSetelahDiskon: Math.round(hargaSetelahDiskon),
      profitPerUnitSetelahDiskon: Math.round(profitSetelahDiskon),
      totalBiayaVariabelSetelahDiskon: Math.round(biayaVariabelSetelahDiskon),
      peringatan: profitSetelahDiskon <= 0 ? "Profit setelah diskon negatif atau nol." : undefined,
    });
  }, [diskonInputs]);

  // useEffect to run calculations when inputs change
  useEffect(() => {
    if (activeMode === 'hargaJual') calculateHargaJual();
  }, [hargaJualInputs, activeMode, calculateHargaJual]);

  useEffect(() => {
    if (activeMode === 'omsetLaba') calculateOmsetLaba();
  }, [omsetLabaInputs, activeMode, calculateOmsetLaba]);
  
  useEffect(() => {
    if (activeMode === 'bep') calculateBEP();
  }, [bepInputs, activeMode, calculateBEP]);

  useEffect(() => {
    if (activeMode === 'komisi') calculateKomisi();
  }, [komisiInputs, activeMode, calculateKomisi]);
  
  useEffect(() => {
    if (activeMode === 'diskon') calculateDiskon();
  }, [diskonInputs, activeMode, calculateDiskon]);

  // Load state from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const mode = params.get('mode') as CalculatorMode | null;

    if (mode) {
      setActiveMode(mode);
      const loadInputs = (keys: string[], setter: React.Dispatch<React.SetStateAction<any>>, initialValues: any) => {
        const newInputs: { [key: string]: string } = { ...initialValues };
        let changed = false;
        keys.forEach(key => {
          if (params.has(key)) {
            newInputs[key] = params.get(key) || initialValues[key];
            changed = true;
          }
        });
        if (changed) setter(newInputs);
      };

      if (mode === 'hargaJual') loadInputs(Object.keys(initialHargaJualInputs), setHargaJualInputs, initialHargaJualInputs);
      if (mode === 'omsetLaba') loadInputs(Object.keys(initialOmsetLabaInputs), setOmsetLabaInputs, initialOmsetLabaInputs);
      if (mode === 'bep') loadInputs(Object.keys(initialBEPInputs), setBepInputs, initialBEPInputs);
      if (mode === 'komisi') loadInputs(Object.keys(initialKomisiInputs), setKomisiInputs, initialKomisiInputs);
      if (mode === 'diskon') loadInputs(Object.keys(initialDiskonInputs), setDiskonInputs, initialDiskonInputs);
    }
  }, []);


  const handleShare = () => {
    let currentInputs = {};
    if (activeMode === 'hargaJual') currentInputs = hargaJualInputs;
    else if (activeMode === 'omsetLaba') currentInputs = omsetLabaInputs;
    else if (activeMode === 'bep') currentInputs = bepInputs;
    else if (activeMode === 'komisi') currentInputs = komisiInputs;
    else if (activeMode === 'diskon') currentInputs = diskonInputs;

    const params = new URLSearchParams({ mode: activeMode, ...currentInputs }).toString();
    const shareUrl = `${window.location.origin}${window.location.pathname}#${window.location.hash.split('?')[0].substring(1)}?${params}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    }).catch(err => {
        console.error("Failed to copy link: ", err);
        alert("Gagal menyalin link.");
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return 'Rp -';
    return `Rp${Math.round(value).toLocaleString('id-ID')}`;
  };
  
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '- %';
    return `${value.toFixed(2)}%`;
  }

  const renderInput = (name: keyof any, label: string, value: string, placeholder?: string, unit?: string, isPercent?: boolean, isDecimal?:boolean) => (
    <div key={String(name)}>
      <label htmlFor={String(name)} className="block text-sm font-medium text-gray-700 mb-1">{label} {unit && `(${unit})`}</label>
      <input
        type="text"
        id={String(name)}
        name={String(name)}
        value={value}
        onChange={(e) => handleInputChange(activeMode, e)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white"
        placeholder={placeholder || "0"}
      />
    </div>
  );
  
  const renderOutput = (label: string, value: string | number, className: string = "text-gray-800") => (
     <div className="flex justify-between py-2 border-b border-gray-200">
        <span className="text-gray-600">{label}:</span>
        <span className={`font-semibold ${className}`}>{value}</span>
      </div>
  );

  const tabs: { key: CalculatorMode; label: string; icon: string }[] = [
    { key: 'hargaJual', label: 'Harga Jual Ideal', icon: 'fas fa-tag' },
    { key: 'omsetLaba', label: 'Simulasi Omset & Laba', icon: 'fas fa-chart-line' },
    { key: 'bep', label: 'BEP Calculator', icon: 'fas fa-equals' },
    { key: 'komisi', label: 'Komisi Reseller', icon: 'fas fa-percent' },
    { key: 'diskon', label: 'Simulasi Diskon', icon: 'fas fa-bolt' },
  ];

  return (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-2xl print:shadow-none">
      {/* 
        The <style jsx global> tag has been removed as it's not standard React/TS.
        Print styles are now handled by Tailwind's print modifiers.
        - `print:hidden` is applied to elements that should not be printed.
        - The `printable-area` div uses `print:absolute print:top-0 print:left-0 print:w-full`
          to take over the page during printing.
        - Other elements like Navbar/Footer outside this component would ideally also get `print:hidden` 
          in their respective files or a global print stylesheet for a cleaner print output.
      */}

    <div className="printable-area print:absolute print:top-0 print:left-0 print:w-full">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-primary">
        Kalkulator Bisnis CUANLABS
      </h2>

      <div className="mb-6 flex flex-wrap justify-center gap-2 print:hidden">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveMode(tab.key)}
            className={`px-3 py-2 md:px-4 text-sm md:text-base font-medium rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105
              ${activeMode === tab.key 
                ? 'bg-primary text-white shadow-md ring-2 ring-primary-dark ring-offset-1' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <i className={`${tab.icon} mr-1 md:mr-2`}></i>{tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Render inputs based on activeMode */}
        {activeMode === 'hargaJual' && (
          <>
            {renderInput('modalBeliProduk', 'Modal Beli Produk', hargaJualInputs.modalBeliProduk, "100000", "Rp")}
            {renderInput('biayaAdminMarketplacePersen', 'Biaya Admin Marketplace', hargaJualInputs.biayaAdminMarketplacePersen, "5", "% HJ", true, true)}
            {renderInput('biayaIklanPersenDariHJ', 'Biaya Iklan', hargaJualInputs.biayaIklanPersenDariHJ, "10", "% HJ", true, true)}
            {renderInput('biayaPackingRp', 'Biaya Packing', hargaJualInputs.biayaPackingRp, "2000", "Rp")}
            {renderInput('ongkirDitanggungPenjualRp', 'Ongkir Ditanggung Penjual', hargaJualInputs.ongkirDitanggungPenjualRp, "0", "Rp")}
            {renderInput('komisiResellerPersenDariHJ', 'Komisi Reseller', hargaJualInputs.komisiResellerPersenDariHJ, "0", "% HJ", true, true)}
            {renderInput('marginKeuntunganPersenDariHJ', 'Margin Keuntungan Diinginkan', hargaJualInputs.marginKeuntunganPersenDariHJ, "30", "% HJ", true, true)}
          </>
        )}
        {activeMode === 'omsetLaba' && (
          <>
            {renderInput('targetPenjualanUnit', 'Target Penjualan', omsetLabaInputs.targetPenjualanUnit, "100", "Unit")}
            {renderInput('hargaJualPerUnit', 'Harga Jual per Unit', omsetLabaInputs.hargaJualPerUnit, "150000", "Rp")}
            {renderInput('modalPerUnit', 'Modal per Unit', omsetLabaInputs.modalPerUnit, "80000", "Rp")}
            {renderInput('biayaAdminMarketplacePersen', 'Biaya Admin Marketplace', omsetLabaInputs.biayaAdminMarketplacePersen, "5", "% Omset", true, true)}
            {renderInput('totalBiayaIklanRp', 'Total Biaya Iklan Periode', omsetLabaInputs.totalBiayaIklanRp, "500000", "Rp")}
            {renderInput('biayaPackingPerUnitRp', 'Biaya Packing per Unit', omsetLabaInputs.biayaPackingPerUnitRp, "2000", "Rp")}
          </>
        )}
        {activeMode === 'bep' && (
          <>
            {renderInput('totalBiayaTetapRp', 'Total Biaya Tetap', bepInputs.totalBiayaTetapRp, "5000000", "Rp")}
            {renderInput('hargaJualPerUnit', 'Harga Jual per Unit', bepInputs.hargaJualPerUnit, "150000", "Rp")}
            {renderInput('modalPerUnit', 'Modal per Unit (Biaya Variabel)', bepInputs.modalPerUnit, "80000", "Rp")}
            {renderInput('biayaVariabelLainPersenDariHJ', 'Biaya Variabel Lain (% dari HJ)', bepInputs.biayaVariabelLainPersenDariHJ, "5", "% HJ", true, true)}
            {renderInput('biayaVariabelLainPerUnitRp', 'Biaya Variabel Lain (Rp per Unit)', bepInputs.biayaVariabelLainPerUnitRp, "2000", "Rp")}
          </>
        )}
        {activeMode === 'komisi' && (
          <>
            {renderInput('hargaModalProdukSupplier', 'Harga Modal dari Supplier', komisiInputs.hargaModalProdukSupplier, "70000", "Rp")}
            {renderInput('hargaJualKeKonsumen', 'Harga Jual ke Konsumen', komisiInputs.hargaJualKeKonsumen, "150000", "Rp")}
            {renderInput('komisiDropshipperPersenDariProfitSeller', 'Komisi Dropshipper/Reseller', komisiInputs.komisiDropshipperPersenDariProfitSeller, "20", "% dari Profit Seller", true, true)}
          </>
        )}
        {activeMode === 'diskon' && (
          <>
            {renderInput('hargaJualNormal', 'Harga Jual Normal', diskonInputs.hargaJualNormal, "150000", "Rp")}
            {renderInput('modalPerUnit', 'Modal per Unit', diskonInputs.modalPerUnit, "80000", "Rp")}
            {renderInput('biayaVariabelLainPersenDariHJ', 'Biaya Variabel Lain (% dari Harga Jual)', diskonInputs.biayaVariabelLainPersenDariHJ, "5", "% HJ", true, true)}
            {renderInput('persentaseDiskon', 'Persentase Diskon', diskonInputs.persentaseDiskon, "10", "%", true, true)}
          </>
        )}
      </div>

      {/* Results Area */}
      <div className="mt-8 p-4 md:p-6 bg-sky-50 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-4 text-center text-primary">Hasil Perhitungan:</h3>
        {activeMode === 'hargaJual' && hargaJualOutputs && (
          <div className="space-y-1">
            {hargaJualOutputs.peringatan && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-2">{hargaJualOutputs.peringatan}</p>}
            {renderOutput('Harga Jual Ideal', formatCurrency(hargaJualOutputs.hargaJualIdeal), 'text-green-600 text-lg')}
            {renderOutput('Estimasi Profit per Produk', formatCurrency(hargaJualOutputs.profitPerProduk), 'text-accent')}
            {renderOutput('Total Biaya Tetap per Produk', formatCurrency(hargaJualOutputs.totalBiayaTetapPerProduk))}
            {renderOutput('Total Biaya Persen dari HJ', formatPercentage(hargaJualOutputs.totalBiayaPersenPerProduk))}
          </div>
        )}
         {activeMode === 'omsetLaba' && omsetLabaOutputs && (
          <div className="space-y-1">
            {omsetLabaOutputs.peringatan && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-2">{omsetLabaOutputs.peringatan}</p>}
            {renderOutput('Estimasi Omset Kotor', formatCurrency(omsetLabaOutputs.omsetKotor), 'text-lg')}
            {renderOutput('Total Biaya Admin Marketplace', formatCurrency(omsetLabaOutputs.totalBiayaAdmin))}
            {renderOutput('Total Modal Produk', formatCurrency(omsetLabaOutputs.totalModalProduk))}
            {renderOutput('Total Biaya Packing', formatCurrency(omsetLabaOutputs.totalBiayaPacking))}
            {renderOutput('Total Potongan Biaya Keseluruhan', formatCurrency(omsetLabaOutputs.totalPotonganBiaya), 'text-orange-600')}
            {renderOutput('Estimasi Laba Bersih', formatCurrency(omsetLabaOutputs.estimasiLabaBersih), 'text-green-600 text-xl font-bold')}
          </div>
        )}
        {activeMode === 'bep' && bepOutputs && (
          <div className="space-y-1">
            {bepOutputs.peringatan && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-2">{bepOutputs.peringatan}</p>}
            {renderOutput('Margin Kontribusi per Unit', formatCurrency(bepOutputs.marginKontribusiPerUnit))}
            {renderOutput('BEP (Unit)', `${Math.ceil(bepOutputs.bepUnit).toLocaleString('id-ID')} unit`, 'text-green-600 text-lg')}
            {renderOutput('BEP (Rupiah)', formatCurrency(bepOutputs.bepRupiah), 'text-green-600 text-lg')}
          </div>
        )}
         {activeMode === 'komisi' && komisiOutputs && (
          <div className="space-y-1">
            {komisiOutputs.peringatan && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-2">{komisiOutputs.peringatan}</p>}
            {renderOutput('Profit Kotor Penjual (sebelum komisi DS)', formatCurrency(komisiOutputs.profitKotorSeller))}
            {renderOutput('Komisi untuk Dropshipper/Reseller', formatCurrency(komisiOutputs.komisiDropshipperRp), 'text-accent')}
            {renderOutput('Profit Bersih Penjual (setelah komisi DS)', formatCurrency(komisiOutputs.profitBersihSeller), 'text-green-600 text-lg')}
          </div>
        )}
        {activeMode === 'diskon' && diskonOutputs && (
          <div className="space-y-1">
            {diskonOutputs.peringatan && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-2">{diskonOutputs.peringatan}</p>}
            {renderOutput('Harga Jual Setelah Diskon', formatCurrency(diskonOutputs.hargaJualSetelahDiskon))}
            {renderOutput('Total Biaya Variabel per Unit (Setelah Diskon)', formatCurrency(diskonOutputs.totalBiayaVariabelSetelahDiskon))}
            {renderOutput('Profit per Unit Setelah Diskon', formatCurrency(diskonOutputs.profitPerUnitSetelahDiskon), 'text-green-600 text-lg')}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 print:hidden">
        <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center"
        >
            <i className="fas fa-print mr-2"></i>Cetak / Simpan PDF
        </button>
        <button
            onClick={handleShare}
            className="w-full sm:w-auto px-6 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center"
        >
            <i className="fas fa-share-alt mr-2"></i>{copiedLink ? 'Link Tersalin!' : 'Bagikan Perhitungan'}
        </button>
      </div>
     </div> {/* End .printable-area */}
    </div>
  );
};

export default KalkulatorCuan;
