# Fetch trade balances (MultiIndex df) across all scenarios
result_flag = 'countries_t.trade_balance_per_partner'
model_flag = 'countries'

print(f'Results: All scenarios → MultiIndex DataFrame')
print(study.scen.fetch(result_flag))

print(f'Results: Individual scenario')
print(study.scen.get_dataset('base').fetch(result_flag))

print(f'Model: Individual scenario')
print(study.scen.get_dataset('base').fetch(model_flag))

print(f'Results: All comparisons (deltas) → same interface')
print(study.comp.fetch(result_flag))

print(f'Results: Combined fetch: scenarios + comparisons')
print(study.scen_comp.fetch(result_flag))
