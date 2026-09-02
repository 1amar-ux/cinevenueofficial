import sys

with open('src/components/AdminPanel.tsx', 'rb') as f:
    content = f.read()

keyword = b'bg-emerald-500/15 border-emerald-500/20 text-emerald-400"\n                                    : "bg-amber-500/15 border-amber-500/20 text-amber-400"\n                                }`}>'

idx = content.find(keyword)
if idx != -1:
    idx += len(keyword)
    print(f"Found keyword at {idx}")
else:
    print("Keyword not found")
    sys.exit(1)

new_content = content[:idx] + b"""
                                  {r.status}
                                </span>
                              </div>
                              <p className="text-xs text-text-primary font-bold truncate">{r.eventName}</p>
                              <p className="text-[10px] text-text-muted">Tickets: {r.tickets} | Paid: \xe2\x82\xb9{r.totalPrice}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <Database className="w-12 h-12 text-white/10 mb-4" />
                <h4 className="text-lg font-display text-text-primary mb-2">Select a Customer Profile</h4>
                <p className="text-sm text-text-muted max-w-md mx-auto">Click on any customer credential from the database panel to view their complete transaction history, event registrations, and venue booking records.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
</div>
</div>
</div>
);
}
export default AdminPanel;
"""

with open('src/components/AdminPanel.tsx', 'wb') as f:
    f.write(new_content)

print("Done")
