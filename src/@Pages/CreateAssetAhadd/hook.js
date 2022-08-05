/* eslint-disable max-lines */
import _ from 'lodash';
import { useEffect, useState } from 'react';
import Api, { endpoints } from '@Helpers/api';
import { getTrueInObject } from '@Helpers';

export default () => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeStepAssetType, setActiveStepAssetType] = useState(0);
  const [assetTypeList, setAssetTypeList] = useState([]);
  const [assetPhaseList, setAssetPhaseList] = useState([]);
  const [modules, setModules] = useState([]);
  const [assetParameters, setAssetParameters] = useState([]);
  const [assetType, setAssetType] = useState('');
  const [lifeCycle, setLifeCycle] = useState('yes');
  const [selectedPhase, setSelectedPhase] = useState({});
  const [selectedModule, setSelectedModule] = useState({});

  const [selectedAssetParameter, setSelectedAssetParameter] = useState({});
  const [parameterOption, setParameterOption] = useState([]);
  const [name, setName] = useState('');
  const [network, setNetwork] = useState('');
  const [region, setRegion] = useState('');
  const [section, setSection] = useState('');
  const [ranking, setRanking] = useState('');
  const [marker, setMarker] = useState({ lat: 3.093783, lng: 101.655155 });
  const [files, setFiles] = useState([]);
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [polygon, setPolygon] = useState({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [
            101.6261100769043,
            3.119433252237636,
          ],
          [
            101.58731460571289,
            3.0906364795014616,
          ],
          [
            101.60842895507812,
            3.0601247606563886,
          ],
          [
            101.66421890258788,
            3.046582763910366,
          ],
          [
            101.6949462890625,
            3.086694003205406,
          ],
          [
            101.6261100769043,
            3.119433252237636,
          ],
        ],
      ],
    },
  });
  const isFirstStep = activeStepAssetType === 0;

  const handleUpdatePhase = (event) => {
    setSelectedPhase({ ...selectedPhase, [event.target.name]: event.target.checked });
  };
  const handleUpdateModule = (event, phaseid) => {
    const selectedPhaseOverideModule = { ...(selectedModule[phaseid] ?? {}), [event.target.name]: event.target.checked };
    setSelectedModule({ ...selectedModule, [phaseid]: { ...selectedPhaseOverideModule } });
  };
  const handleUpdateParameter = (event, moduleid, phaseid) => {
    const selectedModuleOverideParams = { ...(selectedAssetParameter[phaseid]?.[moduleid] ?? {}), [event.target.name]: event.target.checked };
    const selectedPhaseOverideModule = { ...(selectedAssetParameter[phaseid] ?? {}), [moduleid]: selectedModuleOverideParams };
    setSelectedAssetParameter({ ...selectedAssetParameter, [phaseid]: { ...selectedPhaseOverideModule } });
  };

  const handleNextStep = () => { setActiveStep((prev) => prev + 1); };
  const handleBackStep = () => { setActiveStep((prev) => prev - 1); };
  const handleNextStepAssetType = () => { setActiveStepAssetType((prev) => prev + 1); };
  const handleBackStepAssetType = () => { setActiveStepAssetType((prev) => prev - 1); };

  const selectedGroupParameter = Object.keys(selectedAssetParameter)
    .map(m => Object.keys(selectedAssetParameter[m])
      .map(e => ({
        ProjectPhaseId: Number(m),
        ModuleId: Number(e),
        params: getTrueInObject(selectedAssetParameter[m]?.[e]).map(x => ({
          id: x,
          name: assetParameters.find(f => String(f.id) === x)?.label,
        })),
      }))).flat();

  const createAsset = () => {
    const data = {
      name, network, region, section, location, ranking, polygonCoordinate,
    };
    if (!data.name) return;
    if (!data.lat) return;
    if (!data.lng) return;
    setIsLoading(true);
    // Api({
    //   endpoint: endpoints.newAssets(),
    //   data,
    //   files,
    //   onSuccess: () => {
    //     toast('success', 'Asset created');
    //     setIsLoading(false);
    //     setIsSuccess(true);
    //     handleNextStep();
    //   },
    //   onFail: () => {
    //     toast('error', 'Opss, something went wrong, please try again.');
    //     setIsLoading(false);
    //     setIsSuccess(false);
    //     handleNextStep();
    //   },
    // });
    alert('Data that will be submitted: ', data)
  };

  const selectedTypeProfile = _.find(assetTypeList, { id: assetType });
  const selectedParameter = parameterOption.length ? _.filter(
    parameterOption.map(x => ({ ...x, value: selectedAssetParameter[x.label] })),
    { value: true },
  ) : [];

  const getStaticData = () => {
    setIsLoadingAssets(true);
    Api({
      endpoint: endpoints.getStaticData(),
      onSuccess: ({ data }) => {
        setAssetTypeList(data.AssetType ?? []);
        setAssetPhaseList(data.projectphase ?? []);
        setIsLoadingAssets(false);
      },
      onFail: () => console.log('error loading static data'),
    });
  };

  const getModules = () => {
    Api({
      endpoint: endpoints.getModules(),
      onSuccess: ({ data }) => setModules(data.map(m => ({ ...m, label: m.name }))),
      onFail: () => toast('error', 'Something went wrong, please try again later.'),
    });
  };

  const getAssetParameters = () => {
    Api({
      endpoint: endpoints.getParameters(),
      onSuccess: ({ data }) => setAssetParameters(data),
      onFail: () => toast('error', 'Something went wrong, please try again later.'),
    });
  };

  useEffect(() => {
    getStaticData();
    getModules();
    getAssetParameters();
  }, []);

  const resetParameter = () => setSelectedAssetParameter({});

  useEffect(() => {
    setLifeCycle('yes');
    setSelectedPhase({});
    setSelectedModule({});
    resetParameter();
  }, [isFirstStep]);

  useEffect(() => {
    setParameterOption(parameterOption.map(x => ({ ...x, value: selectedAssetParameter[x.label] })));
  }, [selectedAssetParameter]);

  useEffect(() => {
    setSelectedModule({});
    resetParameter();
    setAssetPhaseList(assetPhaseList.map(x => ({ ...x, value: selectedPhase[x.id] })));
  }, [selectedPhase, lifeCycle, isFirstStep]);

  return {
    activeStep,
    setActiveStep,
    activeStepAssetType,
    setActiveStepAssetType,
    handleNextStep,
    handleBackStep,
    handleNextStepAssetType,
    handleBackStepAssetType,
    assetType,
    setAssetType,
    assetTypeList,
    selectedTypeProfile,
    assetPhaseList,
    modules,
    assetParameters,
    lifeCycle,
    setLifeCycle,
    selectedModule,
    handleUpdateModule,
    name,
    setName,
    marker,
    setMarker,
    files,
    setFiles,
    location,
    setLocation,
    state,
    setState,
    country,
    setCountry,
    assetTag,
    setAssetTag,
    isSuccess,
    setIsSuccess,
    isLoading,
    createAsset,
    selectedParameter,
    handleUpdatePhase,
    setAssetParameters,
    handleUpdateParameter,
    selectedPhase,
    setSelectedPhase,
    selectedAssetParameter,
    setSelectedAssetParameter,
    selectedGroupParameter,
    isLoadingAssets,
    network,
    setNetwork,
    region,
    setRegion,
    ranking,
    setRanking,
    section,
    setSection,
    polygon,
    setPolygon,
  };
};
