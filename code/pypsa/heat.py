from mesqual.visualizations import TimeSeriesDashboardGenerator

# Fetch cross-border trade balances
data = study.scen_comp.fetch('countries_t.trade_balance_per_partner')
data = data.xs('net_exp', level='variable', axis=1)
data = data.xs('BE', level='primary_country', axis=1)

# Create interactive heatmap dashboard
gen = TimeSeriesDashboardGenerator(
    x_axis='week',
    facet_col='dataset',
    facet_row='partner_country',
    color_continuous_scale=theme.colors.diverging.teal_amber,
)
fig = gen.get_figure(data, title='BE: Trade Balance [MW]')
