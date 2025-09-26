import pypsa
from mesqual import StudyManager
from mesqual_pypsa import PyPSADataset

# Initialize study with a base case and a scenario
study = StudyManager.factory_from_scenarios(
    scenarios=[
        PyPSADataset(pypsa.Network('base.nc'), name='base'),
        PyPSADataset(pypsa.Network('scen1.nc'), name='scen1'),
    ],
    comparisons=[("scen1", "base")],
)