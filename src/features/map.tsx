import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Globe from 'react-globe.gl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export type MapHandle = {
  pointOfView: (view: { lat: number; lng: number; altitude: number }) => void;
};

export type MapProps = {
  latitude: number;
  longitude: number;
  altText?: string;
};

export const Map = forwardRef<MapHandle, MapProps>(({ latitude, longitude, altText = 'Map showing location' }, ref) => {
  const globeRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    pointOfView: (view) => {
      if (globeRef.current) {
        globeRef.current.pointOfView(view);
      }
    },
  }));

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: latitude, lng: longitude, altitude: 1 });
    }
  }, [latitude, longitude]);

  return (
    <div className="w-64 h-64 flex items-center justify-center overflow-hidden relative">
      <Globe
        ref={globeRef}
        waitForGlobeReady={true}
        animateIn={false}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        htmlElementsData={[{ lat: latitude, lng: longitude }]}
        htmlElement={(d) => {
          const el = document.createElement('div');
          el.innerHTML = '<div style="font-size: 24px; color: red; transform: translate(-50%, -100%); position: absolute;"><i class="fas fa-map-marker-alt"></i></div>';
          return el;
        }}
        enablePointerInteraction={false}
        onGlobeReady={() => {
          if (globeRef.current) {
            const controls = globeRef.current.controls();
            controls.enableZoom = false;
            controls.enableRotate = false;
            controls.enablePan = false;
          }
        }}
      />
    </div>
  );
});

export default Map;