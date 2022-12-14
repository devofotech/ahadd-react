import { useEffect, useState } from 'react';
import Api, { endpoints } from '@Helpers/api';
import { isMimeVideo } from '@Helpers';

const delay = ms => new Promise(res => setTimeout(res, ms));
export default function Hook(props) {
  const [tab, setTab] = useState(0);
  const [toggleAnnotationView, setToggleAnnotationView] = useState('image');
  const [asset_details, set_asset_details] = useState({});
  const [inspections, setInspections] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [ImgIdxForMap, setImgIdxForMap] = useState(0);
  const [mainImage, setMainImage] = useState({});
  const [mainImageAnnotations, setMainImageAnnotations] = useState([]);
  const [mainAnnotationId, setMainAnnotationId] = useState();
  const [mainVideo, setMainVideo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [ignoreChanges, setIgnoreChanges] = useState(false);
  const [uploadPercentages, setUploadPercentages] = useState([0]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [inspection_module, set_inspection_module] = useState([]);
  const [isFirstTimeAnnotate, setIsFirstTimeAnnotate] = useState(true)
  const [currentStep, setCurrentStep] = useState(0);

  const refresh = () => {
    let inspectionsIds = {};
    if (props.InspectionId) inspectionsIds = { InspectionId: props.InspectionId };
    Api({
      endpoint: endpoints.getSeverity(),
      data: { InspectionId: props.InspectionId },
      onSuccess: (response) => setSeverity(response.data),
    });
    Api({
      endpoint: endpoints.getInspectionDetails(props.InspectionId),
      onSuccess: ({ data }) => {
        set_asset_details(data.Asset);
        set_inspection_module(data.Module);
      },
    });
    Api({
      endpoint: endpoints.getInspectionFile(),
      data: { ...inspectionsIds },
      onSuccess: (response) => setInspections(response.data),
    });
  };
  useEffect(refresh, [props.InspectionId]);
  useEffect(() => {
    if (inspections.length > 0) {
      setImages(inspections.filter(f => !f.isVideo)
        .map(m => ({ ...m, src: m.path, metaData: [] })));
      setVideos(inspections.filter(f => f.isVideo)
        .map((m, i) => ({
          ...m,
          imgSrc: 'https://s3.wasabisys.com/yinkadorc/resources/1584104338796_71wcqm_defaultVideo.png',
          vidSrc: m.path,
          asset: m['Inspection.name'],
          title: `Video ${i + 1}`,
        })));
    } else {
      setImages([]);
      setVideos([]);
      setIsLoading(false);
    }
  }, [inspections]);
  useEffect(async () => {
    console.log('vv toggleAnnotationView', toggleAnnotationView)
    if (toggleAnnotationView === 'map') {
      // console.log('vv images', images[1]?.lat, images[1]?.lng)
      setTab(0);
    }
  }, [toggleAnnotationView]);

  const saveImage = () => {
    const input = [];
    console.log('save click', mainImageAnnotations);
    for (let idx = 0; idx < mainImageAnnotations.length; idx++) {
      console.log(mainImageAnnotations[idx]);
      const { points: strpoints, ...therest } = mainImageAnnotations[idx];
      const points = JSON.parse(strpoints);
      const input_annotation = { points, ...therest };
      input.push(input_annotation);
    }
    console.log('save click input', input);
    Api({
      endpoint: endpoints.updateInspectionFileAnnotate(),
      data: {
        InspectionFileId: mainImage.id,
        input,
      },
      onSuccess: () => {
        toast('success', 'Annotation saved');
        refresh();
      },
      onFail: () => {
        toast('error', 'Opss, something went wrong, please try again.');
        refresh();
      },
    });
  };

  const handleChangeMainImage = async (id, changeByIdx) => {
    const image = changeByIdx ? images[id] : images.find(i => i.id == id);
    if (!image) return;
    setIsLoading(true);
    // if(hasChanges && !ignoreChanges) prompt there some changes in to annotation,?
    console.log('image change', mainImageAnnotations);
    setMainImage(image);
    setMainImageAnnotations(image.annotations);
    if (image.annotations.length) setMainAnnotationId(image.annotations[0].id);
    await delay(2000);
    setHasChanges(false);
  };
  const handleChangeMainVideo = async (id, changeByIdx) => {
    const video = changeByIdx ? videos[id] : videos.find(i => i.id == id);
    if (!video) return;
    setIsLoading(true);
    // if(hasChanges && !ignoreChanges) prompt there some changes in to annotation,?
    setMainVideo(video);
    await delay(2000);
    setHasChanges(false);
  };
  useEffect(() => handleChangeMainImage(ImgIdxForMap, true), [ImgIdxForMap]);
  useEffect(() => {
    if (images.length > 0) handleChangeMainImage(mainImage?.id ?? images[0].id);
    if (videos.length > 0) handleChangeMainVideo(mainVideo?.id ?? videos[0].id);
  }, [images, videos]);
  const uploadPhoto = ({ files }) => {
    if (!files.length) return;
    setUploadPercentages([...Array(files.length)].map(() => 0));
    files.forEach((file, idx) => {
      const xhr = Api({
        endpoint: endpoints.uploadInspectionFile('undefined'),
        data: { InspectionId: Number(props.InspectionId), wait: true },
        files: [file],
        uploadPercent: (p) => updatePercentage(idx, p),
        onSuccess: () => {
          toast('success', `${isMimeVideo(file.type) ? 'Video' : 'Photo'} ${idx + 1} saved`);
          refresh();
          updatePercentage(idx, 'done');
        },
        onFail: () => {
          toast('error', 'Opss, something went wrong, please try again.');
        },
      });
      setUploadFiles(prev => [...prev, xhr]);
    });
  };

  const updatePercentage = (i, p) => {
    if (p === 100) p = 99;
    if (p === 'done') p = 100;
    setUploadPercentages(arr => { arr[i] = p; return [...arr]; });
  };

  const deleteImage = (id) => {
    Api({
      endpoint: endpoints.deleteInspectionFile(id),
      onSuccess: () => {
        toast('success', 'File Deleted');
        refresh();
        setMainImage({});
      },
      onFail: () => {
        toast('error', 'Opss, something went wrong, please try again.');
        refresh();
      },
    });
  };

  return {
    toggleAnnotationView,
    setToggleAnnotationView,
    user: props.user,
    setIsLoading,
    isLoading,
    hasChanges,
    ignoreChanges,
    asset_details,
    inspections,
    images,
    videos,
    mainImage,
    setMainImage,
    mainVideo,
    setMainVideo,
    tab,
    setTab,
    handleChangeMainImage,
    saveImage,
    mainImageAnnotations,
    setMainImageAnnotations,
    mainAnnotationId,
    setMainAnnotationId,
    uploadPhoto,
    uploadPercentages,
    setUploadPercentages,
    severity,
    deleteImage,
    uploadFiles,
    ImgIdxForMap,
    setImgIdxForMap,
    inspection_module,
    isFirstTimeAnnotate,
    setIsFirstTimeAnnotate,
    currentStep,
    setCurrentStep,
  };
}
