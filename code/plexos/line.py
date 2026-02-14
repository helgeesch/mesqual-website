import plotly.express as px
from mesqual.utils.pandas_utils import flatten_df

# Same data as heatmap, different visualization
data = study.scen.fetch('countries_t.trade_balance_per_partner')
data = data.xs('net_exp', level='variable', axis=1)
data = flatten_df(data)

# Interactive line chart with range slider
fig = px.line(
    data[data['primary_country'] == 'BE'],
    x='snapshot', y='value',
    color='partner_country', line_dash='dataset',
    title='BE Net-Positions [GW]',
)
