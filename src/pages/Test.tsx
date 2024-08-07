import React, { useEffect, useRef, useState } from 'react'
import NavBar from '../components/NavBar'
// import { InteractiveMap } from './counties/components/InteractiveMap'
import Map, { CircleLayer, FillLayer, Layer, LineLayer, MapLayerMouseEvent, MapRef, Source, ViewState } from 'react-map-gl'

// import geojson from '../resources/usaPolygon.json'
import { Feature, FeatureCollection, Point, Polygon } from 'geojson'
import { BBox, area, buffer, centroid, hexGrid, intersect, /*pointGrid, squareGrid, triangleGrid*/ } from '@turf/turf'
import { Typography } from '@mui/joy'
// import { writeFileSync } from 'fs'

const bbox: BBox = [-125, 25, -67, 49];
const SPACING = 50
const INSET = -30

const Test = () => {

  const [view, setView] = useState<Partial<ViewState>>({
    longitude: -98.5696,
    latitude: 39.8282,
    zoom: 4,
  })
  const [usaBuffer, setUsaBuffer] = useState<Feature<Polygon>>()
  const [grid, setGrid] = useState<FeatureCollection>()
  const [points, setPoints] = useState<FeatureCollection<Point>>()

  const mapRef = useRef<MapRef>(null)

  const onMove = (e: { viewState: { longitude: number; latitude: number; zoom: number } }) => {
    setView(e.viewState)
  };

  // const median = (arr: number[]) => {
  //   const mid = Math.floor(arr.length / 2),
  //     nums = [...arr].sort((a, b) => a - b);
  //   return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  // };

  useEffect(() => {

    setUsaBuffer(buffer(usaPolygon, INSET, { units: "miles" }))

  }, [mapRef])

  useEffect(() => {

    if (usaBuffer) {
      const g = hexGrid(bbox, SPACING, { units: 'miles', mask: usaBuffer });

      // const polygonAreas = g.features.map(gridElement => {
      //   const intersection = intersect(usaBuffer, gridElement)
      //   if (intersection) return area(intersection)
      //   return 0
      // })

      // const med = median(polygonAreas)
      // const mean = polygonAreas.reduce((acc, curr) => acc + curr) / polygonAreas.length

      setGrid(g)

      const features = g.features.filter(gridElement => {
        const intersection = intersect(usaBuffer, gridElement)
        if (!intersection) return false

        return area(intersection) >= 8700000000

      }).map(f => centroid(f))

      const points: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features
      }

      // const coords = points.features.map(feature => feature.geometry.coordinates)

      // console.log(JSON.stringify(coords))
      setPoints(points)
    }

  }, [usaBuffer])



  const lineStyle = (id: string): LineLayer => {
    return {
      type: 'line',
      id,
      paint: {
        'line-color': "#000000"
      }
    }
  }

  const fillStyle = (id: string): FillLayer => {
    return {
      type: 'fill',
      id,
      paint: {
        "fill-outline-color": "#000000",
        "fill-color": "rgba(171, 195, 231, 0)"
      }
    }
  }


  const pointStyle: CircleLayer = {
    type: 'circle',
    id: 'points',
    paint: {
      'circle-color': "#000000"
    }
  }

  const onClick = (e: MapLayerMouseEvent) => {
    console.log(e.features);

    if (e.features?.length && e.features[0].source == 'grid' && usaBuffer) {
      console.log(e.features[0].geometry);
      const geometry = e.features[0].geometry as Polygon

      const intersection = intersect(usaBuffer, geometry)
      if (intersection) {
        const a = area(intersection)
        console.log(a.toExponential())
      }

    } else if (e.features?.length && e.features[0].source == 'points') {
      console.log(e.features[0]);
      const point = e.features[0]
      console.log(point.geometry)

    }
  }




  return (
    <>
      <NavBar />

      <Map
        minZoom={2.5}
        maxPitch={0}
        doubleClickZoom={false}
        mapStyle={`mapbox://styles/juddlee/clrih8y4l006f01r7f899d6ok`}
        ref={mapRef}
        initialViewState={{ latitude: 38, longitude: -104, zoom: 3.5 }}
        // viewState={view}   
        style={{ width: '100%', height: 600 }}
        onMove={onMove}
        onClick={onClick}
        interactiveLayerIds={['grid', 'points']}
      >
        {/* <Source id='buffer' type='geojson' data={usaPolygon}>
          <Layer {...style} />
        </Source> */}
        <Source id='usa' type='geojson' data={usaBuffer}>
          <Layer {...lineStyle('usaBuffer')} />
        </Source>
        <Source id='grid' type='geojson' data={grid}>
          <Layer {...fillStyle("grid")} />
        </Source>
        <Source id='points' type='geojson' data={points}>
          <Layer {...pointStyle} />
        </Source>



      </Map>

      <Typography>{points?.features.length}</Typography>
    </>
  )
}


