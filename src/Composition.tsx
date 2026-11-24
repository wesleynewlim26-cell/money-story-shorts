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

interface SceneData {
  id: string;
  name: string;
  narration: string;
  subtitle: string;
  heroElement: string;
  background: string;
  characters: unknown[];
  props: string[];
  notes: string;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  durationSeconds: number;
  midFrame: number;
}

// Scene start/end frames from scenes.json
const SCENES: SceneData[] = [
  { id: "scene-01", name: "Judul Koran", narration: "Pagi 1925. Koran Paris berteriak: Menara Eiffel berkarat, biaya perbaikan melonjak.", subtitle: "MENARA EIFFEL BERKARAT • BIAYA PERBAIKAN MELONJAK", heroElement: "newspaper", background: "paris-morning-sky", characters: [], props: ["newspaper-large", "coffee-cup", "bakery-awning"], notes: "Full-bleed newspaper front page as hero, 60%+ frame height. Paris street level as ground layer with 2+ props.", startFrame: 0, endFrame: 89, durationFrames: 90, durationSeconds: 3, midFrame: 44 },
  { id: "scene-02", name: "Victor Lustig", narration: "Victor Lustig, penalip paling brilian, membaca berita itu sambil tersenyum tipis.", subtitle: "VICTOR LUSTIG: PENALIP PALING BRILIAN", heroElement: "victor-character", background: "cafe-interior", characters: [], props: ["cafe-table", "chair", "coffee-cup", "folded-newspaper", "window-paris"], notes: "Victor at 45% frame height (~576px), centered. Cafe interior background with window showing Paris.", startFrame: 90, endFrame: 179, durationFrames: 90, durationSeconds: 3, midFrame: 134 },
  { id: "scene-03", name: "Hotel Mewah - 6 Dealer", narration: "Hotel mewah Paris. Enam dealer besi bersemi di ruangan berluster, menunggu 'kontrak rahasia'.", subtitle: "HOTEL MEWAH • 6 DEALER BESI MENUNGGU KONTRAK RAHASIA", heroElement: "hotel-chandelier", background: "hotel-ballroom", characters: [], props: ["crystal-chandelier", "mahogany-table", "secret-document", "champagne-glasses", "velvet-curtains", "gold-mirror"], notes: "Large chandelier as hero (60%+ height). 6 dealers in 3-left/3-right formation, Victor center with hat. Ballroom floor + 4+ props.", startFrame: 180, endFrame: 299, durationFrames: 120, durationSeconds: 4, midFrame: 239 },
  { id: "scene-04", name: "7000 Ton Besi - Rahasia", narration: "7.000 ton besi. Kontrak dijual sebagai rahasia negara. Dealer ke-2 tertarik, tangan mengangkat dokumen.", subtitle: "7.000 TON BESI • KONTRAK RAHASIA NEGARA", heroElement: "secret-document", background: "hotel-ballroom", characters: [], props: ["secret-document-large", "mahogany-table", "chandelier", "champagne-glasses", "velvet-curtains"], notes: "Document scaled up as hero element (60%+ height). Dealer-2 highlighted reaching for it. Victor center smirking.", startFrame: 300, endFrame: 389, durationFrames: 90, durationSeconds: 3, midFrame: 344 },
  { id: "scene-05", name: "Poisson - Dealer Baru", narration: "Poisson, dealer baru, ambisius tapi ragu. Lustig membaca kelemahan itu seperti buku terbuka.", subtitle: "POISSON: DEALER BARU, AMBISIUS TAPI RAGU", heroElement: "poisson-character", background: "hotel-ballroom", characters: [], props: ["mahogany-table", "document-folder", "chandelier", "champagne-glass", "pocket-watch"], notes: "Two-character scene: Poisson left (concerned), Victor right (smirking with hat). Hotel props between them.", startFrame: 390, endFrame: 509, durationFrames: 120, durationSeconds: 4, midFrame: 449 },
  { id: "scene-06", name: "Suap = Bukti Keaslian", narration: "Suap diberikan. Bukan korupsi — bukti keaslian kontrak. Tangan Lustig mengayunkan amplop ke Poisson.", subtitle: "SUAP = BUKTI KEASLIAN KONTRAK", heroElement: "envelope-bribe", background: "hotel-ballroom", characters: [], props: ["envelope-large", "mahogany-table", "chandelier", "champagne-glasses", "document-folder"], notes: "Large envelope as hero element passed from Victor to Poisson. Hotel ballroom background maintained.", startFrame: 510, endFrame: 629, durationFrames: 120, durationSeconds: 4, midFrame: 569 },
  { id: "scene-07", name: "Koper Penuh Uang - Ke Vienna", narration: "Koper penuh uang. Lustig pergi ke Vienna, meninggalkan Paris dan 6 dealer yang tertipu.", subtitle: "KOPER PENUH UANG • BERANGKAT KE VIENNA", heroElement: "briefcase-money", background: "train-station", characters: [], props: ["briefcase-large-money", "steam-train", "platform-clock", "luggage-cart", "steam-clouds", "station-sign-vienna"], notes: "Open briefcase with money floating as hero (60%+ height). Train station background with steam train. Victor confident with hat.", startFrame: 630, endFrame: 719, durationFrames: 90, durationSeconds: 3, midFrame: 674 },
  { id: "scene-08", name: "Polisi - Tidak Lapor Malu", narration: "Poisson di kantor polisi. Malu tertipu, ia memilih diam. 'Tidak lapor.' Lustig aman.", subtitle: "POISSON DI POLISI • MALU • TIDAK LAPOR", heroElement: "police-station-sign", background: "police-station", characters: [], props: ["police-desk", "police-sign-large", "filing-cabinet", "wanted-poster", "officer-silhouette", "door-exit"], notes: "Police station sign as hero. Poisson centered-left looking concerned with speech bubble 'Malu... Tidak lapor.' Officer silhouette in background.", startFrame: 720, endFrame: 809, durationFrames: 90, durationSeconds: 3, midFrame: 764 },
  { id: "scene-09", name: "1 Bulan Kemudian - Dealer Baru", narration: "Satu bulan kemudian. Lustig kembali ke Paris. Dealer baru. Pola yang sama. Uang yang sama.", subtitle: "1 BULAN KEMUDIAN • DEALER BARU • POLA YANG SAMA", heroElement: "calendar-page", background: "hotel-ballroom", characters: [], props: ["calendar-page-flip", "mahogany-table", "chandelier", "document-folder", "champagne-glasses", "velvet-curtains"], notes: "Calendar page flipping as hero element showing '1 BULAN KEMUDIAN'. Victor center, new dealer left. Hotel ballroom reused.", startFrame: 810, endFrame: 899, durationFrames: 90, durationSeconds: 3, midFrame: 854 },
  { id: "scene-10", name: "2x Lebih Cepat - Uang Lagi", narration: "Kali ini 2x lebih cepat. Suap lebih besar. Uang mengalir lebih deras. Lustig tidak henti.", subtitle: "2x LEBIH CEPAT • SUAP LEBIH BESAR • UANG BERTAMBAL", heroElement: "speed-lines-money", background: "hotel-ballroom", characters: [], props: ["money-flow-lines", "briefcase-stack", "timer-2x", "chandelier", "mahogany-table", "champagne-tower"], notes: "Speed lines with money as hero element (60%+ height). '2x' badge prominent. Victor center, dealer surprised. Faster pace visual.", startFrame: 900, endFrame: 1019, durationFrames: 120, durationSeconds: 4, midFrame: 959 },
  { id: "scene-11", name: "Split: Hotel vs Polisi - Kali Ini Lapor", narration: "Dealer kali ini tidak diam. Hotel kiri, polisi kanan. Garis emas memisah. 'Lapor ke polisi!'", subtitle: "KALI INI: DEALER LAPOR KE POLISI", heroElement: "split-divider-gold", background: "split-hotel-police", characters: [], props: ["gold-divider-line", "hotel-panel-bg", "police-panel-bg", "document-evidence", "handcuffs", "gavel"], notes: "TRUE split-screen 50/50 with gold divider. Left: hotel ballroom with Victor concerned. Right: police station with dealer reporting. Both panels overflow:hidden with own padding.", startFrame: 1020, endFrame: 1109, durationFrames: 90, durationSeconds: 3, midFrame: 1064 },
  { id: "scene-12", name: "Kapal ke Mark Selanjutnya: Al Capone", narration: "Lustig kabur ke Amerika. Kapal melintas Atlantik. Mark selanjutnya: Al Capone, raja Chicago.", subtitle: "KAPAL KE AMERIKA • MARK SELANJUTNYA: AL CAPONE", heroElement: "ocean-liner", background: "ocean-atlantik", characters: [], props: ["ocean-liner-large", "atlantic-waves", "seagulls", "horizon-sunset", "ship-railing", "steam-funnel"], notes: "Ocean liner as hero element (60%+ frame height). Victor on deck with briefcase. Atlantic waves + sunset horizon. Ship railing as foreground prop.", startFrame: 1110, endFrame: 1199, durationFrames: 90, durationSeconds: 3, midFrame: 1154 },
  { id: "scene-13", name: "Menara Eiffel Malam - Masih Berdiri", narration: "Menara Eiffel masih berdiri megah di Paris. Belum pernah dijual — secara resmi.", subtitle: "MENARA EIFFEL MASIH BERDIRI • BELUM PERNAH DIJUAL SECARA RESMI", heroElement: "eiffel-tower-night", background: "paris-night-sky", characters: [], props: ["eiffel-tower-glowing", "seine-river-reflection", "paris-rooftops", "street-lamps", "stars-sparkle", "moon-glow"], notes: "Eiffel Tower at night as hero (80%+ frame height, glowing). Seine river reflection. Paris rooftops foreground. Stars + moon.", startFrame: 1200, endFrame: 1289, durationFrames: 90, durationSeconds: 3, midFrame: 1244 },
  { id: "scene-14", name: "CTA - Follow Cerita Uang", narration: "Ikuti @wealthstock.id untuk cerita uang lain yang tak kalah gila. Follow untuk update.", subtitle: "FOLLOW UNTUK CERITA UANG LAINNYA", heroElement: "money-bag-icon", background: "gradient-dark-gold", characters: [], props: ["money-bag-large", "sparkle-particles", "follow-button", "handle-text", "coin-stack", "gold-glow"], notes: "Large money bag icon as hero (60%+ height). Dark gradient background with gold accents. CTA text centered in safe area. Handle @wealthstock.id prominent.", startFrame: 1290, endFrame: 1799, durationFrames: 510, durationSeconds: 17, midFrame: 1544 },
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
  frame,
  sceneData,
}: {
  sceneId: string;
  progress: number;
  frame: number;
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
      {frame >= scene.startFrame && frame <= scene.endFrame && (
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
      {sceneData.id === "scene-14" && frame >= sceneData.startFrame && frame <= sceneData.endFrame && (
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

  // Find active scene based on current frame
  const activeScene = SCENES.find(
    (scene) => frame >= scene.startFrame && frame <= scene.endFrame
  ) || SCENES[0];

  const sceneProgress = (frame - activeScene.startFrame) / activeScene.durationFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a1a" }}>
      <Scene
        sceneId={activeScene.id}
        progress={sceneProgress}
        frame={frame}
        sceneData={activeScene}
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