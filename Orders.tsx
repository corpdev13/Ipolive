import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, Bell, ArrowLeft, X, CreditCard, CheckCircle2, Copy } from 'lucide-react';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiDogecoin } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateDeposit, useGetDepositAddresses, getGetDepositAddressesQueryKey, CreateDepositInputMethod, CreateDepositInputCoin } from '@workspace/api-client-react';
import SideNav from '../components/SideNav';
import { toast } from 'sonner';

export default function Orders() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | '3a' | '3b' | 'success'>(1);
  const [amount, setAmount] = useState<string>('1593.55');
  const [method, setMethod] = useState<'card' | 'crypto'>('card');
  const [coin, setCoin] = useState<CreateDepositInputCoin>('BTC' as CreateDepositInputCoin);
  
  // Card details
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardZip, setCardZip] = useState('');

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('spcx_user') || 'null') : null;
  const email = user?.email ?? '';

  useEffect(() => {
    if (!user) setLocation('/signin');
  }, [user, setLocation]);

  const handleSignOut = () => {
    localStorage.removeItem('spcx_user');
    setLocation('/');
  };

  const createDeposit = useCreateDeposit();
  const { data: addresses } = useGetDepositAddresses({ query: { enabled: step === '3b', queryKey: getGetDepositAddressesQueryKey() } });

  const cryptoRates: Record<string, number> = {
    BTC: 65000,
    ETH: 3500,
    DOGE: 0.12
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += val[i];
    }
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length >= 3) {
      setCardExp(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
    } else {
      setCardExp(val);
    }
  };

  const submitDeposit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      toast.error('Invalid amount');
      return;
    }

    createDeposit.mutate({
      data: {
        email,
        amount: numAmount,
        method: method as CreateDepositInputMethod,
        ...(method === 'crypto' ? { coin } : {})
      }
    }, {
      onSuccess: () => {
        setStep('success');
      },
      onError: () => {
        toast.error('Failed to submit deposit');
      }
    });
  };

  const currentAddress = addresses?.find(a => a.coin === coin)?.address || 'Loading address...';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentAddress);
    toast.success('Address copied to clipboard');
  };

  const renderStepIndicators = (current: number) => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map(i => (
        <div key={i} className={`w-2 h-2 rounded-full ${i === current ? 'bg-[#1a8a4a]' : i < current ? 'bg-[#1a8a4a]/50' : 'bg-white/20'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20 flex flex-col">
      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} onSignOut={handleSignOut} />
      
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => setLocation('/dashboard')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setMenuOpen(true)} className="text-white/70 hover:text-white transition-colors cursor-pointer">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <button className="text-white/70 hover:text-white transition-colors cursor-pointer">
          <Bell className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 px-6 py-8 flex flex-col justify-center max-w-lg mx-auto w-full relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-[#111827] border border-white/5 rounded-2xl p-8 shadow-2xl w-full"
            >
              <h1 className="text-2xl font-bold font-display uppercase tracking-widest text-center mb-8">Invest in SPCX</h1>
              <div className="flex justify-center items-end gap-1 mb-8">
                <span className="text-4xl font-display font-bold text-white/50 mb-1">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-6xl font-bold font-display tracking-tight text-white w-48 text-center focus:outline-none placeholder:text-white/20"
                  placeholder="0.00"
                />
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={parseFloat(amount) < 1 || isNaN(parseFloat(amount))}
                className="w-full bg-[#1a8a4a] hover:bg-[#1a9a52] disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-bold tracking-widest uppercase py-4 rounded-xl transition-colors cursor-pointer"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep(1)} className="text-white/50 hover:text-white cursor-pointer"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold font-display uppercase tracking-widest">Payment Method</h1>
                <button onClick={() => setLocation('/dashboard')} className="text-white/50 hover:text-white cursor-pointer"><X className="w-6 h-6" /></button>
              </div>
              
              {renderStepIndicators(2)}

              <div className="space-y-4 mb-8">
                <button 
                  onClick={() => setMethod('card')}
                  className={`w-full flex items-center justify-between p-4 border rounded-xl transition-colors cursor-pointer text-left ${method === 'card' ? 'border-[#1a8a4a] bg-[#1a8a4a]/5' : 'border-white/10 hover:border-white/30 bg-[#111827]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display tracking-widest uppercase font-bold text-sm">Debit or Credit Card</div>
                      <div className="text-xs font-display tracking-widest text-white/50">Visa, Mastercard, Amex</div>
                    </div>
                  </div>
                  {method === 'card' && <CheckCircle2 className="w-6 h-6 text-[#1a8a4a]" />}
                </button>

                <div className={`p-4 border rounded-xl transition-colors ${method === 'crypto' ? 'border-[#1a8a4a] bg-[#1a8a4a]/5' : 'border-white/10 hover:border-white/30 bg-[#111827]'}`}>
                  <button 
                    onClick={() => setMethod('crypto')}
                    className="w-full flex items-center justify-between cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#f7931a]/10 flex items-center justify-center text-[#f7931a]">
                        <FaBitcoin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-display tracking-widest uppercase font-bold text-sm">Crypto Wallet</div>
                        <div className="text-xs font-display tracking-widest text-white/50">BTC, ETH, DOGE</div>
                      </div>
                    </div>
                    {method === 'crypto' && <CheckCircle2 className="w-6 h-6 text-[#1a8a4a]" />}
                  </button>
                  
                  {method === 'crypto' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex gap-2">
                        {[
                          { id: 'BTC', label: 'Bitcoin', icon: FaBitcoin, color: '#f7931a' },
                          { id: 'ETH', label: 'Ethereum', icon: FaEthereum, color: '#627eea' },
                          { id: 'DOGE', label: 'Dogecoin', icon: SiDogecoin, color: '#c2a633' }
                        ].map(c => (
                          <button
                            key={c.id}
                            onClick={(e) => { e.stopPropagation(); setCoin(c.id as CreateDepositInputCoin); }}
                            className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-colors cursor-pointer ${coin === c.id ? 'border-[#1a8a4a] bg-[#1a8a4a]/10 text-white' : 'border-white/10 bg-black/20 text-white/50 hover:bg-white/5'}`}
                          >
                            <c.icon className="w-6 h-6 mb-2" style={{ color: coin === c.id ? c.color : undefined }} />
                            <span className="text-[10px] font-display font-bold tracking-widest uppercase">{c.id}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setStep(method === 'card' ? '3a' : '3b')}
                className="w-full bg-[#1a8a4a] hover:bg-[#1a9a52] text-white font-display font-bold tracking-widest uppercase py-4 rounded-xl transition-colors cursor-pointer"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === '3a' && (
            <motion.div
              key="step3a"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep(2)} className="text-white/50 hover:text-white cursor-pointer"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold font-display uppercase tracking-widest">Pay with Card</h1>
                <div className="w-6" />
              </div>
              
              {renderStepIndicators(3)}

              <div className="mb-6 h-40 bg-gradient-to-tr from-[#111827] to-[#1f2937] rounded-xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none" />
                <div className="font-display tracking-widest uppercase text-white/50 text-sm">Debit / Credit Card</div>
                <div className="font-display tracking-widest text-xl">{cardNumber || '•••• •••• •••• ••••'}</div>
                <div className="flex justify-between items-end">
                  <div className="font-display uppercase tracking-widest text-sm text-white/80">{cardName || 'CARDHOLDER NAME'}</div>
                  <div className="font-display tracking-widest text-sm">{cardExp || 'MM/YY'}</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  placeholder="FULL NAME ON CARD"
                  value={cardName}
                  onChange={e => setCardName(e.target.value.toUpperCase())}
                  className="w-full bg-[#111827] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#1a8a4a] transition-colors font-display tracking-widest text-sm"
                />
                <input
                  type="text"
                  placeholder="CARD NUMBER"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full bg-[#111827] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#1a8a4a] transition-colors font-display tracking-widest text-sm"
                />
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExp}
                    onChange={handleExpChange}
                    className="w-1/2 bg-[#111827] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#1a8a4a] transition-colors font-display tracking-widest text-sm"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-1/2 bg-[#111827] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#1a8a4a] transition-colors font-display tracking-widest text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="BILLING ZIP CODE"
                  value={cardZip}
                  onChange={e => setCardZip(e.target.value)}
                  className="w-full bg-[#111827] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#1a8a4a] transition-colors font-display tracking-widest text-sm"
                />
              </div>

              <button 
                onClick={submitDeposit}
                disabled={createDeposit.isPending || !cardNumber || !cardName || !cardExp || !cardCvv}
                className="w-full bg-[#1a8a4a] hover:bg-[#1a9a52] disabled:opacity-50 text-white font-display font-bold tracking-widest uppercase py-4 rounded-xl transition-colors cursor-pointer mb-4"
              >
                PAY NOW ${parseFloat(amount).toFixed(2)}
              </button>
              
              <div className="text-center text-[10px] text-white/40 font-display tracking-widest uppercase">
                256-bit encrypted · SIPC protected up to $500,000
              </div>
            </motion.div>
          )}

          {step === '3b' && (
            <motion.div
              key="step3b"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep(2)} className="text-white/50 hover:text-white cursor-pointer"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold font-display uppercase tracking-widest">Crypto Deposit</h1>
                <div className="w-6" />
              </div>

              {renderStepIndicators(3)}

              <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  {coin === 'BTC' && <FaBitcoin className="w-8 h-8 text-[#f7931a]" />}
                  {coin === 'ETH' && <FaEthereum className="w-8 h-8 text-[#627eea]" />}
                  {coin === 'DOGE' && <SiDogecoin className="w-8 h-8 text-[#c2a633]" />}
                </div>
                <div className="text-sm text-white/50 font-display tracking-widest uppercase mb-1">Send Exactly</div>
                <div className="text-3xl font-display font-bold tracking-wider mb-6">
                  {(parseFloat(amount) / (cryptoRates[coin] || 1)).toFixed(6)} <span className="text-lg text-white/50">{coin}</span>
                </div>
                
                <div className="text-left mb-2 text-xs text-white/50 font-display tracking-widest uppercase">Deposit Address</div>
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 flex items-center justify-between gap-4 mb-4">
                  <span className="font-mono text-xs break-all text-white/80">{currentAddress}</span>
                  <button onClick={copyToClipboard} className="text-white/50 hover:text-white cursor-pointer shrink-0">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-xs text-white/40 font-display tracking-wider bg-white/5 p-3 rounded text-left">
                  Send only {coin} to this address. Sending any other coin may result in permanent loss.
                </div>
              </div>

              <button 
                onClick={submitDeposit}
                disabled={createDeposit.isPending}
                className="w-full bg-[#1a8a4a] hover:bg-[#1a9a52] disabled:opacity-50 text-white font-display font-bold tracking-widest uppercase py-4 rounded-xl transition-colors cursor-pointer"
              >
                {createDeposit.isPending ? 'PROCESSING...' : "I've Sent the Payment"}
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-[#111827] border border-white/5 rounded-2xl p-10 shadow-2xl w-full"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 bg-[#1a8a4a]/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-[#1a8a4a]" />
              </motion.div>
              <h1 className="text-2xl font-bold font-display uppercase tracking-widest mb-4">Payment Submitted</h1>
              <p className="text-sm text-white/50 tracking-wider font-display uppercase mb-10 leading-relaxed">
                Your deposit is being processed.<br/>Holdings will be updated once confirmed.
              </p>
              <button 
                onClick={() => setLocation('/dashboard')}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-display font-bold tracking-widest uppercase py-4 rounded-xl transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}