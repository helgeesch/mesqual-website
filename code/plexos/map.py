import folium
from captain_arro import ArrowTypeEnum
from mesqual import kpis
from mesqual.visualizations import folviz, valmap

# Define KPIs: mean prices per country, mean flows per border
price_flag = SolutionFlag(Enums.Collection.CountrieBorders, Enums.SystemOut.VolWeightedPrice)
flow_flag = SolutionFlag(Enums.Collection.CountrieBorders, Enums.SystemOut.NetFlow)

kpi_defs = (
    kpis.FlagAggKPIBuilder()
    .for_flags([price_flag, flow_flag])
    .with_aggregation(kpis.Aggregations.Mean)
    .for_all_objects().build()
)
study.scen.add_kpis(kpi_defs)

# Colored country areas for prices
price_cs = valmap.SegmentedContinuousColorscale(
    segments={(0, 100): theme.colors.sequential.default}
)
area_gen = folviz.AreaGenerator(folviz.AreaFeatureResolver(
    fill_color=folviz.PropertyMapper.from_kpi_value(price_cs),
    fill_opacity=1.0,
    border_color='#ffffff',
    tooltip=True,
))

# Animated flow arrows for cross-border trade
arrow_gen = folviz.ArrowIconGenerator(folviz.ArrowIconFeatureResolver(
    arrow_type=ArrowTypeEnum.MOVING_FLOW_ARROW,
    color='#101010',
    num_arrows=4,
    speed_in_duration_seconds=4
))

# Build map — one togglable layer per scenario
m = folium.Map()
map_build = MapBuilder()
map_build.add_legends_to_map(m)
map_build.add_non_physical_interconnector_cables(study, m)
map_build.generate_and_add_feature_groups_to_map(study, m,show='first')
