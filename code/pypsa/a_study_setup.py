import pypsa
from mesqual import StudyManager
from mesqual_pypsa import PyPSADataset

study = StudyManager.factory_from_scenarios(
    scenarios=[
        PyPSADataset(pypsa.Network('base.nc')),
        PyPSADataset(pypsa.Network('high_res.nc')),
        PyPSADataset(pypsa.Network('low_res.nc')),
    ],
    comparisons=[("high_res", "base"), ("low_res", "base")],
)