export default Test

const bBoxPolygon: Feature<Polygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [[
      [bbox[0], bbox[1]],
      [bbox[0], bbox[3]],
      [bbox[2], bbox[3]],
      [bbox[2], bbox[1]],
      [bbox[0], bbox[1]]
    ]]
  }
}


const usaPolygon: Feature<Polygon, {}> = {
  type: "Feature",
  properties: {},
  geometry: {
    "type": "Polygon",
    "coordinates": [[
      [-94.81758, 49.38905],
      [-94.64, 48.84],
      [-94.32914, 48.67074],
      [-93.63087, 48.60926],
      [-92.61, 48.45],
      [-91.64, 48.14],
      [-90.83, 48.27],
      [-89.6, 48.01],
      [-89.272917, 48.019808],
      [-88.378114, 48.302918],
      [-87.439793, 47.94],
      [-86.461991, 47.553338],
      [-85.652363, 47.220219],
      [-84.87608, 46.900083],
      [-84.779238, 46.637102],
      [-84.543749, 46.538684],
      [-84.6049, 46.4396],
      [-84.3367, 46.40877],
      [-84.14212, 46.512226],
      [-84.091851, 46.275419],
      [-83.890765, 46.116927],
      [-83.616131, 46.116927],
      [-83.469551, 45.994686],
      [-83.592851, 45.816894],
      [-82.550925, 45.347517],
      [-82.337763, 44.44],
      [-82.137642, 43.571088],
      [-82.43, 42.98],
      [-82.9, 42.43],
      [-83.12, 42.08],
      [-83.142, 41.975681],
      [-83.02981, 41.832796],
      [-82.690089, 41.675105],
      [-82.439278, 41.675105],
      [-81.277747, 42.209026],
      [-80.247448, 42.3662],
      [-78.939362, 42.863611],
      [-78.92, 42.965],
      [-79.01, 43.27],
      [-79.171674, 43.466339],
      [-78.72028, 43.625089],
      [-77.737885, 43.629056],
      [-76.820034, 43.628784],
      [-76.5, 44.018459],
      [-76.375, 44.09631],
      [-75.31821, 44.81645],
      [-74.867, 45.00048],
      [-73.34783, 45.00738],
      [-71.50506, 45.0082],
      [-71.405, 45.255],
      [-71.08482, 45.30524],
      [-70.66, 45.46],
      [-70.305, 45.915],
      [-69.99997, 46.69307],
      [-69.237216, 47.447781],
      [-68.905, 47.185],
      [-68.23444, 47.35486],
      [-67.79046, 47.06636],
      [-67.79134, 45.70281],
      [-67.13741, 45.13753],
      [-66.96466, 44.8097],
      [-68.03252, 44.3252],
      [-69.06, 43.98],
      [-70.11617, 43.68405],
      [-70.645476, 43.090238],
      [-70.81489, 42.8653],
      [-70.825, 42.335],
      [-70.495, 41.805],
      [-70.08, 41.78],
      [-70.185, 42.145],
      [-69.88497, 41.92283],
      [-69.96503, 41.63717],
      [-70.64, 41.475],
      [-71.12039, 41.49445],
      [-71.86, 41.32],
      [-72.295, 41.27],
      [-72.87643, 41.22065],
      [-73.71, 40.931102],
      [-72.24126, 41.11948],
      [-71.945, 40.93],
      [-73.345, 40.63],
      [-73.982, 40.628],
      [-73.952325, 40.75075],
      [-74.25671, 40.47351],
      [-73.96244, 40.42763],
      [-74.17838, 39.70926],
      [-74.90604, 38.93954],
      [-74.98041, 39.1964],
      [-75.20002, 39.24845],
      [-75.52805, 39.4985],
      [-75.32, 38.96],
      [-75.071835, 38.782032],
      [-75.05673, 38.40412],
      [-75.37747, 38.01551],
      [-75.94023, 37.21689],
      [-76.03127, 37.2566],
      [-75.72205, 37.93705],
      [-76.23287, 38.319215],
      [-76.35, 39.15],
      [-76.542725, 38.717615],
      [-76.32933, 38.08326],
      [-76.989998, 38.239992],
      [-76.30162, 37.917945],
      [-76.25874, 36.9664],
      [-75.9718, 36.89726],
      [-75.86804, 36.55125],
      [-75.72749, 35.55074],
      [-76.36318, 34.80854],
      [-77.397635, 34.51201],
      [-78.05496, 33.92547],
      [-78.55435, 33.86133],
      [-79.06067, 33.49395],
      [-79.20357, 33.15839],
      [-80.301325, 32.509355],
      [-80.86498, 32.0333],
      [-81.33629, 31.44049],
      [-81.49042, 30.72999],
      [-81.31371, 30.03552],
      [-80.98, 29.18],
      [-80.535585, 28.47213],
      [-80.53, 28.04],
      [-80.056539, 26.88],
      [-80.088015, 26.205765],
      [-80.13156, 25.816775],
      [-80.38103, 25.20616],
      [-80.68, 25.08],
      [-81.17213, 25.20126],
      [-81.33, 25.64],
      [-81.71, 25.87],
      [-82.24, 26.73],
      [-82.70515, 27.49504],
      [-82.85526, 27.88624],
      [-82.65, 28.55],
      [-82.93, 29.1],
      [-83.70959, 29.93656],
      [-84.1, 30.09],
      [-85.10882, 29.63615],
      [-85.28784, 29.68612],
      [-85.7731, 30.15261],
      [-86.4, 30.4],
      [-87.53036, 30.27433],
      [-88.41782, 30.3849],
      [-89.18049, 30.31598],
      [-89.593831, 30.159994],
      [-89.413735, 29.89419],
      [-89.43, 29.48864],
      [-89.21767, 29.29108],
      [-89.40823, 29.15961],
      [-89.77928, 29.30714],
      [-90.15463, 29.11743],
      [-90.880225, 29.148535],
      [-91.626785, 29.677],
      [-92.49906, 29.5523],
      [-93.22637, 29.78375],
      [-93.84842, 29.71363],
      [-94.69, 29.48],
      [-95.60026, 28.73863],
      [-96.59404, 28.30748],
      [-97.14, 27.83],
      [-97.37, 27.38],
      [-97.38, 26.69],
      [-97.33, 26.21],
      [-97.14, 25.87],
      [-97.53, 25.84],
      [-98.24, 26.06],
      [-99.02, 26.37],
      [-99.3, 26.84],
      [-99.52, 27.54],
      [-100.11, 28.11],
      [-100.45584, 28.69612],
      [-100.9576, 29.38071],
      [-101.6624, 29.7793],
      [-102.48, 29.76],
      [-103.11, 28.97],
      [-103.94, 29.27],
      [-104.45697, 29.57196],
      [-104.70575, 30.12173],
      [-105.03737, 30.64402],
      [-105.63159, 31.08383],
      [-106.1429, 31.39995],
      [-106.50759, 31.75452],
      [-108.24, 31.754854],
      [-108.24194, 31.34222],
      [-109.035, 31.34194],
      [-111.02361, 31.33472],
      [-113.30498, 32.03914],
      [-114.815, 32.52528],
      [-114.72139, 32.72083],
      [-115.99135, 32.61239],
      [-117.12776, 32.53534],
      [-117.295938, 33.046225],
      [-117.944, 33.621236],
      [-118.410602, 33.740909],
      [-118.519895, 34.027782],
      [-119.081, 34.078],
      [-119.438841, 34.348477],
      [-120.36778, 34.44711],
      [-120.62286, 34.60855],
      [-120.74433, 35.15686],
      [-121.71457, 36.16153],
      [-122.54747, 37.55176],
      [-122.51201, 37.78339],
      [-122.95319, 38.11371],
      [-123.7272, 38.95166],
      [-123.86517, 39.76699],
      [-124.39807, 40.3132],
      [-124.17886, 41.14202],
      [-124.2137, 41.99964],
      [-124.53284, 42.76599],
      [-124.14214, 43.70838],
      [-124.020535, 44.615895],
      [-123.89893, 45.52341],
      [-124.079635, 46.86475],
      [-124.39567, 47.72017],
      [-124.68721, 48.184433],
      [-124.566101, 48.379715],
      [-123.12, 48.04],
      [-122.58736, 47.096],
      [-122.34, 47.36],
      [-122.5, 48.18],
      [-122.84, 49.0],
      [-120.0, 49.0],
      [-117.03121, 49.0],
      [-116.04818, 49.0],
      [-113.0, 49.0],
      [-110.05, 49.0],
      [-107.05, 49.0],
      [-104.04826, 48.99986],
      [-100.65, 49.0],
      [-97.22872, 49.0007],
      [-95.15907, 49.0],
      [-95.15609, 49.38425],
      [-94.81758, 49.38905]
    ]]
  }
}
