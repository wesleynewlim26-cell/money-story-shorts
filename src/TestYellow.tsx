import { Composition, CalculateMetadataFunction, useCurrentFrame, useVideoConfig, HtmlInCanvas } from "remotion";

const calculateMetadata: CalculateMetadataFunction<{}> = () => ({
  durationInFrames: 30,
  fps: 30,
  width: 720,
  height: 1280,
});

const TestYellow = () => {
  const frame = useCurrentFrame();
  return (
    <HtmlInCanvas
      width={720}
      height={1280}
      onPaint={(params: any) => {
        const canvas = params.canvas || params;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // Solid yellow background
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(0, 0, 720, 1280);
        // Black "TEST" text center
        ctx.fillStyle = "#000000";
        ctx.font = "bold 120px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("TEST", 360, 640);
        // Frame counter
        ctx.font = "40px monospace";
        ctx.fillText(`Frame: ${frame}`, 360, 720);
      }}
    >
      <div />
    </HtmlInCanvas>
  );
};

export const TestComposition = () => (
  <Composition
    id="TestYellow"
    component={TestYellow}
    durationInFrames={30}
    fps={30}
    width={720}
    height={1280}
    calculateMetadata={calculateMetadata}
  />
);

export const MyComponent = () => null;
