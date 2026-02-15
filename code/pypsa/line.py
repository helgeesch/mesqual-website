import plotly.express as px
from mesqual.utils.pandas_utils import flatten_df

# Same data as heatmap, different visualization
flag = 'countries_t.trade_balance_per_partner'
data = study.scen.fetch(flag)
data = flatten_df(data)
data = data[data['primary_country'] == 'BE']  # demo BE only

# Interactive line chart with range slider
fig = px.line(
    data,
    x='snapshot', y='value',
    color='partner_country', line_dash='dataset',
    title='BE Net-Positions [GW]',
)
