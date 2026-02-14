import folium
from captain_arro import ArrowTypeEnum
from mesqual import kpis
from mesqual.visualizations import folviz, valmap

# Define KPIs: mean prices per country, mean flows per border
price_defs = (kpis.FlagAggKPIBuilder()
    .for_flag('countries_t.vol_weighted_marginal_price')
    .with_aggregation(kpis.Aggregations.Mean)
    .for_all_objects().build())
flow_defs = (kpis.FlagAggKPIBuilder()
    .for_flag('country_borders_t.net_flow')
    .with_aggregation(kpis.Aggregations.Mean)
    .for_all_objects().build())
study.scen.add_kpis_from_definitions_to_all_child_datasets(
    price_defs + flow_defs)

# Colored country areas for prices
price_cs = valmap.SegmentedContinuousColorscale(
    segments={(0, 100): theme.colors.sequential.default})
area_gen = folviz.AreaGenerator(folviz.AreaFeatureResolver(
    fill_color=folviz.PropertyMapper.from_kpi_value(price_cs),
    fill_opacity=1.0, border_color='#ffffff', tooltip=True))

# Animated flow arrows for cross-border trade
arrow_gen = folviz.ArrowIconGenerator(folviz.ArrowIconFeatureResolver(
    arrow_type=ArrowTypeEnum.MOVING_FLOW_ARROW,
    color='#101010',
    reverse_direction=folviz.PropertyMapper.from_kpi_value(lambda v: v < 0),
    num_arrows=4, speed_in_duration_seconds=4))

# Build map — one togglable layer per scenario
m = folium.Map(location=[52, 15], zoom_start=4.5)
for ds in study.scen.dataset_iterator:
    fg = folium.FeatureGroup(name=ds.name)
    area_gen.generate_objects_for_kpi_collection(
        ds.kpi_collection.filter(flag='countries_t.vol_weighted_marginal_price'), fg)
    arrow_gen.generate_objects_for_kpi_collection(
        ds.kpi_collection.filter(flag='country_borders_t.net_flow'), fg)
    fg.add_to(m)
folium.LayerControl(collapsed=False).add_to(m)
