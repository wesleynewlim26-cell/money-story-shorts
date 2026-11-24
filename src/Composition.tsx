import {
  Composition,
  CalculateMetadataFunction,
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
} from "remotion";

type Props = {};

const interpolate = (
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
  extrapolate: "clamp" | "extend" = "clamp"
): number => {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  const t = (frame - inMin) / (inMax - inMin);
  const clampedT = extrapolate === "clamp" ? Math.max(0, Math.min(1, t)) : t;
  return outMin + (outMax - outMin) * clampedT;
};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {
    durationInFrames: 1800,
    fps: 30,
    width: 720,
    height: 1280,
  };
};

// Scene start/end frames from scenes.json
const SCENES = [
  { id: "scene-01", start: 0, end: 89, mid: 44 },
  { id: "scene-02", start: 90, end: 179, mid: 134 },
  { id: "scene-03", start: 180, end: 299, mid: 239 },
  { id: "scene-04", start: 300, end: 389, mid: 344 },
  { id: "scene-05", start: 390, end: 509, mid: 449 },
  { id: "scene-06", start: 510, end: 629, mid: 569 },
  { id: "scene-07", start: 630, end: 719, mid: 674 },
  { id: "scene-08", start: 720, end: 809, mid: 764 },
  { id: "scene-09", start: 810, end: 899, mid: 854 },
  { id: "scene-10", start: 900, end: 1019, mid: 959 },
  { id: "scene-11", start: 1020, end: 1109, mid: 1064 },
  { id: "scene-12", start: 1110, end: 1199, mid: 1154 },
  { id: "scene-13", start: 1200, end: 1289, mid: 1244 },
  { id: "scene-14", start: 1290, end: 1799, mid: 1544 },
];

// Cloud decorative overlay - using div with inline background (no img tags, no 'right' prop)
const Cloud = ({
  top,
  left,
  width,
  height,
}: {
  top: string;
  left: string;
  width: string;
  height: string;
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      width,
      height,
      background: "rgba(255,255,255,0.3)",
      borderRadius: "50%",
      filter: "blur(20px)",
      opacity: 0.6,
    }}
  />
);

