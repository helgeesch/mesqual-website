# Fetch trade balances (MultiIndex df) across all scenarios
flag = SolutionFlag(Enums.Collection.Countries, Enums.SystemOut.TradeBalPerPartner)

print(f'All scenarios → MultiIndex DataFrame')
print(study.scen.fetch(flag))

print(f'Individual scenario')
print(study.scen.get_dataset('base').fetch(flag))

print(f'All comparisons (deltas) → same interface')
print(study.comp.fetch(flag))

print(f'Combined fetch: scenarios + comparisons')
print(study.scen_comp.fetch(flag))
