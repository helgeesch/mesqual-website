# code/pypsa/kpi.py
from mesqual.kpi import KPICalculator
from mesqual.kpi.library import system_cost, mean_price

# Calculate KPIs for all scenarios
kpi_df = study.scen.calculate_kpis(
    kpis=[system_cost, mean_price],
    kpi_calculator_class=KPICalculator
)

# kpi_df is now a pandas DataFrame ready for display.