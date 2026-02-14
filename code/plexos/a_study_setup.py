import pypsa
from mesqual import StudyManager
from mesqual_plexos import PlexosDataset

study = StudyManager.factory_from_scenarios(
    scenarios=[
        PlexosDataset.from_xml_and_solution_zip(
           model='path/to/my_plexos_model.xml',
           solution=f'path/to/{scen}.zip',
           name=scen,
        )
        for scen in ["base", "high_res", "low_res"]
    ],
    comparisons=[("high_res", "base"), ("low_res", "base")],
)