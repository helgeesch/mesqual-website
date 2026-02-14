# Fetch trade balances across all scenarios
flag = 'countries_t.trade_balance_per_partner'

# All scenarios → MultiIndex DataFrame
df = study.scen.fetch(flag)

# All comparisons (deltas) → same interface
df_comp = study.comp.fetch(flag)

# Combined: scenarios + comparisons
df_all = study.scen_comp.fetch(flag)

print(df.round(2))
