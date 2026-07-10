import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  User as UserIcon, 
  QrCode, 
  Link as LinkIcon, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Camera, 
  Copy, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { User } from '../types';

interface OnboardingViewProps {
  onComplete: (setupData: {
    groupName: string;
    currentUser: User;
    initialRoommates?: User[];
  }) => void;
  darkMode: boolean;
}

type OnboardingStep = 'welcome' | 'profile' | 'group-details' | 'invite-connect' | 'success';
type FlowType = 'create' | 'join';

export function OnboardingView({ onComplete, darkMode }: OnboardingStepProps) {
  const [flow, setFlow] = useState<FlowType | null>(null);
  const [step, setStep] = useState<OnboardingStep>('welcome');
  
  // State for Step: Profile
  const [displayName, setDisplayName] = useState('');
  const [avatarBg, setAvatarBg] = useState('bg-emerald-500');
  
  // State for Step: Group Details (Create only)
  const [groupNameInput, setGroupNameInput] = useState('');
  
  // State for Step: Invite / Connect
  const [inviteMethod, setInviteMethod] = useState<'qr' | 'link' | null>(null);
  const [joinMethod, setJoinMethod] = useState<'qr' | 'link' | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [simulatingScan, setSimulatingScan] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const avatarColors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-amber-500'
  ];

  const handleNextStep = () => {
    if (step === 'welcome' && flow) {
      setStep('profile');
    } else if (step === 'profile') {
      if (!displayName.trim()) {
        alert('Please enter a display name to personalize your view.');
        return;
      }
      setStep('group-details');
    } else if (step === 'group-details') {
      if (flow === 'create' && !groupNameInput.trim()) {
        alert('Please enter a group name for your household.');
        return;
      }
      setStep('invite-connect');
    } else if (step === 'invite-connect') {
      if (flow === 'join' && !scanComplete && joinMethod === 'qr') {
        alert('Please complete the QR scan or use a join code.');
        return;
      }
      if (flow === 'join' && joinMethod === 'link' && !joinCodeInput.trim()) {
        alert('Please enter a valid join code or link.');
        return;
      }
      setStep('success');
    }
  };

  const handleBackStep = () => {
    if (step === 'success') setStep('invite-connect');
    else if (step === 'invite-connect') setStep('group-details');
    else if (step === 'group-details') setStep('profile');
    else if (step === 'profile') setStep('welcome');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('lista.app/j/d8f2x');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSimulateScan = () => {
    setSimulatingScan(true);
    setTimeout(() => {
      setSimulatingScan(false);
      setScanComplete(true);
    }, 2000);
  };

  const handleFinishSetup = () => {
    const mainUser: User = {
      id: 'u1',
      name: displayName.trim(),
      avatar: avatarBg,
      status: 'ACTIVE'
    };

    // Default roomies for simulated flow
    const defaultRoommates: User[] = flow === 'create' 
      ? []
      : [
          { id: 'u2', name: 'Household Owner', avatar: 'bg-indigo-500', status: 'ACTIVE' },
          { id: 'u3', name: 'Dorm Roommate', avatar: 'bg-rose-500', status: 'ACTIVE' }
        ];

    onComplete({
      groupName: flow === 'create' ? groupNameInput.trim() : 'Dorm 402 Roomies',
      currentUser: mainUser,
      initialRoommates: defaultRoommates
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        
        {/* Animated Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-3 relative">
            <span className="font-bold text-2xl">L</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[10px] text-gray-950 font-bold">
              <Sparkles size={8} />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome to lista</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[240px]">
            The zero-friction roommate ledger and dorm expense manager.
          </p>
        </div>

        {/* STEP CONTROLLER CONTENT */}
        <div className="min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* --- WELCOME STEP (FLOW TYPE SELECT) --- */}
            {step === 'welcome' && (
              <motion.div
                key="welcome-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                <div className="text-center mb-2">
                  <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Get Started</h3>
                  <p className="text-xs text-gray-500 mt-1">Select an onboarding mode for your room/dorm.</p>
                </div>

                <button
                  onClick={() => { setFlow('create'); setStep('profile'); }}
                  className="group relative flex items-center gap-4 p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 hover:bg-emerald-50/40 text-left transition-all hover:scale-[1.01] active:scale-[0.99] outline-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Create a New Group</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Setup a ledger, name the group, and generate invite links.</p>
                  </div>
                </button>

                <button
                  onClick={() => { setFlow('join'); setStep('profile'); }}
                  className="group relative flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30 hover:border-emerald-400 text-left transition-all hover:scale-[1.01] active:scale-[0.99] outline-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-750 dark:text-gray-300 flex items-center justify-center shrink-0">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Join an Existing Group</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Scan a household QR or enter a code to synchronize with roommates.</p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* --- PROFILE STEP --- */}
            {step === 'profile' && (
              <motion.div
                key="profile-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                <div className="text-center mb-2">
                  <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Dorm Profile</h3>
                  <p className="text-xs text-gray-500 mt-1">Set up your profile representation for bills.</p>
                </div>

                <div className="flex flex-col items-center gap-3 mb-2">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-md ${avatarBg}`}>
                    {displayName.trim() ? displayName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex gap-1.5">
                    {avatarColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setAvatarBg(color)}
                        className={`w-6 h-6 rounded-full border-2 ${color} ${avatarBg === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Roommate Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Xancho Monreal"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-950 dark:text-white"
                  />
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 mt-4"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {/* --- GROUP DETAILS STEP --- */}
            {step === 'group-details' && (
              <motion.div
                key="group-details-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                {flow === 'create' ? (
                  <>
                    <div className="text-center mb-2">
                      <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Setup Household</h3>
                      <p className="text-xs text-gray-500 mt-1">Name your dorm or room cluster to start adding bills.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Group / Dorm Name</label>
                      <input
                        type="text"
                        required
                        value={groupNameInput}
                        onChange={(e) => setGroupNameInput(e.target.value)}
                        placeholder="e.g. Room 402, Apex Suites"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-950 dark:text-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Connect Group</h3>
                      <p className="text-xs text-gray-500 mt-1">No group name is required when joining. Just connect to your roommate's instance.</p>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/40 flex items-start gap-3">
                      <ShieldCheck size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                        lista will automatically pull the shared household name, roommate status details, and currency configuration once you establish a handshake connection on the next step.
                      </p>
                    </div>
                  </>
                )}

                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 mt-4"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {/* --- INVITE / CONNECT STEP --- */}
            {step === 'invite-connect' && (
              <motion.div
                key="invite-connect-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                {flow === 'create' ? (
                  <>
                    <div className="text-center mb-2">
                      <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Generate Onboarding</h3>
                      <p className="text-xs text-gray-500 mt-1">Choose how roommates will join your new household group.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setInviteMethod('qr')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${inviteMethod === 'qr' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 dark:border-gray-800'}`}
                      >
                        <QrCode size={20} className={inviteMethod === 'qr' ? 'text-emerald-500' : 'text-gray-400'} />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Onboarding QR</span>
                      </button>
                      
                      <button
                        onClick={() => setInviteMethod('link')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${inviteMethod === 'link' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 dark:border-gray-800'}`}
                      >
                        <LinkIcon size={20} className={inviteMethod === 'link' ? 'text-emerald-500' : 'text-gray-400'} />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Onboarding Link</span>
                      </button>
                    </div>

                    <div className="min-h-[140px] flex items-center justify-center bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mt-1">
                      {inviteMethod === 'qr' && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-24 h-24 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center">
                            {/* Simple simulated pixel-art QR Code */}
                            <div className="grid grid-cols-5 gap-1 w-16 h-16">
                              {[...Array(25)].map((_, i) => (
                                <div key={i} className={`rounded-xs ${ (i % 3 === 0 || i % 7 === 1 || i < 5 || i > 20) ? 'bg-gray-900 dark:bg-white' : 'bg-transparent' }`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">Scan to Join Household</span>
                        </div>
                      )}

                      {inviteMethod === 'link' && (
                        <div className="w-full flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Household Code Link</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              readOnly 
                              value="lista.app/j/d8f2x" 
                              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 px-3 py-2 rounded-lg text-xs font-semibold flex-1 outline-none text-gray-800 dark:text-gray-200"
                            />
                            <button 
                              onClick={handleCopyLink} 
                              className="px-3 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all"
                            >
                              {copiedLink ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      )}

                      {!inviteMethod && (
                        <p className="text-xs text-gray-400 text-center">Select QR or Link to preview the join credential.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-2">
                      <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Establish Join</h3>
                      <p className="text-xs text-gray-500 mt-1">Choose how you want to join your roommates' household.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => { setJoinMethod('qr'); setScanComplete(false); }}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${joinMethod === 'qr' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 dark:border-gray-800'}`}
                      >
                        <QrCode size={20} className={joinMethod === 'qr' ? 'text-emerald-500' : 'text-gray-400'} />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Scan QR Code</span>
                      </button>
                      
                      <button
                        onClick={() => { setJoinMethod('link'); setScanComplete(false); }}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${joinMethod === 'link' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 dark:border-gray-800'}`}
                      >
                        <LinkIcon size={20} className={joinMethod === 'link' ? 'text-emerald-500' : 'text-gray-400'} />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Enter Code / Link</span>
                      </button>
                    </div>

                    <div className="min-h-[140px] flex items-center justify-center bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mt-1">
                      {joinMethod === 'qr' && (
                        <div className="w-full flex flex-col items-center gap-3">
                          {simulatingScan ? (
                            <div className="flex flex-col items-center gap-2 py-4">
                              <RefreshCw size={24} className="text-emerald-500 animate-spin" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold animate-pulse">Initializing Camera Feed...</span>
                            </div>
                          ) : scanComplete ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center">
                                <Check size={20} strokeWidth={3} />
                              </div>
                              <span className="text-xs text-gray-800 dark:text-gray-200 font-bold">Dorm 402 QR Scanned Successfully!</span>
                            </div>
                          ) : (
                            <button
                              onClick={handleSimulateScan}
                              className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                            >
                              <Camera size={14} /> Simulate QR Scanner Camera
                            </button>
                          )}
                        </div>
                      )}

                      {joinMethod === 'link' && (
                        <div className="w-full flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Paste Join Link or Enter Code</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={joinCodeInput} 
                              onChange={(e) => setJoinCodeInput(e.target.value)}
                              placeholder="e.g. HATI-D8F2X or copy link here" 
                              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 px-3 py-2 rounded-lg text-xs font-semibold flex-1 outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      )}

                      {!joinMethod && (
                        <p className="text-xs text-gray-400 text-center">Select QR or Link to connect with existing roommates.</p>
                      )}
                    </div>
                  </>
                )}

                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 mt-4"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {/* --- SUCCESS STEP --- */}
            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shadow-inner">
                  <Check size={32} strokeWidth={3} />
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Household Setup Active!</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-[240px] leading-relaxed mx-auto">
                    {flow === 'create'
                      ? 'Your brand new group is ready! You can now invite your roommates using a QR code or an invite link.'
                      : 'Your connection has been established. Mock roommates initialized to demonstrate bills.'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-4 border border-gray-150/50 dark:border-gray-800 w-full text-left flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-semibold">GROUP</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{flow === 'create' ? groupNameInput : 'Dorm 402 Roomies'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-gray-100 dark:border-gray-800 pt-2.5">
                    <span className="text-gray-400 font-semibold">YOUR REPRESENTATION</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-4.5 h-4.5 rounded-full ${avatarBg}`} />
                      <span className="font-bold text-gray-800 dark:text-gray-200">{displayName}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-gray-100 dark:border-gray-800 pt-2.5">
                    <span className="text-gray-400 font-semibold">CONNECTION STATUS</span>
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">DORM ONLINE</span>
                  </div>
                </div>

                <button
                  onClick={handleFinishSetup}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 mt-2 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
                >
                  Enter Dorm Dashboard
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* STEP PROGRESS INDICATION & BACK BUTTON */}
        {step !== 'welcome' && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-150/50 dark:border-gray-800/60">
            <button
              onClick={handleBackStep}
              className="flex items-center gap-1 text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="flex gap-1.5">
              {(['profile', 'group-details', 'invite-connect', 'success'] as const).map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all ${
                    s === step ? 'w-5 bg-emerald-500' : 'w-1.5 bg-gray-200 dark:bg-gray-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Add generic settings props interface for build safety
interface OnboardingStepProps {
  onComplete: (setupData: {
    groupName: string;
    currentUser: User;
    initialRoommates?: User[];
  }) => void;
  darkMode: boolean;
}
