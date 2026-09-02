import sys

append_str = """                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-white">{r.eventTitle}</p>
                                <div className="flex justify-between items-center text-[10px] text-white/50">
                                  <span>Tickets: {r.ticketCount}</span>
                                  <span>₹{r.totalPrice}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* SECURITY PANEL PASSCODE VERIFICATION MODAL */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-[#0F0F12] border border-amber-500/30 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative space-y-5 text-center">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowPasscodeModal(false);
                setPendingAction(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-gold/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white tracking-wide">
                {passcodeActionTitle || "Security PIN Passcode Required"}
              </h3>
              <p className="text-xs text-amber-500/80 mt-1">
                Please enter your security PIN passcode to authorize this sensitive operation.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="••••"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasscodeSubmit();
                  }
                }}
                className="w-full text-center tracking-[0.5em] font-mono text-lg bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500/50"
                maxLength={8}
                autoFocus
              />
              {passcodeError && (
                <p className="text-xs text-red-500 font-semibold">{passcodeError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasscodeModal(false);
                  setPendingAction(null);
                  setPasscodeInput("");
                  setPasscodeError("");
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white font-bold uppercase rounded-xl transition-all border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasscodeSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-gold hover:from-amber-600 hover:to-gold-light text-black text-xs font-bold uppercase rounded-xl transition-all shadow-lg border-0 cursor-pointer"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"""

with open('src/components/AdminPanel.tsx', 'rb') as f:
    lines = f.readlines()

clean_lines = lines[:9029]

with open('src/components/AdminPanel.tsx', 'wb') as f:
    f.writelines(clean_lines)
    f.write(append_str.encode('utf-8'))

print("Appended content successfully.")
