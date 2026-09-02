import sys

with open('src/components/AdminPanel.tsx', 'rb') as f:
    content = f.read()

keyword = b'bg-emerald-500/15 border-emerald-500/20 text-emerald-400"\n                                    : "bg-amber-500/15 border-amber-500/20 text-amber-400"\n                                }`}>'

idx = content.find(keyword)
if idx != -1:
    idx += len(keyword)
else:
    print("Keyword not found")
    sys.exit(1)

new_content = content[:idx] + b"""
                                  {r.status || "Pending"}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-text-primary leading-tight">{r.eventName}</p>
                              <p className="text-[10px] text-text-secondary leading-none">Tickets: {r.tickets} | Paid: \xe2\x82\xb9{r.totalPrice}</p>
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
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
"""

with open('src/components/AdminPanel.tsx', 'wb') as f:
    f.write(new_content)

print("Fixed!")
