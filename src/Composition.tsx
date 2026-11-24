import {
  Composition,
  CalculateMetadataFunction,
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  Sequence,
} from "remotion";
import { GoogleFont, Text } from "@remotion/google-fonts";

type Props = {};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {
    durationInFrames: 1800,
    fps: 30,
    width: 720,
    height: 1280,
  };
};

const FPS = 30;
const SCENE_1_START = 0;
const SCENE_1_END = 89;
const SCENE_1_DURATION = SCENE_1_END - SCENE_1_START + 1;

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

// Newspaper SVG component - fills 80%+ width, full-bleed
const Newspaper = ({ progress }: { progress: number }) => {
  const scale = interpolate(progress * SCENE_1_DURATION, [0, SCENE_1_DURATION], [0.3, 1.05]);
  const opacity = interpolate(progress * SCENE_1_DURATION, [0, 15], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 720 * 0.9,
          aspectRatio: "720/1024",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          backgroundColor: "#f5f0e1",
          border: "4px solid #000000",
          borderRadius: "8px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,0,0,0.1)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Newspaper masthead */}
        <div
          style={{
            position: "absolute",
            top: "2%",
            left: "4%",
            right: "4%",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Playfair Display",
              fontSize: "48px",
              fontWeight: "bold",
              lineHeight: 1.1,
              color: "#000000",
              textShadow: "2px 2px 0px rgba(255,255,255,0.3)",
            }}
          >
            LE MATIN
          </Text>
          <Text
            style={{
              fontFamily: "Playfair Display",
              fontSize: "18px",
              fontWeight: "normal",
              lineHeight: 1.2,
              color: "#333333",
              marginTop: "4px",
            }}
          >
            PARIS, 1925 • EDITION DU MATIN
          </Text>
        </div>

        {/* Main headline - "MENARA EIFFEL DIJUAL" */}
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "6%",
            right: "6%",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Anton",
              fontSize: "52px",
              fontWeight: "400",
              lineHeight: 1.05,
              color: "#000000",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            MENARA EIFFEL
          </Text>
          <Text
            style={{
              fontFamily: "Anton",
              fontSize: "52px",
              fontWeight: "400",
              lineHeight: 1.05,
              color: "#cc0000",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginTop: "4px",
            }}
          >
            DIJUAL
          </Text>
        </div>

        {/* Sub-headline */}
        <div
          style={{
            position: "absolute",
            top: "36%",
            left: "6%",
            right: "6%",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Playfair Display",
              fontSize: "22px",
              fontWeight: "bold",
              lineHeight: 1.3,
              color: "#000000",
            }}
          >
            Kontrak Rahasia Pemerintah Prancis
          </Text>
        </div>

        {/* Key detail: "Biaya Perbaikan: 250 Juta Franc" - MUST be 40px+ from all edges */}
        <div
          style={{
            position: "absolute",
            top: "48%",
            left: "8%",
            right: "8%",
            textAlign: "center",
            zIndex: 10,
            padding: "16px",
            backgroundColor: "rgba(255,255,255,0.9)",
            border: "2px solid #000000",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <Text
            style={{
              fontFamily: "Oswald",
              fontSize: "28px",
              fontWeight: "700",
              lineHeight: 1.2,
              color: "#000000",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Biaya Perbaikan: 250 Juta Franc
          </Text>
        </div>

        {/* Body text lines */}
        <div
          style={{
            position: "absolute",
            top: "62%",
            left: "6%",
            right: "6%",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Noto Serif",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#1a1a1a",
              textAlign: "justify",
            }}
          >
            La Tour Eiffel, symbole de la grandeur française, nécessite des
            réparations urgentes. La rouille menace la structure de 7 300 tonnes.
            Le gouvernement cherche un acheteur pour la démolition.
          </Text>
        </div>

        <div
          style={{
            position: "absolute",
            top: "74%",
            left: "6%",
            right: "6%",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Noto Serif",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#1a1a1a",
              textAlign: "justify",
            }}
          >
            M. Lustig, homme d'affaires avisé, voit une opportunité unique.
            Six marchands de fer déjà contactés pour soumission confidentielle.
          </Text>
        </div>

        {/* Decorative line */}
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: "20%",
            right: "20%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #000, transparent)",
            zIndex: 5,
          }}
        />

        {/* Bottom section */}
        <div
          style={{
            position: "absolute",
            bottom: "6%",
            left: "6%",
            right: "6%",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Playfair Display",
              fontSize: "14px",
              lineHeight: 1.4,
              color: "#333333",
            }}
          >
            Prix: 25 centimes • 8 Pages • Dépôt Légal
          </Text>
        </div>

        {/* Paper texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 720 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Paris street ground layer with props
const StreetGround = ({ progress }: { progress: number }) => {
  const yOffset = interpolate(progress * SCENE_1_DURATION, [0, SCENE_1_DURATION], [100, 0]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "28%",
          minHeight: "360px",
          background: "linear-gradient(180deg, transparent 0%, #1a1a2e 40%, #0a0a1a 100%)",
          position: "relative",
          transform: `translateY(${yOffset}px)`,
          overflow: "visible",
        }}
      >
        {/* Cobblestone texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 720 360' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h720v360H0z' fill='%231a1a2e'/%3E%3Cpath d='M20 20a20 20 0 0140 0h640a20 20 0 010 40H60a20 20 0 010-40z' fill='%23252540' fill-opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: "120px 80px",
            opacity: 0.6,
          }}
        />

        {/* Prop 1: Cafe table & chairs */}
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "8%",
            width: "140px",
            height: "100px",
            background: "linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)",
            border: "2px solid #333",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "16px",
              height: "16px",
              background: "#ffd700",
              border: "2px solid #000",
              borderRadius: "50%",
              boxShadow: "0 0 8px #ffd700",
            }}
          />
        </div>

        {/* Prop 2: Street lamp */}
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "10%",
            width: "12px",
            height: "180px",
            background: "linear-gradient(180deg, #1a1a2e 0%, #0a0a1a 100%)",
            borderLeft: "2px solid #333",
            borderRight: "2px solid #333",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-24px",
              left: "-16px",
              width: "44px",
              height: "28px",
              background: "#1a1a2e",
              border: "2px solid #333",
              borderRadius: "8px 8px 0 0",
              boxShadow: "inset 0 0 20px rgba(255,215,0,0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "16px",
                height: "16px",
                background: "radial-gradient(circle at 30% 30%, #fff8dc 0%, #ffd700 50%, #ccac00 100%)",
                borderRadius: "50%",
                boxShadow: "0 0 12px #ffd700, inset 0 0 4px rgba(255,255,255,0.5)",
              }}
            />
          </div>
        </div>

        {/* Prop 3: Bakery awning */}
        <div
          style={{
            position: "absolute",
            bottom: "35%",
            left: "55%",
            width: "180px",
            height: "60px",
            background: "linear-gradient(180deg, #cc3333 0%, #990000 100%)",
            borderRadius: "0 0 12px 12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <Text
            style={{
              fontFamily: "Playfair Display",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#fff",
              textAlign: "center",
              marginTop: "16px",
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            BOULANGERIE
          </Text>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Sky background - full bleed layer 0
const SkyBackground = () => (
  <AbsoluteFill
    style={{
      background: "linear-gradient(180deg, #4a90d9 0%, #87ceeb 35%, #e0f0ff 70%, #f5f0e1 100%)",
    }}
  >
    {/* Subtle cloud shapes */}
    <div
      style={{
        position: "absolute",
        top: "8%",
        left: "5%",
        width: "200px",
        height: "60px",
        background: "rgba(255,255,255,0.4)",
        borderRadius: "50%",
        filter: "blur(20px)",
        opacity: 0.6,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: "12%",
        right: "8%",
        width: "160px",
        height: "48px",
        background: "rgba(255,255,255,0.3)",
        borderRadius: "50%",
        filter: "blur(16px)",
        opacity: 0.5,
      }}
    />
  </AbsoluteFill>
);

// Scene 1 Component
export const Scene1 = () => {
  const frame = useCurrentFrame();
  const progress = frame / SCENE_1_DURATION;

  return (
    <>
      <Sequence from={SCENE_1_START} durationInFrames={SCENE_1_DURATION}>
        <SkyBackground />
      </Sequence>
      <Sequence from={SCENE_1_START} durationInFrames={SCENE_1_DURATION}>
        <Newspaper progress={progress} />
      </Sequence>
      <Sequence from={SCENE_1_START} durationInFrames={SCENE_1_DURATION}>
        <StreetGround progress={progress} />
      </Sequence>
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
      <Scene1 />
      {/* Subtitle overlay - safe area: bottom 120px, padding 48px LR */}
      {frame >= SCENE_1_START && frame <= SCENE_1_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
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
            }}
          >
            <Text
              style={{
                fontFamily: "Oswald",
                fontSize: "28px",
                fontWeight: "700",
                lineHeight: 1.2,
                color: "#ffd700",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                overflowWrap: "break-word",
                maxWidth: "100%",
              }}
            >
              MENARA EIFFEL BERKARAT • BIAYA PERBAIKAN 250 JUTA FRANC
            </Text>
          </div>
        </AbsoluteFill>
      )}
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