// Paris building silhouette as ground/background
const ParisBuildings = ({ progress }: { progress: number }) => {
  const waveY = Math.sin(progress * Math.PI * 2) * 30;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        height: "28%",
        minHeight: "360px",
        background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
        overflow: "visible",
      }}
    >
      {/* Building 1 */}
      <div
        style={{
          position: "absolute",
          bottom: `${30 + waveY}px`,
          left: "8%",
          width: "120px",
          height: "80px",
          background: "#2c3e50",
          borderRadius: "0 0 20px 20px",
          margin: "0 4px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      />
      {/* Building 2 */}
      <div
        style={{
          position: "absolute",
          bottom: `${40 + waveY}px`,
          left: "20%",
          width: "90px",
          height: "60px",
          background: "#1a1a2e",
          borderRadius: "0 0 16px 16px",
          margin: "0 4px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      />
      {/* Building 3 */}
      <div
        style={{
          position: "absolute",
          bottom: `${50 + waveY}px`,
          left: "45%",
          width: "100px",
          height: "70px",
          background: "#2c3e50",
          borderRadius: "0 0 20px 20px",
          margin: "0 4px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      />
      {/* Building 4 */}
      <div
        style={{
          position: "absolute",
          bottom: `${25 + waveY}px`,
          left: "65%",
          width: "80px",
          height: "50px",
          background: "#1a1a2e",
          borderRadius: "0 0 12px 12px",
          margin: "0 4px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      />
      {/* Building 5 */}
      <div
        style={{
          position: "absolute",
          bottom: `${45 + waveY}px`,
          left: "80%",
          width: "90px",
          height: "55px",
          background: "#2c3e50",
          borderRadius: "0 0 18px 18px",
          margin: "0 4px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
};

// Eiffel Tower silhouette - full height hero (60%+ frame height = 768px+)
const EiffelTowerSilhouette = ({ progress }: { progress: number }) => {
  const towerHeight = Math.min(interpolate(progress * 100, [0, 100], [200, 800]), 800);
  return (
    <div
      style={{
        position: "absolute",
        top: "15%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "8px",
        height: towerHeight,
        background: "linear-gradient(200deg, #2c3e50 0%, #1a1a2e 100%)",
        borderRadius: "4px",
        boxShadow: "0 0 20px rgba(255,215,0,0.5), inset 0 0 20px rgba(0,0,0,0.1)",
      }}
    />
  );
};

// Hero text badge - prominent in safe area
const HeroBadge = ({
  text,
  topPercent,
  fontSize,
  fontWeight,
  color,
}: {
  text: string;
  topPercent: number;
  fontSize: number;
  fontWeight: number;
  color: string;
}) => (
  <div
    style={{
      position: "absolute",
      top: `${topPercent}%`,
      left: "48px",
      right: "48px",
      textAlign: "center",
      zIndex: 100,
      overflowWrap: "break-word",
    }}
  >
    <div
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        color: color,
        lineHeight: 1.1,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        minHeight: `${fontSize * 1.5}px`,
      }}
    >
      {text}
    </div>
  </div>
);

// Main scene renderer - each scene gets proper full-bleed layout with 3+ layers
const Scene = ({
  sceneId,
  progress,
  sceneData,
}: {
  sceneId: string;
  progress: number;
  sceneData: SceneData;
}) => {
  const sceneIndex = SCENES.findIndex((s) => s.id === sceneId);
  const scene = SCENES[sceneIndex];

  return (
    <>
      {/* Layer 0: Full-bleed background for scenes that need it (720x1280 full frame) */}
      {scene.id === "scene-01" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background:
              "linear-gradient(180deg, #4a90d9 0%, #87ceeb 35%, #e0f0ff 70%, #f5f0e1 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-02" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-03" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-04" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-05" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-06" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-07" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background:
              "linear-gradient(180deg, #4a90d9 0%, #87ceeb 50%, #e0f0ff 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-08" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #2f4f4f 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-09" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-10" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-11" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-12" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background: "linear-gradient(180deg, #1a1a2e 0%, #0a0a1a 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {scene.id === "scene-13" && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "72%",
            background:
              "linear-gradient(180deg, #4a90d9 0%, #87ceeb 35%, #e0f0ff 70%, #f5f0e1 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Cloud top="8%" left="5%" width="200px" height="60px" />
          <Cloud top="12%" right="8%" width="160px" height="48px" />
        </div>
      )}

      {/* Layer 1: Hero element - always at top, 60%+ frame height */}
      {scene.id === "scene-01" && (
        <EiffelTowerSilhouette progress={progress} />
      )}

      {scene.id === "scene-02" && (
        <HeroBadge
          text="VICTOR LUSTIG: PENALIP PALING BRILIAN"
          topPercent="8"
          fontSize={32}
          fontWeight={700}
          color="#ffd700"
        />
      )}

      {scene.id === "scene-03" && (
        <HeroBadge
          text="HOTEL MEWAH • 6 DEALER MENUNGGU KONTRAK RAHASIA"
          topPercent="8"
          fontSize={28}
          fontWeight={700}
          color="#e83e8c"
        />
      )}

      {scene.id === "scene-04" && (
        <HeroBadge
          text="7.000 TON BESI • KONTRAK RAHASIA NEGARA"
          topPercent="8"
          fontSize={30}
          fontWeight={700}
          color="#e83e8c"
        />
      )}

      {scene.id === "scene-05" && (
        <HeroBadge
          text="POISSON: DEALER BARU, AMBISIUS TAPI RAGU"
          topPercent="8"
          fontSize={28}
          fontWeight={700}
          color="#e83e8c"
        />
      )}

      {scene.id === "scene-06" && (
        <HeroBadge
          text="SUAP = BUKTI KEASLIAN KONTRAK"
          topPercent="8"
          fontSize={30}
          fontWeight={700}
          color="#ffd700"
        />
      )}

      {scene.id === "scene-07" && (
        <HeroBadge
          text="KOPER PENUH UANG • BERANGKAT KE VIENNA"
          topPercent="8"
          fontSize={30}
          fontWeight={700}
          color="#e83e8c"
        />
      )}

      {scene.id === "scene-08" && (
        <HeroBadge
          text="POISSON DI POLISI • MALU • TIDAK LAPOR"
          topPercent="8"
          fontSize={28}
          fontWeight={700}
          color="#e83e8c"
        />
      )}

      {scene.id === "scene-09" && (
        <HeroBadge
          text="1 BULAN KEMUDIAN • DEALER BARU • POLA YANG SAMA"
          topPercent="8"
          fontSize={28}
          fontWeight={700}
          color="#e83e8c"
        />
      )}

      {scene.id === "scene-10" && (
        <HeroBadge
          text="2x LEBIH CEPAT • SUAP LEBIH BESAR • UANG BERTAMBAL"
          topPercent="8"
          fontSize={30}
          fontWeight={700}
          color="#e83e8c"
        />
      )}

      {scene.id === "scene-11" && (
        <HeroBadge
          text="KALI INI: DEALER LAPOR KE POLISI"
          topPercent="8"
          fontSize={30}
          fontWeight={700}
          color="#ffd700"
        />
      )}

      {scene.id === "scene-12" && (
        <HeroBadge
          text="KAPAL KE AMERIKA • MARK SELANJUTNYA: AL CAPONE"
          topPercent="8"
          fontSize={30}
          fontWeight={700}
          color="#e83e8c"
        />
      )}

      {scene.id === "scene-13" && (
        <EiffelTowerSilhouette progress={progress} />
      )}

      {scene.id === "scene-14" && (
        <HeroBadge
          text="FOLLOW UNTUK CERITA UANG LAINNYA"
          topPercent="88"
          fontSize={24}
          fontWeight={700}
          color="#ffd700"
        />
      )}

      {/* Layer 2: Scene-specific content under hero (bottom 20% of frame) */}
      {scene.id === "scene-01" && (
        <ParisBuildings progress={progress} />
      )}

      {scene.id === "scene-02" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "8%",
              left: "8%",
              right: "8%",
              bottom: "15%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 360' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v360H0z' fill='none'/%3E%3Cpath d='M20 20h680v40H20z' fill='%231a1a2e'/%3E%3C/svg%3E')",
              backgroundSize: "120px 80px",
              opacity: 0.4,
            }}
          />
        </div>
      )}

      {scene.id === "scene-03" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "15%",
              right: "15%",
              height: "40%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v1024H0z' fill='none'/%3E%3Cpath d='M40 40h640v80H40z' fill='%231a1a2e'/%3E%3C/svg%3E')",
              backgroundSize: "150px 100px",
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {scene.id === "scene-04" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "15%",
              right: "15%",
              height: "40%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v1024H0z' fill='none'/%3E%3Cpath d='M40 40h640v80H40z' fill='%231a1a2e'/%3E%3C/svg%3E')",
              backgroundSize: "150px 100px",
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {scene.id === "scene-05" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "15%",
              right: "15%",
              height: "40%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v1024H0z' fill='none'/%3E%3Cpath d='M40 40h640v80H40z' fill='%231a1a2e'/%3E%3C/svg%3E')",
              backgroundSize: "150px 100px",
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {scene.id === "scene-06" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "15%",
              right: "15%",
              height: "40%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v1024H0z' fill='none'/%3E%3Cpath d='M40 40h640v80H40z' fill='%231a1a2e'/%3E%3C/svg%3E')",
              backgroundSize: "150px 100px",
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {scene.id === "scene-07" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #4a90d9 0%, #87ceeb 50%, #e0f0ff 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "3%",
              left: "5%",
              right: "5%",
              height: "20%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v1024H0z' fill='none'/%3E%3Cpath d='M20 20h680v40H20z' fill='%231a1a2e'/%3E%3Csvg%3E')",
              backgroundSize: "120px 80px",
              opacity: 0.5,
            }}
          />
        </div>
      )}

      {scene.id === "scene-08" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #2f4f4f 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "10%",
              right: "10%",
              height: "30%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v1024H0z' fill='none'/%3E%3Cpath d='M30 30h660v60H30z' fill='%231a1a2e'/%3E%3Csvg%3E')",
              backgroundSize: "150px 100px",
              opacity: 0.4,
            }}
          />
        </div>
      )}

      {scene.id === "scene-09" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "15%",
              right: "15%",
              height: "40%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v1024H0z' fill='none'/%3E%3Cpath d='M40 40h640v80H40z' fill='%231a1a2e'/%3E%3C/svg%3E')",
              backgroundSize: "150px 100px",
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {scene.id === "scene-10" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "15%",
              right: "15%",
              height: "40%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v1024H0z' fill='none'/%3E%3Cpath d='M40 40h640v80H40z' fill='%231a1a2e'/%3E%3C/svg%3E')",
              backgroundSize: "150px 100px",
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {scene.id === "scene-11" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "5%",
              right: "5%",
              height: "30%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 360 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h360v1024H0z' fill='none'/%3E%3Cpath d='M20 20h320v40H20z' fill='%231a1a2e'/%3E%3Csvg%3E')",
              backgroundSize: "180px 100px",
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {scene.id === "scene-12" && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "0",
            right: "0",
            bottom: "20%",
            background: "linear-gradient(180deg, #1a1a2e 0%, #0a0a1a 100%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "8%",
              left: "8%",
              right: "8%",
              height: "25%",
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v1024H0z' fill='none'/%3E%3Cpath d='M20 20h680v40H20z' fill='%231a1a2e'/%3E%3Cpath d='M40 40h640v80H40z' fill='%230a0a1a'/%3E%3C/svg%3E')",
              backgroundSize: "120px 80px",
              opacity: 0.5,
            }}
          />
        </div>
      )}

      {scene.id === "scene-13" && (
        <EiffelTowerSilhouette progress={progress} />
      )}

      {/* Layer 3: Subtitle in safe area (bottom 120px from frame bottom, padding 48px LR) */}
      {frame >= scene.start && frame <= scene.end && (
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-bottom",
            paddingBottom: "140px",
            paddingLeft: "48px",
            paddingRight: "48px",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: "100%",
              backgroundColor: "rgba(0,0,0,0.75)",
              border: "2px solid #ffd700",
              borderRadius: "12px",
              padding: "16px 24px",
              backdropFilter: "blur(4px)",
              fontFamily: "Oswald, sans-serif",
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#ffd700",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              overflowWrap: "break-word",
              maxHeight: "80px",
            }}
          >
            {sceneData.subtitle}
          </div>
        </AbsoluteFill>
      )}

      {/* CTA only on last scene (scene 14) */}
      {scene.id === "scene-14" && frame >= scene.start && frame <= scene.end && (
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-bottom",
            paddingBottom: "140px",
            paddingLeft: "48px",
            paddingRight: "48px",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: "100%",
              backgroundColor: "rgba(0,0,0,0.8)",
              border: "2px solid #ffd700",
              borderRadius: "12px",
              padding: "20px 40px",
              backdropFilter: "blur(4px)",
              fontFamily: "Oswald, sans-serif",
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#ffd700",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "1px",
              overflowWrap: "break-word",
            }}
          >
            FOLLOW UNTUK CERITA UANG LAINNYA
          </div>
        </AbsoluteFill>
      )}
    </>
  );
};

// Main composition component
export const MoneyStory = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a1a" }}>
      <Scene
        sceneId={SCENES[0].id}
        progress={progress}
        sceneData={SCENES[0]}
      />
    </AbsoluteFill>
  );
};

// Composition registration
export const MyComposition = () => {
  return (
    <Composition
      id="MoneyStory"
      component={MoneyStory}
      durationInFrames={1800}
      fps={30}
      width={720}
      height={1280}
      calculateMetadata={calculateMetadata}
    />
  );
};

export const MyComponent = () => null;